// src/components/features/Product/components/ProductGallery.tsx
'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ImageOff,
  Timer,
  Percent,
} from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';
import { useDiscountCountdown } from '@/shared/hooks/useDiscountCountdown';

export interface ProductGalleryProps {
  images: any[];
  title: string;
  hasDiscount?: boolean;
  discountPercent?: number;
  hasTimedDiscount?: boolean;
  discountExpiration?: string | Date | null;
  onDragVertical?: (deltaY: number) => void;
}

/* -------------------------------------------------------------------------- */
/*              نوار اسکرابر مقطعی هوشمند (دسکتاپ، موبایل و فول‌اسکرین)         */
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
        'flex select-none items-center gap-2 w-full max-w-[15rem]',
        align === 'start' ? 'justify-start' : 'justify-center mx-auto'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-1.5 flex-1 p-1 rounded-full backdrop-blur-md transition-colors',
          isDark ? 'bg-white/10 border border-white/10' : 'bg-muted/80 border border-border'
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
              aria-label={`رفتن به تصویر شماره ${idx + 1}`}
              className="relative flex-1 h-1.5 rounded-full overflow-hidden transition-all duration-200 focus:outline-none"
            >
              <div
                className={cn(
                  'absolute inset-0 rounded-full transition-colors',
                  isDark ? 'bg-white/20' : 'bg-muted-foreground/20'
                )}
              />
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  isActive
                    ? 'bg-primary shadow-xs'
                    : isPassed
                    ? isDark ? 'bg-white/50' : 'bg-primary/40'
                    : 'w-0'
                )}
                style={{ width: isActive || isPassed ? '100%' : '0%' }}
              />
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          'flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full tabular-nums shrink-0',
          isDark ? 'bg-white/10 text-white' : 'bg-card text-foreground border border-border/70 shadow-xs'
        )}
      >
        <span className="text-primary font-black">{toPersianDigits(current + 1)}</span>
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

  // همگام با زمان سرور
  const { isExpired, formattedPersian } = useDiscountCountdown(
    hasTimedDiscount ? discountExpiration : null
  );
  const isTimerActive = Boolean(hasTimedDiscount && discountExpiration && !isExpired);

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

  React.useEffect(() => {
    if (!isFullscreenOpen) return;
    window.history.pushState({ modal: 'product-gallery-fullscreen' }, '');
    const handlePopState = () => closeFullscreen();
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modal === 'product-gallery-fullscreen') {
        window.history.back();
      }
    };
  }, [isFullscreenOpen, closeFullscreen]);

  React.useEffect(() => {
    if (!isFullscreenOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFullscreen();
      else if (e.key === 'ArrowLeft') handleNext();
      else if (e.key === 'ArrowRight') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen, closeFullscreen, handleNext, handlePrev]);

  const handleMobileScroll = () => {
    if (!mobileCarouselRef.current) return;
    const { scrollLeft, clientWidth } = mobileCarouselRef.current;
    const index = Math.round(Math.abs(scrollLeft) / clientWidth);
    if (index !== activeIndex && index < validImages.length) {
      setActiveIndex(index);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
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
    if (info.offset.x < -swipeThreshold) handlePrev();
    else if (info.offset.x > swipeThreshold) handleNext();
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
  /*                      مودال تمام‌صفحه تصاویر کالا                          */
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
          className="fixed inset-0 z-modal flex h-[100dvh] w-screen flex-col bg-black select-none touch-none transform-gpu"
          dir="rtl"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black px-4 py-3 sm:px-6 z-20">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate text-xs sm:text-sm font-bold text-white max-w-[12.5rem] sm:max-w-xl">
                {title}
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-2xs font-bold text-white/90">
                {toPersianDigits(safeIndex + 1)} از {toPersianDigits(validImages.length)}
              </span>
            </div>

            <button
              type="button"
              onClick={closeFullscreen}
              aria-label="بستن تمام‌صفحه"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-destructive transition-colors active:scale-95"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <div className="relative min-h-0 w-full flex-1 overflow-hidden flex items-center justify-center bg-black p-2 sm:p-6">
            {validImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="عکس قبلی"
                className="hidden sm:flex absolute start-6 z-20 h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-all active:scale-95"
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
                className="hidden sm:flex absolute end-6 z-20 h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-all active:scale-95"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-center border-t border-white/10 bg-black p-3 sm:py-4 z-20">
            <GalleryScrubber
              total={validImages.length}
              current={safeIndex}
              onChange={goToSlide}
              isDark
              align="center"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={`گالری تصاویر ${title}`}
      className="w-full select-none"
      dir="rtl"
    >
      <div className="sr-only" aria-live="polite">
        تصویر {safeIndex + 1} از {validImages.length}
      </div>

      {/* ================= نسخه دسکتاپ ================= */}
      <div className="hidden lg:flex w-full flex-col items-start gap-3.5 text-right pt-1">
        <div className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs">
          {/* نشانگر تخفیف و تایمر مینیمال و شکیل دسکتاپ */}
          {isTimerActive ? (
            <div className="absolute end-3 top-3 z-10 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-2.5 py-1 text-destructive shadow-2xs backdrop-blur-md">
              <div className="flex items-center gap-1 font-extrabold text-2xs">
                <span>تخفیف</span>
                <span>{toPersianDigits(discountPercent || 0)}٪</span>
              </div>
              <span className="h-3 w-px bg-destructive/30" />
              <div className="flex items-center gap-1 text-2xs font-bold tabular-nums" dir="ltr">
                <Timer className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {formattedPersian.hours}:{formattedPersian.minutes}:{formattedPersian.seconds}
                </span>
              </div>
            </div>
          ) : hasDiscount && discountPercent ? (
            <div className="absolute end-3 top-3 z-10 flex items-center gap-1 rounded-xl bg-destructive px-2.5 py-1 text-2xs font-bold text-destructive-foreground shadow-2xs">
              <Percent className="h-3 w-3" />
              <span>تخفیف {toPersianDigits(discountPercent)}٪</span>
            </div>
          ) : null}

          <div 
            onClick={() => setIsFullscreenOpen(true)}
            className="relative h-full w-full cursor-zoom-in flex items-center justify-center"
          >
            <Image
              src={resolveImageUrl(validImages[safeIndex])}
              alt={`${title} - عکس ${safeIndex + 1}`}
              fill
              priority={safeIndex === 0}
              sizes="(max-width: 1400px) 40vw, 450px"
              className="object-contain p-2 transition-transform duration-normal group-hover:scale-105"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreenOpen(true)}
            aria-label="مشاهده تمام‌صفحه تصویر"
            className="absolute bottom-3 start-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-xs hover:bg-primary hover:text-primary-foreground active:scale-95 transition-all"
          >
            <Maximize2 aria-hidden="true" className="h-4 w-4" />
          </button>

          {validImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="عکس قبلی"
                className="absolute start-3 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="عکس بعدی"
                className="absolute end-3 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* بندانگشتی‌های دسکتاپ */}
        {validImages.length > 1 && (
          <div className="w-full flex flex-col items-start gap-2.5">
            <div className="w-full overflow-x-auto scrollbar-thin py-1">
              <div className="flex items-center gap-2.5 w-max justify-start px-0.5">
                {validImages.map((img, idx) => {
                  const thumbUrl = resolveImageUrl(img);
                  if (!thumbUrl) return null;
                  const isSelected = idx === safeIndex;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      aria-label={`انتخاب عکس شماره ${idx + 1}`}
                      className={cn(
                        'relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-card p-1 outline-none transition-all',
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-xs'
                          : 'border-border/80 opacity-60 hover:opacity-100 hover:border-primary/40'
                      )}
                    >
                      <Image
                        src={thumbUrl}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-contain p-0.5"
                      />
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
        className="lg:hidden relative w-full flex flex-col items-center pt-2 gap-2.5"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
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
                  className="relative h-[15.5rem] w-full flex items-center justify-center cursor-zoom-in overflow-hidden rounded-2xl bg-card border border-border shadow-xs"
                >
                  <Image
                    src={currentUrl}
                    alt={`${title} - تصویر ${idx + 1}`}
                    fill
                    priority={idx === 0}
                    sizes="100vw"
                    className="object-contain p-3"
                  />

                  {/* نشانگر تخفیف زمان‌دار شناور در موبایل */}
                  {isTimerActive ? (
                    <div className="absolute top-2.5 end-2.5 z-10 flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/15 px-2.5 py-0.5 text-destructive backdrop-blur-md shadow-2xs">
                      <span className="text-3xs font-extrabold">{toPersianDigits(discountPercent || 0)}٪</span>
                      <span className="h-2.5 w-px bg-destructive/30" />
                      <div className="flex items-center gap-0.5 text-3xs font-bold tabular-nums" dir="ltr">
                        <Timer className="h-3 w-3" />
                        <span>
                          {formattedPersian.hours}:{formattedPersian.minutes}:{formattedPersian.seconds}
                        </span>
                      </div>
                    </div>
                  ) : hasDiscount && discountPercent ? (
                    <div className="absolute top-2.5 end-2.5 z-10 rounded-full bg-destructive px-2 py-0.5 text-3xs font-bold text-destructive-foreground shadow-2xs">
                      تخفیف {toPersianDigits(discountPercent)}٪
                    </div>
                  ) : null}

                  {/* شمارشگر عکس در موبایل: ۱ از ۴ */}
                  {validImages.length > 1 && (
                    <div className="absolute top-2.5 start-2.5 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-2xs font-bold text-white backdrop-blur-md tabular-nums shadow-xs">
                      <span>{toPersianDigits(safeIndex + 1)}</span>
                      <span className="opacity-50">از</span>
                      <span>{toPersianDigits(validImages.length)}</span>
                    </div>
                  )}

                  {/* دکمه تمام صفحه */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFullscreenOpen(true);
                    }}
                    aria-label="مشاهده تمام‌صفحه تصویر"
                    className="absolute bottom-2.5 start-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card/90 text-foreground shadow-xs active:scale-95"
                  >
                    <Maximize2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {validImages.length > 1 && (
          <div className="w-full px-6 flex justify-center">
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