// src/components/sections/Header/Header.tsx

'use client';

import { useState, useEffect } from 'react';
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
import { useRouter } from 'next/navigation';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  useAuth(); 
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let accumulatedDelta = 0;
    const SCROLL_THRESHOLD = 15;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 100) {
        setIsHeaderMinimized(false);
        lastScrollY = currentScrollY;
        accumulatedDelta = 0;
        return;
      }

      const diff = currentScrollY - lastScrollY;
      
      if (diff > 0) {
        if (accumulatedDelta < 0) accumulatedDelta = 0;
        accumulatedDelta += diff;
        
        if (accumulatedDelta >= SCROLL_THRESHOLD) {
          setIsHeaderMinimized(true);
          accumulatedDelta = 0;
        }
      } else if (diff < 0) {
        if (accumulatedDelta > 0) accumulatedDelta = 0;
        accumulatedDelta += Math.abs(diff);
        
        if (accumulatedDelta >= SCROLL_THRESHOLD) {
          setIsHeaderMinimized(false);
          accumulatedDelta = 0;
        }
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className={cn('sticky top-0 z-50 w-full bg-background border-b transition-all duration-300', className)}>
      {/* ===== دسکتاپ (lg و بالاتر) ===== */}
      <div className="hidden lg:block">
        <div className="w-full px-4 lg:px-8 py-3">
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
            <Logo className="pt-0" />
            
            {/* 🚨 کلاس‌های border و bg حذف شدند */}
            <div className="flex-1 max-w-2xl mx-4">
              <SearchBar 
                placeholder="جستجوی هوشمند قطعات..."
                onSearch={handleSearch}
                isMobile={false}
              />
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <SellerButton />
              <ThemeToggle />
              <AuthButton />
              <CartButton />
            </div>
          </div>
        </div>

        {/* ردیف پایین دسکتاپ */}
        <div className={cn(
          'w-full border-t bg-muted/30 transition-all duration-300 ease-in-out',
          isHeaderMinimized 
            ? 'max-h-0 opacity-0 border-t-transparent pointer-events-none overflow-hidden' 
            : 'max-h-14 opacity-100 border-t-border overflow-visible'
        )}>
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between h-12">
              <DesktopNavigation />
              <div className="flex items-center gap-4">
                <MyCarButton />
                <CitySelector />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== موبایل (تا lg) ===== */}
      <div className="lg:hidden w-full px-4 py-2">
        <div className="max-w-screen-2xl mx-auto">
          <MobileHeader onSearch={handleSearch} isScrolled={isHeaderMinimized} />
        </div>
      </div>
    </header>
  );
}