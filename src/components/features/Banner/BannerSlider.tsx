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

interface BaseSliderProps {
  slides: any[];
  autoPlayInterval: number;
  aspectRatio: string;
  className?: string;
}

function BaseSlider({ slides, autoPlayInterval, aspectRatio, className }: BaseSliderProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalSlides = slides.length;

  React.useEffect(() => {
    if (!isMounted || totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [totalSlides, autoPlayInterval, isMounted]);

  const currentSlide = slides[currentIndex];
  const slideImpressionRef = useBannerImpression(currentSlide?.id || null);

  if (totalSlides === 0) return null;

  if (!isMounted) {
    const initialSlide = slides[0];
    return (
      <div className={cn('relative w-full overflow-hidden rounded-xl shadow-xs', aspectRatio, className)}>
        <Image
          src={getFullUrl(initialSlide.image)}
          alt={initialSlide.imageAlt || initialSlide.title}
          fill
          priority
          sizes="100vw"
          className="rounded-xl object-cover"
        />
      </div>
    );
  }

  const slideElement = (
    <div
      ref={slideImpressionRef}
      className={cn('relative w-full overflow-hidden rounded-xl shadow-xs', aspectRatio)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 h-full w-full"
        >
          <Image
            src={getFullUrl(currentSlide.image)}
            alt={currentSlide.imageAlt || currentSlide.title}
            fill
            priority={currentIndex === 0}
            sizes="100vw"
            className="rounded-xl object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {totalSlides > 1 ? (
        <>
          {/* دکمه سمت راست (شروع در RTL): رفتن به اسلاید قبلی */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
            }}
            className="absolute start-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/35 p-2 text-white backdrop-blur-md transition-all duration-fast hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="اسلاید قبلی بنر"
          >
            <ChevronRight aria-hidden="true" className="h-5 w-5" />
          </button>

          {/* دکمه سمت چپ (پایان در RTL): رفتن به اسلاید بعدی */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % totalSlides);
            }}
            className="absolute end-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/35 p-2 text-white backdrop-blur-md transition-all duration-fast hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="اسلاید بعدی بنر"
          >
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          </button>

          {/* نشانگرهای نقطه‌ای پایین اسلایدر */}
          <div className="absolute bottom-4 start-1/2 z-10 flex -translate-x-1/2 gap-1.5 rtl:translate-x-1/2">
            {slides.map((_: any, index: number) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={cn(
                  'h-2 rounded-full transition-all duration-normal',
                  index === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-white/50 hover:bg-white/80'
                )}
                aria-label={`نمایش اسلاید شماره ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );

  if (currentSlide.targetURL) {
    const href = currentSlide.targetURL.startsWith('http')
      ? currentSlide.targetURL
      : `https://${currentSlide.targetURL}`;
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={currentSlide.title || currentSlide.imageAlt || 'اسلاید بنر تبلیغاتی'}
        className={cn('block h-full w-full', className)}
        onClick={() => bannerTracker.trackClick(currentSlide.id)}
      >
        {slideElement}
      </Link>
    );
  }

  return <div className={cn('h-full w-full', className)}>{slideElement}</div>;
}

export function BannerSlider({
  group,
  className,
  autoPlayInterval = 5000,
  aspectRatio = 'aspect-[16/9] md:aspect-[16/7.5] lg:aspect-[16/7]',
}: BannerSliderProps) {
  if (!group || !group.banners || group.banners.length === 0) return null;

  const desktopSlides = group.banners.filter((b: any) => b.size === 'Desktop');
  const mobileSlides = group.banners.filter((b: any) => b.size === 'Mobile');

  const finalDesktopSlides = desktopSlides.length > 0 ? desktopSlides : group.banners;
  const finalMobileSlides = mobileSlides.length > 0 ? mobileSlides : group.banners;

  return (
    <div className="h-full w-full">
      <div className="hidden h-full w-full md:block">
        <BaseSlider
          slides={finalDesktopSlides}
          autoPlayInterval={autoPlayInterval}
          aspectRatio={aspectRatio}
          className={className}
        />
      </div>

      <div className="block h-full w-full md:hidden">
        <BaseSlider
          slides={finalMobileSlides}
          autoPlayInterval={autoPlayInterval}
          aspectRatio={aspectRatio}
          className={className}
        />
      </div>
    </div>
  );
}