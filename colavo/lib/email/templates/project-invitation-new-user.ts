interface NewUserInvitationParams {
  inviterName: string;
  projectName: string;
  projectDescription?: string;
  leaderName: string;
  memberCount: number;
  projectDeadline?: Date;
  signupUrl: string;
  expiresAt: Date;
}

export function generateNewUserInvitationEmail({
  inviterName,
  projectName,
  projectDescription,
  leaderName,
  memberCount,
  projectDeadline,
  signupUrl,
  expiresAt
}: NewUserInvitationParams): string {
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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Collavo - Project Invitation</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #f8fafc;
        }
        .container { 
          background: white; 
          border-radius: 12px; 
          padding: 40px; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header { 
          text-align: center; 
          margin-bottom: 32px; 
        }
        .logo { 
          color: #008080; 
          font-size: 28px; 
          font-weight: bold; 
          margin-bottom: 8px; 
        }
        .title { 
          color: #1f2937; 
          font-size: 24px; 
          font-weight: 600; 
          margin: 0 0 16px 0; 
        }
        .message { 
          color: #4b5563; 
          margin-bottom: 32px; 
          font-size: 16px; 
        }
        .project-info { 
          background: #f0fdfa; 
          border: 2px solid #ccfbf1; 
          border-radius: 8px; 
          padding: 24px; 
          margin: 24px 0; 
          text-align: left; 
        }
        .project-name { 
          color: #008080; 
          font-size: 20px; 
          font-weight: 600; 
          margin: 0 0 12px 0; 
        }
        .project-description {
          color: #4b5563;
          font-size: 14px;
          margin: 8px 0 16px 0;
          line-height: 1.5;
        }
        .project-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #ccfbf1;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
        }
        .deadline-warning {
          color: #dc2626;
          font-weight: 600;
        }
        .cta-button { 
          display: inline-block; 
          background: #008080; 
          color: white; 
          padding: 14px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 16px; 
          text-align: center; 
          margin: 24px 0; 
        }
        .cta-button:hover { 
          background: #006666; 
        }
        .welcome-box {
          background: linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 100%);
          border: 2px solid #22d3ee;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
          text-align: center;
        }
        .welcome-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .welcome-title {
          color: #0891b2;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .welcome-text {
          color: #0e7490;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .steps-container {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
        }
        .steps-title {
          color: #374151;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          text-align: center;
        }
        .step {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          font-size: 14px;
          color: #4b5563;
        }
        .step:last-child {
          margin-bottom: 0;
        }
        .step-number {
          background: #008080;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 12px;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .expiration { 
          color: #ef4444; 
          font-size: 14px; 
          font-weight: 500; 
          margin-top: 16px; 
        }
        .footer { 
          margin-top: 32px; 
          padding-top: 24px; 
          border-top: 1px solid #e5e7eb; 
          color: #6b7280; 
          font-size: 14px; 
        }
        .footer-link { 
          color: #008080; 
          text-decoration: none; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Collavo</div>
        </div>
        
        <h1 class="title">🎉 You&apos;re Invited to Join Collavo!</h1>
        
        <div class="message">
          <strong>${inviterName}</strong> has invited you to collaborate on a project. Join Collavo to start working together!
        </div>
        
        <div class="project-info">
          <h2 class="project-name">${projectName}</h2>
          ${projectDescription ? `<div class="project-description">${projectDescription}</div>` : ''}
          
          <div class="project-meta">
            <div class="meta-item">
              <span>👑</span>
              <span>Led by ${leaderName}</span>
            </div>
            <div class="meta-item">
              <span>👥</span>
              <span>${memberCount} team members</span>
            </div>
            ${deadlineDate ? `
              <div class="meta-item ${isDeadlineSoon ? 'deadline-warning' : ''}">
                <span>${isDeadlineSoon ? '⚠️' : '📅'}</span>
                <span>Due ${deadlineDate}</span>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="welcome-box">
          <div class="welcome-icon">🚀</div>
          <div class="welcome-title">Ready to Get Started?</div>
          <div class="welcome-text">
            Create your free Collavo account and join the team in just a few clicks!
          </div>
        </div>
        
        <div style="text-align: center;">
          <a href="${signupUrl}" class="cta-button">✨ Create Account & Join</a>
        </div>
        
        <div class="steps-container">
          <div class="steps-title">What happens next:</div>
          <div class="step">
            <div class="step-number">1</div>
            <div>Create your Collavo account (takes 30 seconds)</div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div>You&apos;ll be taken to your dashboard</div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div>Accept the project invitation from your inbox</div>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <div>Start collaborating with your team! 🎊</div>
          </div>
        </div>
        
        <div class="expiration">
          ⏰ This invitation expires on ${expirationDate}
        </div>
        
        <div class="footer">
          <p>Collavo is a collaborative project management platform designed for teams. It&apos;s free to get started!</p>
          <p>Need help? Contact us at <a href="mailto:support@collavo.me" class="footer-link">support@collavo.me</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}