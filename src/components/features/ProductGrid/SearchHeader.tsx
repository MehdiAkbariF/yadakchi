'use client';

import { cn } from '@/design-system/utils/cn';
import { Typography } from '@/components/primitives/Typography';
import { SlidersHorizontal } from 'lucide-react';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';
import { useAppStore } from '@/shared/store/useAppStore';
import { SortSelector } from '@/components/composites/SortSelector/SortSelector'; // وارد کردن کامپوننت مرتب‌سازی جدید

interface SearchHeaderProps {
  totalCount: number;
  currentSort: string;
  onSortChange: (sort: string) => void;
  filters: SearchProductsRequest;
  onOpenMobileFilters?: () => void;
  onOpenMobileSort?: () => void;
  searchTitle?: string;
  isMobileSticky?: boolean;
}

export function SearchHeader({
  totalCount,
  currentSort,
  onSortChange,
  filters,
  onOpenMobileFilters,
  searchTitle,
  isMobileSticky = false,
}: SearchHeaderProps) {
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);

  const activeChips = () => {
    const chips: { name: string; label: string; value?: any }[] = [];

    if (filters.isProductInStock) {
      chips.push({ name: 'inStock', label: 'فقط کالاهای موجود' });
    }
    if (filters.isSellerInUserCity) {
      chips.push({ name: 'userCity', label: 'فروشنده‌های شهر من' });
    }
    if (filters.hasDiscount) {
      chips.push({ name: 'discount', label: 'دارای تخفیف' });
    }
    if (filters.fromPrice) {
      chips.push({ name: 'fromPrice', label: `از ${new Intl.NumberFormat('fa-IR').format(filters.fromPrice / 10)} تومان` });
    }
    if (filters.toPrice) {
      chips.push({ name: 'toPrice', label: `تا ${new Intl.NumberFormat('fa-IR').format(filters.toPrice / 10)} تومان` });
    }
    if (filters.brandIds) {
      filters.brandIds.forEach(id => {
        chips.push({ name: 'brandIds', label: 'برند خاص', value: id });
      });
    }
    if (filters.carIds) {
      filters.carIds.forEach(id => {
        chips.push({ name: 'carIds', label: 'خودرو خاص', value: id });
      });
    }

    return chips;
  };

  const chipsList = activeChips();
  const formatNumber = (val: number) => new Intl.NumberFormat('fa-IR').format(val);

  if (isMobileSticky) {
    return (
      <div 
        style={{
          top: isHeaderMinimized ? '56px' : '122px'
        }}
        className="md:hidden sticky z-40 bg-background border-b py-2.5 px-4 w-full flex items-center justify-between  select-none gap-3 transition-all duration-300 mt-5"
      >
        <button
          onClick={onOpenMobileFilters}
          className="flex items-center justify-center gap-1.5 border rounded-xl py-2 px-3 bg-background hover:bg-muted text-xs font-bold font-iran-sans text-foreground flex-1 h-9 shadow-sm select-none outline-none"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate whitespace-nowrap">فیلترها</span>
        </button>
        
        {/* دکمه تریگر متصل به باتم‌شیت در هدر چسبان سرچ */}
        <SortSelector
          value={currentSort}
          onChange={onSortChange}
          variant="trigger"
        />

        <span className="text-[10px] font-bold font-iran-sans text-muted-foreground bg-muted px-2.5 py-2 rounded-xl shrink-0 h-9 flex items-center justify-center select-none">
          {formatNumber(totalCount)} کالا
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 pb-2 select-none">
      <div className="flex items-center justify-between w-full md:border-b md:pb-3">
        <Typography variant="h3" className="font-iran-yekan font-extrabold text-foreground">
          {searchTitle ? `نتایج جستجو برای «${searchTitle}»` : 'لیست قطعات یدکی'}
        </Typography>
        <span className="hidden md:inline-block text-xs font-bold font-iran-sans text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
          {formatNumber(totalCount)} کالا
        </span>
      </div>

      {/* نمایش انیمیشنی کپسول‌ها در دسکتاپ */}
      <div className="hidden md:block">
        <SortSelector
          value={currentSort}
          onChange={onSortChange}
        />
      </div>
    </div>
  );
}