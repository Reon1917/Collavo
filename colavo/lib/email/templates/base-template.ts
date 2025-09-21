export interface BaseEmailParams {
  title: string;
  preheader?: string;
  content: string;
  primaryAction?: {
    text: string;
    url: string;
  };
  secondaryAction?: {
    text: string;
    url: string;
  };
  footerText?: string;
}

export function generateBaseEmailTemplate({
  title,
  preheader,
  content,
  primaryAction,
  secondaryAction,
  footerText
}: BaseEmailParams): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <title>${title}</title>
      ${preheader ? `<meta name="description" content="${preheader}">` : ''}
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background-color: #f8fafc;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        
        .header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 32px 24px;
          text-align: center;
        }
        
        .logo {
          color: #ffffff;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.025em;
          margin: 0;
        }
        
        .tagline {
          color: #94a3b8;
          font-size: 14px;
          margin: 4px 0 0 0;
          font-weight: 500;
        }
        
        .content {
          padding: 40px 24px;
        }
        
        .content h1 {
          color: #0f172a;
          font-size: 28px;
          font-weight: 700;
          line-height: 1.3;
          margin: 0 0 24px 0;
          letter-spacing: -0.025em;
        }
        
        .content h2 {
          color: #334155;
          font-size: 20px;
          font-weight: 600;
          margin: 32px 0 16px 0;
        }
        
        .content p {
          color: #475569;
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 16px 0;
        }
        
        .card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        
        .card h3 {
          color: #0f172a;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 12px 0;
        }
        
        .meta-row {
          display: flex;
          align-items: center;
          margin: 12px 0;
          font-size: 14px;
        }
        
        .meta-label {
          color: #64748b;
          font-weight: 500;
          min-width: 100px;
          margin-right: 12px;
        }
        
        .meta-value {
          color: #0f172a;
          font-weight: 500;
        }
        
        .button-container {
          text-align: center;
          margin: 32px 0;
        }
        
        .button-primary {
          display: inline-block;
          background-color: #0f172a;
          color: #ffffff;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: background-color 0.2s ease;
        }
        
        .button-primary:hover {
          background-color: #1e293b;
        }
        
        .button-secondary {
          display: inline-block;
          background-color: transparent;
          color: #475569;
          text-decoration: none;
          padding: 14px 28px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-weight: 500;
          font-size: 16px;
          margin-left: 12px;
          transition: all 0.2s ease;
        }
        
        .button-secondary:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
        }
        
        .footer {
          background-color: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 24px;
          text-align: center;
        }
        
        .footer p {
          color: #64748b;
          font-size: 14px;
          margin: 0 0 8px 0;
        }
        
        .footer a {
          color: #0f172a;
          text-decoration: none;
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .content h1 { color: #f8fafc; }
          .content h2 { color: #e2e8f0; }
          .content p { color: #cbd5e1; }
          .card { background-color: #1e293b; border-color: #334155; }
          .card h3 { color: #f8fafc; }
          .meta-value { color: #e2e8f0; }
        }
        
        /* Mobile responsiveness */
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
          }
          
          .header {
            padding: 24px 16px;
          }
          
          .content {
            padding: 32px 16px;
          }
          
          .content h1 {
            font-size: 24px;
          }
          
          .card {
            padding: 20px;
          }
          
          .button-primary,
          .button-secondary {
            display: block;
            margin: 8px 0;
            text-align: center;
          }
          
          .meta-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          
          .meta-label {
            min-width: auto;
            margin-right: 0;
          }
        }
      </style>
    </head>
    <body>
      ${preheader ? `
        <div style="display: none; max-height: 0; overflow: hidden;">
          ${preheader}
        </div>
      ` : ''}
      
      <div class="email-container">
        <div class="header">
          <h1 class="logo">Collavo</h1>
          <p class="tagline">Project Management Platform</p>
        </div>
        
        <div class="content">
          ${content}
          
          ${primaryAction || secondaryAction ? `
            <div class="button-container">
              ${primaryAction ? `
                <a href="${primaryAction.url}" class="button-primary">
                  ${primaryAction.text}
                </a>
              ` : ''}
              ${secondaryAction ? `
                <a href="${secondaryAction.url}" class="button-secondary">
                  ${secondaryAction.text}
                </a>
              ` : ''}
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>${footerText || 'This is an automated notification from Collavo.'}</p>
          <p>
            <a href="mailto:support@collavo.me">Contact Support</a> • 
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://collavo-alpha.vercel.app'}/settings/notifications">Email Settings</a>
          </p>
          <p>© ${new Date().getFullYear()} Collavo. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
