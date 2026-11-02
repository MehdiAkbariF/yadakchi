'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/design-system/utils/cn';

interface ThreeDotsLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullPage?: boolean;
}

const DOT_SIZES = {
  sm: 'h-1 w-1',
  md: 'h-1.5 w-1.5',
  lg: 'h-2 w-2',
} as const;

const GAP_SIZES = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-2',
} as const;

export function ThreeDotsLoader({
  className,
  size = 'md',
  label,
  fullPage = false,
}: ThreeDotsLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // افکت خروج نرم مخصوص Next.js Suspense / loading.tsx
  useEffect(() => {
    if (!fullPage) return;

    const el = containerRef.current;

    return () => {
      // دقیقا در لحظه‌ای که Next.js لودینگ را حذف می‌کند:
      if (el) {
        const clone = el.cloneNode(true) as HTMLDivElement;
        clone.style.pointerEvents = 'none'; // کاربر بتواند فورا با صفحه جدید کار کند
        clone.style.transition = 'opacity 350ms cubic-bezier(0.4, 0, 0.2, 1)';
        clone.style.opacity = '1';
        document.body.appendChild(clone);

        // اجبار به اعمال استایل اولیه (Reflow)
        void clone.offsetHeight;

        // اجرای انیمیشن خروج نرم
        clone.style.opacity = '0';

        // پاکسازی کامل از DOM بعد از پایان انیمیشن
        setTimeout(() => {
          clone.remove();
        }, 350);
      }
    };
  }, [fullPage]);

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2.5 select-none',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label || 'در حال بارگذاری'}
    >
      <div className={cn('flex items-center', GAP_SIZES[size])}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              'rounded-full bg-muted-foreground/50',
              DOT_SIZES[size],
              'animate-[dotFade_1.2s_ease-in-out_infinite]'
            )}
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
      {label && (
        <span className="text-3xs font-medium text-muted-foreground/70">{label}</span>
      )}
    </div>
  );

  if (!fullPage) return content;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
    >
      {content}
    </div>
  );
}