// c:\Users\Raven\final-projects\yadakchi-front\yadakchi\src\components\features\ProductGrid\SearchHeader.tsx
'use client';

import { cn } from '@/design-system/utils/cn';
import { Typography } from '@/components/primitives/Typography';
import { SlidersHorizontal } from 'lucide-react';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';
import { useAppStore } from '@/shared/store/useAppStore';
import { SortSelector } from '@/components/composites/SortSelector/SortSelector';

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

  const formatNumber = (val: number) => new Intl.NumberFormat('fa-IR').format(val);

  if (isMobileSticky) {
    return (
      <div
        style={{
          top: isHeaderMinimized ? '56px' : '122px',
        }}
        dir="rtl"
        className="sticky z-sticky mt-3 flex w-full select-none items-center justify-between gap-3 border-b border-border bg-card px-4 py-2.5 transition-all duration-normal md:hidden shadow-xs"
      >
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="flex h-9 flex-1 select-none items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-xs transition-colors hover:border-primary/40 hover:bg-muted/60 outline-none"
        >
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate whitespace-nowrap">فیلترها</span>
        </button>

        {/* دکمه تریگر متصل به باتم‌شیت در هدر چسبان سرچ */}
        <SortSelector
          value={currentSort}
          onChange={onSortChange}
          variant="trigger"
        />

        <span className="flex h-9 shrink-0 select-none items-center justify-center rounded-md bg-muted px-2.5 py-1.5 text-2xs font-bold text-muted-foreground">
          {formatNumber(totalCount)} کالا
        </span>
      </div>
    );
  }

  return (
    <div className="flex w-full select-none flex-col gap-4 pb-2" dir="rtl">
      <div className="flex w-full items-center justify-between md:border-b md:border-border md:pb-3">
        <Typography variant="h3" className="font-extrabold text-foreground">
          {searchTitle ? `نتایج جستجو برای «${searchTitle}»` : 'لیست قطعات یدکی'}
        </Typography>
        <span className="hidden rounded-md bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground md:inline-block">
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