'use client';

import { useState, useEffect } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={cn("w-full flex flex-col transition-transform duration-300 will-change-transform", className)}>
      <div className="flex items-center justify-between w-full h-10 bg-background z-20 relative">
        <Logo className="shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          <SellerButton size="sm" />
          <ThemeToggle />
        </div>
      </div>

      <div className={cn(
        "w-full bg-background transition-all duration-300 ease-out origin-top transform will-change-[transform,opacity,max-height]",
        isScrolled 
          ? "max-h-0 opacity-0 pointer-events-none scale-y-90 -translate-y-3 overflow-hidden" 
          : "max-h-36 opacity-100 scale-y-100 translate-y-0"
      )}>
        <div className="pt-2 pb-1.5 flex flex-col w-full">
          {isMounted ? (
            <>
              <SearchBar 
                placeholder="جستجو در یدک‌چی..."
                onSearch={onSearch}
                className="rounded-md px-3 py-1.5 bg-background w-full"
                isMobile={true}
              />
              
              <div className="border-t pt-2 mt-2">
                <CitySelector variant="mobile" />
              </div>
            </>
          ) : (
            <>
              <div className="h-9 w-full bg-muted/20 rounded-md animate-pulse" />
              <div className="h-6 mt-2.5 w-full bg-muted/15 rounded-md animate-pulse" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}