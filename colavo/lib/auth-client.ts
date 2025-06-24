import { createAuthClient } from "better-auth/react"

// Get the base URL with proper fallbacks
const getBaseURL = () => {
  // In production, use the environment variable or fallback to your domain
  if (typeof window !== 'undefined') {
    // Client-side: use window.location.origin
    return window.location.origin;
  }
  
  // Server-side: use environment variables
  return process.env.NEXT_PUBLIC_APP_URL || 
         process.env.BETTER_AUTH_URL || 
         (process.env.NODE_ENV === 'production' 
           ? 'https://collavo-alpha.vercel.app' 
           : 'http://localhost:3000');
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  // Add additional configuration for debugging
  fetchOptions: {
    onError: (ctx) => {
      // Silently handle auth errors - they're handled in the UI
      void ctx.error;
    },
    onRequest: (ctx) => {
      // Silently handle requests
      void ctx.url;
    }
  }
})