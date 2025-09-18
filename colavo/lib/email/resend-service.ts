import { Resend } from 'resend';
import { generateSubtaskAssignmentTemplate, SubtaskAssignmentParams } from './templates/subtask-assignment';
import { db } from '@/db';
import { user, subTasks, mainTasks, projects } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

  /**
   * Send subtask assignment notification
   */
  static async sendSubtaskAssignmentNotification(params: SubtaskAssignmentParams): Promise<EmailResponse> {
    try {
      const { subtaskTitle } = params;
      
      const html = generateSubtaskAssignmentTemplate(params);
      const subject = `New Task Assignment: ${subtaskTitle}`;
      
      // Send email to the assignee
      
      return await this.sendEmail({
        to: [params.assigneeEmail],
        subject,
        html
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to send subtask assignment notification:', error);
      }
      throw new Error(`Failed to send assignment notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Helper function to send assignment notification by IDs
   * Reusable for both creation and update scenarios
   */
  static async sendAssignmentNotificationByIds(
    assigneeId: string,
    assignerId: string, 
    subtaskId: string,
    projectId: string
  ): Promise<void> {
    try {
      // Skip self-assignment
      if (assigneeId === assignerId) {
        return;
      }

      // Get assignee data
      const assigneeData = await db
        .select({
          name: user.name,
          email: user.email,
        })
        .from(user)
        .where(eq(user.id, assigneeId))
        .limit(1);

      // Get assigner data  
      const assignerData = await db
        .select({ name: user.name })
        .from(user)
        .where(eq(user.id, assignerId))
        .limit(1);

      // Get subtask and project data
      const taskData = await db
        .select({
          subtaskTitle: subTasks.title,
          subtaskDescription: subTasks.description,
          projectName: projects.name,
          deadline: subTasks.deadline,
        })
        .from(subTasks)
        .innerJoin(mainTasks, eq(mainTasks.id, subTasks.mainTaskId))
        .innerJoin(projects, eq(projects.id, mainTasks.projectId))
        .where(eq(subTasks.id, subtaskId))
        .limit(1);

      if (assigneeData.length > 0 && assignerData.length > 0 && taskData.length > 0) {
        const assignee = assigneeData[0];
        const assigner = assignerData[0];
        const task = taskData[0];

        if (assignee && assigner && task) {
          // Send assignment notification
          const notificationParams: any = {
            assigneeName: assignee.name,
            assigneeEmail: assignee.email,
            assignerName: assigner.name,
            subtaskTitle: task.subtaskTitle,
            projectName: task.projectName,
            projectId,
            subtaskId,
          };

          // Only include subtaskDescription if it has a value
          if (task.subtaskDescription) {
            notificationParams.subtaskDescription = task.subtaskDescription;
          }

          // Only include deadline if it has a value
          if (task.deadline) {
            notificationParams.deadline = task.deadline;
          }

          await this.sendSubtaskAssignmentNotification(notificationParams);
        }
      }
    } catch (error) {
      // Log error but don't throw - notification failure shouldn't break assignment
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to send assignment notification:', error);
      }
    }
  }
} 