import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ============================================
     IMAGE CONFIGURATION
     Allow images from Google (user pfp) and Spotify
     ============================================ */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google avatars
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co', // Spotify album art
      },
      {
        protocol: 'https',
        hostname: 'mosaic.scdn.co', // Spotify playlist covers
      },
    ],
  },
};

export default nextConfig;
