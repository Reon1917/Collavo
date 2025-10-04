# Collavo Use Case Diagrams

This document captures essential flows for Collavo based on the current Next.js App Router implementation, API contracts (`app/api/projects`, `app/api/projects/[id]`, `app/api/uploadthing`), and Drizzle schema (`db/schema.ts`). Each section combines a brief description with PlantUML code ready for rendering.

## Authentication & Accounts

Handles onboarding, login, credential recovery, and invitation acceptance through Better Auth and email services.

```plantuml
@startuml
left to right direction
actor Visitor
actor "Existing User" as User
actor "Invited User" as Invitee
actor "Better Auth" as Auth
actor "Email Service" as Mail

rectangle Collavo {
  usecase "Register Account" as UC_Register
  usecase "Log In" as UC_Login
  usecase "Reset Password" as UC_Reset
  usecase "Manage Profile" as UC_Profile
  usecase "Accept Invitation" as UC_Accept
  usecase "Send Auth Emails" as UC_Email
}

Visitor --> UC_Register
Visitor --> UC_Login
Visitor --> UC_Reset
User --> UC_Profile
Invitee --> UC_Accept

UC_Register --> Auth
UC_Login --> Auth
UC_Reset --> Auth
UC_Profile --> Auth
UC_Accept --> Auth

UC_Reset --> UC_Email : �include�
UC_Accept --> UC_Email : �include�
Auth --> UC_Email
Mail --> UC_Email
@enduml
```

## Project Governance

Summarizes how leaders shape project workspaces, manage access, and schedule reminders.

```plantuml
@startuml
left to right direction
actor "Project Leader" as Leader
actor "System Scheduler" as Scheduler

rectangle Collavo {
  usecase "Create Project" as UC_CreateProject
  usecase "Edit Project Details" as UC_EditProject
  usecase "Configure Permissions" as UC_Permissions
  usecase "Invite or Remove Members" as UC_Members
  usecase "Define Task Structure" as UC_TaskStructure
  usecase "Schedule Events" as UC_Events
  usecase "Enable Reminder Rules" as UC_Reminders
}

Leader --> UC_CreateProject
Leader --> UC_EditProject
Leader --> UC_Permissions
Leader --> UC_Members
Leader --> UC_TaskStructure
Leader --> UC_Events
Leader --> UC_Reminders

UC_Reminders --> Scheduler : �include�
@enduml
```

## Collaboration & Execution

Shows day-to-day teaming interactions for members and read-only viewers.

```plantuml
@startuml
left to right direction
actor "Team Member" as Member
actor "Project Viewer" as Viewer
actor "Chat Gateway" as Chat

rectangle Collavo {
  usecase "Browse Assigned Projects" as UC_ViewProjects
  usecase "Update Task Progress" as UC_UpdateTasks
  usecase "Manage Subtasks & Notes" as UC_Subtasks
  usecase "Share and Open Files" as UC_Files
  usecase "Chat with Team" as UC_Chat
  usecase "Review Event Timeline" as UC_EventsView
  usecase "Receive Notifications" as UC_Notifications
}

Member --> UC_ViewProjects
Member --> UC_UpdateTasks
Member --> UC_Subtasks
Member --> UC_Files
Member --> UC_Chat
Member --> UC_EventsView
Member --> UC_Notifications

Viewer --> UC_ViewProjects
Viewer --> UC_EventsView
Viewer --> UC_Files

UC_Chat --> Chat : �include�
@enduml
```

## Support Services & Integrations

Highlights background systems that underpin Collavo features.

```plantuml
@startuml
left to right direction
actor "Background Worker" as Worker
actor "File Storage Provider" as Storage
actor "Email Service" as Mail
actor "Auth Provider" as Auth

rectangle Collavo {
  usecase "Persist Project Data" as UC_DB
  usecase "Authenticate Requests" as UC_AuthGuard
  usecase "Queue Reminder Emails" as UC_EmailQueue
  usecase "Upload & Serve Files" as UC_FileTransfer
  usecase "Cleanup Expired Data" as UC_Cleanup
}

UC_AuthGuard --> Auth
UC_EmailQueue --> Mail
UC_FileTransfer --> Storage
UC_Cleanup --> Worker
UC_DB --> Worker
@enduml
```

## Project Creation Flow

Expands the creation path from form submission to seeded permissions in `app/api/projects/route.ts`.

```plantuml
@startuml
left to right direction
actor "Project Leader" as Leader
actor "Better Auth" as Auth
actor "Projects DB" as PDB
actor "Members DB" as MDB

rectangle "Create Project Flow" {
  usecase "Submit Project Form" as UC_Form
  usecase "Validate Session" as UC_Session
  usecase "Persist Project" as UC_SaveProject
  usecase "Add Leader Membership" as UC_AddMember
  usecase "Grant Default Permissions" as UC_GrantPerms
}

Leader --> UC_Form
UC_Form --> UC_Session
UC_Session --> Auth
UC_Session --> UC_SaveProject
UC_SaveProject --> PDB
UC_SaveProject --> UC_AddMember
UC_AddMember --> MDB
UC_AddMember --> UC_GrantPerms
UC_GrantPerms --> MDB
UC_GrantPerms --> Leader
@enduml
```

## Task Creation Flow

Captures `POST /api/projects/{id}/tasks` logic for forming main tasks with nested subtasks.

