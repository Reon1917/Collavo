interface ProjectInvitationParams {
  inviterName: string;
  projectName: string;
  acceptUrl: string;
  expiresAt: Date;
}

export function generateProjectInvitationEmail({
  inviterName,
  projectName,
  acceptUrl,
  expiresAt
}: ProjectInvitationParams): string {
  const expirationDate = expiresAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Invitation - Collavo</title>
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
          padding: 20px; 
          margin: 24px 0; 
          text-align: center; 
        }
        .project-name { 
          color: #008080; 
          font-size: 20px; 
          font-weight: 600; 
          margin: 0; 
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
        
        <h1 class="title">You're invited to join a project!</h1>
        
        <div class="message">
          <strong>${inviterName}</strong> has invited you to collaborate on a project in Collavo.
        </div>
        
        <div class="project-info">
          <h2 class="project-name">${projectName}</h2>
        </div>
        
        <div style="text-align: center;">
          <a href="${acceptUrl}" class="cta-button">Accept Invitation</a>
        </div>
        
        <div class="expiration">
          ⏰ This invitation expires on ${expirationDate}
        </div>
        
        <div class="footer">
          <p>If you don't have a Collavo account yet, you'll be able to create one when you accept this invitation.</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          <p>Need help? Contact us at <a href="mailto:support@collavo.me" class="footer-link">support@collavo.me</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

