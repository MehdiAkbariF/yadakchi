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
import { HEADER_CONSTANTS } from './constants/header.constants';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > HEADER_CONSTANTS.SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className={cn('sticky top-0 z-50 w-full bg-background border-b', className)}>
      {/* ===== دسکتاپ (lg و بالاتر) ===== */}
      <div className="hidden lg:block">
        <div className="w-full px-4 lg:px-8 py-3">
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
            <Logo className="pt-0" />
            
            {/* جستجو با حداکثر عرض ثابت */}
            <div className="flex-1 max-w-2xl mx-4">
              <SearchBar 
                placeholder="جستجو در"
                onSearch={handleSearch}
                className="border border-input rounded-md px-3 py-1.5 bg-background"
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

        {/* ردیف پایین */}
        <div className={cn(
          'w-full border-t bg-muted/30',
          isScrolled && 'hidden'
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
          <MobileHeader onSearch={handleSearch} />
        </div>
      </div>
    </header>
  );
}