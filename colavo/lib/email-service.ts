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
export async function sendTaskReminderEmail(
  recipientEmail: string,
  data: TaskReminderData
): Promise<EmailResult> {
  try {
    const { assignedUserName, taskTitle, daysBefore } = data;
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

    if (result.error) {
      console.error('Failed to send task reminder email:', result.error);
      return {
        id: '',
        success: false,
        error: result.error.message
      };
    }

    console.log(`Task reminder email sent successfully to ${recipientEmail}:`, result.data?.id);
    
    return {
      id: result.data?.id || '',
      success: true
    };

  } catch (error) {
    console.error('Error sending task reminder email:', error);
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
      console.error('Failed to send event reminder email:', result.error);
      return {
        id: '',
        success: false,
        error: result.error.message
      };
    }

    console.log(`Event reminder email sent successfully to ${recipientEmails.length} recipients:`, result.data?.id);
    
    return {
      id: result.data?.id || '',
      success: true
    };

  } catch (error) {
    console.error('Error sending event reminder email:', error);
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