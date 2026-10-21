'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { BottomSheet } from '@/components/composites/BottomSheet';

export const SORT_OPTIONS = [
  { value: 'Selected', label: 'منتخب' },
  { value: 'MostVisited', label: 'پربازدیدترین' },
  { value: 'Newest', label: 'جدیدترین' },
  { value: 'BestSelling', label: 'پرفروش‌ترین' },
  { value: 'Cheapest', label: 'ارزان‌ترین' },
  { value: 'MostExpensive', label: 'گران‌ترین' },
] as const;

export type SortValue = typeof SORT_OPTIONS[number]['value'];

export interface SortSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  variant?: 'default' | 'trigger';
}

export function SortSelector({
  value,
  onChange,
  className,
  label = 'مرتب‌سازی بر اساس:',
  variant = 'default',
}: SortSelectorProps) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeValue = SORT_OPTIONS.some((opt) => opt.value === value) ? value : 'Selected';
  const activeOptionLabel = SORT_OPTIONS.find((opt) => opt.value === activeValue)?.label ?? 'منتخب';

  return (
    <div className={cn(variant === 'trigger' ? 'flex-1 min-w-0' : 'w-full')}>
      <div className={cn('hidden md:flex w-full items-center gap-3.5 rounded-lg bg-muted p-2 select-none', className)}>
        <div className="flex shrink-0 items-center gap-2 ps-2 text-muted-foreground">
          <ArrowUpDown aria-hidden="true" className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">{label}</span>
        </div>

        <div className="relative flex items-center gap-1.5">
          {SORT_OPTIONS.map((opt) => {
            const isActive = activeValue === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={cn(
                  'relative shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isActive && isMounted ? (
                  <motion.span
                    layoutId="activeSortPill"
                    className="absolute inset-0 rounded-full bg-card shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-10">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="block w-full md:hidden">
        {variant === 'trigger' ? (
          <button
            type="button"
            onClick={() => setIsMobileSheetOpen(true)}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{activeOptionLabel}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsMobileSheetOpen(true)}
            className="flex h-11 w-full items-center justify-between rounded-lg bg-muted px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center gap-2">
              <ArrowUpDown aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">مرتب‌سازی:</span>
              <span className="font-bold text-primary">{activeOptionLabel}</span>
            </div>
            <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        )}

        <BottomSheet
          isOpen={isMobileSheetOpen}
          onClose={() => setIsMobileSheetOpen(false)}
          title="مرتب‌سازی بر اساس"
        >
          <div className="flex w-full flex-col divide-y divide-border text-start">
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
                    'flex w-full items-center justify-between py-4 text-sm font-semibold transition-colors',
                    isActive ? 'text-primary' : 'text-foreground'
                  )}
                >
                  <span>{opt.label}</span>
                  {isActive ? <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" /> : null}
                </button>
              );
            })}
          </div>
        </BottomSheet>
      </div>
    </div>
  );
}
