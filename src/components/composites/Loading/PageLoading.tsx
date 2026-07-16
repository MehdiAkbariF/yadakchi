'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

interface PageLoadingProps {
  message?: string;
  fullPage?: boolean;
  className?: string;
}

export function PageLoading({
  message = 'در حال بارگذاری اطلاعات...',
  fullPage = false,
  className,
}: PageLoadingProps) {
  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3.5 select-none text-center",
      fullPage ? "w-screen h-screen bg-background/80 backdrop-blur-sm" : "w-full min-h-[350px]",
      className
    )}>
      <div className="relative flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary shrink-0" />
        <div className="absolute h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
      </div>
      {message && (
        <span className="text-xs md:text-sm font-bold font-iran-sans text-muted-foreground animate-pulse">
          {message}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return <div className="fixed inset-0 z-[100] flex items-center justify-center">{content}</div>;
  }

  return content;
}