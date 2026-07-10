// src/components/sections/Header/components/MobileHeader/MobileHeader.tsx

'use client';

import { cn } from '@/design-system/utils/cn';
import { Logo } from '../Logo/Logo';
import { SellerButton } from '../SellerButton/SellerButton';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { SearchBar } from '../SearchBar/SearchBar';

interface MobileHeaderProps {
  className?: string;
  onSearch?: (query: string) => void;
}

export function MobileHeader({ className, onSearch }: MobileHeaderProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* ردیف اول: لوگو + دکمه‌ها */}
      <div className="flex items-start justify-between w-full">
        <Logo hideTitle className="shrink-0" />
        <div className="flex items-center gap-2 shrink-0 mt-1">
          <SellerButton size="sm" />
          <ThemeToggle />
        </div>
      </div>

      {/* ردیف دوم: جستجو (نسخه موبایل - بدون نتایج) */}
      <div className="mt-1.5 w-full">
        <SearchBar 
          placeholder="جستجو در"
          onSearch={onSearch}
          className="border border-input rounded-md px-3 py-1.5 bg-background"
          isMobile={true}
        />
      </div>
    </div>
  );
}