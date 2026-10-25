'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, X, ChevronLeft, ChevronRight, Maximize2, ImageOff, Ticket } from 'lucide-react';
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
  const [isFullscreenOpen, setIsFullscreenOpen] = React.useState(false);
  const [zoomScale, setZoomScale] = React.useState(1);
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 });

  const countdown = useCountdown(hasTimedDiscount ? discountExpiration : null);

  const validImages = React.useMemo(() => (images || []).filter(Boolean), [images]);
  const safeIndex = activeIndex < validImages.length ? activeIndex : 0;

  React.useEffect(() => {
    if (!isFullscreenOpen) return;
    document.body.style.overflow = 'hidden';
    const handlePopState = () => setIsFullscreenOpen(false);
    window.history.pushState({ modalOpen: 'gallery-modal' }, '');
    window.addEventListener('popstate', handlePopState);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isFullscreenOpen]);

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.5, 4));
  const handleZoomOut = () =>
    setZoomScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleCloseFullscreen = () => {
    handleResetZoom();
    setIsFullscreenOpen(false);
    if (window.history.state?.modalOpen === 'gallery-modal') window.history.back();
  };

  const resolveImageUrl = (item: any): string => {
    if (!item) return '';
    const rawPath = typeof item === 'string' ? item : item.url || item.image || '';
    if (!rawPath) return '';
    if (rawPath.startsWith('http')) return rawPath;
    try {
      return getFullUrl(rawPath);
    } catch {
      return `https://api.yadakchi.com${rawPath.startsWith('/') ? rawPath : `/${rawPath}`}`;
    }
  };

  const currentImageUrl = resolveImageUrl(validImages[safeIndex]);

  if (validImages.length === 0 || !currentImageUrl) {
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-card p-6 text-muted-foreground shadow-xs">
        <ImageOff aria-hidden="true" className="h-10 w-10 opacity-40" />
        <span className="text-xs font-bold">تصویری برای این کالا ثبت نشده است</span>
      </div>
    );
  }

  return (
    <div className="flex w-full select-none flex-col gap-4" dir="rtl">
      
      {/* ================= تصویر اصلی محصول با قابلیت Swipe و دکمه‌های ناوبری استاندارد RTL ================= */}
      <div className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        
        {/* تگ تخفیف و تایمر */}
        {hasTimedDiscount ? (
          <div className="absolute end-3 top-3 z-10 flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-2xs font-bold text-destructive-foreground shadow-sm">
            <Ticket aria-hidden="true" className="h-3.5 w-3.5" />
            <span>تخفیف {toPersianDigits(discountPercent || 0)}٪</span>
            {countdown ? (
              <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-3xs font-bold font-mono" dir="ltr">
                {String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:
                {String(countdown.s).padStart(2, '0')}
              </span>
            ) : null}
          </div>
        ) : hasDiscount && discountPercent ? (
          <div className="absolute end-3 top-3 z-10 rounded-lg bg-destructive px-3 py-1.5 text-2xs font-bold text-destructive-foreground shadow-sm">
            تخفیف {toPersianDigits(discountPercent)}٪
          </div>
        ) : null}

        {/* عکس اصلی با قابلیت کشیدن (Swipe) در موبایل (هماهنگ با RTL) */}
        <motion.img
          key={safeIndex}
          src={currentImageUrl}
          alt={`${title} - تصویر ${safeIndex + 1}`}
          onClick={() => setIsFullscreenOpen(true)}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50 && validImages.length > 1) {
              setActiveIndex((prev) => (prev + 1) % validImages.length);
            } else if (info.offset.x > 50 && validImages.length > 1) {
              setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
            }
          }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="h-full w-full cursor-zoom-in object-contain touch-pan-y"
        />

        {/* دکمه بزرگ‌نمایی در گوشه تصویر */}
        <button
          type="button"
          onClick={() => setIsFullscreenOpen(true)}
          aria-label="مشاهده تمام‌صفحه"
          className="absolute bottom-3 start-3 flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card/90 text-muted-foreground shadow-xs backdrop-blur-md outline-none transition-all hover:bg-primary hover:text-primary-foreground active:scale-90"
        >
          <Maximize2 aria-hidden="true" className="h-4 w-4" />
        </button>

        {/* دکمه‌های ناوبری عکس در دسکتاپ */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length)}
              aria-label="تصویر قبلی"
              className="absolute start-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card/90 text-foreground shadow-sm backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev + 1) % validImages.length)}
              aria-label="تصویر بعدی"
              className="absolute end-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card/90 text-foreground shadow-sm backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}

        {/* نقاط نشانگر صفحه در موبایل (Pagination Dots) */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 md:hidden pointer-events-none">
            {validImages.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === safeIndex ? 'w-5 bg-primary' : 'w-1.5 bg-foreground/20'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================= ریزعکس‌ها (Thumbnails): فیت شده و بدون بیرون‌زدگی از کناره‌ها ================= */}
      {validImages.length > 1 ? (
        <div className="w-full overflow-x-auto scrollbar-none py-1">
          <div className="flex items-center gap-2.5 w-max min-w-full px-0.5">
            {validImages.map((img, idx) => {
              const thumbUrl = resolveImageUrl(img);
              if (!thumbUrl) return null;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`تصویر ${idx + 1}`}
                  aria-current={idx === safeIndex}
                  className={cn(
                    'relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-card p-1.5 outline-none transition-all',
                    idx === safeIndex
                      ? 'border-primary ring-2 ring-primary/20 scale-105'
                      : 'border-border/80 hover:border-primary/40 opacity-70 hover:opacity-100'
                  )}
                >
                  <img src={thumbUrl} alt="" className="h-full w-full rounded-lg object-contain" />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* ================= مدال لایت‌باکس تمام‌صفحه با زوم پیشرفته ================= */}
      <AnimatePresence>
        {isFullscreenOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-modal flex h-screen w-screen flex-col bg-card/98 backdrop-blur-lg"
            dir="rtl"
          >
            {/* هدر مدال */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/80 bg-muted/30 px-5 py-4">
              <span className="max-w-xs truncate text-xs font-bold text-foreground md:max-w-xl sm:text-sm">
                {title} ({toPersianDigits(safeIndex + 1)} از {toPersianDigits(validImages.length)})
              </span>
              <button
                type="button"
                onClick={handleCloseFullscreen}
                aria-label="بستن"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            {/* بدنه اصلی عکس تمام‌صفحه */}
            <div className="relative min-h-0 w-full flex-1 overflow-hidden flex items-center justify-center p-4">
              <div className="relative flex h-full w-full max-w-5xl items-center justify-center touch-none">
                <motion.img
                  src={currentImageUrl}
                  alt=""
                  drag={zoomScale > 1}
                  dragConstraints={zoomScale > 1 ? false : { left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.15}
                  onDragEnd={(_, info) => {
                    if (zoomScale === 1) {
                      if (info.offset.x < -50 && validImages.length > 1) {
                        setActiveIndex((prev) => (prev + 1) % validImages.length);
                      } else if (info.offset.x > 50 && validImages.length > 1) {
                        setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
                      }
                    }
                  }}
                  animate={{
                    scale: zoomScale,
                    x: zoomScale > 1 ? panOffset.x : 0,
                    y: zoomScale > 1 ? panOffset.y : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  onUpdate={(latest: any) => {
                    if (zoomScale > 1) setPanOffset({ x: latest.x || 0, y: latest.y || 0 });
                  }}
                  className="max-h-full max-w-full select-none object-contain cursor-grab active:cursor-grabbing"
                />
              </div>

              {/* دکمه‌های ناوبری در مدال تمام‌صفحه با جهت صحیح RTL */}
              {validImages.length > 1 && zoomScale === 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
                      handleResetZoom();
                    }}
                    aria-label="تصویر قبلی"
                    className="absolute start-4 sm:start-8 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md outline-none transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIndex((prev) => (prev + 1) % validImages.length);
                      handleResetZoom();
                    }}
                    aria-label="تصویر بعدی"
                    className="absolute end-4 sm:end-8 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md outline-none transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                </>
              ) : null}
            </div>

            {/* فوتر ابزارها (زوم و بازنشانی) */}
            <div className="flex shrink-0 items-center justify-center gap-3 border-t border-border/80 bg-muted/30 p-4">
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomScale >= 4}
                aria-label="بزرگ‌نمایی"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:opacity-30 shadow-xs"
              >
                <ZoomIn className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomScale === 1}
                aria-label="کوچک‌نمایی"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:opacity-30 shadow-xs"
              >
                <ZoomOut className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                disabled={zoomScale === 1 && panOffset.x === 0 && panOffset.y === 0}
                aria-label="بازنشانی"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:opacity-30 shadow-xs"
              >
                <RotateCcw className="h-4.5 w-4.5" />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}