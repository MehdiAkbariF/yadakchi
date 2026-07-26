import type { Metadata, Viewport } from 'next';
import { RootProvider } from '@/providers/root.provider';
import { env } from '@/core/config/env';
import './globals.css';

// تنظیم کامل مشخصات تاچ، مقیاس و استاتوس‌بار گوشی‌ها
export const viewport: Viewport = {
  themeColor: '#F56D3C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // جلوگیری از زوم ناخواسته در زمان کلیک روی اینپوت‌های فرم در موبایل
  viewportFit: 'cover', // پشتیبانی کامل از ناچ بالای گوشی‌ها (خصوصا آیفون)
};

export const metadata: Metadata = {
  title: {
    default: 'یدک‌چی | بازارگاه تخصصی قطعات خودرو',
    template: '%s | یدک‌چی'
  },
  description: 'بزرگ‌ترین مارکت‌پلیس خودرو و قطعات یدکی در ایران',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'یدک‌چی',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192x192.png', // آیکون مخصوص دیوایس‌های اپل (Homescreen)
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* افزودن suppressHydrationWarning جهت نادیده گرفتن هشدارهای تزریق اتریبیوت کلاس و استایل تم توسط next-themes */
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}