# Backend API Architecture & Implementation

## Overview

Collavo's backend leverages Next.js 15 App Router with API routes, Drizzle ORM with PostgreSQL (Neon), and Better Auth for a robust, type-safe backend architecture. The system implements role-based permissions, hierarchical data structures, and comprehensive error handling.

## Core Architecture

### Technology Stack
- **Runtime**: Next.js 15 API Routes (Edge/Node.js)
- **Database**: PostgreSQL (Neon) with HTTP driver
- **ORM**: Drizzle ORM with type-safe queries
- **Authentication**: Better Auth with OAuth (Google) + Email/Password
- **Authorization**: Role-based permissions with granular control
- **Validation**: Runtime validation with TypeScript inference

### API Route Structure
```
app/api/
├── auth/
│   ├── [...all]/route.ts          # Better Auth catch-all handler
│   └── reset-password/route.ts    # Password reset functionality
├── projects/
│   ├── route.ts                   # GET /api/projects, POST /api/projects
│   └── [id]/
│       ├── route.ts               # GET/PUT/DELETE /api/projects/[id]
│       ├── tasks/
│       │   ├── route.ts           # Task CRUD operations
│       │   └── [taskId]/route.ts  # Individual task operations
│       ├── members/route.ts       # Member management
│       ├── events/route.ts        # Event management
│       ├── files/route.ts         # File management
│       └── overview/route.ts      # Project statistics
└── uploadthing/route.ts           # File upload handling
```

## Database Schema

### Core Tables
```sql
-- Authentication (Better Auth managed)
users, sessions, accounts, verification

-- Project Management
projects (id, name, description, leaderId, deadline, timestamps)
members (id, userId, projectId, role, joinedAt)
permissions (id, memberId, permission, granted, grantedAt, grantedBy)
invitations (id, email, projectId, invitedBy, token, expiresAt)

-- Task Management  
main_tasks (id, projectId, title, description, importanceLevel, deadline, createdBy)
sub_tasks (id, mainTaskId, assignedId, title, status, note, deadline, createdBy)

-- Additional Features
events (id, projectId, title, description, datetime, location, createdBy)
files (id, projectId, addedBy, name, description, url, size, mimeType)
```

### Key Design Patterns

**1. Hierarchical Permission System**
```typescript
// Permission types defined as enum
export const permissionTypeEnum = pgEnum("permission_type", [
  "createTask", "handleTask", "updateTask", "handleEvent",
  "handleFile", "addMember", "createEvent", "viewFiles"
]);

// Normalized permissions table
export const permissions = pgTable("permissions", {
  id: text("id").primaryKey(),
  memberId: text("member_id").references(() => members.id, { onDelete: "cascade" }),
  permission: permissionTypeEnum("permission").notNull(),
  granted: boolean("granted").default(false).notNull(),
  grantedBy: text("granted_by").references(() => user.id)
});
```

**2. Task Hierarchy**
```typescript
// Main tasks contain project-level information
mainTasks -> subTasks (one-to-many)

// Sub-tasks are assigned to specific users
subTasks.assignedId -> user.id
```

**3. Optimized Indexing**
```typescript
// Strategic indexes for performance
(table) => ({
  userProjectIdx: index("idx_members_user_project").on(table.userId, table.projectId),
  memberPermissionIdx: index("idx_permissions_member_permission").on(table.memberId, table.permission),
  projectDatetimeIdx: index("idx_events_project_datetime").on(table.projectId, table.datetime)
})
```

## Authentication & Authorization

### Better Auth Configuration
```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false // Set to true in production
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      scope: ["email", "profile"],
      prompt: "select_account"
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // Update every 24 hours
  },
  csrf: { enabled: true },
  rateLimit: { enabled: true, window: 60, max: 100 }
});
```

### Centralized Authorization System
```typescript
// lib/auth-helpers.ts - Core authorization logic
export interface ProjectAccess {
  hasAccess: boolean;
  isLeader: boolean;
  isMember: boolean;
  role: 'leader' | 'member' | null;
  permissions: string[];
  project: ProjectData | null;
}

// Main authorization function
export async function checkProjectAccess(projectId: string, userId: string): Promise<ProjectAccess> {
  // 1. Check if project exists
  // 2. Check if user is project leader (full access)
  // 3. Check if user is member with specific permissions
  // 4. Return comprehensive access object
}

// Helper functions for specific checks
export async function requirePermission(userId: string, projectId: string, permission: string)
export async function requireLeaderRole(userId: string, projectId: string)
export async function requireProjectAccess(userId: string, projectId: string)
```

