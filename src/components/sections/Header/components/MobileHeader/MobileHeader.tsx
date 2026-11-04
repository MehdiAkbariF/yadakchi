'use client';

import * as React from 'react';
import { cn } from '@/design-system/utils/cn';
import { Logo } from '../Logo/Logo';
import { SellerButton } from '../SellerButton/SellerButton';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { SearchBar } from '../SearchBar/SearchBar';
import { CitySelector } from '../CitySelector/CitySelector';

export interface MobileHeaderProps {
  className?: string;
  onSearch?: (query: string) => void;
  isScrolled?: boolean;
}

export function MobileHeader({ className, onSearch, isScrolled = false }: MobileHeaderProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={cn('flex w-full flex-col select-none', className)}>
      {/* ردیف اول: لوگو و کلیدها */}
      <div className="relative z-20 flex h-10 w-full items-center justify-between">
        <Logo className="shrink-0" />
        <div className="flex shrink-0 items-center gap-2">
          <SellerButton size="sm" />
          <ThemeToggle />
        </div>
      </div>

      {/* ردیف سرچ و شهر با ترنزیشن فید و جمع‌شدن روان */}
      <div
        className={cn(
          'w-full transition-all duration-300 ease-out transform-gpu overflow-hidden',
          isScrolled
            ? 'h-0 opacity-0 pointer-events-none mt-0'
            : 'h-24 opacity-100 pointer-events-auto mt-1.5'
        )}
      >
        <div className="flex w-full flex-col pb-1 pt-1">
          {isMounted ? (
            <>
              <SearchBar
                placeholder="جستجو در یدکچی..."
                onSearch={onSearch}
                className="w-full"
                isMobile
              />

              <div className="mt-2 border-t border-border/60 pt-1.5">
                <CitySelector variant="mobile" />
              </div>
            </>
          ) : (
            <>
              <div className="h-9 w-full animate-pulse rounded-md bg-secondary" />
              <div className="mt-2 h-6 w-full animate-pulse rounded-md bg-secondary/70" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}