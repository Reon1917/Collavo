# Backend Services Documentation

This document details the architecture and implementation of Collavo's core backend services.

## 1. Authentication Service (`lib/auth.ts`)

- **Technology**: `better-auth`
- **Responsibility**: Handles all aspects of user authentication, including registration, login, session management, and social providers (Google).
- **Configuration**:
  - **Database Adapter**: `drizzleAdapter` for PostgreSQL.
  - **Providers**: Email/Password and Google OAuth are enabled.
  - **Session Management**: Sessions are configured to expire in 7 days and are updated every 24 hours.
  - **Security**: CSRF protection and rate limiting are enabled by default.
- **Key Functions**:
  - `auth.api.getSession()`: Retrieves the current user session in API routes.
  - `auth.pages.getSession()`: Retrieves the session in Next.js pages.
  - `auth.email.sendVerificationEmail()`: Sends email verification links.

## 2. Authorization and Access Control (`lib/auth-helpers.ts`)

- **Responsibility**: Provides a centralized system for checking user permissions related to projects. This service is crucial for securing data and ensuring users can only perform actions they are authorized for.
- **Core Function**: `checkProjectAccess(projectId, userId)`
  - **Purpose**: The main function to determine a user's access level to a specific project.
  - **Returns**: An `ProjectAccess` object containing:
    - `hasAccess`: Boolean indicating if the user can view the project.
    - `isLeader`: Boolean indicating if the user is the project leader.
    - `role`: The user's role (`leader` or `member`).
    - `permissions`: An array of specific permissions the user has (e.g., `createTask`, `addMember`).
- **Helper Functions**:
  - `requireProjectAccess(userId, projectId)`: Throws an error if the user does not have access.
  - `requireLeaderRole(userId, projectId)`: Throws an error if the user is not the project leader.
  - `requirePermission(userId, projectId, permission)`: Throws an error if the user does not have a specific permission.
- **Usage**: These helpers are called at the beginning of API routes to protect endpoints.

## 3. Database Service (`db/index.ts`)

- **Technology**: `drizzle-orm` with `neon-http` driver.
- **Responsibility**: Manages the database connection and provides the `db` instance for all database operations.
- **Connection Management**:
  - It uses the Neon serverless driver, which is optimized for HTTP connections and manages connection pooling automatically. This is ideal for a serverless environment like Vercel.
- **Schema**: The database schema is defined in `db/schema.ts` and includes tables for projects, members, tasks, permissions, etc.

## 4. Email Notification Service

This service is composed of two main parts:

### a) Resend Service (`lib/email/resend-service.ts`)

- **Technology**: `resend`
- **Responsibility**: A low-level service that acts as a wrapper around the Resend API.
- **Core Function**: `sendEmail(options)`
  - **Parameters**: `to`, `subject`, `html`, and `sendAt` (for scheduled emails).
  - **Error Handling**: It includes robust error handling and validates the presence of the `RESEND_API_KEY` and `FROM_EMAIL` environment variables.

### b) Notification Service (`lib/email/notification-service.ts`)

- **Responsibility**: A high-level service for managing the business logic of scheduling and creating notifications.
- **Key Functions**:
  - `createSubtaskNotification(data)`: Creates a database record for a scheduled sub-task notification and calls the `ResendService` to schedule the email.
  - `createEventNotification(data)`: Does the same for event notifications, handling multiple recipients.
- **Timezone Handling**: All scheduling calculations are performed with the **Bangkok (UTC+7)** timezone in mind, as per project requirements.

## 5. API Error Handling

- **Location**: Implemented within each API route.
- **Strategy**: A `try...catch` block wraps the entire route logic.
- **Centralized Logic (`handleError` function)**: While not a separate service, a common pattern or function is used to handle errors consistently.
  - It checks for specific error messages (e.g., from `requirePermission`) to return appropriate HTTP status codes (403 for permission denied, 404 for not found).
  - Generic errors result in a `500 Internal Server Error` to avoid leaking implementation details.

## Interactions and Flow

A typical API request flows through these services as follows:

1.  **Request Received**: An API route (e.g., `POST /api/projects/{id}/tasks`) receives a request.
2.  **Authentication**: It calls `auth.api.getSession()` to verify the user is logged in.
3.  **Authorization**: It uses `requirePermission()` from `lib/auth-helpers.ts` to check if the user has the `createTask` permission.
4.  **Validation**: The route validates the request body.
5.  **Business Logic**: The route interacts with the **Database Service** (`db`) to perform the necessary operations (e.g., creating a task and sub-tasks in a transaction).
6.  **Response**: A success or error response is sent back to the client.

This architecture ensures a clear separation of concerns, making the backend more maintainable, secure, and scalable.