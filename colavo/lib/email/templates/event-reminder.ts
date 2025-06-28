import { formatBangkokTime } from '@/utils/timezone';

export interface EventReminderParams {
  userName: string;
  eventTitle: string;
  eventDate: Date;
  projectName: string;
  location?: string;
  description?: string;
  projectId: string;
  eventId: string;
  daysRemaining: number;
}

export function generateEventReminderTemplate(params: EventReminderParams): string {
  const {
    userName,
    eventTitle,
    eventDate,
    projectName,
    location,
    description,
    projectId,
    eventId,
    daysRemaining
  } = params;

  const eventDateFormatted = formatBangkokTime(eventDate);
  const urgencyColor = daysRemaining <= 1 ? '#ef4444' : daysRemaining <= 3 ? '#f59e0b' : '#10b981';
  const urgencyText = daysRemaining === 0 ? 'TODAY' : daysRemaining <= 1 ? 'URGENT' : daysRemaining <= 3 ? 'Important' : 'Reminder';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Reminder - ${eventTitle}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Collavo</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Project Management</p>
        </div>

        <!-- Urgency Banner -->
        <div style="background-color: ${urgencyColor}; padding: 12px 30px; text-align: center;">
          <span style="color: white; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
            ${urgencyText} - ${daysRemaining === 0 ? 'Event is today!' : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining`}
          </span>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
            Hi ${userName}! 🎉
          </h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Don't miss this upcoming event in <strong>${projectName}</strong>. Mark your calendar and be ready!
          </p>

          <!-- Event Card -->
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
              🎯 ${eventTitle}
            </h3>
            
            <div style="margin: 16px 0;">
              <div style="display: flex; align-items: center; margin: 12px 0;">
                <span style="color: #059669; font-weight: 500; margin-right: 8px; min-width: 100px;">📅 Date & Time:</span>
                <span style="color: #1f2937; font-weight: 600;">${eventDateFormatted}</span>
              </div>
              
              <div style="display: flex; align-items: center; margin: 12px 0;">
                <span style="color: #059669; font-weight: 500; margin-right: 8px; min-width: 100px;">📁 Project:</span>
                <span style="color: #1f2937;">${projectName}</span>
              </div>

              ${location ? `
                <div style="display: flex; align-items: center; margin: 12px 0;">
                  <span style="color: #059669; font-weight: 500; margin-right: 8px; min-width: 100px;">📍 Location:</span>
                  <span style="color: #1f2937;">${location}</span>
                </div>
              ` : ''}

              ${description ? `
                <div style="margin: 16px 0 0 0;">
                  <span style="color: #059669; font-weight: 500; display: block; margin-bottom: 8px;">📝 Description:</span>
                  <p style="color: #4b5563; margin: 0; line-height: 1.5; background-color: #ffffff; padding: 12px; border-radius: 4px; border: 1px solid #d1fae5;">
                    ${description}
                  </p>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/project/${projectId}?tab=events&event=${eventId}" 
               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; transition: all 0.2s;">
              View Event Details
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
              📱 <strong>Reminder:</strong> Add this event to your personal calendar so you don't miss it. Your participation matters to the team!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
            This is an automated reminder from Collavo. You're receiving this because you're invited to this event.
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