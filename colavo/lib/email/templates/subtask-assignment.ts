export interface SubtaskAssignmentParams {
  assigneeName: string;
  assigneeEmail: string;
  assignerName: string;
  subtaskTitle: string;
  subtaskDescription?: string;
  projectName: string;
  deadline?: Date;
  projectId: string;
  subtaskId: string;
}

export function generateSubtaskAssignmentTemplate(params: SubtaskAssignmentParams): string {
  const {
    assigneeName,
    assignerName,
    subtaskTitle,
    subtaskDescription,
    projectName,
    deadline,
    projectId,
    subtaskId
  } = params;

  const deadlineFormatted = deadline ? new Date(deadline).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Bangkok'
  }) : null;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Task Assignment - ${subtaskTitle}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Collavo</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Project Management</p>
        </div>

        <!-- Assignment Banner -->
        <div style="background-color: #3b82f6; padding: 12px 30px; text-align: center;">
          <span style="color: white; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
            📋 New Task Assignment
          </span>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
            Hi ${assigneeName}! 👋
          </h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            <strong>${assignerName}</strong> has assigned you to a new subtask in <strong>${projectName}</strong>.
          </p>

          <!-- Subtask Card -->
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
              📋 ${subtaskTitle}
            </h3>
            
            ${subtaskDescription ? `
              <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
                ${subtaskDescription}
              </p>
            ` : ''}
            
            <div style="margin: 16px 0;">
              <div style="display: flex; align-items: center; margin: 8px 0;">
                <span style="color: #6b7280; font-weight: 500; margin-right: 8px;">📁 Project:</span>
                <span style="color: #1f2937;">${projectName}</span>
              </div>
              
              <div style="display: flex; align-items: center; margin: 8px 0;">
                <span style="color: #6b7280; font-weight: 500; margin-right: 8px;">👤 Assigned by:</span>
                <span style="color: #1f2937;">${assignerName}</span>
              </div>
              
              ${deadlineFormatted ? `
                <div style="display: flex; align-items: center; margin: 8px 0;">
                  <span style="color: #6b7280; font-weight: 500; margin-right: 8px;">⏰ Due date:</span>
                  <span style="color: #1f2937; font-weight: 600;">${deadlineFormatted}</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || (process.env.NODE_ENV === 'production' ? 'https://collavo-alpha.vercel.app' : 'http://localhost:3000')}/project/${projectId}?subtask=${subtaskId}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; transition: all 0.2s;">
              View Task Details
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
              💡 <strong>Next steps:</strong> Review the task details and update your progress as you work. Your team is counting on you!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
            This is an automated notification from Collavo. You're receiving this because you were assigned to a task.
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