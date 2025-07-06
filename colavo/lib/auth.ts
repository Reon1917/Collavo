import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { ResendEmailService } from "@/lib/email/resend-service";
import { generatePasswordResetTemplate } from "@/lib/email/templates/password-reset";

// Type-safe environment configuration
interface AuthEnvConfig {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

function getAuthEnvConfig(): AuthEnvConfig {
  const config = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NODE_ENV: process.env.NODE_ENV as AuthEnvConfig['NODE_ENV'],
  };

  // Validate required environment variables
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'BETTER_AUTH_SECRET'
  ] as const;

  for (const varName of requiredVars) {
    if (!config[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  return config as AuthEnvConfig;
}

// Get validated environment config
const envConfig = getAuthEnvConfig();

// Database provider type
type DatabaseProvider = "pg" | "mysql" | "sqlite";

// Auth configuration with proper typing
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg" as DatabaseProvider,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false, // Set to true in production
    sendResetPassword: async ({ user, token }) => {
      try {
        // Create a proper reset URL that points to our reset password page
        // Priority: NEXT_PUBLIC_APP_URL > BETTER_AUTH_URL > Vercel URL > localhost
        const getBaseUrl = () => {
          // Use NEXT_PUBLIC_APP_URL if available (recommended for production)
          if (process.env.NEXT_PUBLIC_APP_URL) {
            return process.env.NEXT_PUBLIC_APP_URL;
          }
          
          // Fall back to BETTER_AUTH_URL
          if (envConfig.BETTER_AUTH_URL) {
            return envConfig.BETTER_AUTH_URL;
          }
          
          // Use Vercel URL if available (automatically set by Vercel)
          if (process.env.VERCEL_URL) {
            return `https://${process.env.VERCEL_URL}`;
          }
          
          // Production fallback (you should set NEXT_PUBLIC_APP_URL instead)
          if (envConfig.NODE_ENV === "production") {
            return "https://collavo-alpha.vercel.app";
          }
          
          // Development fallback
          return "http://localhost:3000";
        };
        
        const baseUrl = getBaseUrl();
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;
        
        // Sanitize user name to prevent XSS
        const sanitizedUserName = user.name ? user.name.replace(/[<>]/g, '') : user.email.split('@')[0] || 'User';
        
        // Generate HTML email using our template
        const emailHtml = generatePasswordResetTemplate({
          userName: sanitizedUserName,
          resetUrl,
          expirationHours: 1, // Reset tokens expire in 1 hour
        });

        // Send email using ResendEmailService
        await ResendEmailService.sendEmail({
          to: [user.email],
          subject: "Reset your Collavo password",
          html: emailHtml,
        });

        // Log success in development
        if (envConfig.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.log(`Password reset email sent to ${user.email}`);
        }

      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to send password reset email:', error);
        
        // In development, still log the URL as fallback
        if (envConfig.NODE_ENV === "development") {
          const fallbackBaseUrl = process.env.NEXT_PUBLIC_APP_URL || envConfig.BETTER_AUTH_URL || "http://localhost:3000";
          const fallbackResetUrl = `${fallbackBaseUrl}/reset-password?token=${token}`;
          // eslint-disable-next-line no-console
          console.log(`Fallback - Password reset link for ${user.email}: ${fallbackResetUrl}`);
        }
        
        // Re-throw the error to be handled by better-auth
        throw error;
      }
    },
  },
  socialProviders: {
    google: {
      clientId: envConfig.GOOGLE_CLIENT_ID,
      clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
      scope: ["email", "profile"], // Explicitly define scopes
      prompt: "select_account", // Force account selection on every login
    },
  },
  secret: envConfig.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 
    envConfig.BETTER_AUTH_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    (envConfig.NODE_ENV === "production" 
      ? "https://collavo-alpha.vercel.app" 
      : "http://localhost:3000"
    ),
  trustedOrigins: [
    "http://localhost:3000",
    "https://collavo-alpha.vercel.app",
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [])
  ].filter((origin, index, arr) => arr.indexOf(origin) === index), // Remove duplicates
  // Additional security configurations
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },
  // CSRF protection
  csrf: {
    enabled: true,
  },
  // Rate limiting
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute window
    max: 100, // Max requests per window
  },
  // Logging configuration
  logger: {
    level: envConfig.NODE_ENV === "production" ? "error" : "debug",
  },
});

// Export auth types for use in your app
export type Auth = typeof auth;
export type Session = Auth['api']['getSession'] extends (...args: any[]) => Promise<infer T> ? T : never;
export type User = Session extends { user: infer U } ? U : never;