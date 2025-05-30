# Collavo Implementation Plan

## Core Database Structure Reference
Our application is built on the following key database tables:
- `projects`: Stores project details and references leader
- `members`: Tracks project membership with role-based approach
- `permissions`: Normalized permission system (separate table)
- `invitations`: Handles external user invitations
- `mainTasks`: Stores parent tasks in a project
- `subTasks`: Stores child tasks assigned to specific members
- `events`: Stores project events/meetings
- `files`: Stores uploaded files and linked resources

## Permission System (Updated)
The permission system is now normalized with a separate `permissions` table:
- `createTask`: Ability to create main tasks and sub-tasks
- `handleTask`: Ability to edit/delete task details (deadlines, assignments)
- `updateTask`: Ability to modify task status and add notes
- `handleEvent`: Ability to modify events
- `handleFile`: Ability to manage files (default: true)
- `addMember`: Ability to add new members
- `createEvent`: Ability to create new events
- `viewFiles`: Ability to view files (default: true)

Each member can have granular permissions stored in the `permissions` table, linked by `memberId`.

## Implementation Plan

### 1. Project Creation and Leadership

#### Project Creation Flow
1. User navigates to "Create New Project" page
2. User inputs project details:
   - Project name (required)
   - Project description (optional)
   - Project deadline (optional)
3. System creates a new project record:
   ```ts
   const newProject = {
     id: createId(), // Auto-generated CUID
     name: projectName,
     description: projectDescription,
     leaderId: currentUserId, // Current authenticated user with FK constraint
     deadline: projectDeadline,
     createdAt: new Date(),
     updatedAt: new Date()
   };
   ```

4. System automatically creates a member record for the leader:
   ```ts
   const leaderMember = {
     id: createId(),
     userId: currentUserId,
     projectId: newProject.id,
     role: "leader", // Using enum: leader | member
     joinedAt: new Date()
   };
   ```

5. System automatically grants all permissions to the leader:
   ```ts
   const leaderPermissions = [
     'createTask', 'handleTask', 'updateTask', 'handleEvent', 
     'handleFile', 'addMember', 'createEvent', 'viewFiles'
   ];
   
   for (const permission of leaderPermissions) {
     await createPermission({
       memberId: leaderMember.id,
       permission: permission,
       granted: true,
       grantedAt: new Date(),
       grantedBy: currentUserId
     });
   }
   ```

### 2. Member Management with Invitations

#### Adding Members by Email (New Users)
1. Leader enters email address of person to invite
2. System checks if user exists:
   ```ts
   const existingUser = await getUserByEmail(email);
   
   if (!existingUser) {
     // Create invitation record
     const invitation = {
       id: createId(),
       email: email,
       projectId: projectId,
       invitedBy: currentUserId,
       token: generateSecureToken(),
       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
       createdAt: new Date()
     };
     
     // Send email with signup link containing invitation token
     await sendInvitationEmail(email, invitation.token, projectName);
   }
   ```

#### Adding Existing Users
```ts
if (existingUser) {
  // Add user directly as member
  const newMember = {
    id: createId(),
    userId: existingUser.id,
    projectId: projectId,
    role: "member",
    joinedAt: new Date()
  };
  
  // Grant default permissions
  await grantDefaultPermissions(newMember.id);
}
```

#### Default Permission Setup
```ts
async function grantDefaultPermissions(memberId: string) {
  const defaultPermissions = [
    { permission: 'handleFile', granted: true },
    { permission: 'viewFiles', granted: true }
  ];
  
  for (const perm of defaultPermissions) {
    await createPermission({
      memberId: memberId,
      permission: perm.permission,
      granted: perm.granted,
      grantedAt: new Date(),
      grantedBy: currentUserId
    });
  }
}
```

#### Managing Member Permissions (Updated)
1. Leader navigates to member details page
2. System queries current permissions:
   ```ts
   const memberPermissions = await getPermissions(memberId);
   const permissionMap = memberPermissions.reduce((acc, perm) => {
     acc[perm.permission] = perm.granted;
     return acc;
   }, {});
   ```

3. UI displays toggles for each permission type
4. When leader updates permissions:
   ```ts
   async function updatePermission(memberId: string, permission: string, granted: boolean) {
     const existingPerm = await getPermission(memberId, permission);
     
     if (existingPerm) {
       // Update existing permission
       await updatePermissionRecord(existingPerm.id, {
         granted: granted,
         grantedAt: new Date(),
         grantedBy: currentUserId
       });
     } else {
       // Create new permission record
       await createPermission({
         memberId: memberId,
         permission: permission,
         granted: granted,
         grantedAt: new Date(),
         grantedBy: currentUserId
       });
     }
   }
   ```

### 3. Task Management (Updated)

#### Permission Checking Helper
```ts
async function hasPermission(userId: string, projectId: string, permission: string): Promise<boolean> {
  // Check if user is project leader
  const project = await getProject(projectId);
  if (project.leaderId === userId) return true;
  
  // Get member record
  const member = await getMemberByUserAndProject(userId, projectId);
  if (!member) return false;
  
  // Check specific permission
  const permissionRecord = await getPermission(member.id, permission);
  return permissionRecord?.granted || false;
}
```

