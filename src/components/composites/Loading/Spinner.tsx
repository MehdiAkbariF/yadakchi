'use client';

import { cn } from '@/design-system/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

export function Spinner({
  size = 'md',
  className,
  fullScreen = false,
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-[3px]',
    lg: 'h-14 w-14 border-4',
  };

  const spinnerElement = (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div className={cn(
        "rounded-full border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin z-10",
        sizeClasses[size]
      )} />
      <div className={cn(
        "absolute rounded-full border-zinc-100 dark:border-zinc-800/80 pointer-events-none z-0",
        sizeClasses[size]
      )} />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-background/50 backdrop-blur-sm flex items-center justify-center">
        {spinnerElement}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center py-12">
      {spinnerElement}
    </div>
  );
}