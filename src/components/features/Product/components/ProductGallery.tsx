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
  onDragVertical?: (deltaY: number) => void;
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
  onDragVertical,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = React.useState(false);
  const [zoomScale, setZoomScale] = React.useState(1);
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = React.useState(false);

  const mobileCarouselRef = React.useRef<HTMLDivElement>(null);
  const touchStartRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const countdown = useCountdown(hasTimedDiscount ? discountExpiration : null);
  const validImages = React.useMemo(() => (images || []).filter(Boolean), [images]);
  const safeIndex = activeIndex < validImages.length ? activeIndex : 0;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const handleNextDesktop = () => {
    if (validImages.length <= 1) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % validImages.length);
  };

  const handlePrevDesktop = () => {
    if (validImages.length <= 1) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleMobileScroll = () => {
    if (!mobileCarouselRef.current) return;
    const { scrollLeft, clientWidth } = mobileCarouselRef.current;
    const index = Math.round(Math.abs(scrollLeft) / clientWidth);
    if (index !== activeIndex && index < validImages.length) {
      setActiveIndex(index);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = Math.abs(e.touches[0].clientX - touchStartRef.current.x);
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;

    if (Math.abs(deltaY) > deltaX && onDragVertical) {
      onDragVertical(deltaY);
      touchStartRef.current.y = e.touches[0].clientY;
    }
  };

  React.useEffect(() => {
    if (window.innerWidth < 1024 && validImages.length > 1 && mobileCarouselRef.current) {
      const t = setTimeout(() => {
        mobileCarouselRef.current?.scrollTo({ left: -36, behavior: 'smooth' });
        setTimeout(() => {
          mobileCarouselRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
        }, 300);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [validImages.length]);

  if (validImages.length === 0) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card p-6 text-muted-foreground">
        <ImageOff aria-hidden="true" className="h-12 w-12 opacity-30" />
        <span className="text-xs font-bold">تصویری برای این کالا ثبت نشده است</span>
      </div>
    );
  }

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
          <div className="flex shrink-0 items-center justify-between border-b border-border sm:border-white/10 bg-muted/40 sm:bg-black/60 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate text-xs sm:text-sm font-bold text-foreground sm:text-white max-w-[200px] sm:max-w-xl">
                {title}
              </span>
              <span className="rounded-md bg-muted sm:bg-white/15 px-2 py-1 text-3xs font-bold text-foreground sm:text-white">
                {toPersianDigits(safeIndex + 1)} از {toPersianDigits(validImages.length)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setZoomScale(1);
                setPanOffset({ x: 0, y: 0 });
                setIsFullscreenOpen(false);
              }}
              aria-label="بستن"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted sm:bg-white/10 text-foreground sm:text-white hover:bg-destructive hover:text-white transition-colors"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <div className="relative min-h-0 w-full flex-1 overflow-hidden flex items-center justify-center p-2 sm:p-6">
            <motion.img
              src={resolveImageUrl(validImages[safeIndex])}
              alt=""
              drag={zoomScale > 1}
              dragConstraints={zoomScale > 1 ? false : { left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.2}
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

          <div className="flex shrink-0 items-center justify-center gap-3 border-t border-border sm:border-white/10 bg-muted/40 sm:bg-black/60 p-3 sm:p-4">
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.min(prev + 1, 4))}
              disabled={zoomScale >= 4}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border sm:border-white/15 bg-card sm:bg-white/10 text-foreground sm:text-white"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.max(prev - 1, 1))}
              disabled={zoomScale === 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border sm:border-white/15 bg-card sm:bg-white/10 text-foreground sm:text-white"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoomScale(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              disabled={zoomScale === 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border sm:border-white/15 bg-card sm:bg-white/10 text-foreground sm:text-white"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="w-full select-none" dir="rtl">
      {/* ================= نسخه دسکتاپ ================= */}
      <div className="hidden lg:flex w-full flex-col gap-4">
        <div className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
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

          {validImages.length > 1 && (
            <div className="absolute start-3 top-3 z-10 rounded-lg bg-card/85 border border-border/60 px-2 py-1 text-3xs font-bold text-foreground backdrop-blur-md">
              {toPersianDigits(safeIndex + 1)} / {toPersianDigits(validImages.length)}
            </div>
          )}

          <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.img
                key={safeIndex}
                src={resolveImageUrl(validImages[safeIndex])}
                alt={`${title} - عکس ${safeIndex + 1}`}
                onClick={() => setIsFullscreenOpen(true)}
                initial={{ opacity: 0, x: -direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * 40 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full cursor-zoom-in object-contain"
              />
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreenOpen(true)}
            aria-label="مشاهده تمام‌صفحه"
            className="absolute bottom-3 start-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card/90 text-muted-foreground shadow-xs backdrop-blur-md transition-all hover:bg-primary hover:text-primary-foreground active:scale-95"
          >
            <Maximize2 aria-hidden="true" className="h-4 w-4" />
          </button>

          {validImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevDesktop}
                aria-label="عکس قبلی"
                className="absolute start-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card/90 text-foreground shadow-xs backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextDesktop}
                aria-label="عکس بعدی"
                className="absolute end-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card/90 text-foreground shadow-xs backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

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
      </div>

      {/* ================= نسخه موبایل ================= */}
      <div
        className="lg:hidden relative w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {hasTimedDiscount ? (
          <div className="absolute end-4 top-4 z-20 flex items-center gap-2 rounded-xl bg-destructive px-3 py-1.5 text-2xs font-bold text-destructive-foreground shadow-md backdrop-blur-md">
            <Ticket aria-hidden="true" className="h-4 w-4" />
            <span>تخفیف {toPersianDigits(discountPercent || 0)}٪</span>
            {countdown && (
              <span className="rounded-md bg-black/20 px-1.5 py-0.5 text-3xs font-black tracking-wider" dir="ltr">
                {String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:
                {String(countdown.s).padStart(2, '0')}
              </span>
            )}
          </div>
        ) : hasDiscount && discountPercent ? (
          <div className="absolute end-4 top-4 z-20 rounded-xl bg-destructive px-3 py-1.5 text-2xs font-bold text-destructive-foreground shadow-md">
            تخفیف {toPersianDigits(discountPercent)}٪
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsFullscreenOpen(true)}
          aria-label="مشاهده تمام‌صفحه"
          className="absolute bottom-6 start-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card/85 text-foreground backdrop-blur-md shadow-xs active:scale-95 transition-all"
        >
          <Maximize2 aria-hidden="true" className="h-4 w-4" />
        </button>

        <div
          ref={mobileCarouselRef}
          onScroll={handleMobileScroll}
          className="flex w-full snap-x snap-mandatory overflow-x-auto scrollbar-none items-center pt-2 pb-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {validImages.map((img, idx) => {
            const currentUrl = resolveImageUrl(img);
            return (
              <div key={idx} className="w-[86%] sm:w-[90%] shrink-0 snap-center px-2">
                <div
                  onClick={() => setIsFullscreenOpen(true)}
                  className="relative aspect-square w-full max-h-[300px] flex items-center justify-center cursor-zoom-in overflow-hidden rounded-2xl bg-card border border-border/60 shadow-xs"
                >
                  <img
                    src={currentUrl}
                    alt={`${title} - تصویر ${idx + 1}`}
                    className="h-full w-full object-contain p-3 transition-transform duration-300"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {validImages.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-1 pb-3">
            {validImages.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === safeIndex ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/35'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {isMounted && createPortal(fullscreenModalContent, document.body)}
    </div>
  );
}