'use client';

import { cn } from '@/design-system/utils/cn';

interface PageLoadingProps {
  message?: string;
  fullPage?: boolean;
  className?: string;
}

export function PageLoading({
  message,
  fullPage = false,
  className,
}: PageLoadingProps) {
  const loaderCard = (
    <div className={cn(
      "w-36 h-36 flex flex-col items-center justify-center gap-4 animate-in zoom-in duration-200",
      message 
        ? "bg-transparent border-0 shadow-none" 
        : "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-xl"
    )}>
      <div className="relative w-20 h-10">
        <img
          src="/Logo.svg"
          alt="Yadakchi"
          className="w-full h-full object-contain block"
        />
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
      </div>
      {message && (
        <span className="text-[10px] font-bold font-iran-yekan text-muted-foreground animate-pulse mt-0.5">
          {message}
        </span>
      )}
    </div>
  );

  return (
    <div className={cn(
      "flex flex-col items-center justify-center select-none",
      fullPage ? "fixed inset-0 z-[100] bg-zinc-950/20 backdrop-blur-md w-screen h-screen" : "w-full min-h-[350px]",
      className
    )}>
      {loaderCard}
    </div>
  );
}