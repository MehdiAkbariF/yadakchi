'use client';

import { cn } from '@/design-system/utils/cn';
import { Typography } from '@/components/primitives/Typography';
import { X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';
import { useAppStore } from '@/shared/store/useAppStore';
import { motion } from 'framer-motion';

interface SearchHeaderProps {
  totalCount: number;
  currentSort: string;
  onSortChange: (sort: string) => void;
  filters: SearchProductsRequest;
  onRemoveFilter: (name: string, value?: any) => void;
  onClearAll: () => void;
  onOpenMobileFilters?: () => void;
  onOpenMobileSort?: () => void;
  searchTitle?: string;
  isMobileSticky?: boolean;
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
  onOpenMobileSort,
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
  const activeSortLabel = SORT_OPTIONS.find(o => o.value === currentSort)?.label || 'منتخب';

  if (isMobileSticky) {
    return (
      <div 
        style={{
          top: isHeaderMinimized ? '56px' : '174px'
        }}
        className="md:hidden sticky z-40 bg-background border-b py-2.5 px-4 -mx-4 w-[calc(100%+2rem)] flex items-center justify-between shadow-sm select-none gap-3 transition-all duration-300"
      >
        <button
          onClick={onOpenMobileFilters}
          className="flex items-center justify-center gap-1.5 border rounded-xl py-2 px-3 bg-background hover:bg-muted text-xs font-bold font-iran-sans text-foreground flex-1 shadow-sm"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>فیلترها</span>
        </button>
        <button
          onClick={onOpenMobileSort}
          className="flex items-center justify-center gap-1.5 border rounded-xl py-2 px-3
           bg-background hover:bg-muted text-xs font-bold font-iran-sans text-foreground 
           flex-1 shadow-sm"
        >
          <ArrowUpDown className="h-4 w-4 text-primary" />
          <span>مرتب‌سازی: {activeSortLabel}</span>
        </button>
        <span className="text-[10px] font-bold font-iran-sans text-muted-foreground 
        bg-muted px-2.5 py-2 rounded-xl shrink-0">
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

      <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-xs font-bold font-iran-sans text-muted-foreground whitespace-nowrap ml-2">
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
                  "relative px-4 py-1.5 rounded-full text-xs font-bold font-iran-sans transition-colors select-none whitespace-nowrap outline-none",
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

      {chipsList.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 animate-in fade-in duration-200">
          {chipsList.map((chip, idx) => (
            <div
              key={`${chip.name}-${idx}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 text-[10px] font-bold font-iran-sans text-foreground border hover:border-primary/20 transition-all select-none"
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
            className="text-xs font-bold font-iran-sans text-destructive hover:underline ml-2"
          >
            حذف فیلترها
          </button>
        </div>
      )}
    </div>
  );
}