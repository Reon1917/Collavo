import { Resend } from 'resend';
import { 
  generateTaskReminderHTML, 
  generateTaskReminderText,
  generateEventReminderHTML,
  generateEventReminderText,
  type TaskReminderData,
  type EventReminderData 
} from './email-templates';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender email - update this to your verified domain
const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Collavo <notifications@collavo.app>';

export interface EmailResult {
  id: string;
  success: boolean;
  error?: string;
}

/**
 * Send task reminder email to assigned user
 */
// Add at the top of the file
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function sendTaskReminderEmail(
  recipientEmail: string,
  data: TaskReminderData
): Promise<EmailResult> {
  try {
    if (!isValidEmail(recipientEmail)) {
      return {
        id: '',
        success: false,
        error: 'Invalid recipient email address'
      };
    }

    const { taskTitle, daysBefore } = data;
    const daysText = daysBefore === 1 ? 'day' : 'days';
    
    const htmlContent = generateTaskReminderHTML(data);
    const textContent = generateTaskReminderText(data);
    
    const result = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: [recipientEmail],
      subject: `Task Reminder: "${taskTitle}" due in ${daysBefore} ${daysText}`,
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Entity-Ref-ID': `task-reminder-${data.taskTitle}`,
      },
    });
    // …rest of function…
    if (result.error) {
      // Failed to send task reminder email
      return {
        id: '',
        success: false,
        error: result.error.message
      };
    }

    // Task reminder email sent successfully
    
    return {
      id: result.data?.id || '',
      success: true
    };

  } catch (error) {
    // Error sending task reminder email
    return {
      id: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send event reminder email to multiple recipients
 */
export async function sendEventReminderEmail(
  recipientEmails: string[],
  data: EventReminderData
): Promise<EmailResult> {
  try {
    const { eventTitle, daysBefore } = data;
    const daysText = daysBefore === 1 ? 'day' : 'days';
    
    const htmlContent = generateEventReminderHTML(data);
    const textContent = generateEventReminderText(data);
    
    const result = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: recipientEmails,
      subject: `Event Reminder: "${eventTitle}" in ${daysBefore} ${daysText}`,
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Entity-Ref-ID': `event-reminder-${data.eventTitle}`,
      },
    });

    if (result.error) {
      // Failed to send event reminder email
      return {
        id: '',
        success: false,
        error: result.error.message
      };
    }

    // Event reminder email sent successfully
    
    return {
      id: result.data?.id || '',
      success: true
    };

  } catch (error) {
    // Error sending event reminder email
    return {
      id: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send batch emails for multiple task reminders
 */
export async function sendBatchTaskReminders(
  emails: Array<{ recipientEmail: string; data: TaskReminderData }>
): Promise<EmailResult[]> {
  const results: EmailResult[] = [];
  
  // Send emails sequentially to avoid rate limiting
  for (const { recipientEmail, data } of emails) {
    const result = await sendTaskReminderEmail(recipientEmail, data);
    results.push(result);
    
    // Small delay between emails to be respectful to email service
    if (emails.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

/**
 * Send test email to verify configuration
 */
export async function sendTestEmail(recipientEmail: string): Promise<EmailResult> {
  try {
    const result = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: [recipientEmail],
      subject: 'Collavo Email Notifications Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Email Notifications Test</h2>
          <p>This is a test email to verify that Collavo email notifications are working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p>If you received this email, the notification system is functioning properly!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated test email from Collavo Project Management
          </p>
        </div>
      `,
      text: `
Email Notifications Test

This is a test email to verify that Collavo email notifications are working correctly.

Timestamp: ${new Date().toISOString()}

If you received this email, the notification system is functioning properly!

---
This is an automated test email from Collavo Project Management
      `.trim(),
    });

    if (result.error) {
      return {
        id: '',
        success: false,
        error: result.error.message
      };
    }

    return {
      id: result.data?.id || '',
      success: true
    };

  } catch (error) {
    return {
      id: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Interface for the unified notification email function
export interface NotificationEmailParams {
  type: 'subtask_reminder' | 'event_reminder';
  recipientEmail: string;
  recipientName: string;
  data: {
    // For subtask reminders
    subtaskTitle?: string;
    mainTaskTitle?: string;
    projectName: string;
    deadline?: Date;
    projectId: string;
    subtaskId?: string;
    
    // For event reminders  
    eventTitle?: string;
    eventDescription?: string;
    eventDatetime?: Date;
    eventId?: string;
  };
}

/**
 * Unified function to send notification emails for both subtasks and events
 * Used by the test API for immediate email testing
 */
export async function sendNotificationEmail(params: NotificationEmailParams): Promise<EmailResult> {
  try {
    const { type, recipientEmail, recipientName, data } = params;
    
    if (type === 'subtask_reminder') {
      if (!data.subtaskTitle || !data.deadline) {
        throw new Error('Missing required subtask data');
      }
      
      const taskData: TaskReminderData = {
        assignedUserName: recipientName,
        taskTitle: data.subtaskTitle,
        projectName: data.projectName,
        deadline: data.deadline,
        daysBefore: 1 // Test email, so use 1 day
      };
      
      return await sendTaskReminderEmail(recipientEmail, taskData);
      
    } else if (type === 'event_reminder') {
      if (!data.eventTitle || !data.eventDatetime) {
        throw new Error('Missing required event data');
      }
      
      const eventData: EventReminderData = {
        eventTitle: data.eventTitle,
        ...(data.eventDescription && { eventDescription: data.eventDescription }),
        projectName: data.projectName,
        datetime: data.eventDatetime,
        daysBefore: 1 // Test email, so use 1 day
      };
      
      return await sendEventReminderEmail([recipientEmail], eventData);
      
    } else {
      throw new Error(`Unsupported notification type: ${type}`);
    }
    
  } catch (error) {
    return {
      id: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending notification email'
    };
  }
} 