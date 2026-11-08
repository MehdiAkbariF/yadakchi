// src/components/primitives/OtpInput/OtpInput.tsx
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';

export interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

// تبدیل خودکار ارقام فارسی/عربی به انگلیسی
const normalizeDigits = (str: string): string => {
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
};

export const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(
  (
    {
      length = 5,
      value,
      onChange,
      className,
      disabled = false,
      'aria-label': ariaLabel = 'کد یکبار مصرف',
    },
    ref
  ) => {
    const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
    const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);

    // تغییر مقدار یک رقم
    const handleChange = (index: number, rawInput: string) => {
      const normalized = normalizeDigits(rawInput);
      const digit = normalized.slice(-1); // فقط آخرین کاراکتر وارد شده

      if (digit && !/^[0-9]$/.test(digit)) return;

      const updated = [...value];
      updated[index] = digit;
      onChange(updated);

      // انتقال فوکوس خودکار به خانه بعدی
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    // مدیریت کلید‌های هدایتی و Backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (!value[index] && index > 0) {
          const updated = [...value];
          updated[index - 1] = '';
          onChange(updated);
          inputRefs.current[index - 1]?.focus();
        } else {
          const updated = [...value];
          updated[index] = '';
          onChange(updated);
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    };

    // پشتیبانی هوشمند از Paste کردن کد کامل پیامک
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = normalizeDigits(e.clipboardData.getData('text')).replace(/\D/g, '').slice(0, length);
      if (!pasted) return;

      const updated = Array.from({ length }, (_, i) => pasted[i] || '');
      onChange(updated);

      const targetIndex = Math.min(pasted.length, length - 1);
      inputRefs.current[targetIndex]?.focus();
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        className={cn('flex items-center justify-center gap-2.5 sm:gap-3.5 select-none', className)}
        dir="ltr"
      >
        {Array.from({ length }).map((_, index) => {
          const digit = value[index] ?? '';
          const isFocused = focusedIndex === index && !disabled;
          const hasValue = Boolean(digit);

          return (
            <motion.div
              key={index}
              animate={{
                scale: isFocused ? 1.05 : 1,
                borderColor: isFocused
                  ? 'hsl(var(--primary))'
                  : hasValue
                  ? 'hsl(var(--foreground) / 0.35)'
                  : 'hsl(var(--border))',
                backgroundColor: isFocused
                  ? 'hsl(var(--card))'
                  : hasValue
                  ? 'hsl(var(--card))'
                  : 'hsl(var(--muted) / 0.35)',
                boxShadow: isFocused
                  ? '0 0 0 3px hsl(var(--primary) / 0.18), var(--shadow-sm)'
                  : 'var(--shadow-xs)',
              }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              onClick={() => inputRefs.current[index]?.focus()}
              className={cn(
                'relative flex h-12 w-12 sm:h-14 sm:w-14 cursor-text items-center justify-center rounded-xl border-2 transition-colors overflow-hidden',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* رقم متحرک و مورف‌شونده با AnimatePresence */}
              <AnimatePresence mode="popLayout" initial={false}>
                {digit ? (
                  <motion.span
                    key={`digit-${digit}`}
                    initial={{ scale: 0.3, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.4, opacity: 0, y: -10 }}
                    transition={{
                      type: 'spring',
                      stiffness: 550,
                      damping: 24,
                    }}
                    className="text-xl sm:text-2xl font-black text-foreground tabular-nums select-none"
                  >
                    {digit}
                  </motion.span>
                ) : isFocused ? (
                  /* کرسر چشمک‌زن نرم در باکس فوکوس‌شده */
                  <motion.span
                    key="caret"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      ease: 'easeInOut',
                    }}
                    className="h-6 w-0.5 rounded-full bg-primary"
                  />
                ) : null}
              </AnimatePresence>

              {/* اینپوت مخفی و دسترس‌پذیر برای هندل کیبورد و تاچ موبایل */}
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="tel"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                disabled={disabled}
                value={digit}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                aria-label={`رقم ${index + 1}`}
                className="absolute inset-0 h-full w-full cursor-text opacity-0"
              />
            </motion.div>
          );
        })}
      </div>
    );
  }
);

OtpInput.displayName = 'OtpInput';