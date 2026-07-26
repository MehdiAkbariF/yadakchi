'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { BottomSheet } from '@/components/composites/BottomSheet/BottomSheet';

export const SORT_OPTIONS = [
  { value: 'Selected', label: 'منتخب' },
  { value: 'MostVisited', label: 'پربازدیدترین' },
  { value: 'Newest', label: 'جدیدترین' },
  { value: 'BestSelling', label: 'پرفروش‌ترین' },
  { value: 'Cheapest', label: 'ارزان‌ترین' },
  { value: 'MostExpensive', label: 'گران‌ترین' },
] as const;

export type SortValue = typeof SORT_OPTIONS[number]['value'];

interface SortSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  variant?: 'default' | 'trigger'; // پروپ جدید برای کنترل حالت نمایش موبایل
}

export function SortSelector({
  value,
  onChange,
  className,
  label = 'مرتب‌سازی بر اساس:',
  variant = 'default',
}: SortSelectorProps) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeValue = SORT_OPTIONS.some(opt => opt.value === value) ? value : 'Selected';
  const activeOptionLabel = SORT_OPTIONS.find(opt => opt.value === activeValue)?.label || 'منتخب';

  return (
    <div className={cn(variant === 'trigger' ? "flex-1 min-w-0" : "w-full")} dir="rtl">
      
      {/* ۱. نمایش اختصاصی دسکتاپ (تب‌های کپسولی افقی بر روی بستر خاکستری) */}
      <div 
        className={cn(
          "hidden md:flex w-full items-center gap-3.5 bg-secondary rounded-2xl p-2 select-none text-right",
          className
        )}
      >
        <div className="flex items-center gap-2 text-muted-foreground shrink-0 select-none mr-2">
          <ArrowUpDown className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold font-iran-sans">{label}</span>
        </div>

        <div className="flex items-center gap-1.5 relative">
          {SORT_OPTIONS.map((opt) => {
            const isActive = activeValue === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={cn(
                  "relative px-4 py-1.5 rounded-full text-xs font-bold font-iran-sans transition-colors select-none whitespace-nowrap outline-none shrink-0 border-0",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && isMounted && (
                  <motion.div
                    layoutId="activeSortPill"
                    className="absolute inset-0 bg-background rounded-full shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ۲. نمایش اختصاصی موبایل بر اساس نوع پروپ ورودی */}
      <div className="block md:hidden w-full">
        {variant === 'trigger' ? (
          /* حالت تریگر دکمه‌ای جهت قرارگیری در هدر چسبان در کنار دکمه فیلترها */
          <button
            type="button"
            onClick={() => setIsMobileSheetOpen(true)}
            className="w-full h-9 flex items-center justify-center gap-1.5 border rounded-xl py-2 px-3
             bg-background hover:bg-muted text-xs font-bold font-iran-sans text-foreground
              select-none outline-none"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{activeOptionLabel}</span>
          </button>
        ) : (
          /* حالت دکمه عریض خاکستری توکار */
          <button
            type="button"
            onClick={() => setIsMobileSheetOpen(true)}
            className="w-full h-11 flex items-center justify-between bg-secondary rounded-2xl px-4 py-3 text-xs font-bold font-iran-sans text-foreground shadow-sm select-none outline-none border-0"
          >
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">مرتب‌سازی:</span>
              <span className="text-primary font-black">{activeOptionLabel}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        )}

        {/* باتم‌شیت خودگردان برای انتخاب گزینه‌ها */}
        <BottomSheet
          isOpen={isMobileSheetOpen}
          onClose={() => setIsMobileSheetOpen(false)}
          title="مرتب‌سازی بر اساس"
        >
          <div className="flex flex-col w-full text-right divide-y dark:divide-zinc-800">
            {SORT_OPTIONS.map((opt) => {
              const isActive = activeValue === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsMobileSheetOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between w-full py-4 text-sm font-bold font-iran-sans transition-colors border-0 bg-transparent outline-none",
                    isActive ? "text-primary" : "text-foreground"
                  )}
                >
                  <span>{opt.label}</span>
                  {isActive && <Check className="h-4.5 w-4.5 text-primary stroke-[3] shrink-0" />}
                </button>
              );
            })}
          </div>
        </BottomSheet>
      </div>

    </div>
  );
}