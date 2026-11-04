'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
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

/* -------------------------------------------------------------------------- */
/*             ایده جسورانه: اسکرابر کپسولی مقطعی (Segmented Capsule)          */
/* -------------------------------------------------------------------------- */
interface GalleryScrubberProps {
  total: number;
  current: number;
  onChange: (index: number) => void;
  isDark?: boolean;
  align?: 'start' | 'center';
}

function GalleryScrubber({
  total,
  current,
  onChange,
  isDark = false,
  align = 'center',
}: GalleryScrubberProps) {
  if (total <= 1) return null;

  return (
    <div
      className={cn(
        'flex flex-col select-none w-full max-w-[220px] sm:max-w-[260px] gap-1.5',
        align === 'start' ? 'items-start' : 'items-center mx-auto'
      )}
    >
      {/* تراک مقطعی تعاملی */}
      <div
        className={cn(
          'flex items-center gap-1.5 w-full p-1 rounded-full backdrop-blur-md transition-colors',
          isDark ? 'bg-neutral-900/80 border border-neutral-800' : 'bg-muted/60 border border-border/60'
        )}
      >
        {Array.from({ length: total }).map((_, idx) => {
          const isActive = idx === current;
          const isPassed = idx < current;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(idx)}
              aria-label={`رفتن به تصویر ${idx + 1}`}
              className="relative flex-1 h-2 rounded-full overflow-hidden transition-all duration-300 focus:outline-none"
            >
              {/* پس‌زمینه قطعه */}
              <div
                className={cn(
                  'absolute inset-0 rounded-full transition-colors',
                  isDark ? 'bg-neutral-800' : 'bg-muted-foreground/20'
                )}
              />

              {/* نشانگر وضعیت */}
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  isActive
                    ? isDark ? 'bg-primary shadow-sm shadow-primary/50' : 'bg-primary shadow-sm'
                    : isPassed
                    ? isDark ? 'bg-neutral-600' : 'bg-primary/40'
                    : 'w-0'
                )}
                style={{ width: isActive || isPassed ? '100%' : '0%' }}
              />
            </button>
          );
        })}
      </div>

      {/* بج شمارشگر ارقام فارسی با استایل مینیمال */}
      <div
        className={cn(
          'flex items-center gap-1 text-3xs font-black tracking-wider px-2 py-0.5 rounded-md tabular-nums',
          isDark ? 'bg-neutral-900 text-neutral-300' : 'bg-card text-muted-foreground border border-border/50'
        )}
      >
        <span className={cn('text-xs font-black', isDark ? 'text-primary' : 'text-primary')}>
          {toPersianDigits(current + 1)}
        </span>
        <span className="opacity-40">/</span>
        <span>{toPersianDigits(total)}</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           کامپوننت اصلی گالری                              */
