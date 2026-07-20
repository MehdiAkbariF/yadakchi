'use client';

import { forwardRef } from 'react';
import { cn } from '@/design-system/utils/cn';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, error, label, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-right">
        {label && (
          <label className="text-xs md:text-sm font-medium leading-none text-foreground">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            "flex w-full rounded-xl border bg-background px-3 py-2 text-xs md:text-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 outline-none resize-none",
            error ? 'border-destructive' : 'border-zinc-200 dark:border-zinc-800',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';