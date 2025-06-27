import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

if (!process.env.FROM_EMAIL) {
  throw new Error('FROM_EMAIL environment variable is required');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailParams {
  to: string[];
  subject: string;
  html: string;
  scheduledAt?: Date;
}

export interface EmailResponse {
  emailId: string;
}

/**
 * Simplified Resend email service
 */
export class ResendEmailService {
  private static readonly FROM_EMAIL = process.env.FROM_EMAIL!;

  /**
   * Send or schedule an email notification
   */
  static async sendEmail(params: EmailParams): Promise<EmailResponse> {
    const { to, subject, html, scheduledAt } = params;

    try {
      const emailData: any = {
        from: this.FROM_EMAIL,
        to,
        subject,
        html,
      };

      // Add scheduling if specified
      if (scheduledAt) {
        emailData.scheduledAt = scheduledAt.toISOString();
      }

      const response = await resend.emails.send(emailData);

      if (response.error) {
        throw new Error(`Resend API error: ${response.error.message}`);
      }

      if (!response.data?.id) {
        throw new Error('Failed to send email: No email ID returned');
      }

      return { emailId: response.data.id };
    } catch (error) {
      throw new Error(`Email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel a scheduled email
   */
  static async cancelEmail(emailId: string): Promise<void> {
    try {
      await resend.emails.cancel(emailId);
    } catch (error) {
      throw new Error(`Failed to cancel email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a scheduled email
   */
  static async updateEmail(emailId: string, newScheduledAt: Date): Promise<void> {
    try {
      await resend.emails.update({
        id: emailId,
        scheduledAt: newScheduledAt.toISOString(),
      });
    } catch (error) {
      throw new Error(`Failed to update email schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 