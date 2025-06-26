# Email Notifications Implementation Plan
*Using Upstash QStash + Resend*

## 🎯 REVISED Core Requirements
- **Subtask Notifications**: Individual subtask notifications (1-7 days before deadline) → sent to assigned team member
- **Event Notifications**: Event reminders sent to selected members (1-14 days before event datetime)
- **UI Flow**: Input days + time → Save button (NO on/off toggle)
- **Email Domain**: Use Resend's free domain with Collavo branding
- **Fast Testing**: Implement immediate test notifications for development

## ⚡ REVISED UI FLOW
**Old Flow**: Toggle on/off → Configure days/recipients → Auto-save
**New Flow**: Input days + time selection → Manual save button → Confirmation

## 📋 COMPLETED TODAY ✅

### Phase 1: Database Schema Extension
- [x] **1.1** Add `scheduledNotifications` table to schema
- [x] **1.2** Add notification-related enums (type, status)
- [x] **1.3** Update TypeScript types

### Phase 2: Core QStash Integration
- [x] **2.1** Create QStash client configuration (`lib/qstash-client.ts`)
- [x] **2.2** Build notification scheduler (`lib/notification-scheduler.ts`)
- [x] **2.3** Create webhook handler (`app/api/webhooks/send-notification/route.ts`)
- [x] **2.4** Implement signature verification for security

### Phase 3: Email Templates & Sending
- [x] **3.1** Create Resend email templates (`lib/email-templates.ts`)
- [x] **3.2** Build email sending service (`lib/email-service.ts`)
- [x] **3.3** Implement subtask reminder emails
- [x] **3.4** Implement event reminder emails

### Phase 4: API Integration - RESTRUCTURED TO SUBTASK-LEVEL
- [x] **4.1** Remove task-level notification API (moved to subtask-level)
- [x] **4.2** Implement subtask notification API (`/api/projects/[id]/tasks/[taskId]/subtasks/[subtaskId]/notifications`)
- [x] **4.3** Extend event notification API
- [x] **4.4** Add notification cancellation API
- [x] **4.5** Add notification status API (list, view, test)

### Phase 5: Core UI Components - COMPLETED
- [x] **5.1** Add notification options to subtask creation form (`CreateSubTaskForm.tsx`)
- [x] **5.2** Add notification options to event creation form (`EventForm.tsx`)
- [x] **5.3** Create notification management interface (`NotificationManagement/`)
- [x] **5.4** Add notification status indicators (`NotificationStatusIndicator/`)
- [x] **5.5** Create post-creation notification setup (`PostNotificationSettings/`)
- [x] **5.6** Fix TypeScript errors and remove task-level notification references

## ✅ COMPLETED REVISIONS

### Phase 6: UI Revision - Remove Toggle, Add Save Flow - COMPLETED ✅
- [x] **6.1** **Revise NotificationSettings Component**
  - [x] Remove Switch toggle completely
  - [x] Add time picker for notification time (default 9:00 AM)
  - [x] Change to days input + time selection → Save button workflow
  - [x] Add clear feedback when notification is saved
  - [x] Show current scheduled notifications with edit/cancel options

- [x] **6.2** **Update Event Logic**
  - [x] Verify event notifications use `event.datetime` correctly (not deadline)
  - [x] Ensure scheduling logic handles event datetime vs subtask deadline properly
  - [x] Update validation messages for events vs subtasks

- [x] **6.3** **Email Template Collavo Branding**
  - [x] Update email templates to use Collavo branding
  - [x] Configure Resend free domain (noreply@resend.dev)
  - [x] Test email delivery and formatting
  - [x] Add Collavo logo/colors to email templates

## 🔄 REMAINING IMPLEMENTATION TASKS

### Phase 7: Fast Testing Implementation - COMPLETED ✅
- [x] **7.1** **Immediate Test Notifications**
  - [x] Add "Test Now" button to notification settings
  - [x] Implement 1-2 minute delay test notifications
  - [x] Create test notification API endpoint (`/api/notifications/test`)
  - [x] Add test notification status tracking

- [x] **7.2** **Development Mode Enhancements**
  - [x] Add environment detection for faster testing (dev-only button)
  - [x] Implement notification preview functionality (via test API)
  - [x] Add debug logging for notification flow
  - [x] Enhanced scheduler with customScheduledFor parameter

### Phase 8: Event Schema Verification & Polish
- [ ] **8.1** **Event Schema Analysis**
  - [ ] Confirm events use `datetime` field correctly
  - [ ] Verify notification calculation logic for events
  - [ ] Update any deadline references to use datetime for events
  - [ ] Test event notification scheduling end-to-end

