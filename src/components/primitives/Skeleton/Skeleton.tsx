import * as React from 'react';
import { cn } from '@/design-system/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text';
}

const variantClasses = {
  rect: 'rounded-lg',
  circle: 'rounded-full',
  text: 'rounded h-4 w-full',
} as const;

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rect', ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-muted',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
);

Skeleton.displayName = 'Skeleton';