'use client';

import { forwardRef } from 'react';
import { cn } from '@/design-system/utils/cn';

interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  error?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options = [], error, label, size = 'md', placeholder, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-right">
        {label && (
          <label className="text-xs md:text-sm font-medium leading-none text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              "flex w-full rounded-xl border bg-background px-3 py-2 text-xs md:text-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 outline-none appearance-none cursor-pointer",
              size === 'sm' && 'h-8',
              size === 'md' && 'h-11',
              size === 'lg' && 'h-12',
              error ? 'border-destructive' : 'border-zinc-200 dark:border-zinc-800',
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-9"/></svg>
          </div>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';