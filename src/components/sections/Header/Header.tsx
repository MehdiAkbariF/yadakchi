'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';
import { Logo } from './components/Logo/Logo';
import { SearchBar } from './components/SearchBar/SearchBar';
import { SellerButton } from './components/SellerButton/SellerButton';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { AuthButton } from './components/AuthButton/AuthButton';
import { CartButton } from './components/CartButton/CartButton';
import { DesktopNavigation } from './components/DesktopNavigation/DesktopNavigation';
import { MobileHeader } from './components/MobileHeader/MobileHeader';
import { MyCarButton } from './components/MyCarButton/MyCarButton';
import { CitySelector } from './components/CitySelector/CitySelector';
import { FlowHeader, FlowStep } from '@/components/features/CheckoutFlow/FlowHeader';
import { useAppStore } from '@/shared/store/useAppStore';
import { FlowProgressBar } from '@/components/features/CheckoutFlow';

export interface HeaderProps {
  className?: string;
}

const FLOW_PAGES_MAP: Record<string, FlowStep> = {
  '/basket': 'basket',
  '/checkout': 'checkout',
  '/basket-payment': 'payment',
};

function getFlowStep(pathname: string | null): FlowStep | null {
  if (!pathname) return null;
  for (const [path, step] of Object.entries(FLOW_PAGES_MAP)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) return step;
  }
  return null;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);
  const setIsHeaderMinimized = useAppStore((state) => state.setIsHeaderMinimized);
  const { scrollY } = useScroll();

  const flowStep = getFlowStep(pathname);
  const isFlowPage = !!flowStep;

  React.useEffect(() => {
    setIsHeaderMinimized(false);
  }, [pathname, setIsHeaderMinimized]);

  // کنترل تغییر وضعیت هدر با آستانه (Threshold) دقیق‌تر برای جلوگیری از ری‌رندرهای اسپمی
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    const diff = latest - prev;

    if (latest < 40) {
      if (isHeaderMinimized) setIsHeaderMinimized(false);
      return;
    }

    if (diff < -12) {
      if (isHeaderMinimized) setIsHeaderMinimized(false);
    } else if (diff > 12 && latest > 90) {
      if (!isHeaderMinimized) setIsHeaderMinimized(true);
    }
  });

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      document.documentElement.style.setProperty(
        '--header-height',
        isHeaderMinimized ? '68px' : '112px'
      );
    }
  }, [isHeaderMinimized]);

  return (
    <header className={cn('z-40 w-full select-none', className)}>
      {/* ============ هدر دسکتاپ با شتاب‌دهنده گرافیکی GPU ============ */}
      <div className="pointer-events-none relative hidden h-28 w-full lg:block">
        <div
          className={cn(
            'pointer-events-auto fixed inset-x-0 top-0 z-40 flex w-full flex-col border-b border-border/60 bg-card/95 shadow-xs backdrop-blur-md transition-all duration-300 ease-out transform-gpu'
          )}
        >
          <div className="flex h-[68px] w-full items-center px-4 py-3 lg:px-8">
            <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4">
              <Logo className="shrink-0 pt-0" />

              <div className="mx-2 max-w-3xl flex-1 xl:max-w-4xl">
                <SearchBar
                  placeholder="جستجو در قطعات یدکچی..."
                  onSearch={handleSearch}
                  isMobile={false}
                />
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <SellerButton />
                <AuthButton />
                <CartButton />
                <div className="ms-1 border-s border-border/70 pe-1">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>

          {/* ردیف دوم نویگیشن با ترنزیشن نرم ارتفاع و فید بدون ری‌لیات سنگین */}
          <div
            className={cn(
              'w-full border-t border-border/50 bg-secondary/30 transition-all duration-300 ease-out overflow-hidden transform-gpu',
              isHeaderMinimized
                ? 'h-0 opacity-0 pointer-events-none'
                : 'h-11 opacity-100 pointer-events-auto'
            )}
          >
            <div className="mx-auto max-w-screen-2xl px-4 lg:px-8">
              <div className="flex h-11 items-center justify-between">
                <DesktopNavigation />
                <div className="flex items-center gap-4">
                  <MyCarButton />
                  <CitySelector />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ هدر موبایل ============ */}
      {isFlowPage && flowStep ? (
        <>
          <div className="h-[92px] w-full lg:hidden" />
          <FlowHeader step={flowStep} />
          <FlowProgressBar currentStep={flowStep} />
        </>
      ) : (
        <>
          <div className={cn('w-full lg:hidden transition-all duration-300', isHeaderMinimized ? 'h-14' : 'h-36')} />
          <div className="fixed inset-x-0 top-0 z-40 w-full border-b border-border/60 bg-card/95 px-4 py-2 shadow-xs backdrop-blur-md lg:hidden transform-gpu">
            <div className="mx-auto max-w-screen-2xl">
              <MobileHeader onSearch={handleSearch} isScrolled={isHeaderMinimized} />
            </div>
          </div>
        </>
      )}
    </header>
  );
}