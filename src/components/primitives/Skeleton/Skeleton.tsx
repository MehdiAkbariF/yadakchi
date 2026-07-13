import { cn } from '@/design-system/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text';
}

const variantClasses = {
  circle: 'rounded-full',
  rect: 'rounded-xl',
  text: 'rounded h-4 w-full'
};

export function Skeleton({ className, variant = 'rect', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-zinc-200 dark:bg-zinc-800',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}