/* -------------------------------------------------------------------------- */
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

  const handleNext = React.useCallback(() => {
    if (validImages.length <= 1) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % validImages.length);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, [validImages.length]);

  const handlePrev = React.useCallback(() => {
    if (validImages.length <= 1) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, [validImages.length]);

  const goToSlide = (idx: number) => {
    if (idx === safeIndex) return;
    setDirection(idx > safeIndex ? 1 : -1);
    setActiveIndex(idx);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });

    if (mobileCarouselRef.current) {
      const width = mobileCarouselRef.current.clientWidth;
      mobileCarouselRef.current.scrollTo({
        left: -idx * width,
        behavior: 'smooth',
      });
    }
  };

  const closeFullscreen = React.useCallback(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setIsFullscreenOpen(false);
  }, []);

  // ✅ بستن تمام‌صفحه با دکمه فیزیکی بازگشت گوشی (Android Back / Browser History Back)
  React.useEffect(() => {
    if (!isFullscreenOpen) return;

    window.history.pushState({ modal: 'product-gallery-fullscreen' }, '');

    const handlePopState = () => {
      closeFullscreen();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modal === 'product-gallery-fullscreen') {
        window.history.back();
      }
    };
  }, [isFullscreenOpen, closeFullscreen]);

  // کنترل با کلیدهای کیبورد
  React.useEffect(() => {
    if (!isFullscreenOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFullscreen();
      } else if (e.key === 'ArrowLeft') {
        handleNext();
      } else if (e.key === 'ArrowRight') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen, closeFullscreen, handleNext, handlePrev]);

  // رویدادهای اسکرول در حالت عادی موبایل
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

  const handleFullscreenDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (zoomScale > 1) return;

    const swipeThreshold = 40;
    if (info.offset.x < -swipeThreshold) {
      handlePrev();
    } else if (info.offset.x > swipeThreshold) {
      handleNext();
    }
  };

  const handleDoubleTap = () => {
    if (zoomScale > 1) {
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
    } else {
      setZoomScale(2.5);
    }
  };

  if (validImages.length === 0) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card p-6 text-muted-foreground">
        <ImageOff aria-hidden="true" className="h-12 w-12 opacity-30" />
        <span className="text-xs font-bold">تصویری برای این کالا ثبت نشده است</span>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*            مودال تمام‌صفحه (کامل مشکی، با پشتیبانی از دکمه بازگشت)            */
  /* -------------------------------------------------------------------------- */
  const fullscreenModalContent = (
    <AnimatePresence>
      {isFullscreenOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="نمایش تمام‌صفحه تصاویر کالا"
          className="fixed inset-0 z-[999999] flex h-[100dvh] w-screen flex-col bg-black select-none touch-none transform-gpu"
          dir="rtl"
        >
          {/* هدر کاملاً مشکی */}
          <div className="flex shrink-0 items-center justify-between border-b border-neutral-800 bg-black px-4 py-3 sm:px-6 z-20">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate text-xs sm:text-sm font-bold text-white max-w-[200px] sm:max-w-xl">
                {title}
              </span>
              <span className="rounded-md bg-neutral-800 px-2 py-0.5 text-3xs font-bold text-neutral-300">
                {toPersianDigits(safeIndex + 1)} از {toPersianDigits(validImages.length)}
              </span>
            </div>

            <button
              type="button"
              onClick={closeFullscreen}
              aria-label="بستن گالری (Escape یا دکمه بازگشت)"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white hover:bg-destructive transition-colors focus:ring-2 focus:ring-white active:scale-95"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          {/* بدنه و تصویر اسلایدر */}
          <div className="relative min-h-0 w-full flex-1 overflow-hidden flex items-center justify-center bg-black p-2 sm:p-6">
            {validImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="عکس قبلی"
                className="hidden sm:flex absolute start-6 z-20 h-12 w-12 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 transition-all active:scale-95"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={safeIndex}
                custom={direction}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="h-full w-full flex items-center justify-center"
              >
                <motion.img
                  src={resolveImageUrl(validImages[safeIndex])}
                  alt={`${title} - تصویر ${safeIndex + 1}`}
                  onDoubleClick={handleDoubleTap}
                  drag={zoomScale > 1 ? true : 'x'}
                  dragConstraints={
                    zoomScale > 1
                      ? { left: -300, right: 300, top: -300, bottom: 300 }
                      : { left: 0, right: 0 }
                  }
                  dragElastic={zoomScale > 1 ? 0.2 : 0.4}
                  onDragEnd={handleFullscreenDragEnd}
                  animate={{
                    scale: zoomScale,
                    x: zoomScale > 1 ? panOffset.x : 0,
                    y: zoomScale > 1 ? panOffset.y : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  onUpdate={(latest: any) => {
                    if (zoomScale > 1) setPanOffset({ x: latest.x || 0, y: latest.y || 0 });
                  }}
                  className={cn(
                    'max-h-full max-w-full select-none object-contain',
                    zoomScale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
                  )}
                />
              </motion.div>
            </AnimatePresence>

            {validImages.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="عکس بعدی"
                className="hidden sm:flex absolute end-6 z-20 h-12 w-12 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 transition-all active:scale-95"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* فوتر مشکی با اسکرابر کپسولی مقطعی */}
          <div className="flex shrink-0 flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-800 bg-black p-3 sm:px-8 sm:py-4 z-20">
            <div className="w-full sm:w-auto flex-1 max-w-xs">
              <GalleryScrubber
                total={validImages.length}
                current={safeIndex}
                onChange={goToSlide}
                isDark
                align="center"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(prev + 0.75, 4))}
                disabled={zoomScale >= 4}
                aria-label="بزرگنمایی"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-white active:scale-95 disabled:opacity-30"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(prev - 0.75, 1))}
                disabled={zoomScale === 1}
                aria-label="کوچک‌نمایی"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-white active:scale-95 disabled:opacity-30"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoomScale(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                disabled={zoomScale === 1}
                aria-label="بازنشانی زوم"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-white active:scale-95 disabled:opacity-30"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={`تصاویر ${title}`}
      className="w-full select-none"
      dir="rtl"
    >
      <div className="sr-only" aria-live="polite">
        تصویر {safeIndex + 1} از {validImages.length}
      </div>

      {/* ================= نسخه دسکتاپ ================= */}
      <div className="hidden lg:flex w-full flex-col items-start gap-4 text-right pt-1">
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

          <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.img
                key={safeIndex}
                src={resolveImageUrl(validImages[safeIndex])}
                alt={`${title} - عکس ${safeIndex + 1}`}
                onClick={() => setIsFullscreenOpen(true)}
                initial={{ opacity: 0, x: -direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * 30 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full cursor-zoom-in object-contain transform-gpu"
              />
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreenOpen(true)}
            aria-label="مشاهده تمام‌صفحه"
            className="absolute bottom-3 start-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground shadow-xs hover:bg-primary hover:text-primary-foreground active:scale-95 transition-all"
          >
            <Maximize2 aria-hidden="true" className="h-4 w-4" />
          </button>

          {validImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="عکس قبلی"
                className="absolute start-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="عکس بعدی"
                className="absolute end-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {validImages.length > 1 && (
          <div className="flex w-full flex-col items-start gap-3">
            <div className="w-full overflow-x-auto scrollbar-none py-1">
              <div className="flex items-center gap-3 w-max justify-start px-0.5">
                {validImages.map((img, idx) => {
                  const thumbUrl = resolveImageUrl(img);
                  if (!thumbUrl) return null;
                  const isSelected = idx === safeIndex;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      aria-label={`انتخاب عکس ${idx + 1}`}
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

            <GalleryScrubber
              total={validImages.length}
              current={safeIndex}
              onChange={goToSlide}
              align="start"
            />
          </div>
        )}
      </div>

      {/* ================= نسخه موبایل ================= */}
      <div
        className="lg:hidden relative w-full flex flex-col items-center pt-3.5"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {hasTimedDiscount ? (
          <div className="absolute end-4 top-5 z-20 flex items-center gap-2 rounded-xl bg-destructive px-3 py-1 text-2xs font-bold text-destructive-foreground shadow-md">
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
          <div className="absolute end-4 top-5 z-20 rounded-xl bg-destructive px-3 py-1 text-2xs font-bold text-destructive-foreground shadow-md">
            تخفیف {toPersianDigits(discountPercent)}٪
          </div>
        ) : null}

        {/* کاروسل تصاویر */}
        <div
          ref={mobileCarouselRef}
          onScroll={handleMobileScroll}
          className="flex w-full snap-x snap-mandatory overflow-x-auto scrollbar-none items-center"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {validImages.map((img, idx) => {
            const currentUrl = resolveImageUrl(img);
            return (
              <div key={idx} className="w-full shrink-0 snap-center px-4">
                <div
                  onClick={() => setIsFullscreenOpen(true)}
                  className="relative h-[250px] w-full flex items-center justify-center cursor-zoom-in overflow-hidden 
                  rounded-2xl bg-card border border-border/60 shadow-xs"
                >
                  <img
                    src={currentUrl}
                    alt={`${title} - تصویر ${idx + 1}`}
                    className="h-full w-full object-contain p-2"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFullscreenOpen(true);
                    }}
                    aria-label="مشاهده تمام‌صفحه"
                    className="absolute bottom-2.5 start-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-lg border
                     border-border/80 bg-card text-foreground shadow-xs active:scale-95 transition-all"
                  >
                    <Maximize2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* اسکرابر کپسولی تعاملی زیر کاروسل موبایل */}
        {validImages.length > 1 && (
          <div className="w-full pt-2.5 pb-1 px-6">
            <GalleryScrubber
              total={validImages.length}
              current={safeIndex}
              onChange={goToSlide}
              align="center"
            />
          </div>
        )}
      </div>

      {isMounted && createPortal(fullscreenModalContent, document.body)}
    </section>
  );
}

export default ProductGallery;