### Permission-Based Data Filtering
```typescript
// Example: Task visibility based on permissions
if (access.isLeader || access.permissions.includes('viewFiles')) {
  // Leaders and users with viewFiles can see all tasks
  projectTasks = await db.select().from(mainTasks).where(eq(mainTasks.projectId, projectId));
} else {
  // Regular members only see tasks they're assigned to
  projectTasks = await db.select()
    .from(mainTasks)
    .innerJoin(subTasks, eq(subTasks.mainTaskId, mainTasks.id))
    .where(and(
      eq(mainTasks.projectId, projectId),
      eq(subTasks.assignedId, session.user.id)
    ));
}
```

## API Design Patterns

### 1. Request/Response Flow
```typescript
// Standard API route pattern
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parameter extraction
    const { id: projectId } = await params;

    // 3. Authorization check
    const access = await requireProjectAccess(session.user.id, projectId);

    // 4. Data retrieval with permissions
    const data = await getDataBasedOnPermissions(access);

    // 5. Response
    return NextResponse.json(data);
  } catch (error) {
    return handleError(error);
  }
}
```

### 2. Error Handling Strategy
```typescript
// Centralized error handling
function handleError(error: unknown) {
  if (error instanceof Error) {
    // Known authorization errors
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message.includes('Leader role required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message.includes('Insufficient permissions')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
  }
  
  // Generic server error (don't expose internals)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

### 3. Data Validation Pattern
```typescript
// Input validation with TypeScript inference
interface CreateTaskRequest {
  title: string;
  description?: string;
  importanceLevel: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
  subTasks: Array<{
    title: string;
    description?: string;
    assignedId?: string;
    deadline?: string;
  }>;
}

// Validation function
function validateCreateTaskRequest(body: any): CreateTaskRequest {
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
    throw new Error('Task title is required');
  }
  if (body.title.length > 500) {
    throw new Error('Task title must be less than 500 characters');
  }
  // Additional validations...
  return body as CreateTaskRequest;
}
```

## API Endpoints Documentation

### Projects API

**GET /api/projects**
- **Purpose**: List user's projects (as leader or member)
- **Auth**: Required
- **Response**: 
  ```typescript
  {
    ledProjects: Project[],
    memberProjects: Project[],
    total: number
  }
  ```

**POST /api/projects**
- **Purpose**: Create new project with automatic leader setup
- **Auth**: Required
- **Body**: `{ name: string, description?: string, deadline?: string }`
- **Process**: 
  1. Create project record
  2. Create leader member record
  3. Grant all permissions to leader
  4. Atomic transaction with cleanup on failure

**GET /api/projects/[id]**
- **Purpose**: Get detailed project information
- **Auth**: Required + Project access
- **Response**:
  ```typescript
  {
    ...project,
    members: MemberWithPermissions[],
    userPermissions: string[],
    isLeader: boolean,
    userRole: string
  }
  ```

**PUT /api/projects/[id]**
- **Purpose**: Update project details
- **Auth**: Required + Leader role
- **Body**: `{ name?: string, description?: string, deadline?: string }`

**DELETE /api/projects/[id]**
- **Purpose**: Delete project and all related data
- **Auth**: Required + Leader role
- **Process**: Cascading delete via foreign key constraints

### Tasks API

**GET /api/projects/[id]/tasks**
- **Purpose**: List project tasks with permission-based filtering
- **Auth**: Required + Project access
- **Filtering Logic**:
  - Leaders + viewFiles permission: See all tasks
  - Regular members: Only tasks they're assigned to
- **Response**: `MainTaskWithSubTasks[]`

**POST /api/projects/[id]/tasks**
- **Purpose**: Create main task with sub-tasks
- **Auth**: Required + createTask permission
- **Body**:
  ```typescript
  {
    title: string,
    description?: string,
    importanceLevel: TaskImportance,
    deadline?: string,
    subTasks: SubTaskData[]
  }
  ```
- **Process**: Atomic creation of main task + all sub-tasks

### Members API

**POST /api/projects/[id]/members**
- **Purpose**: Add member to project with default permissions
- **Auth**: Required + addMember permission
- **Body**: `{ identifier: string, type: 'email' | 'username' | 'id' }`
- **Process**:
  1. Resolve identifier to user
  2. Check if already member
  3. Create member record
  4. Grant default permissions (handleFile, viewFiles)

## Database Optimization

### Query Optimization Patterns

**1. Selective Field Loading**
```typescript
// Only select needed fields to reduce payload
const projects = await db
  .select({
    id: projects.id,
    name: projects.name,
    deadline: projects.deadline
    // Exclude large description field when not needed
  })
  .from(projects);
