'use client';

import * as React from 'react';
import { cn } from '@/design-system/utils/cn';

export interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(
  ({ length = 5, value, onChange, className, disabled, 'aria-label': ariaLabel = 'کد یکبار مصرف' }, ref) => {
    const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

    const handleChange = (index: number, next: string) => {
      if (!/^[0-9]?$/.test(next)) return;
      const updated = [...value];
      updated[index] = next;
      onChange(updated);
      if (next && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        className={cn('flex items-center justify-center gap-3', className)}
        dir="ltr"
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={1}
            disabled={disabled}
            value={value[index] ?? ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            aria-label={`رقم ${index + 1}`}
            className={cn(
              'h-12 w-12 md:h-14 md:w-14',
              'text-center text-xl md:text-2xl font-bold',
              'rounded-md border border-input bg-card text-foreground',
              'transition-colors duration-fast ease-in-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          />
        ))}
      </div>
    );
  }
);

OtpInput.displayName = 'OtpInput';
