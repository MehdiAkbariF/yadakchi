// next.config.js

/** @type {import('next').NextConfig} */
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public', // مسیر فایل‌های تولید شده سرویس‌ورکر
  register: true, // ثبت خودکار سرویس‌ورکر روی مرورگر کاربر
  skipWaiting: true, // فعال‌سازی آنی آپدیت‌های جدید اپلیکیشن بدون نیاز به بستن تب
  
  /* 
    تست خطایابی سریع سرعت:
    اگر می‌خواهید بدانید PWA علت اصلی افت سرعت پروداکشن است، 
    کافیست موقتاً مقدار خط زیر را به true تغییر دهید و پروژه را تست کنید:
  */
  disable: process.env.NODE_ENV === 'development', // یا تغییر به true جهت غیرفعال‌سازی موقت در پروداکشن

  /* 
    بهینه‌سازی فوق‌العاده سخت‌گیرانه پیش‌دانلود PWA (Precache Exclusion):
    در این بخش تمامی فایل‌های حجیم رسانه‌ای، تصاویر (PNG, JPG, WebP, SVG, GIF)،
    پوشه‌های فونت با حروف بزرگ و کوچک (Font, font)، ویدیوها و آیکون‌ها را از لیست دانلود اولیه سرویس‌ورکر خارج کرده‌ایم.
    این کار مانع از مسدود شدن اینترنت و پردازنده موبایل کاربر در اولین لود صفحه اصلی می‌شود.
  */
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
    disableDevLogs: true, // غیرفعال کردن لاگ‌های سنگین ورک‌باکس در کنسول مرورگر
  },
});

const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true, // نادیده گرفتن خطاهای تایپ‌اسکریپت در زمان بیلد جهت تسریع فرآیند دپلوی
  },

  eslint: {
    ignoreDuringBuilds: true, // نادیده گرفتن خطاهای ESLint در زمان بیلد
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.yadakchi.com' },
      { protocol: 'https', hostname: 'cdn.yadakchi.com' },
      { protocol: 'http', hostname: '51.158.252.139' },
    ],
    formats: ['image/avif', 'image/webp'], // پشتیبانی از مدرن‌ترین و سبک‌ترین فرمت‌های تصویر روی مرورگرها
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
    removeConsole: process.env.NODE_ENV === 'production', // حذف دستورات console.log در پروداکشن جهت بهبود پرفورمنس کلینت
  },

  // تنظیم قوانین پروکسی جهت دور زدن محدودیت‌های مرورگر و CORS
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
    نکته پایداری بیلد داکر:
    در صورت نیاز به بیلد تحت کانتینر داکر بر روی سرور لینوکس، خط زیر را از کامنت خارج کنید.
  */
  // output: 'standalone',

  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = withPWA(nextConfig);