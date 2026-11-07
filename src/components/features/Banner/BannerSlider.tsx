// src/components/features/Banner/BannerSlider.tsx
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl } from '@/core/utils/formatters';
import { useBannerImpression } from '@/shared/hooks/useBannerImpression';
import { bannerTracker } from '@/core/utils/banner-tracker';

interface BannerSliderProps {
  group?: any;
  className?: string;
  autoPlayInterval?: number;
  aspectRatio?: string;
}

export function BannerSlider({
  group,
  className,
  autoPlayInterval = 5000,
  aspectRatio = 'aspect-[16/9] md:aspect-[16/7.5] lg:aspect-[16/7]',
}: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const banners = group?.banners || [];
  const totalSlides = banners.length;

  React.useEffect(() => {
    if (totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [totalSlides, autoPlayInterval]);

  if (!group || totalSlides === 0) return null;

  const currentSlide = banners[currentIndex] || banners[0];
  const slideImpressionRef = useBannerImpression(currentSlide?.id || null);

  const slideContent = (
    <div
      ref={slideImpressionRef}
      className={cn('relative w-full h-full overflow-hidden rounded-xl shadow-xs', aspectRatio)}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 h-full w-full"
        >
          <Image
            src={getFullUrl(currentSlide.image)}
            alt={currentSlide.imageAlt || currentSlide.title || 'بنر فروشگاه یدکچی'}
            fill
            priority={currentIndex === 0}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 1000px"
            className="rounded-xl object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {totalSlides > 1 ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
            }}
            className="absolute start-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="اسلاید قبلی بنر"
          >
            <ChevronRight aria-hidden="true" className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % totalSlides);
            }}
            className="absolute end-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="اسلاید بعدی بنر"
          >
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          </button>

          {/* Dots با رعایت اندازه تاچ استاندارد 44px برای رفع خطای Touch Target در موبایل */}
          <div className="absolute bottom-3 start-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rtl:translate-x-1/2">
            {banners.map((_: any, index: number) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className="relative flex h-11 w-6 items-center justify-center focus:outline-none"
                aria-label={`نمایش اسلاید شماره ${index + 1}`}
              >
                <span
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300 block',
                    index === currentIndex ? 'w-5 bg-primary' : 'w-1.5 bg-white/60 hover:bg-white'
                  )}
                />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );

  if (currentSlide?.targetURL) {
    const rawUrl = currentSlide.targetURL.trim();
    const isInternal = rawUrl.startsWith('/') || rawUrl.startsWith('#');
    const href = isInternal ? rawUrl : rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

    return (
      <Link
        href={href}
        target={isInternal ? '_self' : '_blank'}
        rel={isInternal ? undefined : 'noopener noreferrer'}
        aria-label={currentSlide.title || 'اسلاید بنر'}
        className={cn('block h-full w-full', className)}
        onClick={() => bannerTracker.trackClick(currentSlide.id)}
      >
        {slideContent}
      </Link>
    );
  }

  return <div className={cn('h-full w-full', className)}>{slideContent}</div>;
}