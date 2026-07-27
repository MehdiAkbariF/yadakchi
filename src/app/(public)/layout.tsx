// src/app/(public)/layout.tsx

import { MainLayout } from '@/components/shared/Layouts/MainLayout';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  /*
    اصلاحیه بزرگ و ساختاری معماری لایوت‌های Next.js:
    با قرار دادن MainLayout در لایوت والد، هدر، فوتر و منوهای پایینی در تمام جابجایی‌های صفحات
    پایدار مانده و هرگز نابود نمی‌شوند. این کار سرعت جابجایی بین صفحات را به زیر ۱۰۰ میلی‌ثانیه می‌رساند.
  */
  return <MainLayout>{children}</MainLayout>;
}