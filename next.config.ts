import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during builds to avoid deployment failures
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Keep TypeScript checking enabled
  typescript: {
    ignoreBuildErrors: false,
  },

  // Image optimization
  images: {
    domains: ['mahalaxmi-test.s3.ap-south-1.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Caching headers for better performance
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=1, stale-while-revalidate=59',
          },
        ],
      },
    ];
  },
};

export default nextConfig;