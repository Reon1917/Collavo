# Collavo API Reference

This document provides a detailed reference for all API endpoints in the Collavo application.

## Authentication

Authentication is handled by **Better Auth**. Please refer to the `better-auth` documentation for details on authentication endpoints under `/api/auth`.

- **POST /api/auth/email/login** - Login with email and password.
- **POST /api/auth/email/register** - Register a new user.
- **GET /api/auth/session** - Get the current user session.
- **POST /api/auth/reset-password** - Initiate password reset.
- **... and other Better Auth endpoints.**

## Projects

Resource path: `/api/projects`

### List Projects

- **Endpoint**: `GET /api/projects`
- **Description**: Retrieves a list of projects associated with the authenticated user. It separates projects where the user is a leader from those where they are a member.
- **Authentication**: Required.
- **Response (200 OK)**:
  ```json
  {
    "ledProjects": [
      {
        "id": "proj_...",
        "name": "Project Alpha",
        "description": "...",
        "deadline": "2025-12-31T23:59:59.000Z",
        "leaderId": "user_...",
        "createdAt": "..."
      }
    ],
    "memberProjects": [
      {
        "id": "proj_...",
        "name": "Project Beta",
        "description": "...",
        "deadline": "2025-11-30T23:59:59.000Z",
        "leaderId": "user_...",
        "createdAt": "..."
      }
    ],
    "total": 2
  }
  ```

### Create Project

- **Endpoint**: `POST /api/projects`
- **Description**: Creates a new project. The authenticated user is automatically assigned as the project leader with full permissions.
- **Authentication**: Required.
- **Request Body**:
  ```json
  {
    "name": "New Awesome Project",
    "description": "This is a detailed description.",
    "deadline": "2026-01-15"
  }
  ```
- **Validation**:
  - `name`: Required, string, max 255 characters.
  - `description`: Optional, string.
  - `deadline`: Optional, string (ISO 8601 date format).
