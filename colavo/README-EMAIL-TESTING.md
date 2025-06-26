# 📧 Collavo Email Notifications - Testing Guide

## 🎯 Three Testing Approaches Available

### 1. **Full System Testing** (QStash CLI + Resend)
**Use Case**: Test complete notification workflow with real scheduling and email delivery

```bash
# Step 1: Start QStash development server
npx @upstash/qstash-cli dev

# Step 2: Copy environment variables to .env.local
QSTASH_URL=http://localhost:8080
QSTASH_TOKEN=eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=
QSTASH_CURRENT_SIGNING_KEY=sig_7kYjw48mhY7kAjqNGcy6cr29RJ6r
QSTASH_NEXT_SIGNING_KEY=sig_5ZB6DVzB1wjE8S6rZ7eenA8Pdnhs

# Step 3: Add Resend configuration
RESEND_API_KEY=re_your_key_here  # From https://resend.com/api-keys
RESEND_FROM_EMAIL=onboarding@resend.dev

# Step 4: Test with "Test Schedule" button (2-minute delay)
```

**What This Tests:**
- ✅ Complete QStash scheduling workflow
- ✅ Local webhook reception (`/api/webhooks/send-notification`)
- ✅ Database notification management
- ✅ Professional Collavo-branded email delivery
- ✅ Signature verification
- ✅ Retry logic and error handling

---

### 2. **Immediate Email Testing** (Resend Only)
**Use Case**: Quick email template and delivery testing

```bash
# Just add Resend to .env.local:
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Test with green "Send Email" button (immediate delivery)
```

**What This Tests:**
- ✅ Email template rendering (subtask & event reminders)
- ✅ Resend API integration
- ✅ Collavo branding and styling
- ✅ Recipient handling (single/multiple)
- ✅ Database queries for notification data

---

### 3. **Mock System Testing** (No External Services)
**Use Case**: Development without API keys or when offline

```bash
# No additional setup needed
# Just use the existing notification UI
```

**What This Tests:**
- ✅ UI/UX notification setup workflow
- ✅ Database notification records
- ✅ Form validation and error handling
- ✅ Notification management interface
- ✅ Console logging for debugging

---

## 🚀 Quick Start Testing

### Option A: Full Experience (Recommended)
1. **Get Resend API Key**: Visit [resend.com/api-keys](https://resend.com/api-keys)
2. **Start QStash CLI**: `npx @upstash/qstash-cli dev`
3. **Copy Environment Variables**: Add to `.env.local`
4. **Test Complete Flow**: Use both "Test Schedule" and "Send Email" buttons

### Option B: Just Email Testing  
1. **Get Resend API Key**: Visit [resend.com/api-keys](https://resend.com/api-keys)
2. **Add to .env.local**: `RESEND_API_KEY=re_...`
3. **Test Immediate Emails**: Use green "Send Email" button

### Option C: Mock Testing
1. **No Setup Required**: Just use the notification UI
2. **Check Console**: See mock notifications in dev tools
3. **Check Database**: Notifications saved to DB

---

## 🎨 Email Templates Preview

### Subtask Reminder Email
- **Subject**: `Task Reminder: "Task Name" due in X day(s)`
- **Branding**: Collavo logo, teal gradient (#008080)
- **Content**: Task details, deadline, project info
- **Recipient**: Assigned team member

### Event Reminder Email  
- **Subject**: `Event Reminder: "Event Name" in X day(s)`
- **Branding**: Collavo logo, professional layout
- **Content**: Event details, datetime, project info
- **Recipients**: Selected project members

---

## 🔧 Environment Variables Reference

```env
# QStash Development Server (from CLI output)
QSTASH_URL=http://localhost:8080
QSTASH_TOKEN=eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=
QSTASH_CURRENT_SIGNING_KEY=sig_7kYjw48mhY7kAjqNGcy6cr29RJ6r
QSTASH_NEXT_SIGNING_KEY=sig_5ZB6DVzB1wjE8S6rZ7eenA8Pdnhs

# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev

# Next.js Configuration  
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 Testing Scenarios

### Subtask Notifications
1. **Create subtask** with deadline and assignee
2. **Set notification** (e.g., 2 days before, 9:00 AM)
3. **Test immediately** with "Send Email" button
4. **Test scheduling** with "Test Schedule" button
5. **Verify email** delivery and content

### Event Notifications
1. **Create event** with datetime  
2. **Select recipients** from project members
3. **Set notification** (e.g., 1 day before, 10:00 AM)
4. **Test immediately** with "Send Email" button  
5. **Test scheduling** with "Test Schedule" button
6. **Verify emails** to all selected recipients

### Edge Cases
- ✅ Missing deadline/assignee
- ✅ No project members
- ✅ Invalid notification timing
- ✅ QStash service unavailable
- ✅ Resend service errors

---

## 🎯 Success Criteria

### Email Delivery
- [ ] Professional Collavo branding
- [ ] Correct recipient(s)
- [ ] Accurate deadline/event information
- [ ] Proper timezone handling (Thailand UTC+7)
- [ ] Clear call-to-action

### System Integration
- [ ] Notifications saved to database
- [ ] QStash scheduling successful
- [ ] Webhook handling working
- [ ] Cancellation functionality
- [ ] Error handling graceful

### User Experience
- [ ] Intuitive notification setup
- [ ] Clear validation messages
- [ ] Immediate feedback on actions
- [ ] Test functionality accessible
- [ ] Mobile-friendly interface

---

## 🐛 Troubleshooting

### QStash CLI Issues
```bash
# If CLI fails to start
npm cache clean --force
npx @upstash/qstash-cli@latest dev

# Check if port 8080 is available
netstat -an | grep :8080
```

### Email Delivery Issues
- **Check Resend dashboard** for delivery status
- **Verify API key** has send permissions  
- **Check spam folder** for test emails
- **Monitor console logs** for error details

### Mock System
- **Check browser console** for mock logs
- **Verify database** records in dev tools
- **Ensure proper props** (entityId, projectId)

---

**🎉 Ready to test? Start with Option A for the full experience!** 