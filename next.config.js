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
    '!**/*.{png,jpg,jpeg,gif,webp,svg,mp4,webm,pdf,ico}'
  ], 
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'api.yadakchi.com' },
      { protocol: 'https', hostname: 'cdn.yadakchi.com' },
      { protocol: 'http', hostname: '51.158.252.139' },
      { protocol: 'http', hostname: '172.92.92.237' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_SEARCH_API_BASE_URL: process.env.NEXT_PUBLIC_SEARCH_API_BASE_URL || 'http://172.92.92.237:7104',
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

  // تنظیم تفکیک‌شده پروکسی: جستجو به پورت ۷۱۰۴ و سایر APIها به سرور اصلی
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com';
    const searchApiBaseUrl = process.env.NEXT_PUBLIC_SEARCH_API_BASE_URL || 'http://172.92.92.237:7104';
    
    return [

      {
        source: '/proxy-api/api/Search/:path*',
        destination: `${searchApiBaseUrl}/api/Search/:path*`,
        basePath: false,
      },
      // ۲. هدایت سایر درخواست‌های اپلیکیشن به سرور عمومی
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