```plantuml
@startuml
left to right direction
actor "Authorized User" as User
actor "Auth Guard" as Guard
actor "Main Tasks DB" as TaskDB
actor "Subtasks DB" as SubtaskDB

rectangle "Create Task Flow" {
  usecase "Compose Task Payload" as UC_Compose
  usecase "Check createTask Permission" as UC_Perm
  usecase "Insert Main Task" as UC_MainTask
  usecase "Insert Subtasks" as UC_Subtask
  usecase "Return Created Task" as UC_Return
}

User --> UC_Compose
UC_Compose --> UC_Perm
UC_Perm --> Guard
UC_Perm --> UC_MainTask
UC_MainTask --> TaskDB
UC_MainTask --> UC_Subtask
UC_Subtask --> SubtaskDB
UC_Subtask --> UC_Return
UC_Return --> User
@enduml
```

### Sequence Diagram (Mermaid)

```mermaid
sequenceDiagram
    participant User as Authorized User
    participant TaskRoute as Task API Route
    participant Guard as Auth Guard
    participant TaskDB as Main Tasks DB
    participant SubtaskDB as Subtasks DB

    User->>TaskRoute: Submit task payload
    TaskRoute->>TaskRoute: Validate and normalize input
    TaskRoute->>Guard: checkPermission(createTask)
    alt Permission denied
        Guard-->>TaskRoute: reject access
        TaskRoute-->>User: 403 Unauthorized response
    else Permission granted
        Guard-->>TaskRoute: allow
        TaskRoute->>TaskDB: insertMainTask(payload)
        TaskDB-->>TaskRoute: mainTaskId
        opt Subtasks provided
            TaskRoute->>SubtaskDB: insertSubtasks(mainTaskId, subtasks)
            SubtaskDB-->>TaskRoute: subtasks persisted
        end
        TaskRoute-->>User: Created task response
    end
```

## Event Creation Flow

Details how leaders define milestones and optional reminder schedules.

```plantuml
@startuml
left to right direction
actor "Leader" as Leader
actor "Auth Guard" as Guard
actor "Events DB" as EventDB
actor "Notification Scheduler" as Scheduler

rectangle "Create Event Flow" {
  usecase "Enter Event Details" as UC_EventForm
  usecase "Authorize Event Creation" as UC_EventPerm
  usecase "Store Event" as UC_SaveEvent
  usecase "Configure Reminders" as UC_Reminders
}

Leader --> UC_EventForm
UC_EventForm --> UC_EventPerm
UC_EventPerm --> Guard
UC_EventPerm --> UC_SaveEvent
UC_SaveEvent --> EventDB
UC_SaveEvent --> UC_Reminders
UC_Reminders --> Scheduler
Scheduler --> Leader
@enduml
```

## File Upload Flow

Maps the file upload path via Uploadthing middleware and metadata persistence.

```plantuml
@startuml
left to right direction
actor "Project Member" as Member
actor "Uploadthing API" as Uploadthing
actor "File Storage" as Storage
actor "Files DB" as FileDB

rectangle "File Upload Flow" {
  usecase "Choose File" as UC_Select
  usecase "Request Upload URL" as UC_RequestURL
  usecase "Authorize Upload" as UC_Authorize
  usecase "Upload Binary" as UC_Upload
  usecase "Save Metadata" as UC_Metadata
}

Member --> UC_Select
UC_Select --> UC_RequestURL
UC_RequestURL --> Uploadthing
Uploadthing --> UC_Authorize
UC_Authorize --> UC_Upload
UC_Upload --> Storage
Uploadthing --> UC_Metadata
UC_Metadata --> FileDB
FileDB --> Member
@enduml
```

## Permission Management Flow

Illustrates how leaders adjust member capabilities for a project.

```plantuml
@startuml
left to right direction
actor "Project Leader" as Leader
actor "Auth Guard" as Guard
actor "Permissions DB" as PermDB

rectangle "Permission Update Flow" {
  usecase "Select Member" as UC_SelectMember
  usecase "Review Current Permissions" as UC_Review
  usecase "Authorize Change" as UC_CheckPerm
  usecase "Update Permission Flags" as UC_Update
}

Leader --> UC_SelectMember
UC_SelectMember --> UC_Review
UC_Review --> UC_CheckPerm
UC_CheckPerm --> Guard
UC_CheckPerm --> UC_Update
UC_Update --> PermDB
PermDB --> Leader
@enduml
```

## Member Invitation Flow

Shows the process of inviting peers and provisioning access.

```plantuml
@startuml
left to right direction
actor "Project Leader" as Leader
actor "Invitee" as Invitee
actor "Invitation Service" as InviteService
actor "Members DB" as MemberDB
actor "Email Service" as Mail

rectangle "Invite Member Flow" {
  usecase "Enter Invite Details" as UC_Details
  usecase "Generate Invitation Token" as UC_Generate
  usecase "Send Email" as UC_SendEmail
  usecase "Accept Invitation" as UC_Accept
  usecase "Create Member Record" as UC_CreateMember
}

Leader --> UC_Details
UC_Details --> UC_Generate
UC_Generate --> InviteService
UC_Generate --> UC_SendEmail
UC_SendEmail --> Mail
Invitee --> UC_Accept
UC_Accept --> InviteService
UC_Accept --> UC_CreateMember
UC_CreateMember --> MemberDB
MemberDB --> Invitee
@enduml
```

