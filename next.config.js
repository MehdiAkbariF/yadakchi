// next.config.js

/** @type {import('next').NextConfig} */
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  publicExcludes: [
    '!Font/**/*',
    '!font/**/*',
    '!images/**/*',
    '!image/**/*',
    '!banners/**/*',
    '!banner/**/*',
    '!**/*.{png,jpg,jpeg,gif,webp,svg,mp4,webm,pdf,ico}',
  ],
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  reactStrictMode: true,
  compress: true, // فشرده‌سازی خودکار Gzip / Brotli

  // بهینه‌سازی چشمگیر ایمپورت آیکون‌های لوسید و کاهش زمان بلاک جاوااسکریپت (TBT)
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // ۳۰ روز کش در مرورگر برای تصاویر
    deviceSizes: [640, 750, 828, 1080, 1200, 1400],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'api.yadakchi.local' },
      { protocol: 'https', hostname: 'api.yadakchi.com' },
      { protocol: 'https', hostname: 'cdn.yadakchi.com' },
      { protocol: 'http', hostname: '51.158.252.139' },
      { protocol: 'http', hostname: '172.92.92.237' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },

  // هدرهای امنیتی مطابق الزامات Best Practices گوگل و رفع خطاهای COOP و HSTS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        // کش قدرتمند و بدون تغییر برای فونت‌ها
        source: '/Font/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_MEDIA_BASE_URL:
      process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '/proxy-api',
    NEXT_PUBLIC_SEARCH_API_BASE_URL:
      process.env.NEXT_PUBLIC_SEARCH_API_BASE_URL ||
      'https://query.yadakchi.local',
    NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
    NEXT_PUBLIC_ENABLE_LOGGING: process.env.NEXT_PUBLIC_ENABLE_LOGGING,
    NEXT_PUBLIC_ENABLE_DEV_TOOLS: process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_DEFAULT_PAGE_SIZE: process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE,
    NEXT_PUBLIC_MAX_PAGE_SIZE: process.env.NEXT_PUBLIC_MAX_PAGE_SIZE,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  async rewrites() {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.local';
    const searchApiBaseUrl =
      process.env.NEXT_PUBLIC_SEARCH_API_BASE_URL ||
      'https://query.yadakchi.local';

    return [
      {
        source: '/proxy-api/api/Search/:path*',
        destination: `${searchApiBaseUrl}/api/Search/:path*`,
        basePath: false,
      },
      {
        source: '/proxy-api/:path*',
        destination: `${apiBaseUrl}/:path*`,
        basePath: false,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ];
  },

  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = withPWA(nextConfig);