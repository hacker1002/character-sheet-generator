import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [], // Add external image domains if needed
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb', // Allow 15MB uploads
    },
  },
};

export default nextConfig;
