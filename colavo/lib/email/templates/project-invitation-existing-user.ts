import { generateBaseEmailTemplate } from './base-template';

interface ExistingUserInvitationParams {
  inviterName: string;
  projectName: string;
  projectDescription?: string;
  leaderName: string;
  memberCount: number;
  projectDeadline?: Date;
  dashboardUrl: string;
  expiresAt: Date;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateExistingUserInvitationEmail({
  inviterName,
  projectName,
  projectDescription,
  leaderName,
  memberCount,
  projectDeadline,
  dashboardUrl,
  expiresAt
}: ExistingUserInvitationParams): string {
  const expirationDate = expiresAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok'
  });

  const deadlineDate = projectDeadline ? projectDeadline.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Bangkok'
  }) : null;

  const isDeadlineSoon = projectDeadline && 
    (projectDeadline.getTime() - Date.now()) < (7 * 24 * 60 * 60 * 1000); // 7 days

  const urgencyStyle = isDeadlineSoon ? 'color: #dc2626; font-weight: 600;' : '';
  
  const content = `
    <h1>Project Invitation</h1>
    
    <p><strong>${escapeHtml(inviterName)}</strong> has invited you to join a project on Collavo.</p>

    <div class="card">
      <h3>${escapeHtml(projectName)}</h3>
      
      ${projectDescription ? `
        <p style="color: #64748b; margin: 12px 0 20px 0; font-size: 15px; line-height: 1.5;">
          ${escapeHtml(projectDescription)}
        </p>
      ` : ''}
      
      <div class="meta-row">
        <span class="meta-label">Project Leader:</span>
        <span class="meta-value">${escapeHtml(leaderName)}</span>
      </div>
      
      <div class="meta-row">
        <span class="meta-label">Team Size:</span>
        <span class="meta-value">${memberCount} members</span>
      </div>
      
      ${deadlineDate ? `
        <div class="meta-row">
          <span class="meta-label">Project Deadline:</span>
          <span class="meta-value" style="${urgencyStyle}">${deadlineDate}${isDeadlineSoon ? ' (Soon!)' : ''}</span>
        </div>
      ` : ''}
    </div>

    <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
      <h3 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px;">Check Your Dashboard</h3>
      <p style="color: #a16207; margin: 0; font-size: 14px;">
        Your invitation is waiting in your Collavo dashboard inbox. Click below to accept or decline.
      </p>
    </div>

    <p style="color: #dc2626; font-weight: 500; font-size: 14px; margin-top: 24px;">
      This invitation expires on ${expirationDate}
    </p>
  `;

  return generateBaseEmailTemplate({
    title: `Project Invitation - ${projectName}`,
    preheader: `${inviterName} invited you to join "${projectName}" on Collavo`,
    content,
    primaryAction: {
      text: 'Go to Dashboard',
      url: dashboardUrl
    },
    footerText: "You can accept or decline the invitation from your dashboard inbox."
  });
}