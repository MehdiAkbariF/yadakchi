'use client';

import { cn } from '@/design-system/utils/cn';
import { Typography } from '@/components/primitives/Typography';
import { X, SlidersHorizontal } from 'lucide-react';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';
import { motion } from 'framer-motion';

interface SearchHeaderProps {
  totalCount: number;
  currentSort: string;
  onSortChange: (sort: string) => void;
  filters: SearchProductsRequest;
  onRemoveFilter: (name: string, value?: any) => void;
  onClearAll: () => void;
  onOpenMobileFilters?: () => void;
  searchTitle?: string;
}

const SORT_OPTIONS = [
  { value: 'Selected', label: 'منتخب' },
  { value: 'MostVisited', label: 'پربازدیدترین' },
  { value: 'Newest', label: 'جدیدترین' },
  { value: 'BestSelling', label: 'پرفروش‌ترین' },
  { value: 'Cheapest', label: 'ارزان‌ترین' },
  { value: 'MostExpensive', label: 'گران‌ترین' },
];

export function SearchHeader({
  totalCount,
  currentSort,
  onSortChange,
  filters,
  onRemoveFilter,
  onClearAll,
  onOpenMobileFilters,
  searchTitle,
}: SearchHeaderProps) {
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

  return (
    <div className="w-full flex flex-col gap-4 border-b pb-4 select-none">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center justify-between md:justify-start gap-4">
          <Typography variant="h3" className="font-iran-yekan font-extrabold text-foreground">
            {searchTitle ? `نتایج جستجو برای «${searchTitle}»` : 'لیست قطعات یدکی'}
          </Typography>
          <span className="text-xs font-bold font-iran-yekan text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
            {formatNumber(totalCount)} کالا
          </span>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenMobileFilters}
            className="flex items-center justify-center gap-1.5 border rounded-xl px-4 py-2 bg-background hover:bg-muted text-xs font-bold font-iran-yekan text-foreground shadow-sm flex-1"
          >
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span>فیلترها</span>
          </button>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 border-t pt-3 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold font-iran-yekan text-muted-foreground whitespace-nowrap ml-2">
          مرتب‌سازی:
        </span>
        <div className="flex items-center gap-2 relative">
          {SORT_OPTIONS.map((opt) => {
            const isActive = currentSort === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onSortChange(opt.value)}
                className={cn(
                  "relative px-4 py-1.5 rounded-full text-xs font-bold font-iran-yekan transition-colors select-none whitespace-nowrap outline-none",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSearchSort"
                    className="absolute inset-0 bg-primary/10 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {SORT_OPTIONS.map((opt) => {
          const isActive = currentSort === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold font-iran-yekan transition-all select-none whitespace-nowrap border shrink-0",
                isActive 
                  ? "bg-primary border-primary text-white shadow-sm" 
                  : "bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {chipsList.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 animate-in fade-in duration-200">
          {chipsList.map((chip, idx) => (
            <div
              key={`${chip.name}-${idx}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 text-[10px] font-bold font-iran-yekan text-foreground border hover:border-primary/20 transition-all select-none"
            >
              <span>{chip.label}</span>
              <button
                onClick={() => onRemoveFilter(chip.name, chip.value)}
                className="p-0.5 hover:bg-muted-foreground/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="Remove Filter"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          ))}
          <button
            onClick={onClearAll}
            className="text-xs font-bold font-iran-yekan text-destructive hover:underline ml-2"
          >
            حذف فیلترها
          </button>
        </div>
      )}

    </div>
  );
}