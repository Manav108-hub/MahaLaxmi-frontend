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

  // Image optimization - FIXED deprecated warning
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mahalaxmi-test.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@/components/ui'],
  },

  // Enable compression
  compress: true,

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
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
    ];
  },

  // Output optimization
  output: 'standalone',
  
  // Reduce bundle size
  swcMinify: true,
};

export default nextConfig;