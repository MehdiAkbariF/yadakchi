
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
  const content = (
    <div className="flex flex-col items-center justify-center gap-3.5 select-none animate-in fade-in duration-200">
      {/* کانتینر مرکزی: آیکون جدید با حلقه چرخان ملایم */}
      <div className="relative flex items-center justify-center w-16 h-16">
        
        {/* ۱. حلقه چرخان مینیمال دور آیکون */}
        <div 
          className="absolute inset-0 rounded-full border-2 border-primary/15 border-t-primary animate-spin" 
          style={{ animationDuration: '0.9s' }} 
        />

        {/* ۲. آیکون لانچر جدید با افکت تنفس نامحسوس */}
        <div className="w-8 h-8 flex items-center justify-center transition-transform animate-pulse">
          <img
            src="/Ylogo.png"
            alt="Yadakchi"
            className="w-full h-full object-contain drop-shadow-xs"
          />
        </div>
      </div>

      {/* ۳. پیام لودینگ (اختیاری) */}
      {message ? (
        <span className="text-xs font-bold font-iran-yekan text-muted-foreground/80 tracking-tight">
          {message}
        </span>
      ) : (
        <span className="text-[11px] font-medium font-iran-yekan text-muted-foreground/60">
          در حال بارگذاری...
        </span>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullPage
          ? "fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm w-screen h-screen"
          : "w-full min-h-[300px]",
        className
      )}
    >
      {content}
    </div>
  );
}