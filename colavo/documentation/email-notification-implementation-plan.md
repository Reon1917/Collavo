# Email Notification Implementation Plan - Resend Integration

## SITUATION ANALYSIS

**Core Problem**: Users need automated email notifications for subtasks and events with flexible scheduling options.

**Key Constraints**:
- Timezone: Bangkok (UTC+7)
- Database already has `scheduledNotifications` table
- Resend API keys ready in environment
- Domain: collavo.me configured
- Production-ready implementation (no dev mode)

**Critical Variables**:
- Subtasks: User-defined days before deadline + specific time
- Events: Multi-user selection + timing logic + event date
- Bangkok timezone handling for all scheduling
- Resend integration with scheduling capabilities

## SOLUTION ARCHITECTURE

### 1. Database Layer (Already Implemented ✅)
```sql
-- scheduledNotifications table exists with:
- type: 'subtask' | 'event'
- entityId: subtask.id or event.id  
- recipientUserId: single user (subtasks)
- recipientUserIds: array of users (events)
- scheduledFor: timestamp in Bangkok timezone
- daysBefore: user-defined days
- status: 'pending' | 'sent' | 'failed' | 'cancelled'
- emailId: Resend email ID for tracking
```

### 2. Core Backend Components (COMPLETED ✅)

#### A. Resend Service Layer (`/lib/email/resend-service.ts`) ✅
```typescript
class ResendEmailService {
  // Simplified unified email method
  static async sendEmail(params: {
    to: string[];
    subject: string;
    html: string;
    scheduledAt?: Date; // Optional scheduling
  }): Promise<{ emailId: string }>;

  // Cancel scheduled email
  static async cancelEmail(emailId: string): Promise<void>;

  // Update scheduled email
  static async updateEmail(emailId: string, newScheduledAt: Date): Promise<void>;
}
```

#### B. Notification Service Layer (`/lib/email/notification-service.ts`) ✅
```typescript
class NotificationService {
  // Create subtask notification (with input sanitization)
  static async createSubtaskNotification(params): Promise<string>;
  
  // Create event notification (with input sanitization)
  static async createEventNotification(params): Promise<string[]>;
  
  // Cancel notification
  static async cancelNotification(notificationId: string): Promise<void>;
  
  // Update notification
  static async updateNotification(notificationId: string, params): Promise<void>;
}
```

#### C. Timezone Utilities (`/utils/timezone.ts`) ✅
```typescript
// Bangkok timezone handling
function toBangkokTime(date: Date): Date;
function fromBangkokTime(date: Date): Date;
function calculateScheduleTime(deadline: Date, daysBefore: number, time: string): Date;
```

### 3. API Endpoints (COMPLETED ✅)

#### A. Subtask Notifications ✅
```
POST /api/projects/[id]/tasks/[taskId]/subtasks/[subtaskId]/notifications
PUT  /api/projects/[id]/tasks/[taskId]/subtasks/[subtaskId]/notifications/[notificationId]
DELETE /api/projects/[id]/tasks/[taskId]/subtasks/[subtaskId]/notifications/[notificationId]
GET  /api/projects/[id]/tasks/[taskId]/subtasks/[subtaskId]/notifications
```

#### B. Event Notifications ✅
```
POST /api/projects/[id]/events/[eventId]/notifications
PUT  /api/projects/[id]/events/[eventId]/notifications/[notificationId]
DELETE /api/projects/[id]/events/[eventId]/notifications/[notificationId]
GET  /api/projects/[id]/events/[eventId]/notifications
```

### 4. Email Templates (`/lib/email/templates/`) ✅
```typescript
// subtask-reminder.tsx ✅
function SubtaskReminderTemplate(params: {
  userName: string;
  subtaskTitle: string;
  deadline: Date;
  projectName: string;
  daysRemaining: number;
}): string;

// event-reminder.tsx ✅
function EventReminderTemplate(params: {
  userName: string;
  eventTitle: string;
  eventDate: Date;
  projectName: string;
  location?: string;
}): string;
```

## ENVIRONMENT CONFIGURATION

### Required Environment Variables:
```bash
# Required - Your Resend API key
RESEND_API_KEY=re_your_actual_key_here

# Required - Email address for sending (domain must be verified in Resend)
FROM_EMAIL=notifications@collavo.me

# Optional - Node environment
NODE_ENV=production
```

### Domain Setup in Resend Dashboard:
1. Add domain: `collavo.me`
2. Configure DNS records (provided by Resend dashboard)
3. Verify domain
4. Can use any email prefix: `notifications@collavo.me`, `noreply@collavo.me`, etc.

## IMPLEMENTATION STATUS

### ✅ COMPLETED PHASES:

#### Phase 1: Core Infrastructure ✅
- ✅ Environment validation (RESEND_API_KEY + FROM_EMAIL required)
- ✅ Resend SDK integration
- ✅ Timezone utilities
- ✅ Simplified email service

#### Phase 2: Notification Services ✅
- ✅ Database operations
- ✅ Permission checks integration
- ✅ Subtask notification creation/management
- ✅ Event notification creation/management
- ✅ Cancellation and update logic
- ✅ Input sanitization for security

#### Phase 3: API Endpoints ✅
- ✅ Subtask notification APIs (CREATE, UPDATE, DELETE, READ)
- ✅ Event notification APIs (CREATE, UPDATE, DELETE, READ)
- ✅ Multiple recipient handling

#### Phase 4: Email Templates ✅
- ✅ Professional HTML email templates
- ✅ Dynamic content based on notification type
- ✅ Responsive design

### 🔄 CURRENT STATUS: READY FOR TESTING
- Backend implementation complete
- Production mode enabled (no dev fallbacks)
- Input sanitization added
- Simplified email service architecture

### ⏳ PENDING: UI Integration
- Subtask dialog enhancement for notification setup
- Event dialog enhancement for user selection
- Notification management interface

## SECURITY IMPROVEMENTS IMPLEMENTED

**Input Sanitization** ✅:
- All user-generated content sanitized before email templates
- Protection against HTML injection in email content

**Environment Security** ✅:
- Required environment variables with validation
- No hardcoded dev emails or fallbacks

**Permission Validation** ✅:
- Project access checks before notification creation
- User permission validation in API endpoints

## READY FOR PRODUCTION TESTING

**What to test**:
1. **Environment Setup**: Verify `FROM_EMAIL=notifications@collavo.me` is set
2. **Domain Verification**: Ensure collavo.me is verified in Resend
3. **Basic Email**: Create a subtask with deadline and test notification
4. **Scheduling Logic**: Test different `daysBefore` values
5. **Cancellation**: Test notification cancellation
6. **Event Notifications**: Test multi-user event notifications

**Test Command**:
```bash
# Add to your .env
echo "FROM_EMAIL=notifications@collavo.me" >> .env

# Test the notification system through your UI
```

## VULNERABILITIES ADDRESSED

**FIXED**:
- ✅ Removed dev mode email hardcoding
- ✅ Added input sanitization
- ✅ Required environment validation
- ✅ Simplified error-prone logic

**REMAINING CONSIDERATIONS**:
- Rate limiting (implement if email volume becomes high)
- Webhook handling for delivery confirmation
- Email template versioning
- Retry mechanism for failed deliveries

The system is now production-ready and simplified for immediate testing with your verified collavo.me domain. 