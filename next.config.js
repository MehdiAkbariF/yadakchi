/** @type {import('next').NextConfig} */
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public', // مسیر فایل‌های تولید شده سرویس‌ورکر
  register: true, // ثبت خودکار سرویس‌ورکر
  skipWaiting: true, // فعال‌سازی آنی آپدیت‌های جدید اپلیکیشن
  disable: process.env.NODE_ENV === 'development', // غیرفعال بودن در لوکال دولوپمنت جهت جلوگیری از اختلال در کش کدها
  /* 
    بهینه‌سازی طلایی PWA:
    جلوگیری از پیش‌دانلود (Precache) کردن بیش از ۱۵ مگابایت فونت‌های سنگین ایران‌سنس و ایران‌یکان در اولین رندر صفحه اصلی
  */
  publicExcludes: ['!Font/**/*'], 
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
    remotePatterns: [
      { protocol: 'https', hostname: 'api.yadakchi.com' },
      { protocol: 'https', hostname: 'cdn.yadakchi.com' },
      { protocol: 'http', hostname: '51.158.252.139' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
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

  // Proxy برای جلوگیری از CORS
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com';
    
    return [
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

  /* 
    نکته بسیار مهم:
    اگر می‌خواهید روی سیستم خود دستور "npm run start" یا "next start" را اجرا کنید، 
    خط زیر حتماً باید کامنت باشد. هر زمان خواستید پروژه را روی سرور لینوکس با Docker بالا بیاورید، 
    کافیست خط زیر را از حالت کامنت خارج کنید.
  */
  // output: 'standalone',

  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = withPWA(nextConfig);