# Email Notifications Implementation Plan
*Using Upstash QStash + Resend*

## 🎯 Core Requirements
- **Task Notifications**: Team leader sets notification for tasks (1 day before deadline if not completed) → sent to assigned team member
- **Event Notifications**: Similar to tasks but sent to all members or selected members
- **Scheduling**: Long-term schedules (3-7 days, weeks)
- **Technology**: QStash (serverless scheduling) + Resend (email delivery)

## 📋 Action Items for Today

### Phase 1: Database Schema Extension
- [x] **1.1** Add `scheduledNotifications` table to schema
- [x] **1.2** Add notification-related enums (type, status)
- [ ] **1.3** Run database migration
- [x] **1.4** Update TypeScript types

### Phase 2: Core QStash Integration
- [x] **2.1** Create QStash client configuration (`lib/qstash-client.ts`)
- [x] **2.2** Build notification scheduler (`lib/notification-scheduler.ts`)
- [x] **2.3** Create webhook handler (`app/api/webhooks/send-notification/route.ts`)
- [x] **2.4** Implement signature verification for security

### Phase 3: Email Templates & Sending
- [x] **3.1** Create Resend email templates (`lib/email-templates.ts`)
- [x] **3.2** Build email sending service (`lib/email-service.ts`)
- [x] **3.3** Implement task reminder emails
- [x] **3.4** Implement event reminder emails

### Phase 4: API Integration
- [ ] **4.1** Extend task creation API to schedule notifications
- [ ] **4.2** Extend event creation API to schedule notifications
- [ ] **4.3** Add notification cancellation API
- [ ] **4.4** Add notification status API (list, view)

### Phase 5: Frontend UI Components
- [ ] **5.1** Add notification options to task creation form
- [ ] **5.2** Add notification options to event creation form
- [ ] **5.3** Create notification management interface
- [ ] **5.4** Add notification status indicators

### Phase 6: Testing & Validation
- [ ] **6.1** Test short-term notifications (minutes)
- [ ] **6.2** Test cancellation workflow
- [ ] **6.3** Test email delivery and formatting
- [ ] **6.4** Validate error handling and retries

## 🏗️ Implementation Details

### Database Schema Changes
```sql
-- New table for tracking scheduled notifications
CREATE TABLE scheduled_notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'subtask' | 'event'
  entity_id TEXT NOT NULL, -- subtask.id or event.id
  recipient_user_id TEXT, -- for single recipient (tasks)
  recipient_user_ids TEXT[], -- for multiple recipients (events)
  scheduled_for TIMESTAMP NOT NULL,
  days_before INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'sent' | 'failed' | 'cancelled'
  qstash_message_id TEXT, -- for cancellation
  email_id TEXT, -- Resend email ID
  sent_at TIMESTAMP,
  created_by TEXT NOT NULL REFERENCES user(id),
  project_id TEXT NOT NULL REFERENCES projects(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Core Components Structure
```
lib/
├── qstash-client.ts        # QStash configuration
├── notification-scheduler.ts # Scheduling logic
├── email-service.ts        # Resend integration
└── email-templates.ts     # HTML email templates

app/api/
├── webhooks/
│   └── send-notification/
│       └── route.ts        # QStash webhook handler
└── notifications/
    ├── route.ts           # List notifications
    └── [id]/
        └── cancel/
            └── route.ts   # Cancel notification
```

### Environment Variables Required
```env
# Already added:
QSTASH_URL=
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
RESEND_API_KEY=

# Additional needed:
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
```

## 🔄 Workflow Overview

### Task Notification Flow
1. **Team Leader** creates task with deadline + notification settings (e.g., "1 day before")
2. **System** calculates notification date and schedules with QStash
3. **QStash** delivers webhook at scheduled time
4. **Webhook** checks if task is still incomplete → sends email via Resend
5. **Database** tracks delivery status

### Event Notification Flow  
1. **Organizer** creates event with datetime + notification settings
2. **System** schedules notification for selected recipients
3. **QStash** triggers webhook at scheduled time
4. **Webhook** sends event reminder to all selected members
5. **Database** tracks delivery status

## 📝 Technical Decisions

### Why QStash?
- ✅ Serverless-first (perfect for Vercel)
- ✅ HTTP-based (no infrastructure setup)
- ✅ Built-in retries and failure handling
- ✅ Can schedule far in advance (months/years)
- ✅ Easy cancellation via API
- ✅ Generous free tier (500 messages/day)

### Why Resend?
- ✅ Developer-friendly API
- ✅ Built-in email templates
- ✅ Delivery tracking
- ✅ Good reputation for inbox delivery
- ✅ React-based email templates support

### Architecture Benefits
- **Reliable**: QStash handles retries, failures, and persistence
- **Scalable**: Serverless execution, no server maintenance
- **Cost-effective**: Pay-per-use, generous free tiers
- **Maintainable**: Simple HTTP-based integration
- **Testable**: Easy to test with short delays

## 🎯 Success Criteria
- [ ] Team leader can set task notifications (1-7 days before deadline)
- [ ] Event organizer can set event notifications for selected members
- [ ] Notifications are delivered reliably at scheduled times
- [ ] Only incomplete tasks trigger reminders
- [ ] Users can cancel scheduled notifications
- [ ] System handles failures gracefully with retries
- [ ] Email templates are professional and informative
- [ ] Performance impact is minimal (serverless execution)

## 🚀 Next Steps After Implementation
1. **Analytics**: Track notification open rates and effectiveness
2. **Templates**: Add more email template options
3. **Preferences**: User notification preferences (frequency, types)
4. **Integrations**: Slack/Teams notifications
5. **Smart Scheduling**: ML-based optimal notification timing 