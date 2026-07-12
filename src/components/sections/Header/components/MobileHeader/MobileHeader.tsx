// src/components/sections/Header/components/MobileHeader/MobileHeader.tsx

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
      {/* ردیف اول: لوگو + دکمه‌ها */}
      <div className="flex items-center justify-between w-full h-10">
        <Logo hideTitle className="shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          <SellerButton size="sm" />
          <ThemeToggle />
        </div>
      </div>

      {/* ردیف دوم و سوم: لود انیمیشنی فیلد جستجو صرفاً پس از اتمام هیدراسیون جهت ممانعت از کرش useContext */}
      {isMounted ? (
        <AnimatePresence initial={false}>
          {!isScrolled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-2 pb-1 flex flex-col">
                <SearchBar 
                  placeholder="جستجو در یدکچی..."
                  onSearch={onSearch}
                  className="rounded-md px-3 py-1.5 bg-background w-full"
                  isMobile={true}
                />
                
                <div className="border-t pt-1.5 mt-2.5">
                  <CitySelector variant="mobile" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        // چیدمان ثابت موقت تا پیش از لود کلاینت جهت ممانعت از پرش صفحه
        <div className="pt-2 pb-1 flex flex-col">
          <div className="h-9 w-full bg-muted/20 rounded-md animate-pulse" />
          <div className="h-6 mt-2.5 w-full bg-muted/15 rounded-md animate-pulse" />
        </div>
      )}
    </div>
  );
}