import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

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
    sendResetPassword: async ({ user, url, token }, request) => {
      // Create a proper reset URL that points to our reset password page
      const baseUrl = envConfig.BETTER_AUTH_URL || 
        (envConfig.NODE_ENV === "production" 
          ? "https://collavo-alpha.vercel.app" 
          : "http://localhost:3000"
        );
      
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;
      
      // For now, we'll just log the reset URL
      // In production, you would send this via email
      console.log(`Password reset link for ${user.email}: ${resetUrl}`);
      console.log(`Reset token: ${token}`);
      
      // TODO: Implement actual email sending
      // await sendEmail({
      //   to: user.email,
      //   subject: "Reset your password",
      //   text: `Click the link to reset your password: ${resetUrl}`,
      // });
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
  baseURL: envConfig.BETTER_AUTH_URL || 
    (envConfig.NODE_ENV === "production" 
      ? "https://collavo-alpha.vercel.app" 
      : "http://localhost:3000"
    ),
  trustedOrigins: [
    "http://localhost:3000",
    "https://collavo-alpha.vercel.app"
  ],
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