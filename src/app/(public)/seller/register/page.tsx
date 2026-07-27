import type { Metadata } from 'next';
import { SellerRegisterContent } from '@/components/features/SellerRegister/SellerRegisterContent';

export const metadata: Metadata = {
  title: 'فروشنده شو | راه‌اندازی فروشگاه آنلاین قطعات خودرو در یدک‌چی',
  description: 'در بزرگ‌ترین بازارگاه تخصصی لوازم یدکی خودرو در ایران، فروشگاه آنلاین خود را بدون هزینه راه‌اندازی کنید و به خریداران سراسر کشور بفروشید.',
  alternates: {
    canonical: 'https://www.yadakchi.com/seller/register',
  },
  openGraph: {
    title: 'فروشنده شو | راه‌اندازی فروشگاه آنلاین قطعات خودرو در یدک‌چی',
    description: 'بدون نیاز به داشتن وب‌سایت، در یدک‌چی قطعات خودرو را به سراسر کشور آنلاین بفروشید.',
    url: 'https://www.yadakchi.com/seller/register',
    siteName: 'یدک‌چی',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: 'https://api.yadakchi.com/Logo.svg',
        width: 1200,
        height: 630,
        alt: 'فروشنده شو در یدک‌چی',
      },
    ],
  },
};

export default async function SellerRegisterPage() {
  return <SellerRegisterContent />;
}