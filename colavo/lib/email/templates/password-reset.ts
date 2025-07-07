export interface PasswordResetParams {
  userName: string;
  resetUrl: string;
  expirationHours?: number;
}

export function generatePasswordResetTemplate(params: PasswordResetParams): string {
  const { userName, resetUrl, expirationHours = 1 } = params;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Collavo</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Collavo</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Project Management</p>
        </div>

        <!-- Security Notice Banner -->
        <div style="background-color: #f59e0b; padding: 12px 30px; text-align: center;">
          <span style="color: white; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
            🔒 Password Reset Request
          </span>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
            Hi ${userName}
          </h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            You recently requested to reset your password for your Collavo account. Click the button below to reset it.
          </p>

          <!-- Important Info Card -->
          <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
              ⚠️ Important Security Information
            </h3>
            
            <ul style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0; padding-left: 20px;">
              <li>This reset link will expire in ${expirationHours} hour${expirationHours > 1 ? 's' : ''}</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password won't change until you create a new one</li>
            </ul>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; transition: all 0.2s; font-size: 16px;">
              Reset My Password
            </a>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 12px 0;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #3b82f6; font-size: 12px; word-break: break-all; background-color: #f1f5f9; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0; margin: 0;">
              ${resetUrl}
            </p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
              🔐 <strong>Security tip:</strong> Always make sure you're on the official Collavo website when entering your password. Never share your login credentials with anyone.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
            This is an automated security email from Collavo. If you didn't request a password reset, please secure your account immediately.
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