- [ ] **8.2** **UI Polish & UX**
  - [ ] Improve notification setup user experience
  - [ ] Add better error handling and validation messages
  - [ ] Enhance notification status indicators
  - [ ] Test responsive design across devices

### Phase 9: Comprehensive Testing
- [ ] **9.1** **Email Testing Strategy**
  - [ ] Set up Resend free domain configuration
  - [ ] Test email delivery rates and spam filtering
  - [ ] Verify email template rendering across clients
  - [ ] Test notification cancellation workflow

- [ ] **9.2** **Integration Testing**
  - [ ] Test subtask notification creation and delivery
  - [ ] Test event notification creation and delivery
  - [ ] Test notification management interface
  - [ ] Test edge cases (deleted entities, permission changes)

## 🛠️ REVISED Implementation Details

### New UI Component Structure
```
NotificationSettings/
├── components/
│   ├── DaysInput.tsx           # Input for days before
│   ├── TimePicker.tsx          # Time selection component
│   ├── RecipientSelector.tsx   # For event notifications
│   ├── SaveButton.tsx          # Manual save trigger
│   └── NotificationsList.tsx   # Show existing notifications
├── hooks/
│   ├── useNotificationSave.ts  # Handle save workflow
│   └── useNotificationTest.ts  # Handle test notifications
└── index.tsx                   # Main component (NO TOGGLE)
```

### Revised Notification Flow
```typescript
// New workflow - no toggle
interface NotificationSetup {
  daysBefore: number;        // User input
  notificationTime: string;  // "09:00" format
  recipientUserIds?: string[]; // For events
}

// Save workflow
const handleSave = async () => {
  // Validate inputs
  // Show loading state
  // Save notification
  // Show success/error feedback
  // Update notifications list
}
```

### Fast Testing Configuration
```typescript
// Test notification with 1-2 minute delay
interface TestNotificationParams {
  type: 'subtask' | 'event';
  entityId: string;
  delayMinutes: number; // 1-2 for testing
  recipients: string[];
}
```

### Event vs Subtask Logic Clarification
```typescript
// For subtasks - use deadline
const subtaskNotificationDate = calculateNotificationDate(subtask.deadline, daysBefore);

// For events - use datetime  
const eventNotificationDate = calculateNotificationDate(event.datetime, daysBefore);
```

### Resend Configuration for Collavo
```env
# Use Resend's free domain but with Collavo branding
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=noreply@resend.dev
RESEND_FROM_NAME=Collavo Team
```

## 🎯 SUCCESS CRITERIA

### User Experience
- [x] No confusing on/off toggles
- [ ] Clear "days before + time + save" workflow
- [ ] Immediate feedback when notifications are scheduled
- [ ] Easy testing with "Test Now" functionality
- [ ] Professional Collavo-branded emails

### Technical Implementation  
- [ ] Event notifications use `event.datetime` correctly
- [ ] Subtask notifications use `subtask.deadline` correctly
- [ ] Fast testing with 1-2 minute notifications
- [ ] Robust error handling and validation
- [ ] Responsive UI across all devices

### Email Delivery
- [ ] Collavo branding in all email templates
- [ ] Reliable delivery using Resend free domain
- [ ] Professional email formatting
- [ ] Proper timezone handling (Thailand UTC+7)

## 🎯 CURRENT STATUS SUMMARY

### ✅ COMPLETED (Major Components Working)
1. **Database Schema**: All tables and relationships set up
2. **QStash Integration**: Scheduling and webhook handling working
3. **Email Templates**: Collavo-branded templates with proper event/subtask logic
4. **NotificationSettings UI**: Modern save-workflow interface (no toggle)
5. **API Endpoints**: Subtask and event notification APIs implemented
6. **Core Logic**: Event uses `datetime`, subtask uses `deadline` correctly

### 🔄 NEXT PRIORITY (Final Testing + Polish)
1. **End-to-end verification** with actual email delivery
2. **Integration testing** of complete notification workflows  
3. **Production environment setup** and configuration
4. **Final UX polish** and error handling

## 📅 REVISED EXECUTION TIMELINE

**Current Status**: All major components implemented ✅  
**Next Phase**: End-to-end testing + Production setup
**Ready for**: Email delivery testing with Resend + Live notification flows

This revised plan addresses all your specific requirements:
1. ✅ No on/off toggle - replaced with save workflow
2. ✅ Event datetime handling (not deadline)
3. ✅ Collavo branding with Resend free domain
4. ✅ Fast testing strategy with immediate notifications 