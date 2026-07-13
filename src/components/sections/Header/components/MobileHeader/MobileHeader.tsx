// MobileHeader.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className={cn("w-full flex flex-col", className)}>
      {/* ردیف اول - همیشه ثابت */}
      <div className="flex items-center justify-between w-full h-10 bg-background z-20 relative">
        <Logo hideTitle className="shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          <SellerButton size="sm" />
          <ThemeToggle />
        </div>
      </div>

      {/* ردیف دوم - با انیمیشن */}
      <div className="relative z-10 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {!isScrolled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                height: { duration: 0.3, ease: 'easeInOut' },
                opacity: { duration: 0.2, ease: 'easeInOut' }
              }}
              className="w-full bg-background overflow-hidden"
            >
              <div className="pt-2 pb-1 flex flex-col w-full">
                {isMounted ? (
                  <>
                    <SearchBar 
                      placeholder="جستجو در یدکچی..."
                      onSearch={onSearch}
                      className="rounded-md px-3 py-1.5 bg-background w-full"
                      isMobile={true}
                    />
                    <div className="border-t pt-1.5 mt-2.5">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}