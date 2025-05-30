# Collavo Implementation Plan

## Core Database Structure Reference
Our application is built on the following key database tables:
- `projects`: Stores project details and references leader
- `members`: Tracks project membership and permissions
- `mainTasks`: Stores parent tasks in a project
- `subTasks`: Stores child tasks assigned to specific members
- `events`: Stores project events/meetings
- `files`: Stores uploaded files and linked resources

## Permission System
The permission system is built around boolean flags in the `members` table:
- `createTask`: Ability to create main tasks and sub-tasks
- `handleTask`: Ability to edit/delete task details
- `handleEvent`: Ability to modify events
- `handleFile`: Ability to manage files (default: true)
- `addMember`: Ability to add new members
- `createEvent`: Ability to create new events
- `viewFiles`: Ability to view files (default: true)

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
     leaderId: currentUserId, // Current authenticated user
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
     createTask: true,
     handleTask: true,
     handleEvent: true,
     handleFile: true,
     addMember: true,
     createEvent: true, 
     viewFiles: true,
     joinedAt: new Date()
   };
   ```

#### Leader Permissions
- Project leaders have all permissions enabled by default
- Leaders can modify all aspects of the project including:
  - Adding/removing members
  - Modifying member permissions
  - Creating/editing/deleting tasks and events
  - Managing all files

### 2. Member Management

#### Adding Members
1. Leader navigates to the "Members" page within a project
2. Leader can add members via:
   - Email invitation (for users not yet in the system)
   - User ID (for existing users)

3. When adding by email:
   ```ts
   // Check if user exists with the email
   const existingUser = await getUserByEmail(email);
   
   if (existingUser) {
     // Add existing user as member
     await addMemberToProject(projectId, existingUser.id, defaultPermissions);
   } else {
     // Store invitation in a separate table
     // Send email with signup link that will add them to project upon registration
     await createAndSendInvitation(email, projectId);
   }
   ```

4. Default permissions for new members:
   ```ts
   const defaultMemberPermissions = {
     createTask: false,
     handleTask: false,
     handleEvent: false,
     handleFile: true,  // Can add/delete files by default
     addMember: false,
     createEvent: false,
     viewFiles: true    // Can view files by default
   };
   ```

#### Managing Member Permissions
1. Leader navigates to member details page
2. UI displays toggles for each permission type
3. Leader can enable/disable permissions
4. System updates member record with new permission settings:
   ```ts
   await updateMemberPermissions(memberId, {
     createTask: createTaskEnabled,
     handleTask: handleTaskEnabled,
     handleEvent: handleEventEnabled,
     handleFile: handleFileEnabled,
     addMember: addMemberEnabled,
     createEvent: createEventEnabled,
     viewFiles: viewFilesEnabled
   });
   ```

### 3. Task Management

#### Main Task Creation
1. User with `createTask` permission navigates to tasks page
2. User provides task details:
   - Title (required)
   - Description (optional)
   - Importance level (low/medium/high/critical)
   - Deadline (optional)
3. System creates main task:
   ```ts
   const newMainTask = {
     id: createId(),
     projectId: currentProjectId,
     title: taskTitle,
     description: taskDescription,
     importanceLevel: taskImportance, // From enum: low, medium, high, critical
     deadline: taskDeadline,
     createdBy: currentUserId,
     createdAt: new Date(),
     updatedAt: new Date()
   };
   ```

#### Sub-Task Creation
1. User with `createTask` permission selects a main task
2. User provides sub-task details:
   - Title (required)
   - Description (optional)
   - Assigned member (optional)
   - Deadline (optional)
3. System creates sub-task:
   ```ts
   const newSubTask = {
     id: createId(),
     mainTaskId: parentTaskId,
     projectId: currentProjectId,
     assignedId: assignedMemberId, // Can be null if unassigned
     title: subTaskTitle,
     description: subTaskDescription,
     status: "pending", // From enum: pending, in_progress, completed, cancelled
     note: null,
     deadline: subTaskDeadline,
     createdBy: currentUserId,
     createdAt: new Date(),
     updatedAt: new Date()
   };
   ```

#### Task Handling
1. **Task Editing**:
   - Users with `handleTask` permission can edit any task details
   - Task modification updates the `updatedAt` timestamp

2. **Task Status Updates**:
   - Leader (with `handleTask`) can update any sub-task status
   - Assigned members can update the status of their assigned sub-tasks:
     ```ts
     // Check if current user has permission to update this task
     const canUpdate = 
       currentUserId === task.assignedId || // Is assigned to the task
       userHasPermission(currentUserId, projectId, "handleTask") || // Has handleTask permission
       isProjectLeader(currentUserId, projectId); // Is project leader
     
     if (canUpdate) {
       await updateSubTaskStatus(taskId, newStatus);
     }
     ```

3. **Task Notes**:
   - Leaders can add/edit notes on any sub-task
   - Assigned members can add/edit notes on their assigned sub-tasks
   - Notes provide context for status changes or additional information

### 4. Event Management

#### Event Creation
1. Users with `createEvent` permission can create new events
2. Required event details:
   - Title
   - Date and time
   - Optional: description, location
3. System creates event record:
   ```ts
   const newEvent = {
     id: createId(),
     projectId: currentProjectId,
     title: eventTitle,
     description: eventDescription,
     datetime: eventDateTime,
     location: eventLocation,
     createdBy: currentUserId,
     createdAt: new Date(),
     updatedAt: new Date()
   };
   ```

#### Event Handling
1. Users with `handleEvent` permission can modify/delete events
2. All members can view events regardless of permissions
3. Event modifications update the `updatedAt` timestamp

### 5. File Management

#### File/Resource Addition
1. By default, all members can add files (`handleFile` = true)
2. File addition flow:
   - User uploads file or adds external link
   - System creates file record:
     ```ts
     const newFile = {
       id: createId(),
       projectId: currentProjectId,
       addedBy: currentUserId,
       name: fileName,
       description: fileDescription,
       url: fileIsExternalLink ? externalUrl : null,
       uploadThingId: fileIsUploaded ? uploadedFileId : null,
       size: fileSize,
       mimeType: fileMimeType,
       addedAt: new Date()
     };
     ```

3. File visibility:
   - By default, all members can view files (`viewFiles` = true)
   - Leader can restrict file viewing for specific members

## API Implementation Plan

### Authentication Endpoints
- `/api/auth/register` - User registration
- `/api/auth/login` - User login
- `/api/auth/logout` - User logout
- `/api/auth/reset-password` - Password reset

### Project Endpoints
- `/api/projects` - GET (list projects), POST (create project)
- `/api/projects/:id` - GET (project details), PUT (update project), DELETE (delete project)
- `/api/projects/:id/members` - GET (list members), POST (add member)
- `/api/projects/:id/members/:memberId` - GET (member details), PUT (update permissions), DELETE (remove member)

### Task Endpoints
- `/api/projects/:id/tasks` - GET (list main tasks), POST (create main task)
- `/api/projects/:id/tasks/:taskId` - GET (task details), PUT (update task), DELETE (delete task)
- `/api/projects/:id/tasks/:taskId/subtasks` - GET (list subtasks), POST (create subtask)
- `/api/projects/:id/tasks/:taskId/subtasks/:subtaskId` - GET, PUT, DELETE

### Event Endpoints
- `/api/projects/:id/events` - GET (list events), POST (create event)
- `/api/projects/:id/events/:eventId` - GET, PUT, DELETE

### File Endpoints
- `/api/projects/:id/files` - GET (list files), POST (upload file/add link)
- `/api/projects/:id/files/:fileId` - GET, PUT, DELETE

## Frontend Implementation

### Access Control Logic
All UI elements should respect permission settings:
```ts
// Example permission check function
function canPerformAction(
  userId: string, 
  projectId: string, 
  action: 'createTask' | 'handleTask' | 'createEvent' | 'handleEvent' | 'addMember' | 'handleFile' | 'viewFiles'
): boolean {
  // Check if user is project leader
  if (isProjectLeader(userId, projectId)) {
    return true;
  }
  
  // Get member record
  const memberRecord = getMemberRecord(userId, projectId);
  if (!memberRecord) return false;
  
  // Check specific permission
  return memberRecord[action] === true;
}
```

### UI Components
- Use permission checks to conditionally render UI elements
- Disable action buttons when user lacks permission
- Show appropriate messaging when permissions are missing

## Implementation Phases

### Phase 1: Core Authentication and Project Creation
- Implement user registration/login flow
- Create project creation functionality
- Setup basic project dashboard

### Phase 2: Member and Permission Management
- Implement member invitation system
- Build permission management UI
- Create member listing and details pages

### Phase 3: Task Management
- Implement main task and sub-task creation
- Build task listing, filtering, and details views
- Create task status update functionality

### Phase 4: Events and Files
- Implement event creation and management
- Build file upload and external link functionality
- Create file browser and preview components 