import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */
import dotenv from 'dotenv';

dotenv.config();

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '**',
        search: '',
      },
    ],
    // domains: [`cdn.sanity.io`], // Uncomment if using the older domains option
  },
};

module.exports = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    SANITY_STUDIO_PROJECT_ID: process.env.SANITY_STUDIO_PROJECT_ID,
    SANITY_STUDIO_DATASET: process.env.SANITY_STUDIO_DATASET,
    SANITY_STUDIO_API_VERSION: process.env.SANITY_STUDIO_API_VERSION,
    SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
  },
  async rewrites() {
    return [
      {
        source: "/api/socket",
        destination: "/api/socket",
      },
    ];
  },
};


export default nextConfig;
