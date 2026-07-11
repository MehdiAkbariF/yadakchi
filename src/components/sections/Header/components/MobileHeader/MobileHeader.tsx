// src/components/sections/Header/components/MobileHeader/MobileHeader.tsx

'use client';

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
  return (
    <div className={cn("w-full flex flex-col", className)}>
      {/* ردیف اول: لوگو + کنترل‌ها */}
      <div className="flex items-center justify-between w-full h-10">
        <Logo hideTitle className="shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          <SellerButton size="sm" />
          <ThemeToggle />
        </div>
      </div>

      {/* ردیف دوم و سوم: بخش جستجو و انتخاب شهر با ترنزیشن روان CSS Grid */}
      <div className={cn(
        "grid transition-all duration-300 ease-in-out",
        isScrolled 
          ? "grid-rows-[0fr] opacity-0 pointer-events-none" 
          : "grid-rows-[1fr] opacity-100"
      )}>
        <div className="overflow-hidden">
          <div className="pt-2 pb-1 flex flex-col">
            {/* سرچ بار بومی موبایل */}
            <SearchBar 
              placeholder="جستجو در"
              onSearch={onSearch}
              className=" rounded-md px-3 py-1.5 bg-background w-full"
              isMobile={true}
            />
            
            {/* انتخاب شهر شیک، فلت، راست‌تراز و مجهز به ChevronLeft به صورت یک پاراگراف کاملاً هماهنگ */}
            <div className="border-t pt-1.5 mt-2.5">
              <CitySelector variant="mobile" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}