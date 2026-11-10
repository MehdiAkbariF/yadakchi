// src/components/features/ProductGrid/MobileSearchHeader.tsx
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SortSelector } from '@/components/composites/SortSelector/SortSelector';
import { toPersianDigits } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';

export interface MobileSearchHeaderProps {
  /** آیکون یا تصویر شاخص در سمت راست */
  icon?: React.ReactNode;
  /** برچسب کوچک بالای عنوان */
  subtitle?: string;
  /** عنوان اصلی (مثلاً نام دسته، کلمه جستجو شده یا یدکچی آف) */
  title: string;
  /** بخش اکشن یا بج اختصاصی سمت چپ ردیف اول (اختیاری) */
  actionElement?: React.ReactNode;
  /** تعداد کل نتایج کالا */
  totalCount: number;
  /** نوع مرتب‌سازی فعلی */
  sortValue?: string;
  /** تابع تغییر مرتب‌سازی */
  onSortChange: (value: string) => void;
  /** تابع باز کردن دراور فیلترها */
  onOpenFilters: () => void;
  /** مقدار اسکرول اولیه قبل از مجاز بودن بسته شدن (پیش‌فرض: ۱۸۰ پیکسل) */
  minScrollY?: number;
  className?: string;
}

export function MobileSearchHeader({
  icon,
  subtitle,
  title,
  actionElement,
  totalCount,
  sortValue = 'Selected',
  onSortChange,
  onOpenFilters,
  minScrollY = 180,
  className,
}: MobileSearchHeaderProps) {
  const [isControlsVisible, setIsControlsVisible] = React.useState(true);
  const lastScrollYRef = React.useRef(0);
  const scrollRafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    let accumulatedDown = 0;
    let accumulatedUp = 0;

    const handleScroll = () => {
      if (scrollRafRef.current !== null) return;

      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        const currentY = window.scrollY;
        const diff = currentY - lastScrollYRef.current;

        if (currentY < minScrollY) {
          setIsControlsVisible(true);
          accumulatedDown = 0;
          accumulatedUp = 0;
        } else if (diff > 0) {
          accumulatedUp = 0;
          accumulatedDown += diff;
          if (accumulatedDown > 60) {
            setIsControlsVisible(false);
          }
        } else if (diff < 0) {
          accumulatedDown = 0;
          accumulatedUp += Math.abs(diff);
          if (accumulatedUp > 30) {
            setIsControlsVisible(true);
          }
        }

        lastScrollYRef.current = currentY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);
    };
  }, [minScrollY]);

  return (
    <div
      className={cn(
        'sticky top-14 z-30 -mx-4 -mt-2 flex w-[calc(100%+2rem)] shrink-0 select-none flex-col gap-1',
        'border-b border-border/80 bg-card/95 px-3 py-2 shadow-xs backdrop-blur-md transition-all duration-300 md:hidden',
        className
      )}
      dir="rtl"
    >
      {/* ردیف اول: عنوان، آیکون و اکشن‌های اختصاصی */}
      <div className="flex w-full items-center justify-between mt-1">
        <div className="flex min-w-0 items-center gap-2">
          {icon ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted/40 p-0.5">
              {icon}
            </div>
          ) : null}

          <div className="flex min-w-0 flex-col">
            {subtitle ? (
              <span className="text-[0.625rem] font-bold text-muted-foreground leading-none">
                {subtitle}
              </span>
            ) : null}
            <span className="mt-0.5 truncate text-xs font-bold text-foreground">
              {title}
            </span>
          </div>
        </div>

        {actionElement ? (
          <div className="flex shrink-0 items-center gap-1.5">{actionElement}</div>
        ) : null}
      </div>


      <AnimatePresence initial={false}>
        {isControlsVisible && (
          <motion.div
            key="mobile-search-controls"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex w-full items-center justify-between gap-2 border-t border-dashed border-border/60 pt-1 mt-1">
              <button
                type="button"
                onClick={onOpenFilters}
                className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-input bg-card px-2.5 text-2xs font-bold 
                shadow-2xs active:scale-95 transition-transform"
              >
                <span>فیلترها</span>
              </button>

              <SortSelector
                value={sortValue}
                onChange={onSortChange}
                variant="trigger"
              />

              <span className="flex h-8 shrink-0 items-center justify-center rounded-lg bg-muted px-2 text-3xs font-bold text-muted-foreground">
                {toPersianDigits(new Intl.NumberFormat('fa-IR').format(totalCount))} کالا
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}