- **Response (201 Created)**:
  ```json
  {
    "id": "proj_...",
    "name": "New Awesome Project",
    "description": "This is a detailed description.",
    "deadline": "2026-01-15T00:00:00.000Z",
    "leaderId": "user_...",
    "createdAt": "..."
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If validation fails.
  - `401 Unauthorized`: If the user is not authenticated.
  - `500 Internal Server Error`: If the transaction fails.

---

### Get Project Details

- **Endpoint**: `GET /api/projects/{id}`
- **Description**: Retrieves detailed information for a single project, including its members and the current user's permissions.
- **Authentication**: Required. User must be a member or leader of the project.
- **URL Parameters**:
  - `id`: The ID of the project.
- **Response (200 OK)**:
  ```json
  {
    "id": "proj_...",
    "name": "Project Alpha",
    "description": "...",
    "deadline": "...",
    "leaderId": "user_...",
    "createdAt": "...",
    "members": [
      {
        "id": "mem_...",
        "role": "leader",
        "user": { "id": "user_...", "name": "Admin User", "email": "admin@example.com", "image": "..." },
        "permissions": ["createTask", "addMember", "..."]
      }
    ],
    "userPermissions": ["createTask", "addMember", "..."],
    "isLeader": true,
    "userRole": "leader"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Not authenticated.
  - `403 Forbidden`: Not a member of the project.
  - `404 Not Found`: Project not found.

### Update Project

- **Endpoint**: `PUT /api/projects/{id}`
- **Description**: Updates the details of a project.
- **Authentication**: Required. User must be the project leader.
- **Request Body**:
  ```json
  {
    "name": "Updated Project Name",
    "description": "Updated description.",
    "deadline": "2026-02-20"
  }
  ```
- **Response (200 OK)**: The updated project object.
- **Error Responses**:
  - `403 Forbidden`: User is not the project leader.

### Delete Project

- **Endpoint**: `DELETE /api/projects/{id}`
- **Description**: Deletes a project and all its associated data (tasks, members, files, etc.) via cascading deletes in the database.
- **Authentication**: Required. User must be the project leader.
- **Response (204 No Content)**.
- **Error Responses**:
  - `403 Forbidden`: User is not the project leader.

## Members

Resource path: `/api/projects/{id}/members`

### Add Member

- **Endpoint**: `POST /api/projects/{id}/members`
- **Description**: Adds a new member to a project. Default permissions (`handleFile`, `viewFiles`) are granted.
- **Authentication**: Required. User must have the `addMember` permission for the project.
- **Request Body**:
  ```json
  {
    "identifier": "new.member@example.com",
    "type": "email"
  }
  ```
- **Validation**:
  - `identifier`: Required, string. The user's email, username, or ID.
  - `type`: Required, enum (`email`, `username`, `id`).
- **Response (201 Created)**: The new member object.
- **Error Responses**:
  - `400 Bad Request`: User not found or already a member.
  - `403 Forbidden`: Insufficient permissions.

## Tasks

Resource path: `/api/projects/{id}/tasks`

### List Tasks

- **Endpoint**: `GET /api/projects/{id}/tasks`
- **Description**: Retrieves a list of main tasks for a project. Task visibility is based on user permissions.
  - **Leaders & users with `viewFiles` permission**: See all tasks.
  - **Regular members**: See only tasks where they are assigned to at least one sub-task.
- **Authentication**: Required. User must be a member of the project.
- **Response (200 OK)**: An array of main tasks, each with its sub-tasks.
  ```json
  [
    {
      "id": "main_task_...",
      "title": "Design the new UI",
      "importanceLevel": "high",
      "deadline": "...",
      "subTasks": [
        {
          "id": "sub_task_...",
          "title": "Create wireframes",
          "status": "pending",
          "assignedTo": { "id": "user_...", "name": "Designer" }
        }
      ]
    }
  ]
  ```

### Create Task

- **Endpoint**: `POST /api/projects/{id}/tasks`
- **Description**: Creates a new main task along with its sub-tasks in a single transaction.
- **Authentication**: Required. User must have the `createTask` permission.
- **Request Body**:
  ```json
  {
    "title": "Develop Feature X",
    "description": "...",
    "importanceLevel": "critical",
    "deadline": "2025-10-10",
    "subTasks": [
      {
        "title": "Setup database schema",
        "assignedId": "user_..."
      },
      {
        "title": "Build API endpoints"
      }
    ]
  }
  ```
- **Response (201 Created)**: The newly created main task with its sub-tasks.

## File Uploads

Resource path: `/api/uploadthing`

- **Endpoint**: `POST /api/uploadthing`
- **Description**: Handles file uploads using the `uploadthing` library. This is a managed endpoint.
- **Authentication**: Handled by `uploadthing`'s middleware, which checks for a valid user session.
- **Usage**: This endpoint is typically used by the `uploadthing` client library on the frontend.

## Email Notifications

### Create Sub-task Notification

- **Endpoint**: `POST /api/projects/{projectId}/tasks/{taskId}/subtasks/{subtaskId}/notifications`
- **Description**: Schedules an email notification for a sub-task.
- **Authentication**: Required. User must have access to the sub-task.
- **Request Body**:
  ```json
  {
    "daysBefore": 3,
    "time": "09:00"
  }
  ```
- **Response (201 Created)**: The scheduled notification object.

### Create Event Notification

- **Endpoint**: `POST /api/projects/{projectId}/events/{eventId}/notifications`
- **Description**: Schedules an email notification for an event for multiple project members.
- **Authentication**: Required. User must have permission to manage events.
- **Request Body**:
  ```json
  {
    "recipientIds": ["user_1", "user_2"],
    "daysBefore": 1,
    "time": "10:30"
  }
  ```
- **Response (201 Created)**: An array of scheduled notification objects.
