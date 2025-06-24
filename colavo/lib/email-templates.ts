import { formatThailandDate } from './qstash-client';

export interface TaskReminderData {
  assignedUserName: string;
  taskTitle: string;
  taskDescription?: string;
  projectName: string;
  deadline: Date;
  daysBefore: number;
}

export interface EventReminderData {
  eventTitle: string;
  eventDescription?: string;
  projectName: string;
  datetime: Date;
  location?: string;
  daysBefore: number;
}

/**
 * Generate HTML email template for task reminders
 */
export function generateTaskReminderHTML(data: TaskReminderData): string {
  const {
    assignedUserName,
    taskTitle, 
    taskDescription,
    projectName,
    deadline,
    daysBefore
  } = data;

  const deadlineFormatted = formatThailandDate(deadline);
  const daysText = daysBefore === 1 ? 'day' : 'days';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Task Reminder - ${taskTitle}</title>
    </head>
    <body style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    ">
      <div style="
        background-color: white;
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      ">
        <!-- Header -->
        <div style="
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #e9ecef;
        ">
          <div style="
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            font-weight: bold;
          ">📋</div>
          <h1 style="
            color: #2d3748;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          ">Task Reminder</h1>
          <p style="
            color: #718096;
            margin: 8px 0 0 0;
            font-size: 16px;
          ">Due in ${daysBefore} ${daysText}</p>
        </div>

        <!-- Greeting -->
        <div style="margin-bottom: 24px;">
          <p style="
            font-size: 18px;
            margin: 0;
            color: #2d3748;
          ">Hi ${assignedUserName},</p>
          <p style="
            font-size: 16px;
            color: #4a5568;
            margin: 12px 0 0 0;
          ">This is a friendly reminder about your upcoming task deadline.</p>
        </div>

        <!-- Task Details Card -->
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
          color: white;
        ">
          <h2 style="
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: 600;
          ">Task Details</h2>
          
          <div style="margin-bottom: 16px;">
            <strong style="display: block; margin-bottom: 4px; opacity: 0.9;">Task:</strong>
            <span style="font-size: 18px; font-weight: 500;">${taskTitle}</span>
          </div>
          
          <div style="margin-bottom: 16px;">
            <strong style="display: block; margin-bottom: 4px; opacity: 0.9;">Project:</strong>
            <span>${projectName}</span>
          </div>
          
          <div style="margin-bottom: 16px;">
            <strong style="display: block; margin-bottom: 4px; opacity: 0.9;">Deadline:</strong>
            <span style="font-size: 16px; font-weight: 500;">${deadlineFormatted}</span>
          </div>
          
          <div style="margin-bottom: ${taskDescription ? '16px' : '0'};">
            <strong style="display: block; margin-bottom: 4px; opacity: 0.9;">Time Remaining:</strong>
            <span style="
              background: rgba(255, 255, 255, 0.2);
              padding: 4px 12px;
              border-radius: 20px;
              font-weight: 500;
            ">${daysBefore} ${daysText}</span>
          </div>
          
          ${taskDescription ? `
          <div>
            <strong style="display: block; margin-bottom: 4px; opacity: 0.9;">Description:</strong>
            <p style="margin: 0; opacity: 0.95; line-height: 1.5;">${taskDescription}</p>
          </div>
          ` : ''}
        </div>

        <!-- Action Section -->
        <div style="
          background-color: #fff5f5;
          border-left: 4px solid #f56565;
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
        ">
          <p style="
            margin: 0;
            color: #742a2a;
            font-weight: 500;
            font-size: 16px;
          ">⚠️ Please make sure to complete this task before the deadline.</p>
        </div>

        <!-- Footer -->
        <div style="
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        ">
          <p style="
            color: #718096;
            margin: 0;
            font-size: 14px;
          ">Best regards,<br>
          <strong style="color: #4a5568;">Your Collavo Team</strong></p>
          
          <p style="
            color: #a0aec0;
            margin: 16px 0 0 0;
            font-size: 12px;
          ">This is an automated notification from Collavo Project Management</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate HTML email template for event reminders
 */
export function generateEventReminderHTML(data: EventReminderData): string {
  const {
    eventTitle,
    eventDescription,
    projectName,
    datetime,
    location,
    daysBefore
  } = data;

  const datetimeFormatted = formatThailandDate(datetime);
  const daysText = daysBefore === 1 ? 'day' : 'days';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Reminder - ${eventTitle}</title>
    </head>
    <body style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    ">
      <div style="
        background-color: white;
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      ">
        <!-- Header -->
        <div style="
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #e9ecef;
        ">
          <div style="
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            border-radius: 50%;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            font-weight: bold;
          ">📅</div>
          <h1 style="
            color: #2d3748;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          ">Event Reminder</h1>
          <p style="
            color: #718096;
            margin: 8px 0 0 0;
            font-size: 16px;
          ">Happening in ${daysBefore} ${daysText}</p>
        </div>

        <!-- Greeting -->
        <div style="margin-bottom: 24px;">
          <p style="
            font-size: 18px;
            margin: 0;
            color: #2d3748;
          ">Hi team,</p>
          <p style="
            font-size: 16px;
            color: #4a5568;
            margin: 12px 0 0 0;
          ">This is a reminder about the upcoming event.</p>
        </div>

        <!-- Event Details Card -->
        <div style="
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
          color: white;
        ">
          <h2 style="
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: 600;
          ">Event Details</h2>
          
          <div style="margin-bottom: 16px;">
            <strong style="display: block; margin-bottom: 4px; opacity: 0.9;">Event:</strong>
            <span style="font-size: 18px; font-weight: 500;">${eventTitle}</span>
          </div>
          
          <div style="margin-bottom: 16px;">
            <strong style="display: block; margin-bottom: 4px; opacity: 0.9;">Project:</strong>
            <span>${projectName}</span>
          </div>
          
          <div style="margin-bottom: 16px;">
            <strong style="display: block; margin-bottom: 4px; opacity: 0.9;">Date & Time:</strong>
            <span style="font-size: 16px; font-weight: 500;">${datetimeFormatted}</span>
          </div>
          
          ${location ? `
          <div style="margin-bottom: 16px;">
            <strong style="display: block; margin-bottom: 4px; opacity: 0.9;">Location:</strong>
            <span>${location}</span>
          </div>
          ` : ''}
          
          <div style="margin-bottom: ${eventDescription ? '16px' : '0'};">
            <strong style="display: block; margin-bottom: 4px; opacity: 0.9;">Time Until Event:</strong>
            <span style="
              background: rgba(255, 255, 255, 0.2);
              padding: 4px 12px;
              border-radius: 20px;
              font-weight: 500;
            ">${daysBefore} ${daysText}</span>
          </div>
          
          ${eventDescription ? `
          <div>
            <strong style="display: block; margin-bottom: 4px; opacity: 0.9;">Description:</strong>
            <p style="margin: 0; opacity: 0.95; line-height: 1.5;">${eventDescription}</p>
          </div>
          ` : ''}
        </div>

        <!-- Action Section -->
        <div style="
          background-color: #f0f9ff;
          border-left: 4px solid #3b82f6;
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
        ">
          <p style="
            margin: 0;
            color: #1e40af;
            font-weight: 500;
            font-size: 16px;
          ">📝 Please mark your calendar and prepare accordingly.</p>
        </div>

        <!-- Footer -->
        <div style="
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        ">
          <p style="
            color: #718096;
            margin: 0;
            font-size: 14px;
          ">Best regards,<br>
          <strong style="color: #4a5568;">Your Collavo Team</strong></p>
          
          <p style="
            color: #a0aec0;
            margin: 16px 0 0 0;
            font-size: 12px;
          ">This is an automated notification from Collavo Project Management</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text version for task reminders (fallback)
 */
export function generateTaskReminderText(data: TaskReminderData): string {
  const { assignedUserName, taskTitle, projectName, deadline, daysBefore } = data;
  const deadlineFormatted = formatThailandDate(deadline);
  const daysText = daysBefore === 1 ? 'day' : 'days';

  return `
Task Reminder - Due in ${daysBefore} ${daysText}

Hi ${assignedUserName},

This is a friendly reminder about your upcoming task deadline.

Task Details:
- Task: ${taskTitle}
- Project: ${projectName}
- Deadline: ${deadlineFormatted}
- Time remaining: ${daysBefore} ${daysText}
${data.taskDescription ? `- Description: ${data.taskDescription}` : ''}

Please make sure to complete this task before the deadline.

Best regards,
Your Collavo Team

---
This is an automated notification from Collavo Project Management
  `.trim();
}

/**
 * Generate plain text version for event reminders (fallback)
 */
export function generateEventReminderText(data: EventReminderData): string {
  const { eventTitle, projectName, datetime, location, daysBefore } = data;
  const datetimeFormatted = formatThailandDate(datetime);
  const daysText = daysBefore === 1 ? 'day' : 'days';

  return `
Event Reminder - Happening in ${daysBefore} ${daysText}

Hi team,

This is a reminder about the upcoming event.

Event Details:
- Event: ${eventTitle}
- Project: ${projectName}
- Date & Time: ${datetimeFormatted}
${location ? `- Location: ${location}` : ''}
- Time until event: ${daysBefore} ${daysText}
${data.eventDescription ? `- Description: ${data.eventDescription}` : ''}

Please mark your calendar and prepare accordingly.

Best regards,
Your Collavo Team

---
This is an automated notification from Collavo Project Management
  `.trim();
} 