# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Collavo** is a Next.js 15 student project management platform that enables students to manage assignments individually or collaborate in teams of up to 5 members. The platform provides task management, file sharing, real-time chat, timeline visualization, and email notifications.

## Development Commands

### Core Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production 
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

### Database Operations
- `npx drizzle-kit generate` - Generate database migrations
- `npx drizzle-kit push` - Push schema changes to database
- `npx drizzle-kit studio` - Open Drizzle Studio for database management

### Testing
- Test files are located in `utils/__tests__/` directory
- Uses Jest/Vitest for testing timezone utilities
- Run tests with the appropriate test command (check package.json for exact command)

## Technology Stack

### Core Framework
- **Next.js 15** with App Router (file-based routing)
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library built on Radix UI

### Database & ORM
- **Neon Database** (serverless PostgreSQL)
- **Drizzle ORM** with PostgreSQL dialect
- Database connection via `DATABASE_URL` environment variable
- Schema defined in `db/schema.ts`

### Authentication
- **Better Auth** with email/password and Google OAuth
- Session management with 7-day expiration
- Configuration in `lib/auth.ts`

### Real-time Features
- **Supabase** for chat and presence tracking
- Real-time message synchronization
- Online member status indicators

### File Management
- **UploadThing** for file uploads with permissions
- **Resend** for email notifications
- File types: PDF, DOCX, XLSX, PPTX (4MB limit)

### State Management
- **Zustand** for global state
- **TanStack Query** for server state and caching
- Custom hooks for data fetching

### Theme System
- **Custom Theme Engine** with 8 predefined themes (Ocean Breeze, Vercel Black, Creative Cosmos, Solar Flare, Forest Haven, Graphite, High Contrast, Rose Garden)
- **Dynamic Theme Switching** with real-time color updates
- **Dark/Light Mode Support** for all themes
- **Accessibility Compliance** with WCAG AAA theme option
- **Theme Persistence** via localStorage
- **CSS Custom Properties** for seamless theme transitions

## Architecture Overview

### Database Schema
The PostgreSQL schema includes:
- **users/sessions/accounts** - Authentication tables (Better Auth)
- **projects** - Main project entities with leader relationships
- **members** - Project membership with roles (leader/member)
- **permissions** - Granular access control system
- **main_tasks/sub_tasks** - Two-tier task management
- **events** - Calendar events with notifications
- **files** - File management with UploadThing integration
- **scheduled_notifications** - Email notification system
- **messages/user_presence** - Real-time chat (Supabase)

### Permission System
Enhanced role-based access with granular permissions:
- **createTask**, **handleTask**, **updateTask**
- **handleEvent**, **createEvent**
- **handleFile**, **viewFiles**
- **addMember**
- **Dynamic Permission Management** with toggle-based UI
- **Permission-aware request handling** with automatic refresh
- **Leader-only permission management** for enhanced security

### Component Architecture
- **Server Components** by default (async, direct data fetching)
- **Client Components** only when needed ('use client' directive)
- Feature-based organization: `/components/project/TasksView/`, `/components/project/EventsView/`, etc.
- Compound components for complex UI patterns
- Custom hooks for data fetching and state management

### API Structure
RESTful API with nested routes:
```
/api/auth/[...all]                    # Authentication
/api/projects/                        # Project CRUD
/api/projects/[id]/tasks/             # Task management
/api/projects/[id]/events/            # Event management
/api/projects/[id]/files/             # File management
/api/projects/[id]/chat/              # Real-time chat
/api/projects/[id]/presence/          # User presence
/api/uploadthing/                     # File uploads
```

## Key Development Patterns

### TypeScript Standards
- Strict TypeScript configuration enabled
- All function parameters and return types must be explicitly typed
- No `any` types - use `unknown` if needed
- Proper error handling with custom error types
- Form validation with typed interfaces

### Component Development
- Prefer server components over client components
- Use async server components for data fetching
- Proper loading states with Suspense boundaries
- Error boundaries for graceful error handling
- Type all component props with interfaces

### Database Operations
- Use Drizzle ORM with type inference
- Schema types: `typeof table.$inferSelect` and `typeof table.$inferInsert`
- Proper error handling for database operations
- Use transactions for complex operations

