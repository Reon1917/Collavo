import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep configuration minimal to avoid module system conflicts
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
    ],
  },
};

export default nextConfig;
