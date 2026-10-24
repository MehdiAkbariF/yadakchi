'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
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
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { useAppStore } from '@/shared/store/useAppStore';

export interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  
  const router = useRouter();
  const pathname = usePathname();
  useAuth();
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);
  const setIsHeaderMinimized = useAppStore((state) => state.setIsHeaderMinimized);
  const { scrollY } = useScroll();

  React.useEffect(() => {
    setIsHeaderMinimized(false);
  }, [pathname, setIsHeaderMinimized]);

  // باز شدن فوری با کمترین اسکرول به سمت بالا در هر کجای صفحه
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    const diff = latest - prev;

    if (latest < 40) {
      if (isHeaderMinimized) setIsHeaderMinimized(false);
      return;
    }

    // با کوچکترین حرکت به بالا (بیش از ۸ پیکسل) سریعاً هدر باز می‌شود
    if (diff < -8) {
      if (isHeaderMinimized) setIsHeaderMinimized(false);
    } 
    // با اسکرول به پایین جمع می‌شود
    else if (diff > 10 && latest > 80) {
      if (!isHeaderMinimized) setIsHeaderMinimized(true);
    }
  });

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };
React.useEffect(() => {
  document.documentElement.style.setProperty(
    '--header-height',
    isHeaderMinimized ? '68px' : '112px'
  );
}, [isHeaderMinimized]);
  return (
    <header className={cn('z-40 w-full select-none', className)}>
      {/* هدر نسخه دسکتاپ */}
      <div className="pointer-events-none relative hidden h-28 w-full lg:block">
        <motion.div
          className="pointer-events-auto fixed inset-x-0 top-0 z-40 flex w-full flex-col border-b border-border/60 bg-card/95 shadow-xs backdrop-blur-md"
          initial={false}
          animate={isHeaderMinimized ? 'collapsed' : 'expanded'}
          variants={{
            expanded: { height: '112px', transition: { duration: 0.2, ease: 'easeInOut' } },
            collapsed: { height: '68px', transition: { duration: 0.2, ease: 'easeInOut' } },
          }}
        >
          {/* ردیف اول دسکتاپ: لوگو، جستجو و اکشن‌ها */}
          <div className="flex h-[68px] w-full items-center px-4 py-3 lg:px-8">
            <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4">
              <Logo className="shrink-0 pt-0" />

              <div className="mx-2 max-w-3xl flex-1 xl:max-w-4xl">
                <SearchBar
                  placeholder="جستجوی هوشمند قطعات..."
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

          {/* ردیف دوم دسکتاپ: منوی ناوبری و اطلاعات خودرو */}
          <motion.div
            initial={false}
            animate={isHeaderMinimized ? 'collapsed' : 'expanded'}
            variants={{
              expanded: { height: '44px', opacity: 1, transition: { duration: 0.2, ease: 'easeInOut' } },
              collapsed: { height: 0, opacity: 0, transition: { duration: 0.15, ease: 'easeInOut' } },
            }}
            className={cn(
              'w-full border-t border-border/50 bg-secondary/30',
              isHeaderMinimized ? 'pointer-events-none overflow-hidden' : 'overflow-visible'
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
          </motion.div>
        </motion.div>
      </div>

      {/* هدر نسخه موبایل */}
      <div className="h-36 w-full lg:hidden" />
      <div className="fixed inset-x-0 top-0 z-40 w-full border-b border-border/60 bg-card/95 px-4 py-2 shadow-xs backdrop-blur-md lg:hidden">
        <div className="mx-auto max-w-screen-2xl">
          <MobileHeader onSearch={handleSearch} isScrolled={isHeaderMinimized} />
        </div>
      </div>
    </header>
  );
}