// src/components/shared/Layouts/MainLayout/MainLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { BottomNav } from '@/components/sections/BottomNav/BottomNav';
import { cn } from '@/design-system/utils/cn';

export interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideBottomNav?: boolean;
  /** مخفی کردن هدر اصلی فقط در موبایل */
  hideHeaderOnMobile?: boolean;
  /** مخفی کردن انتخاب شهر در موبایل برای صفحات خاص */
  hideMobileCitySelector?: boolean;
}

const FLOW_PAGES = ['/basket', '/checkout', '/basket-payment'];
function isFlowPage(pathname: string | null): boolean {
  if (!pathname) return false;
  return FLOW_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function MainLayout({
  children,
  className,
  hideHeader = false,
  hideFooter = false,
  hideBottomNav = false,
  hideHeaderOnMobile = false,
  hideMobileCitySelector,
}: MainLayoutProps) {
  const pathname = usePathname();

  const isProfileSection = pathname.startsWith('/profile');
  const isProductPage = pathname.startsWith('/product/');
  const isFlow = isFlowPage(pathname);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {!hideHeader && (
        <div
          className={cn(
            isProfileSection && 'hidden lg:block',
            isProductPage && 'hidden lg:block',
            hideHeaderOnMobile && 'hidden lg:block'
          )}
        >
          <Header hideMobileCitySelector={hideMobileCitySelector} />
        </div>
      )}

      <main
        className={cn(
          'flex-1 w-full max-w-[1400px] mx-auto min-h-[80vh]',
          isProfileSection
            ? 'px-0 py-0 pb-16 lg:pb-8 lg:px-6 lg:py-6'
            : isProductPage
            ? 'px-0 py-0 pb-0 lg:px-6 lg:py-6'
            : isFlow
            ? 'px-4 md:px-6 py-5 pb-44 lg:pb-6'
            : 'px-4 md:px-6 py-5 pb-20 lg:pb-6',
          className
        )}
      >
        {children}
      </main>

      {!hideFooter && (
        <div
          className={cn(
            isProfileSection && 'hidden lg:block',
            isProductPage && 'hidden lg:block'
          )}
        >
          <Footer />
        </div>
      )}

      {!hideBottomNav && !isProductPage && <BottomNav />}
    </div>
  );
}