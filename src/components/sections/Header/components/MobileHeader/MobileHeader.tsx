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
    <div className={cn('flex w-full flex-col transition-transform duration-normal will-change-transform', className)}>
      {/* ردیف بالای موبایل: لوگو و اکشن‌ها کاملاً هماهنگ با پس‌زمینه سفید کارت */}
      <div className="relative z-20 flex h-10 w-full items-center justify-between">
        <Logo className="shrink-0" />
        <div className="flex shrink-0 items-center gap-2">
          <SellerButton size="sm" />
          <ThemeToggle />
        </div>
      </div>

      {/* ردیف پایین: سرچ و انتخاب شهر */}
      <div
        className={cn(
          'w-full origin-top transform transition-all duration-slow ease-out',
          'will-change-[transform,opacity,max-height]',
          isScrolled
            ? 'pointer-events-none max-h-0 -translate-y-3 scale-y-90 overflow-hidden opacity-0'
            : 'max-h-36 translate-y-0 scale-y-100 opacity-100'
        )}
      >
        <div className="flex w-full flex-col pb-1 pt-2">
          {isMounted ? (
            <>
              <SearchBar
                placeholder="جستجو در یدک‌چی..."
                onSearch={onSearch}
                className="w-full"
                isMobile
              />

              <div className="mt-2.5 border-t border-border/60 pt-2">
                <CitySelector variant="mobile" />
              </div>
            </>
          ) : (
            <>
              <div className="h-9 w-full animate-pulse rounded-md bg-secondary" />
              <div className="mt-2.5 h-6 w-full animate-pulse rounded-md bg-secondary/70" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}