### Email Notifications
- **Resend** service for email delivery with scheduling capabilities
- **Advanced Notification System** for subtasks and events
- **Flexible Scheduling** with customizable days-before and time settings
- **Template-based HTML emails** in `lib/email/templates/`
- **Timezone handling** with Luxon (Asia/Bangkok)
- **Email cancellation and updating** support
- **Batch notification creation** for events with multiple recipients
- **Sanitized email content** to prevent injection attacks

## Environment Variables

Required environment variables:
- `DATABASE_URL` - Neon database connection string
- `BETTER_AUTH_SECRET` - Authentication secret
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `UPLOADTHING_SECRET` / `UPLOADTHING_APP_ID` - File upload service
- `RESEND_API_KEY` - Email service
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` - Real-time features

## File Structure

```
app/                     # Next.js App Router
├── api/                # API routes
├── dashboard/          # Dashboard page
├── project/[id]/       # Dynamic project pages
└── (auth)/            # Authentication pages

components/             # React components
├── ui/                # Reusable UI components (shadcn/ui)
├── project/           # Project-specific components
│   ├── TasksView/     # Task management
│   ├── EventsView/    # Event management
│   ├── FilesView/     # File management
│   └── chat/          # Real-time chat
└── shared/            # Shared components

hooks/                 # Custom React hooks
lib/                   # Utility libraries
├── auth.ts           # Authentication config
├── email/            # Email service and templates
├── themes/           # Theme system (definitions and utilities)
└── stores/           # State management

db/                    # Database schema and config
utils/                 # Utility functions
providers/            # React context providers
types/                # TypeScript type definitions
```

## Testing

- Unit tests for utilities in `utils/__tests__/`
- Focus on timezone handling and date calculations
- Mock external services (Supabase, Resend, UploadThing)
- Test database operations with proper cleanup

## Development Guidelines

### Code Quality
- Follow strict TypeScript rules in `.cursor/rules/typescript.mdc`
- Use server components by default, client components only when necessary
- Implement proper error handling and loading states
- Use meaningful component and function names
- Follow the component patterns in `.cursor/rules/react-design.mdc`

### Database Development
- Always use migrations for schema changes
- Type all database operations with Drizzle inference
- Use proper foreign key relationships
- Implement soft deletes where appropriate

### Security
- Never expose sensitive environment variables
- Validate all user inputs
- Use permission checks on all API endpoints
- Implement proper session management
- Sanitize data before database operations

### Performance
- Use Next.js built-in optimizations
- Implement proper caching strategies
- Use React.memo judiciously
- Optimize database queries
- Use streaming for large datasets

## Common Issues

### Database Connection
- Ensure DATABASE_URL is properly configured
- Use connection pooling for production
- Handle connection errors gracefully

### Authentication
- Better Auth requires proper session handling
- OAuth providers need correct redirect URLs
- Session tokens expire after 7 days

### Real-time Features
- Supabase connection issues: check environment variables
- Chat messages: ensure proper user permissions
- Presence tracking: handle connection states

### File Uploads
- UploadThing has specific file type and size limits
- Ensure proper permissions before upload
- Handle upload failures gracefully

### Email Notifications
- Resend API key must be valid
- Email templates must be properly formatted
- Handle timezone calculations correctly with Luxon

## Recent Updates & Features

### Theme System Implementation
- Added comprehensive theming system with 8 unique themes
- Implemented dynamic theme switching with real-time updates
- Created accessibility-compliant high contrast theme
- Added theme persistence and smooth transitions

### Enhanced Email Notifications
- Upgraded notification system with flexible scheduling
- Added support for email cancellation and rescheduling
- Implemented batch notifications for events
- Enhanced security with email content sanitization

### Permission Management Improvements
- Added dynamic permission toggle interface
- Implemented permission-aware request handling
- Enhanced security with leader-only permission management
- Improved user experience with automatic permission refresh

### UI/UX Enhancements
- Updated switch component for better accessibility
- Improved file management interface
- Enhanced member management with permission controls
- Added themed components throughout the application

## Deployment

- Production deployment on Vercel
- Environment variables must be set in deployment platform
- Database migrations run automatically
- Build process includes TypeScript compilation and linting