```

**2. Efficient Joins**
```typescript
// Use inner joins for required relationships
const tasksWithCreators = await db
  .select()
  .from(mainTasks)
  .innerJoin(user, eq(user.id, mainTasks.createdBy))
  .where(eq(mainTasks.projectId, projectId));
```

**3. Indexed Lookups**
```typescript
// Leverage composite indexes for complex queries
.where(and(
  eq(members.userId, userId),      // First part of idx_members_user_project
  eq(members.projectId, projectId) // Second part of idx_members_user_project
))
```

### Connection Management
```typescript
// Optimized for Neon HTTP driver
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Single connection instance
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// No manual connection pooling needed with HTTP driver
```

## Security Implementation

### 1. SQL Injection Prevention
```typescript
// Drizzle ORM provides automatic parameterization
await db.select().from(projects).where(eq(projects.id, projectId)); // Safe
// Never: raw SQL with user input
```

### 2. Authorization at Every Level
```typescript
// Every protected route checks permissions
const access = await requireProjectAccess(userId, projectId);
if (!access.permissions.includes('createTask')) {
  return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
}
```

### 3. Input Sanitization
```typescript
// Trim and validate all string inputs
name: name.trim(),
description: description?.trim() || null,

// Type validation
if (typeof name !== 'string' || name.length > 255) {
  throw new Error('Invalid name format');
}
```

### 4. Session Security
```typescript
// Better Auth handles secure session management
- HttpOnly cookies
- CSRF protection
- Secure flags in production
- Automatic session rotation
```

## Error Handling & Logging

### Error Response Standards
```typescript
// Consistent error format across all endpoints
{
  error: string,           // Human-readable error message
  code?: string,          // Optional error code for client handling
  details?: object        // Optional additional context (dev only)
}

// HTTP Status Code Usage
200: Success with data
201: Created
400: Bad Request (validation errors)
401: Unauthorized (not authenticated)
403: Forbidden (insufficient permissions)
404: Not Found (resource doesn't exist or no access)
500: Internal Server Error (unexpected errors)
```

### Logging Strategy
```typescript
// Production: Log errors without exposing sensitive data
console.error('Project creation failed:', {
  userId: session.user.id,
  error: error.message,
  // Never log passwords, tokens, or sensitive user data
});

// Development: More verbose logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', debugData);
}
```

## Performance Considerations

### 1. Database Query Optimization
- Use indexes strategically for common query patterns
- Implement pagination for large datasets
- Batch operations where possible
- Avoid N+1 queries with proper joins

### 2. Caching Strategy (Future Enhancement)
```typescript
// Implement caching for frequently accessed data
- Redis for session data
- Edge caching for public project data
- Client-side caching with SWR/React Query
```

### 3. Connection Pooling
- Neon HTTP driver handles connections automatically
- No manual pool management required
- Excellent for serverless environments

## API Testing & Validation

### Testing Strategy
```typescript
// Unit tests for authorization functions
describe('checkProjectAccess', () => {
  it('should grant full access to project leader', async () => {
    const access = await checkProjectAccess(projectId, leaderId);
    expect(access.isLeader).toBe(true);
    expect(access.permissions).toContain('createTask');
  });
});

// Integration tests for API endpoints
describe('POST /api/projects', () => {
  it('should create project with leader permissions', async () => {
    const response = await createProject({ name: 'Test Project' });
    expect(response.status).toBe(201);
  });
});
```

## Future Enhancements

### 1. Real-time Features
- WebSocket integration for live updates
- Push notifications for task assignments
- Real-time collaboration features

### 2. Advanced Permissions
- Custom permission sets
- Time-based permissions
- Resource-level permissions

### 3. Performance Monitoring
- Query performance tracking
- API response time monitoring
- Error rate tracking with alerts

### 4. Data Analytics
- Project completion metrics
- User activity tracking
- Performance dashboards

## Best Practices Summary

1. **Authentication**: Every protected route validates session
2. **Authorization**: Granular permission checks at data level
3. **Validation**: Comprehensive input validation with TypeScript
4. **Error Handling**: Consistent error responses with appropriate status codes
5. **Database**: Optimized queries with proper indexing
6. **Security**: Input sanitization and SQL injection prevention
7. **Type Safety**: Full TypeScript integration with Drizzle ORM
8. **Transaction Safety**: Atomic operations with proper cleanup

## Deployment Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Upload
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
```

### Production Optimizations
- Enable email verification in Better Auth
- Configure proper CORS policies
- Set up database connection pooling
- Implement comprehensive logging
- Add rate limiting for public endpoints
