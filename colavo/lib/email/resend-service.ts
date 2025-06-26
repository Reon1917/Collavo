import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ScheduleEmailParams {
  recipientEmails: string[];
  subject: string;
  html: string;
  scheduledAt: Date;
  from?: string;
}

export interface EmailResponse {
  emailId: string;
}

/**
 * Resend service for handling email operations
 */
export class ResendEmailService {
  private static defaultFrom = process.env.FROM_EMAIL || 'Collavo <noreply@collavo.com>';

  /**
   * Schedule an email notification
   */
  static async scheduleNotification(params: ScheduleEmailParams): Promise<EmailResponse> {
    try {
      const { recipientEmails, subject, html, scheduledAt, from } = params;
      

      
      console.log('Scheduling email with Resend:', {
        to: recipientEmails,
        subject: subject.substring(0, 50) + '...',
        scheduledAt: scheduledAt.toISOString(),
        from: from || this.defaultFrom,
        hasApiKey: !!process.env.RESEND_API_KEY,
        timeFromNow: Math.round((scheduledAt.getTime() - Date.now()) / 1000 / 60) + ' minutes'
      });
      
      const response = await resend.emails.send({
        from: from || this.defaultFrom,
        to: recipientEmails,
        subject,
        html,
        scheduledAt: scheduledAt.toISOString(),
      });

      console.log('Resend response:', {
        success: !!response.data?.id,
        emailId: response.data?.id,
        error: response.error,
        fullResponse: response
      });

      if (response.error) {
        console.error('Resend API error details:', response.error);
        throw new Error(`Resend API error: ${response.error.message || JSON.stringify(response.error)}`);
      }

      if (!response.data?.id) {
        console.error('No email ID in response. Full response:', JSON.stringify(response, null, 2));
        throw new Error(`Failed to schedule email: No email ID returned. Response: ${JSON.stringify(response)}`);
      }

      return { emailId: response.data.id };
    } catch (error) {
      console.error('Resend scheduling error:', error);
      throw new Error(`Failed to schedule email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel a scheduled email
   */
  static async cancelNotification(emailId: string): Promise<void> {
    try {

      await resend.emails.cancel(emailId);
    } catch (error) {
      throw new Error(`Failed to cancel email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a scheduled email
   */
  static async updateNotification(emailId: string, newScheduledAt: Date): Promise<void> {
    try {

      await resend.emails.update({
        id: emailId,
        scheduledAt: newScheduledAt.toISOString(),
      });
    } catch (error) {
      throw new Error(`Failed to update email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send immediate email (for testing)
   */
  static async sendImmediate(params: Omit<ScheduleEmailParams, 'scheduledAt'>): Promise<EmailResponse> {
    try {
      const { recipientEmails, subject, html, from } = params;
      

      
      const response = await resend.emails.send({
        from: from || this.defaultFrom,
        to: recipientEmails,
        subject,
        html,
      });

      if (!response.data?.id) {
        throw new Error('Failed to send email: No email ID returned');
      }

      return { emailId: response.data.id };
    } catch (error) {
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 