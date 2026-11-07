// src/components/features/ProductGrid/SearchHeader.tsx
'use client';

import * as React from 'react';
import { Typography } from '@/components/primitives/Typography';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';
import { SortSelector } from '@/components/composites/SortSelector/SortSelector';

interface SearchHeaderProps {
  totalCount: number;
  currentSort: string;
  onSortChange: (sort: string) => void;
  filters: SearchProductsRequest;
  onOpenMobileFilters?: () => void;
  onOpenMobileSort?: () => void;
  onRemoveFilter?: (name: string, value?: any) => void;
  onClearAll?: () => void;
  searchTitle?: string;
  isMobileSticky?: boolean;
}

export function SearchHeader({
  totalCount,
  currentSort,
  onSortChange,
  filters,
  onOpenMobileFilters,
  onRemoveFilter,
  onClearAll,
  searchTitle,
  isMobileSticky = false,
}: SearchHeaderProps) {
  const formatNumber = (val: number) => new Intl.NumberFormat('fa-IR').format(val);

  // استخراج چیپ‌های فیلتر فعال جهت نمایش در بالای صفحه با قابلیت حذف تک‌تک
  const activeChips = React.useMemo(() => {
    const chips: Array<{ id: string; name: string; label: string; value?: any }> = [];

    // ۱. موجودی کالا
    if (filters.onlyInStock || filters.isProductInStock) {
      chips.push({ id: 'inStock', name: 'inStock', label: 'فقط کالاهای موجود' });
    }

    // ۲. تخفیف ویژه
    if (filters.onlyDiscounted || filters.hasDiscount) {
      chips.push({ id: 'discount', name: 'discount', label: 'دارای تخفیف ویژه' });
    }

    // ۳. ارسال مستقیم از فروشنده
    if (filters.onlyDirectShipping) {
      chips.push({ id: 'directShipping', name: 'directShipping', label: 'ارسال مستقیم' });
    }

    // ۴. کالاهای برگزیده
    if (filters.onlyNominated) {
      chips.push({ id: 'nominated', name: 'nominated', label: 'کالاهای برگزیده' });
    }

    // ۵. نوع قطعه (نو، استوک، زیرصفری)
    if (filters.types && filters.types.length > 0) {
      const typeLabels: Record<string, string> = { New: 'نو', Stock: 'استوک', TakeOff: 'زیرصفری' };
      filters.types.forEach((t: any) => {
        const label = typeLabels[String(t)] || (t === 1 ? 'نو' : t === 2 ? 'استوک' : t === 3 ? 'زیرصفری' : String(t));
        chips.push({ id: `type-${t}`, name: 'types', label: `نوع: ${label}`, value: t });
      });
    }

    // ۶. محدوده قیمت
    if (filters.fromPrice || filters.toPrice) {
      const from = filters.fromPrice ? Math.round(filters.fromPrice / 10) : 0;
      const to = filters.toPrice ? Math.round(filters.toPrice / 10) : 0;
      chips.push({
        id: 'price',
        name: 'fromPrice',
        label: `قیمت: ${formatNumber(from)} تا ${formatNumber(to)} تومان`,
      });
    }

    return chips;
  }, [filters]);

  // نسخه چسبان موبایل (کاملاً چسبیده به هدر اصلی با top-14)
  if (isMobileSticky) {
    return (
      <div
        dir="rtl"
        className="sticky top-14 z-30 -mx-4 -mt-4 mb-1 flex w-[calc(100%+2rem)] select-none items-center justify-between gap-2.5 border-b border-border/80 bg-card/95 px-4 py-2.5 shadow-xs backdrop-blur-md md:hidden"
      >
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="flex h-9 flex-1 select-none items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-bold shadow-xs hover:border-primary/40 active:scale-95"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>فیلترها</span>
        </button>

        <SortSelector
          value={currentSort}
          onChange={onSortChange}
          variant="trigger"
        />

        <span className="flex h-9 shrink-0 select-none items-center justify-center rounded-xl bg-muted px-2.5 text-2xs font-bold text-muted-foreground">
          {formatNumber(totalCount)} کالا
        </span>
      </div>
    );
  }

  // نسخه کامل دسکتاپ
  return (
    <div className="flex w-full select-none flex-col gap-3 pb-1" dir="rtl">
      <div className="flex w-full items-center justify-between md:border-b md:border-border md:pb-3">
        <Typography variant="h3" className="text-base sm:text-lg md:text-xl font-bold text-foreground">
          {searchTitle ? `نتایج جستجو برای «${searchTitle}»` : 'لیست قطعات یدکی خودرو'}
        </Typography>
        <span className="hidden rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground md:inline-block">
          {formatNumber(totalCount)} کالا
        </span>
      </div>

      {/* مرتب‌سازی کپسولی در دسکتاپ */}
      <div className="hidden md:block">
        <SortSelector
          value={currentSort}
          onChange={onSortChange}
        />
      </div>

      {/* چیپ‌های فیلترهای فعال (Active Filter Chips) */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 animate-in fade-in duration-200">
          <span className="text-2xs font-bold text-muted-foreground ml-1">فیلترهای فعال:</span>

          {activeChips.map((chip) => (
            <div
              key={chip.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-2xs font-semibold text-primary shadow-xs"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={() => {
                  if (chip.name === 'fromPrice') {
                    onRemoveFilter?.('fromPrice');
                    onRemoveFilter?.('toPrice');
                  } else {
                    onRemoveFilter?.(chip.name, chip.value);
                  }
                }}
                className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-primary/20 transition-colors"
                aria-label={`حذف فیلتر ${chip.label}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}

          {activeChips.length > 1 && onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 text-2xs font-bold text-destructive hover:underline pr-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>حذف همه</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}