This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Critical Production Environment Variables

⚠️ **IMPORTANT**: The following environment variables MUST be set in production:

```bash
# Authentication - Server Side (Required)
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=https://collavo-alpha.vercel.app

# Authentication - Client Side (Required) 
NEXT_PUBLIC_APP_URL=https://collavo-alpha.vercel.app

# Database
DATABASE_URL=postgresql://...

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Upload
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
```

## Security Notes

- **Session Management**: Uses Better Auth with secure cookie settings in production
- **CSRF Protection**: Enabled with proper same-site policies
- **Cookie Security**: HTTPOnly, Secure flags enforced in production
- **Environment Variables**: Server-side secrets are properly isolated from client-side code
- **Error Handling**: Production builds suppress debug logs to prevent information leakage

## Authentication Bug Fixes Applied

1. **Cookie Name Conflicts**: Fixed Better Auth vs NextAuth.js cookie naming issues
2. **Session Killer Logic**: Prevented interference with login/signup processes  
3. **Environment Variables**: Corrected server-side vs client-side variable usage
4. **Production Debugging**: Removed console logs to prevent information exposure

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
