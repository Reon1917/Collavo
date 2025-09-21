import { generateBaseEmailTemplate } from './base-template';

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

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
    process.env.BETTER_AUTH_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || 
    (process.env.NODE_ENV === 'production' ? 'https://collavo-alpha.vercel.app' : 'http://localhost:3000');

  const content = `
    <h1>New Task Assignment</h1>
    
    <p>Hi <strong>${escapeHtml(assigneeName)}</strong>,</p>
    
    <p><strong>${escapeHtml(assignerName)}</strong> has assigned you to a new subtask in the <strong>${escapeHtml(projectName)}</strong> project.</p>

    <div class="card">
      <h3>${escapeHtml(subtaskTitle)}</h3>
      
      ${subtaskDescription ? `
        <p style="color: #64748b; margin: 12px 0 20px 0; font-size: 15px; line-height: 1.5;">
          ${escapeHtml(subtaskDescription)}
        </p>
      ` : ''}
      
      <div class="meta-row">
        <span class="meta-label">Project:</span>
        <span class="meta-value">${escapeHtml(projectName)}</span>
      </div>
      
      <div class="meta-row">
        <span class="meta-label">Assigned by:</span>
        <span class="meta-value">${escapeHtml(assignerName)}</span>
      </div>
      
      ${deadlineFormatted ? `
        <div class="meta-row">
          <span class="meta-label">Due date:</span>
          <span class="meta-value" style="font-weight: 600;">${deadlineFormatted}</span>
        </div>
      ` : ''}
    </div>

    <p style="color: #64748b; font-size: 15px; margin-top: 32px;">
      <strong>Next steps:</strong> Review the task details and update your progress as you work. Click the button below to get started.
    </p>
  `;

  return generateBaseEmailTemplate({
    title: `New Task Assignment - ${subtaskTitle}`,
    preheader: `${assignerName} assigned you to "${subtaskTitle}" in ${projectName}`,
    content,
    primaryAction: {
      text: 'View Task Details',
      url: `${appUrl}/project/${projectId}?subtask=${subtaskId}`
    },
    footerText: "You're receiving this because you were assigned to a task."
  });
}