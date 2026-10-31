import * as React from 'react';
import { cn } from '@/design-system/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text';
}

const variantClasses = {
  rect: 'rounded-xl',
  circle: 'rounded-full',
  text: 'rounded-md h-4 w-full',
} as const;

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rect', ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        // انیمیشن شیمر طبیعی با کنتراست مشخص در تمام تم‌ها
        'relative overflow-hidden bg-muted/70',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-foreground/5 before:to-transparent',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
);

Skeleton.displayName = 'Skeleton';