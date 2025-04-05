// //import type { NextConfig } from "next";
// /** @type {import('next').NextConfig} */
// import dotenv from 'dotenv';

// dotenv.config();

// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'cdn.sanity.io',
//         port: '',
//         pathname: '**',
//         search: '',
//       },
//     ],
//     // domains: [`cdn.sanity.io`], // Uncomment if using the older domains option
//   },
// };

// module.exports = {
//   env: {
//     MONGODB_URI: process.env.MONGODB_URI,
//       },
//   async rewrites() {
//     return [
//       {
//         source: "/api/socket",
//         destination: "/api/socket",
//       },
//     ];
//   },
// };


// export default nextConfig;

import 'dotenv/config';

/** @type {import('next').NextConfig} */
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
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
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
 