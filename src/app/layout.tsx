import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import localFont from 'next/font/local';
import { RootProvider } from '@/providers/root.provider';
import { GlobalNavigationLoader } from '@/shared/Transitions/GlobalNavigationLoader';
import './globals.css';

// لود بهینه و بومی فونت ایران‌یکان با Zero Layout Shift (CLS = 0)
const iranYekan = localFont({
  src: [
    {
      path: '../../public/Font/IranYekan/woff2/IRANYekanXFaNum-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/Font/IranYekan/woff2/IRANYekanWebFn-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/Font/IranYekan/woff2/IRANYekanXFaNum-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  themeColor: '#CE3E04',
  width: 'device-width',
  initialScale: 1,
  // اصلاح شد: userScalable و maximumScale حذف شدند تا خطای بحرانی دسترسی‌پذیری گوگل برطرف شود
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://yadakchi.com'
  ),
  title: {
    default: 'یدکچی | بازارگاه تخصصی قطعات خودرو',
    template: '%s | یدکچی',
  },
  description: 'بزرگ‌ترین بازارگاه تخصصی لوازم یدکی و قطعات خودرو در ایران با تضمین اصالت و بهترین قیمت',
  applicationName: 'یدکچی',
  authors: [{ name: 'Yadakchi' }],
  creator: 'Yadakchi',
  publisher: 'Yadakchi',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'یدکچی',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192x192.png',
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={iranYekan.variable}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <RootProvider>
          <Suspense fallback={null}>
            <GlobalNavigationLoader />
          </Suspense>

          {children}
        </RootProvider>
      </body>
    </html>
  );
}