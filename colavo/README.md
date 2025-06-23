This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Critical Production Environment Variables

⚠️ **IMPORTANT**: The following environment variables MUST be set in production to fix authentication issues:

```bash
# Authentication - Server Side (Required)
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=https://collavo-alpha.vercel.app

# Authentication - Client Side (Required) 
NEXT_PUBLIC_BETTER_AUTH_URL=https://collavo-alpha.vercel.app
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

### ⚠️ Authentication Bug Fix
The production login issue was caused by:
1. **URL Mismatch**: Client and server using different base URLs
2. **Missing Environment Variables**: `NEXT_PUBLIC_BETTER_AUTH_URL` not set
3. **CSRF Origin Issues**: Better Auth rejecting requests due to origin mismatch

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
