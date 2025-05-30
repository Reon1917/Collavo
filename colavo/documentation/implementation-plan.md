# Collavo Phase 1 Implementation Plan

## Phase 1 Scope: Minimum Viable Functionality

**Goal**: Get core project management working with basic functionality:
1. Create projects with automatic leader setup
2. Add members by ID, email, or username
3. Create and manage main tasks and sub-tasks
4. Basic permission enforcement

## Database Schema Reference (Updated)

### Core Tables for Phase 1:
- `projects`: Project details with leader reference
- `members`: Project membership with role (leader/member)
- `permissions`: Normalized permission system
- `mainTasks`: Parent tasks
- `subTasks`: Child tasks with assignments
- `user`: Better-auth user management

### Permission Types:
- `createTask`: Create main tasks and sub-tasks
- `handleTask`: Edit/delete task details
- `updateTask`: Change task status and add notes
- `addMember`: Add new members to project

## Phase 1 Implementation Steps

### 1. Project Creation Flow

#### API Endpoint: `POST /api/projects`
```ts
// Request body
interface CreateProjectRequest {
  name: string;
  description?: string;
  deadline?: string; // ISO date string
}

// Implementation
async function createProject(data: CreateProjectRequest, currentUserId: string) {
  // 1. Create project
  const project = await db.insert(projects).values({
    id: createId(),
    name: data.name,
    description: data.description,
    leaderId: currentUserId,
    deadline: data.deadline ? new Date(data.deadline) : null,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  // 2. Create leader member record
  const leaderMember = await db.insert(members).values({
    id: createId(),
    userId: currentUserId,
    projectId: project[0].id,
    role: "leader",
    joinedAt: new Date()
  }).returning();

  // 3. Grant all permissions to leader
  const allPermissions = ['createTask', 'handleTask', 'updateTask', 'addMember'];
  const permissionInserts = allPermissions.map(permission => ({
    id: createId(),
    memberId: leaderMember[0].id,
    permission,
    granted: true,
    grantedAt: new Date(),
    grantedBy: currentUserId
  }));

  await db.insert(permissions).values(permissionInserts);

  return project[0];
}
```

#### Frontend Implementation
```tsx
// components/project/CreateProjectForm.tsx
function CreateProjectForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      const project = await response.json();
      router.push(`/project/${project.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Project Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      <textarea
        placeholder="Description (optional)"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      <input
        type="date"
        value={formData.deadline}
        onChange={(e) => setFormData({...formData, deadline: e.target.value})}
      />
      <button type="submit">Create Project</button>
    </form>
  );
}
```

### 2. Member Management - Add by ID/Email/Username

#### API Endpoint: `POST /api/projects/:projectId/members`
```ts
interface AddMemberRequest {
  identifier: string; // Can be userId, email, or username
  identifierType: 'id' | 'email' | 'username';
}

async function addMember(projectId: string, data: AddMemberRequest, currentUserId: string) {
  // 1. Check if current user has addMember permission
  const hasPermission = await checkPermission(currentUserId, projectId, 'addMember');
  if (!hasPermission) {
    throw new Error('Insufficient permissions');
  }

  // 2. Find user by identifier
  let targetUser;
  switch (data.identifierType) {
    case 'id':
      targetUser = await db.select().from(user).where(eq(user.id, data.identifier)).limit(1);
      break;
    case 'email':
      targetUser = await db.select().from(user).where(eq(user.email, data.identifier)).limit(1);
      break;
    case 'username':
      // Assuming you have a username field
      targetUser = await db.select().from(user).where(eq(user.name, data.identifier)).limit(1);
      break;
  }

  if (!targetUser.length) {
    throw new Error('User not found');
  }

  // 3. Check if already a member
  const existingMember = await db.select().from(members)
    .where(and(
      eq(members.userId, targetUser[0].id),
      eq(members.projectId, projectId)
    )).limit(1);

  if (existingMember.length) {
    throw new Error('User is already a member');
  }

  // 4. Create member record
  const newMember = await db.insert(members).values({
    id: createId(),
    userId: targetUser[0].id,
    projectId: projectId,
    role: "member",
    joinedAt: new Date()
  }).returning();

  // 5. Grant default permissions (none for now, leader can add later)
  // You can add default permissions here if needed

  return {
    member: newMember[0],
    user: targetUser[0]
  };
}

