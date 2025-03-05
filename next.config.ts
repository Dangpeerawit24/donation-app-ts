/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    TZ: "Asia/Bangkok",
  },
  images: {
    domains: [
      'localhost',
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '3mb',
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
