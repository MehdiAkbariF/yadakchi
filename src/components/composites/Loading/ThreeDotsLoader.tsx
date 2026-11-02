'use client';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      {content}
    </div>
  );
}