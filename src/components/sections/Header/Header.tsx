// c:\Users\Raven\final-projects\yadakchi-front\yadakchi\src\components\sections\Header\Header.tsx
'use client';

import { useEffect } from 'react';
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

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  useAuth(); 
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);
  const setIsHeaderMinimized = useAppStore((state) => state.setIsHeaderMinimized);
  const { scrollY } = useScroll();

  useEffect(() => {
    setIsHeaderMinimized(false);
  }, [pathname, setIsHeaderMinimized]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() || 0;
    let nextState = false;

    if (latest < 120) {
      nextState = false;
    } else if (latest > prev) {
      nextState = true;
    } else {
      nextState = false;
    }

    if (nextState !== isHeaderMinimized) {
      setIsHeaderMinimized(nextState);
    }
  });

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className={cn('lg:sticky lg:top-0 z-50 w-full bg-background border-b lg:bg-transparent lg:border-b-0 transition-colors duration-300', className)}>
      <div className="hidden lg:block h-[116px] w-full pointer-events-none relative">
        <motion.div 
          className="w-full bg-background border-b pointer-events-auto flex flex-col shadow-xs"
          initial={false}
          animate={isHeaderMinimized ? "collapsed" : "expanded"}
          variants={{
            expanded: { height: '116px', transition: { duration: 0.18, ease: 'easeInOut' } },
            collapsed: { height: '68px', transition: { duration: 0.18, ease: 'easeInOut' } }
          }}
        >
          <div className="w-full px-4 lg:px-8 py-3 h-[68px] flex items-center">
            <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto gap-4">
              {/* ۱. لوگو */}
              <Logo className="pt-0 shrink-0" />
              
              {/* ۲. باکس سرچ عریض‌تر شده (طبق ایشو YF-25) */}
              <div className="flex-1 max-w-3xl xl:max-w-4xl mx-2">
                <SearchBar 
                  placeholder="جستجوی هوشمند قطعات..."
                  onSearch={handleSearch}
                  isMobile={false}
                />
              </div>
              
              {/* ۳. چیدمان دقیق طبق عکس (فروشنده شو -> احراز هویت -> سبد خرید -> تغییر تم) */}
              <div className="flex items-center gap-3 shrink-0">
                <SellerButton />
                <AuthButton />
                <CartButton />
                <div className="mr-1 pl-1 border-r border-border/60">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={false}
            animate={isHeaderMinimized ? "collapsed" : "expanded"}
            variants={{
              expanded: { height: '48px', opacity: 1, transition: { duration: 0.18, ease: 'easeInOut' } },
              collapsed: { height: 0, opacity: 0, transition: { duration: 0.15, ease: 'easeInOut' } }
            }}
            className={cn(
              "w-full border-t bg-muted/30",
              isHeaderMinimized ? "overflow-hidden pointer-events-none" : "overflow-visible"
            )}
          >
            <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
              <div className="flex items-center justify-between h-12">
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

      <div className="lg:hidden h-[166px] w-full" />
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b px-4 py-2 w-full shadow-sm">
        <div className="max-w-screen-2xl mx-auto">
          <MobileHeader onSearch={handleSearch} isScrolled={isHeaderMinimized} />
        </div>
      </div>
    </header>
  );
}