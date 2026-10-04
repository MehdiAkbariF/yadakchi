'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, X, ChevronLeft, ChevronRight, Maximize2, ImageOff } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';

interface ProductGalleryProps {
  images: any[];
  title: string;
  hasDiscount?: boolean;
  discountPercent?: number;
}

export function ProductGallery({ images = [], title, hasDiscount, discountPercent }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // فیلتر کردن مقادیر خالی یا undefined
  const validImages = (images || []).filter(Boolean);
  const safeIndex = activeIndex < validImages.length ? activeIndex : 0;

  useEffect(() => {
    if (!isFullscreenOpen) return;

    document.body.style.overflow = 'hidden';

    const handlePopState = () => {
      setIsFullscreenOpen(false);
    };

    window.history.pushState({ modalOpen: 'gallery-modal' }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isFullscreenOpen]);

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => {
    setZoomScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleCloseFullscreen = () => {
    handleResetZoom();
    setIsFullscreenOpen(false);
    if (window.history.state?.modalOpen === 'gallery-modal') {
      window.history.back();
    }
  };

  // ساخت آدرس استاندارد با تابع اصلی formatters
  const resolveImageUrl = (item: any): string => {
    if (!item) return '';
    const rawPath = typeof item === 'string' ? item : item.url || item.image || '';
    if (!rawPath) return '';
    if (rawPath.startsWith('http')) return rawPath;
    
    // استفاده از getFullUrl رسمی پروژه
    try {
      return getFullUrl(rawPath);
    } catch {
      return `https://api.yadakchi.com${rawPath.startsWith('/') ? rawPath : `/${rawPath}`}`;
    }
  };

  const currentImageUrl = resolveImageUrl(validImages[safeIndex]);

  if (validImages.length === 0 || !currentImageUrl) {
    return (
      <div className="w-full aspect-[4/3] rounded-2xl border p-4 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground gap-2">
        <ImageOff className="h-10 w-10 opacity-40" />
        <span className="text-xs font-iran-yekan">تصویری برای این کالا ثبت نشده است</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      
      <div className="relative w-full aspect-[4/3] rounded-2xl border p-4 bg-background flex items-center justify-center overflow-hidden shadow-sm group">
        
        {hasDiscount && (
          <div className="lg:hidden absolute top-3 right-3 bg-destructive text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm z-10 select-none animate-pulse">
            تخفیف ویژه {toPersianDigits(discountPercent || 0)}٪
          </div>
        )}

        <img
          src={currentImageUrl}
          alt={`${title} - ${safeIndex + 1}`}
          onClick={() => setIsFullscreenOpen(true)}
          className="w-full h-full object-contain cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.01]"
        />
        <button
          onClick={() => setIsFullscreenOpen(true)}
          className="absolute bottom-3 left-3 p-2 bg-background/80 hover:bg-primary hover:text-white border text-muted-foreground rounded-xl backdrop-blur-sm transition-all shadow-sm outline-none"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {validImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {validImages.map((img, idx) => {
            const thumbUrl = resolveImageUrl(img);
            if (!thumbUrl) return null;

            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "w-16 h-16 shrink-0 rounded-xl border p-1 bg-background overflow-hidden transition-all outline-none",
                  idx === safeIndex ? "border-primary ring-1 ring-primary scale-105" : "hover:border-zinc-300"
                )}
              >
                <img
                  src={thumbUrl}
                  alt=""
                  className="w-full h-full object-contain rounded-lg"
                />
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {isFullscreenOpen && (
          <div className="fixed inset-0 z-[110] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md flex flex-col w-screen h-screen">
            
            <div className="flex items-center justify-between px-6 py-4 border-b bg-background/20 shrink-0">
              <span className="text-xs md:text-sm font-bold font-iran-yekan text-foreground truncate max-w-xs md:max-w-xl">
                نمای بزرگ محصول: {title}
              </span>
              <button
                onClick={handleCloseFullscreen}
                className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 relative w-full overflow-hidden flex items-center justify-center">
              <div 
                className="w-full h-full max-w-4xl max-h-[75vh] p-4 flex items-center justify-center relative touch-none"
              >
                <motion.img
                  src={currentImageUrl}
                  alt=""
                  drag={zoomScale > 1}
                  dragConstraints={zoomScale > 1 ? false : { left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.15}
                  onDragEnd={(_, info) => {
                    if (zoomScale === 1) {
                      if (info.offset.x > 80) {
                        setActiveIndex(prev => (prev - 1 + validImages.length) % validImages.length);
                      } else if (info.offset.x < -80) {
                        setActiveIndex(prev => (prev + 1) % validImages.length);
                      }
                    }
                  }}
                  animate={{
                    scale: zoomScale,
                    x: zoomScale > 1 ? panOffset.x : 0,
                    y: zoomScale > 1 ? panOffset.y : 0
                  }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  onUpdate={(latest: any) => {
                    if (zoomScale > 1) {
                      setPanOffset({ x: latest.x || 0, y: latest.y || 0 });
                    }
                  }}
                  className="max-w-full max-h-full object-contain select-none pointer-events-none"
                />
              </div>

              {validImages.length > 1 && zoomScale === 1 && (
                <>
                  <button
                    onClick={() => {
                      setActiveIndex(prev => (prev - 1 + validImages.length) % validImages.length);
                      handleResetZoom();
                    }}
                    className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-background border hover:bg-primary hover:text-white transition-all shadow-md outline-none"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveIndex(prev => (prev + 1) % validImages.length);
                      handleResetZoom();
                    }}
                    className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-background border hover:bg-primary hover:text-white transition-all shadow-md outline-none"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div className="border-t bg-background/20 p-4 shrink-0 flex items-center justify-center gap-3">
              <button
                onClick={handleZoomIn}
                disabled={zoomScale >= 4}
                className="p-2.5 border rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all disabled:opacity-30"
              >
                <ZoomIn className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={handleZoomOut}
                disabled={zoomScale === 1}
                className="p-2.5 border rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all disabled:opacity-30"
              >
                <ZoomOut className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={handleResetZoom}
                disabled={zoomScale === 1 && panOffset.x === 0 && panOffset.y === 0}
                className="p-2.5 border rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all disabled:opacity-30"
              >
                <RotateCcw className="h-4.5 w-4.5" />
              </button>
            </div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}