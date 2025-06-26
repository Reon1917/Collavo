# Email Notification Implementation Plan - Resend Integration

## SITUATION ANALYSIS

**Core Problem**: Users need automated email notifications for subtasks and events with flexible scheduling options.

**Key Constraints**:
- Timezone: Bangkok (UTC+7)
- Database already has `scheduledNotifications` table
- Resend API keys ready in environment
- Focus on backend functionality first, simple UI

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

### 2. Core Backend Components

#### A. Resend Service Layer (`/lib/email/resend-service.ts`)
```typescript
class ResendEmailService {
  // Schedule email notification
  async scheduleNotification(params: {
    recipientEmails: string[];
    subject: string;
    html: string;
    scheduledAt: Date; // Bangkok time converted to UTC
  }): Promise<{ emailId: string }>;

  // Cancel scheduled email
  async cancelNotification(emailId: string): Promise<void>;

  // Update scheduled email
  async updateNotification(emailId: string, newScheduledAt: Date): Promise<void>;
}
```

#### B. Notification Service Layer (`/lib/email/notification-service.ts`)
```typescript
class NotificationService {
  // Create subtask notification
  async createSubtaskNotification(params: {
    subtaskId: string;
    userId: string;
    daysBefore: number;
    time: string; // "09:00" format
    projectId: string;
  }): Promise<void>;

  // Create event notification  
  async createEventNotification(params: {
    eventId: string;
    recipientUserIds: string[];
    daysBefore: number;
    time: string;
    projectId: string;
  }): Promise<void>;

  // Cancel notification
  async cancelNotification(notificationId: string): Promise<void>;
  
  // Update notification
  async updateNotification(notificationId: string, params: UpdateParams): Promise<void>;
}
```

#### C. Timezone Utilities (`/utils/timezone.ts`)
```typescript
// Bangkok timezone handling
function toBangkokTime(date: Date): Date;
function fromBangkokTime(date: Date): Date;
function calculateScheduleTime(deadline: Date, daysBefore: number, time: string): Date;
```

### 3. API Endpoints

#### A. Subtask Notifications
```
POST /api/projects/[id]/tasks/[taskId]/subtasks/[subtaskId]/notifications
PUT  /api/projects/[id]/tasks/[taskId]/subtasks/[subtaskId]/notifications/[notificationId]
DELETE /api/projects/[id]/tasks/[taskId]/subtasks/[subtaskId]/notifications/[notificationId]
GET  /api/projects/[id]/tasks/[taskId]/subtasks/[subtaskId]/notifications
```

#### B. Event Notifications
```
POST /api/projects/[id]/events/[eventId]/notifications
PUT  /api/projects/[id]/events/[eventId]/notifications/[notificationId]
DELETE /api/projects/[id]/events/[eventId]/notifications/[notificationId]
GET  /api/projects/[id]/events/[eventId]/notifications
```

### 4. Email Templates (`/lib/email/templates/`)
```typescript
// subtask-reminder.tsx
function SubtaskReminderTemplate(params: {
  userName: string;
  subtaskTitle: string;
  deadline: Date;
  projectName: string;
  daysRemaining: number;
}): string;

// event-reminder.tsx
function EventReminderTemplate(params: {
  userName: string;
  eventTitle: string;
  eventDate: Date;
  projectName: string;
  location?: string;
}): string;
```

## EXECUTION FRAMEWORK

### Phase 1: Core Infrastructure (Day 1)
1. **Environment Setup**
   - Verify Resend API keys in `.env`
   - Install Resend SDK: `npm install resend`

2. **Timezone Utils**
   - Implement Bangkok timezone conversion functions
   - Add date calculation utilities

3. **Resend Service**
   - Basic email scheduling with Resend API
   - Error handling and retry logic

### Phase 2: Notification Services (Day 1-2)
1. **Database Operations**
   - CRUD operations for `scheduledNotifications`
   - Permission checks integration

2. **Notification Service**
   - Subtask notification creation/management
   - Event notification creation/management
   - Cancellation and update logic

### Phase 3: API Endpoints (Day 2)
1. **Subtask Notification APIs**
   - CREATE: Set up notification for subtask
   - UPDATE: Modify timing/settings
   - DELETE: Cancel notification
   - READ: Get notification settings

2. **Event Notification APIs**
   - Same CRUD operations but for events
   - Handle multiple recipients

### Phase 4: Email Templates (Day 2-3)
1. **Template Design**
   - Professional HTML email templates
   - Responsive design for mobile
   - Project branding integration

2. **Content Logic**
   - Dynamic content based on notification type
   - Localization-ready structure

### Phase 5: UI Integration (Day 3)
1. **Subtask Dialog Enhancement**
   - Add notification setup section
   - Days before selector (1-30 days)
   - Time picker (Bangkok timezone)

2. **Event Dialog Enhancement**
   - User selection checkboxes
   - Same timing controls as subtasks
   - Bulk notification management

## SUCCESS METRICS

**Technical Metrics**:
- Email delivery rate > 95%
- Notification scheduling accuracy ±1 minute
- API response time < 500ms
- Zero data loss during cancellations

**User Experience Metrics**:
- Notification setup time < 30 seconds
- Intuitive timezone display (Bangkok)
- Clear confirmation feedback

## RISK MITIGATION

**1. Resend Rate Limits**
- Implement exponential backoff
- Queue system for bulk notifications
- Monitor API usage

**2. Timezone Confusion**
- Always display "Bangkok Time" in UI
- Store UTC in database, convert for display
- Validate user input against Bangkok timezone

**3. Permission Failures**  
- Check user permissions before scheduling
- Graceful handling of permission changes
- Audit trail for notification actions

**4. Email Delivery Failures**
- Retry mechanism with Resend
- Fallback notification methods
- User notification of failures

## IMMEDIATE NEXT ACTIONS

1. **Install Resend SDK** - 5 minutes
2. **Create timezone utility functions** - 30 minutes  
3. **Build Resend service wrapper** - 1 hour
4. **Implement notification service** - 2 hours
5. **Create first API endpoint (subtask notifications)** - 1 hour
6. **Test with basic email template** - 30 minutes

**Total estimated time: 1-2 days for full backend implementation**

## COURSE CORRECTION TRIGGERS

- **If Resend scheduling fails**: Fallback to cron job approach
- **If timezone handling is complex**: Use established library like `date-fns-tz`
- **If permission checks slow down API**: Implement caching layer
- **If email templates look poor**: Use Resend's template system instead

This plan delivers a robust, scalable email notification system with Bangkok timezone support, leveraging your existing database schema and Resend's scheduling capabilities. 