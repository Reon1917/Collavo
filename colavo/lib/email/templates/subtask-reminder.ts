import { formatBangkokTime } from '@/utils/timezone';

export interface SubtaskReminderParams {
  userName: string;
  subtaskTitle: string;
  deadline: Date;
  projectName: string;
  daysRemaining: number;
  projectId: string;
  subtaskId: string;
}

export function generateSubtaskReminderTemplate(params: SubtaskReminderParams): string {
  const {
    userName,
    subtaskTitle,
    deadline,
    projectName,
    daysRemaining,
    projectId,
    subtaskId
  } = params;

  const deadlineFormatted = formatBangkokTime(deadline);
  const urgencyColor = daysRemaining <= 1 ? '#ef4444' : daysRemaining <= 3 ? '#f59e0b' : '#3b82f6';
  const urgencyText = daysRemaining <= 1 ? 'URGENT' : daysRemaining <= 3 ? 'Important' : 'Reminder';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Subtask Reminder - ${subtaskTitle}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Collavo</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Project Management</p>
        </div>

        <!-- Urgency Banner -->
        <div style="background-color: ${urgencyColor}; padding: 12px 30px; text-align: center;">
          <span style="color: white; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
            ${urgencyText} - ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining
          </span>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
            Hi ${userName}! 👋
          </h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            This is a friendly reminder about your upcoming subtask deadline in <strong>${projectName}</strong>.
          </p>

          <!-- Subtask Card -->
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
              📋 ${subtaskTitle}
            </h3>
            
            <div style="margin: 16px 0;">
              <div style="display: flex; align-items: center; margin: 8px 0;">
                <span style="color: #6b7280; font-weight: 500; margin-right: 8px;">⏰ Deadline:</span>
                <span style="color: #1f2937; font-weight: 600;">${deadlineFormatted}</span>
              </div>
              
              <div style="display: flex; align-items: center; margin: 8px 0;">
                <span style="color: #6b7280; font-weight: 500; margin-right: 8px;">📁 Project:</span>
                <span style="color: #1f2937;">${projectName}</span>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || (process.env.NODE_ENV === 'production' ? 'https://collavo-alpha.vercel.app' : 'http://localhost:3000')}/project/${projectId}?subtask=${subtaskId}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; transition: all 0.2s;">
              View Subtask Details
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
              💡 <strong>Pro tip:</strong> Keep your project momentum by updating your progress regularly. Your team is counting on you!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
            This is an automated reminder from Collavo. You're receiving this because you have email notifications enabled for this subtask.
          </p>
          <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0 0;">
            © ${new Date().getFullYear()} Collavo. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
} 