#### Task Status Updates (Updated Logic)
```ts
async function updateSubTaskStatus(taskId: string, newStatus: string, currentUserId: string) {
  const task = await getSubTask(taskId);
  const mainTask = await getMainTask(task.mainTaskId);
  
  const canUpdate = 
    task.assignedId === currentUserId || // Is assigned to the task
    await hasPermission(currentUserId, mainTask.projectId, "updateTask") || // Has updateTask permission
    await hasPermission(currentUserId, mainTask.projectId, "handleTask"); // Has handleTask permission
  
  if (!canUpdate) {
    throw new Error("Insufficient permissions to update task status");
  }
  
  await updateSubTask(taskId, {
    status: newStatus,
    updatedAt: new Date()
  });
}
```

### 4. Invitation System Implementation

#### Invitation Email Processing
```ts
// When user clicks invitation link and signs up
async function acceptInvitation(invitationToken: string, newUserId: string) {
  const invitation = await getInvitationByToken(invitationToken);
  
  if (!invitation || invitation.expiresAt < new Date()) {
    throw new Error("Invalid or expired invitation");
  }
  
  if (invitation.acceptedAt) {
    throw new Error("Invitation already accepted");
  }
  
  // Create member record
  const newMember = {
    id: createId(),
    userId: newUserId,
    projectId: invitation.projectId,
    role: "member",
    joinedAt: new Date()
  };
  
  // Grant default permissions
  await grantDefaultPermissions(newMember.id);
  
  // Mark invitation as accepted
  await updateInvitation(invitation.id, {
    acceptedAt: new Date()
  });
}
```

#### Invitation Management
```ts
// List pending invitations for a project
async function getPendingInvitations(projectId: string) {
  return await getInvitations({
    projectId: projectId,
    acceptedAt: null,
    expiresAt: { gt: new Date() }
  });
}

// Resend invitation
async function resendInvitation(invitationId: string) {
  const invitation = await getInvitation(invitationId);
  
  // Extend expiration
  await updateInvitation(invitationId, {
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  
  // Resend email
  await sendInvitationEmail(invitation.email, invitation.token, projectName);
}
```

## API Implementation Plan (Updated)

### Authentication Endpoints
- `/api/auth/register` - User registration (can include invitation token)
- `/api/auth/login` - User login
- `/api/auth/logout` - User logout
- `/api/auth/reset-password` - Password reset

### Project Endpoints
- `/api/projects` - GET (list projects), POST (create project)
- `/api/projects/:id` - GET (project details), PUT (update project), DELETE (delete project)
- `/api/projects/:id/members` - GET (list members), POST (add member)
- `/api/projects/:id/members/:memberId` - GET (member details), DELETE (remove member)
- `/api/projects/:id/members/:memberId/permissions` - GET, PUT (manage permissions)

### Invitation Endpoints
- `/api/projects/:id/invitations` - GET (list pending invitations), POST (send invitation)
- `/api/projects/:id/invitations/:invitationId` - DELETE (cancel invitation), PUT (resend)
- `/api/invitations/:token` - GET (get invitation details for signup)
- `/api/invitations/:token/accept` - POST (accept invitation after signup)

### Task Endpoints (Same as before)
- `/api/projects/:id/tasks` - GET (list main tasks), POST (create main task)
- `/api/projects/:id/tasks/:taskId` - GET (task details), PUT (update task), DELETE (delete task)
- `/api/projects/:id/tasks/:taskId/subtasks` - GET (list subtasks), POST (create subtask)
- `/api/projects/:id/tasks/:taskId/subtasks/:subtaskId` - GET, PUT, DELETE

### Event and File Endpoints (Same as before)
- `/api/projects/:id/events` - GET (list events), POST (create event)
- `/api/projects/:id/events/:eventId` - GET, PUT, DELETE
- `/api/projects/:id/files` - GET (list files), POST (upload file/add link)
- `/api/projects/:id/files/:fileId` - GET, PUT, DELETE

## Database Improvements Implemented

### 1. ✅ Foreign Key Constraints Added
- All user references now have proper FK constraints
- Proper cascade and set null behaviors defined
- Referential integrity enforced at database level

### 2. ✅ Normalized Permission System
- Moved from wide table with boolean columns to normalized approach
- Separate `permissions` table with proper relationships
- More flexible and maintainable permission management

### 3. ✅ Removed Redundant Data
- Removed `projectId` from `subTasks` (accessible via `mainTask` relation)
- Cleaner data model with no duplication

### 4. ✅ Added Invitations System
- Complete invitation flow for external users
- Token-based secure invitation system
- Proper expiration and acceptance tracking

### 5. ✅ Added Database Indexes
- Performance indexes on all major query patterns
- Composite indexes for common filter combinations
- Optimized for expected query patterns

### 6. ✅ Enhanced Relations
- Complete bidirectional relationships
- Proper TypeScript type inference
- Clean ORM usage patterns

## Implementation Phases (Updated)

### Phase 1: Core Authentication and Project Creation
- Implement user registration/login flow with invitation support
- Create project creation functionality with automatic leader setup
- Setup permission system initialization

### Phase 2: Invitation and Member Management
- Implement invitation sending and acceptance flow
- Build permission management UI with normalized system
- Create member listing and permission details pages

### Phase 3: Task Management with New Permission System
- Implement task creation with permission checks
- Build task status updates with new updateTask permission
- Create task assignment and management flows

### Phase 4: Complete Feature Set
- Implement event creation and management
- Build file upload and external link functionality
- Add real-time updates and notifications 