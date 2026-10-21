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
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted p-4 text-muted-foreground">
        <ImageOff aria-hidden="true" className="h-10 w-10 opacity-40" />
        <span className="text-xs">تصویری برای این کالا ثبت نشده است</span>
      </div>
    );
  }

  return (
    <div className="flex w-full select-none flex-col gap-4">
      <div className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-card p-4 shadow-xs">
        {hasTimedDiscount ? (
          <div className="absolute end-3 top-3 z-10 flex items-center gap-1.5 rounded-sm bg-destructive px-2.5 py-1 text-2xs font-bold text-destructive-foreground shadow-xs">
            <Ticket aria-hidden="true" className="h-3.5 w-3.5" />
            <span>تخفیف {toPersianDigits(discountPercent || 0)}٪</span>
            {countdown ? (
              <span className="rounded-sm bg-destructive-foreground/20 px-1.5 py-0.5 text-2xs" dir="ltr">
                {String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:
                {String(countdown.s).padStart(2, '0')}
              </span>
            ) : null}
          </div>
        ) : hasDiscount ? (
          <div className="absolute end-3 top-3 z-10 rounded-sm bg-destructive px-2.5 py-1 text-2xs font-bold text-destructive-foreground shadow-xs">
            تخفیف {toPersianDigits(discountPercent || 0)}٪
          </div>
        ) : null}

        <img
          src={currentImageUrl}
          alt={`${title} - ${safeIndex + 1}`}
          onClick={() => setIsFullscreenOpen(true)}
          className="h-full w-full cursor-zoom-in object-contain"
        />
        <button
          type="button"
          onClick={() => setIsFullscreenOpen(true)}
          aria-label="مشاهده بزرگ"
          className="absolute bottom-3 start-3 rounded-md border border-border bg-card/80 p-2 text-muted-foreground shadow-xs outline-none backdrop-blur-sm transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <Maximize2 aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      {validImages.length > 1 ? (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
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
                  'h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-card p-1 outline-none transition-colors',
                  idx === safeIndex ? 'border-primary' : 'hover:border-primary/40'
                )}
              >
                <img src={thumbUrl} alt="" className="h-full w-full rounded-sm object-contain" />
              </button>
            );
          })}
        </div>
      ) : null}

      <AnimatePresence>
        {isFullscreenOpen ? (
          <div className="fixed inset-0 z-modal flex h-screen w-screen flex-col bg-card/95 backdrop-blur-md">
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/20 px-6 py-4">
              <span className="max-w-xs truncate text-xs font-bold text-foreground md:max-w-xl md:text-sm">
                نمای بزرگ محصول: {title}
              </span>
              <button
                type="button"
                onClick={handleCloseFullscreen}
                aria-label="بستن"
                className="rounded-full p-2 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="relative min-h-0 w-full flex-1 overflow-hidden">
              <div className="relative flex h-full w-full max-w-4xl items-center justify-center p-4 touch-none">
                <motion.img
                  src={currentImageUrl}
                  alt=""
                  drag={zoomScale > 1}
                  dragConstraints={zoomScale > 1 ? false : { left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.15}
                  onDragEnd={(_, info) => {
                    if (zoomScale === 1) {
                      if (info.offset.x > 80) {
                        setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
                      } else if (info.offset.x < -80) {
                        setActiveIndex((prev) => (prev + 1) % validImages.length);
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
                  className="pointer-events-none max-h-full max-w-full select-none object-contain"
                />
              </div>

              {validImages.length > 1 && zoomScale === 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
                      handleResetZoom();
                    }}
                    aria-label="تصویر قبلی"
                    className="absolute end-6 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-card p-2.5 text-foreground shadow-sm outline-none transition-colors hover:bg-primary hover:text-primary-foreground md:flex"
                  >
                    <ChevronRight aria-hidden="true" className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIndex((prev) => (prev + 1) % validImages.length);
                      handleResetZoom();
                    }}
                    aria-label="تصویر بعدی"
                    className="absolute start-6 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-card p-2.5 text-foreground shadow-sm outline-none transition-colors hover:bg-primary hover:text-primary-foreground md:flex"
                  >
                    <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center justify-center gap-3 border-t border-border bg-card/20 p-4">
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomScale >= 4}
                aria-label="بزرگ‌نمایی"
                className="rounded-md border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:opacity-30"
              >
                <ZoomIn aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomScale === 1}
                aria-label="کوچک‌نمایی"
                className="rounded-md border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:opacity-30"
              >
                <ZoomOut aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                disabled={zoomScale === 1 && panOffset.x === 0 && panOffset.y === 0}
                aria-label="بازنشانی"
                className="rounded-md border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:opacity-30"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
