'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ImageOff,
  Ticket,
} from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';

export interface ProductGalleryProps {
  images: any[];
  title: string;
  hasDiscount?: boolean;
  discountPercent?: number;
  hasTimedDiscount?: boolean;
  discountExpiration?: string | null;
}

function useCountdown(expiration?: string | null) {
  const [remain, setRemain] = React.useState<{ h: number; m: number; s: number } | null>(null);

  React.useEffect(() => {
    if (!expiration) {
      setRemain(null);
      return;
    }
    const calc = () => {
      const diff = +new Date(expiration) - Date.now();
      if (diff <= 0) {
        setRemain({ h: 0, m: 0, s: 0 });
        return;
      }
      setRemain({
        h: Math.floor(diff / (1000 * 60 * 60)),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [expiration]);

  return remain;
}

export function ProductGallery({
  images = [],
  title,
  hasDiscount,
  discountPercent,
  hasTimedDiscount,
  discountExpiration,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = React.useState(false);
  const [zoomScale, setZoomScale] = React.useState(1);
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = React.useState(false);

  const countdown = useCountdown(hasTimedDiscount ? discountExpiration : null);

  const validImages = React.useMemo(() => (images || []).filter(Boolean), [images]);
  const safeIndex = activeIndex < validImages.length ? activeIndex : 0;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // مدیریت قفل اسکرول و کلیدهای کیبورد
  React.useEffect(() => {
    if (!isFullscreenOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreenOpen(false);
      if (e.key === 'ArrowRight' && validImages.length > 1) {
        handleNext();
      }
      if (e.key === 'ArrowLeft' && validImages.length > 1) {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreenOpen, validImages.length]);

  // جهت درگ و ناوبری هماهنگ با ژست طبیعی
  const handleNext = () => {
    if (validImages.length <= 1) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % validImages.length);
  };

  const handlePrev = () => {
    if (validImages.length <= 1) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 1, 4));
  const handleZoomOut = () =>
    setZoomScale((prev) => {
      const next = Math.max(prev - 1, 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // دابل‌تپ در موبایل برای زوم
  const lastTapRef = React.useRef<number>(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (zoomScale > 1) {
        handleResetZoom();
      } else {
        setZoomScale(2.5);
      }
    }
    lastTapRef.current = now;
  };

  const resolveImageUrl = (item: any): string => {
    if (!item) return '';
    const rawPath = typeof item === 'string' ? item : item.url || item.image || '';
    if (!rawPath) return '';
    if (rawPath.startsWith('http')) return rawPath;
    try {
      return getFullUrl(rawPath);
    } catch {
      const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
      return `https://api.yadakchi.local${cleanPath}`;
    }
  };

  const currentImageUrl = resolveImageUrl(validImages[safeIndex]);

  if (validImages.length === 0 || !currentImageUrl) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-card p-6 text-muted-foreground shadow-xs">
        <ImageOff aria-hidden="true" className="h-12 w-12 opacity-30" />
        <span className="text-xs font-bold">تصویری برای این کالا ثبت نشده است</span>
      </div>
    );
  }

  // محتوای مدال تمام صفحه که با پورتال به بدنه صفحه وصل می‌شود
  const fullscreenModalContent = (
    <AnimatePresence>
      {isFullscreenOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999999] flex h-[100dvh] w-screen flex-col bg-background/98 sm:bg-black/95 backdrop-blur-xl select-none"
          dir="rtl"
        >
          {/* هدر مدال تمام‌صفحه */}
          <div className="flex shrink-0 items-center justify-between border-b border-border/80 sm:border-white/10 bg-muted/40 sm:bg-black/60 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate text-xs sm:text-sm font-bold text-foreground sm:text-white max-w-[220px] sm:max-w-xl">
                {title}
              </span>
              <span className="rounded-md bg-muted sm:bg-white/15 px-2 py-1 text-3xs font-bold text-foreground sm:text-white">
                {toPersianDigits(safeIndex + 1)} از {toPersianDigits(validImages.length)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                handleResetZoom();
                setIsFullscreenOpen(false);
              }}
              aria-label="بستن گالری"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted sm:bg-white/10 text-foreground sm:text-white hover:bg-destructive hover:text-white transition-colors"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          {/* بدنه نمایش عکس */}
          <div
            className="relative min-h-0 w-full flex-1 overflow-hidden flex items-center justify-center p-2 sm:p-6"
            onClick={handleDoubleTap}
          >
            <div className="relative flex h-full w-full max-w-5xl items-center justify-center touch-none">
              <motion.img
                src={currentImageUrl}
                alt=""
                drag={zoomScale > 1}
                dragConstraints={zoomScale > 1 ? false : { left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (zoomScale === 1) {
                    // جهت طبیعی درگ اصلاح شد
                    if (info.offset.x > 40) handleNext();
                    else if (info.offset.x < -40) handlePrev();
                  }
                }}
                animate={{
                  scale: zoomScale,
                  x: zoomScale > 1 ? panOffset.x : 0,
                  y: zoomScale > 1 ? panOffset.y : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onUpdate={(latest: any) => {
                  if (zoomScale > 1) setPanOffset({ x: latest.x || 0, y: latest.y || 0 });
                }}
                className="max-h-full max-w-full select-none object-contain cursor-grab active:cursor-grabbing"
              />
            </div>

            {/* دکمه‌های چپ و راست در مدال */}
            {validImages.length > 1 && zoomScale === 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="عکس قبلی"
                  className="absolute start-3 sm:start-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-border sm:border-white/20 bg-card/80 sm:bg-white/10 text-foreground sm:text-white shadow-md backdrop-blur-md outline-none transition-colors hover:bg-primary hover:text-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="عکس بعدی"
                  className="absolute end-3 sm:end-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-border sm:border-white/20 bg-card/80 sm:bg-white/10 text-foreground sm:text-white shadow-md backdrop-blur-md outline-none transition-colors hover:bg-primary hover:text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* فوتر زوم */}
          <div className="flex shrink-0 items-center justify-center gap-3 border-t border-border/80 sm:border-white/10 bg-muted/40 sm:bg-black/60 p-3 sm:p-4">
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomScale >= 4}
              aria-label="بزرگ‌نمایی"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border sm:border-white/15 bg-card sm:bg-white/10 text-foreground sm:text-white transition-colors hover:bg-primary hover:text-white disabled:opacity-30 shadow-xs"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomScale === 1}
              aria-label="کوچک‌نمایی"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border sm:border-white/15 bg-card sm:bg-white/10 text-foreground sm:text-white transition-colors hover:bg-primary hover:text-white disabled:opacity-30 shadow-xs"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              disabled={zoomScale === 1 && panOffset.x === 0 && panOffset.y === 0}
              aria-label="اندازه واقعی"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border sm:border-white/15 bg-card sm:bg-white/10 text-foreground sm:text-white transition-colors hover:bg-primary hover:text-white disabled:opacity-30 shadow-xs"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex w-full select-none flex-col gap-4" dir="rtl">
      {/* ================= تصویر اصلی محصول (کامل در ستون اختصاصی و بدون فاصله اضافی) ================= */}
      <div className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        {/* بنر تخفیف و تایمر */}
        {hasTimedDiscount ? (
          <div className="absolute end-3 top-3 z-10 flex items-center gap-2 rounded-xl bg-destructive px-3 py-1 text-2xs font-bold text-destructive-foreground shadow-xs">
            <Ticket aria-hidden="true" className="h-4 w-4" />
            <span>تخفیف {toPersianDigits(discountPercent || 0)}٪</span>
            {countdown && (
              <span className="rounded-md bg-white/20 px-2 py-1 text-3xs font-bold" dir="ltr">
                {String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:
                {String(countdown.s).padStart(2, '0')}
              </span>
            )}
          </div>
        ) : hasDiscount && discountPercent ? (
          <div className="absolute end-3 top-3 z-10 rounded-xl bg-destructive px-3 py-1 text-2xs font-bold text-destructive-foreground shadow-xs">
            تخفیف {toPersianDigits(discountPercent)}٪
          </div>
        ) : null}

        {/* شمارشگر اسلاید در گوشه بالا */}
        {validImages.length > 1 && (
          <div className="absolute start-3 top-3 z-10 rounded-lg bg-card/85 border border-border/60 px-2 py-1 text-3xs font-bold text-foreground backdrop-blur-md">
            {toPersianDigits(safeIndex + 1)} / {toPersianDigits(validImages.length)}
          </div>
        )}

        {/* تصویر اصلی محصول با سوایپ طبیعی */}
        <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.img
              key={safeIndex}
              src={currentImageUrl}
              alt={`${title} - عکس ${safeIndex + 1}`}
              onClick={() => setIsFullscreenOpen(true)}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                // جهت درگ اصلاح شده: کشیدن به راست = بعدی، کشیدن به چپ = قبلی
                if (info.offset.x > 40) handleNext();
                else if (info.offset.x < -40) handlePrev();
              }}
              initial={{ opacity: 0, x: -direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * 40 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full cursor-zoom-in object-contain touch-pan-y"
            />
          </AnimatePresence>
        </div>

        {/* دکمه تمام‌صفحه */}
        <button
          type="button"
          onClick={() => setIsFullscreenOpen(true)}
          aria-label="مشاهده تمام‌صفحه"
          className="absolute bottom-3 start-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card/90 text-muted-foreground shadow-xs backdrop-blur-md outline-none transition-all hover:bg-primary hover:text-primary-foreground active:scale-95"
        >
          <Maximize2 aria-hidden="true" className="h-4 w-4" />
        </button>

        {/* دکمه‌های ناوبری در دسکتاپ */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="عکس قبلی"
              className="absolute start-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card/90 text-foreground shadow-xs backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="عکس بعدی"
              className="absolute end-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card/90 text-foreground shadow-xs backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}

        {/* نقاط نشانگر صفحه در موبایل */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1 md:hidden pointer-events-none z-10">
            {validImages.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  i === safeIndex ? 'w-5 bg-primary' : 'w-1 bg-foreground/25'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================= ریزعکس‌ها (بندانگشتی‌ها) بدون بیرون‌زدگی ================= */}
      {validImages.length > 1 && (
        <div className="w-full overflow-x-auto scrollbar-none py-1">
          <div className="flex items-center gap-3 w-max min-w-full justify-center px-1">
            {validImages.map((img, idx) => {
              const thumbUrl = resolveImageUrl(img);
              if (!thumbUrl) return null;
              const isSelected = idx === safeIndex;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setDirection(idx > safeIndex ? 1 : -1);
                    setActiveIndex(idx);
                  }}
                  aria-label={`عکس ${idx + 1}`}
                  className={cn(
                    'relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-card p-1 outline-none transition-all',
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 scale-105'
                      : 'border-border/80 opacity-60 hover:opacity-100 hover:border-primary/40'
                  )}
                >
                  <img src={thumbUrl} alt="" className="h-full w-full rounded-lg object-contain" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* رندر مدال فول‌اسکرین در ریشه سند با استفاده از پورتال */}
      {isMounted && createPortal(fullscreenModalContent, document.body)}
    </div>
  );
}