// Permission checking helper
async function checkPermission(userId: string, projectId: string, permission: string): Promise<boolean> {
  // Check if user is project leader
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (project[0]?.leaderId === userId) return true;

  // Check member permissions
  const memberPermission = await db.select()
    .from(members)
    .innerJoin(permissions, eq(permissions.memberId, members.id))
    .where(and(
      eq(members.userId, userId),
      eq(members.projectId, projectId),
      eq(permissions.permission, permission),
      eq(permissions.granted, true)
    )).limit(1);

  return memberPermission.length > 0;
}
```

#### Frontend Implementation
```tsx
// components/project/AddMemberForm.tsx
function AddMemberForm({ projectId }: { projectId: string }) {
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState<'id' | 'email' | 'username'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(`/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, identifierType })
    });

    if (response.ok) {
      // Refresh member list
      window.location.reload(); // Temporary - use proper state management
    } else {
      const error = await response.json();
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select 
        value={identifierType} 
        onChange={(e) => setIdentifierType(e.target.value as any)}
      >
        <option value="email">Email</option>
        <option value="username">Username</option>
        <option value="id">User ID</option>
      </select>
      
      <input
        type="text"
        placeholder={`Enter ${identifierType}`}
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        required
      />
      
      <button type="submit">Add Member</button>
    </form>
  );
}
```

### 3. Task Management

#### API Endpoints for Tasks

**Create Main Task: `POST /api/projects/:projectId/tasks`**
```ts
interface CreateMainTaskRequest {
  title: string;
  description?: string;
  importanceLevel: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
}

async function createMainTask(projectId: string, data: CreateMainTaskRequest, currentUserId: string) {
  // Check permission
  const hasPermission = await checkPermission(currentUserId, projectId, 'createTask');
  if (!hasPermission) {
    throw new Error('Insufficient permissions');
  }

  const mainTask = await db.insert(mainTasks).values({
    id: createId(),
    projectId: projectId,
    title: data.title,
    description: data.description,
    importanceLevel: data.importanceLevel,
    deadline: data.deadline ? new Date(data.deadline) : null,
    createdBy: currentUserId,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  return mainTask[0];
}
```

**Create Sub-Task: `POST /api/projects/:projectId/tasks/:mainTaskId/subtasks`**
```ts
interface CreateSubTaskRequest {
  title: string;
  description?: string;
  assignedId?: string; // User ID to assign to
  deadline?: string;
}

async function createSubTask(mainTaskId: string, data: CreateSubTaskRequest, currentUserId: string) {
  // Get main task to check project
  const mainTask = await db.select().from(mainTasks).where(eq(mainTasks.id, mainTaskId)).limit(1);
  if (!mainTask.length) {
    throw new Error('Main task not found');
  }

  // Check permission
  const hasPermission = await checkPermission(currentUserId, mainTask[0].projectId, 'createTask');
  if (!hasPermission) {
    throw new Error('Insufficient permissions');
  }

  const subTask = await db.insert(subTasks).values({
    id: createId(),
    mainTaskId: mainTaskId,
    title: data.title,
    description: data.description,
    assignedId: data.assignedId,
    status: 'pending',
    deadline: data.deadline ? new Date(data.deadline) : null,
    createdBy: currentUserId,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  return subTask[0];
}
```

#### Frontend Task Components
```tsx
// components/tasks/CreateTaskForm.tsx
function CreateTaskForm({ projectId }: { projectId: string }) {
  const [taskType, setTaskType] = useState<'main' | 'sub'>('main');
  const [mainTaskId, setMainTaskId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    importanceLevel: 'medium' as const,
    deadline: '',
    assignedId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = taskType === 'main' 
      ? `/api/projects/${projectId}/tasks`
      : `/api/projects/${projectId}/tasks/${mainTaskId}/subtasks`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      // Reset form and refresh task list
      setFormData({ title: '', description: '', importanceLevel: 'medium', deadline: '', assignedId: '' });
      // Trigger refresh
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={taskType} onChange={(e) => setTaskType(e.target.value as any)}>
        <option value="main">Main Task</option>
        <option value="sub">Sub Task</option>
      </select>

      {taskType === 'sub' && (
        <select 
          value={mainTaskId} 
          onChange={(e) => setMainTaskId(e.target.value)}
          required
        >
          <option value="">Select Main Task</option>
          {/* Map through main tasks */}
        </select>
      )}

      <input
        type="text"
        placeholder="Task Title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        required
      />

      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />

      {taskType === 'main' && (
        <select 
          value={formData.importanceLevel}
          onChange={(e) => setFormData({...formData, importanceLevel: e.target.value as any})}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      )}

      <input
        type="date"
        value={formData.deadline}
        onChange={(e) => setFormData({...formData, deadline: e.target.value})}
      />

      {taskType === 'sub' && (
        <select 
          value={formData.assignedId}
          onChange={(e) => setFormData({...formData, assignedId: e.target.value})}
        >
          <option value="">Unassigned</option>
          {/* Map through project members */}
        </select>
      )}

      <button type="submit">Create {taskType === 'main' ? 'Main' : 'Sub'} Task</button>
    </form>
  );
}
```

### 4. Data Fetching Helpers

```ts
// lib/api/projects.ts
export async function getProject(projectId: string) {
  const response = await fetch(`/api/projects/${projectId}`);
  return response.json();
}

export async function getProjectMembers(projectId: string) {
  const response = await fetch(`/api/projects/${projectId}/members`);
  return response.json();
}

export async function getProjectTasks(projectId: string) {
  const response = await fetch(`/api/projects/${projectId}/tasks`);
  return response.json();
}

// lib/api/permissions.ts
export async function getUserPermissions(projectId: string) {
  const response = await fetch(`/api/projects/${projectId}/my-permissions`);
  return response.json();
}
```

## Phase 1 File Structure

```
colavo/
├── app/
│   ├── api/
│   │   └── projects/
│   │       ├── route.ts                 # GET, POST projects
│   │       └── [id]/
│   │           ├── route.ts             # GET, PUT, DELETE project
│   │           ├── members/
│   │           │   └── route.ts         # GET, POST members
│   │           └── tasks/
│   │               ├── route.ts         # GET, POST main tasks
│   │               └── [taskId]/
│   │                   └── subtasks/
│   │                       └── route.ts # GET, POST sub tasks
│   ├── project/
│   │   ├── new/
│   │   │   └── page.tsx                 # Create project page
│   │   └── [id]/
│   │       ├── page.tsx                 # Project dashboard
│   │       ├── members/
│   │       │   └── page.tsx             # Members management
│   │       └── tasks/
│   │           └── page.tsx             # Task management
│   └── dashboard/
│       └── page.tsx                     # User dashboard
├── components/
│   ├── project/
│   │   ├── CreateProjectForm.tsx
│   │   ├── AddMemberForm.tsx
│   │   └── ProjectCard.tsx
│   └── tasks/
│       ├── CreateTaskForm.tsx
│       ├── TaskList.tsx
│       └── TaskCard.tsx
└── lib/
    ├── api/
    │   ├── projects.ts
    │   ├── members.ts
    │   └── tasks.ts
    └── utils/
        └── permissions.ts
```

## Phase 1 Testing Checklist

### ✅ Basic Functionality Tests
1. **Project Creation**
   - [ ] Create project with name only
   - [ ] Create project with full details
   - [ ] Verify leader gets all permissions automatically

2. **Member Management**
   - [ ] Add member by email
   - [ ] Add member by username
   - [ ] Add member by ID
   - [ ] Prevent duplicate members
   - [ ] Handle non-existent users

3. **Task Management**
   - [ ] Create main task
   - [ ] Create sub-task under main task
   - [ ] Assign sub-task to member
   - [ ] Verify permission checking works

4. **Permission System**
   - [ ] Leader can do everything
   - [ ] Members without permissions cannot create tasks
   - [ ] Members without permissions cannot add members

This Phase 1 implementation gives you the core functionality to start testing and building upon, with a solid foundation for the normalized permission system. 