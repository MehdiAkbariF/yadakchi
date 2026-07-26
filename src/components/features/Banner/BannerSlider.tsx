'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { useBannerImpression } from '@/shared/hooks/useBannerImpression'; // هوک بازدید
import { bannerTracker } from '@/core/utils/banner-tracker'; // ترکر کلیک

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalSlides = slides.length;

  useEffect(() => {
    if (!isMounted || totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [totalSlides, autoPlayInterval, isMounted]);

  const currentSlide = slides[currentIndex];
  
  // لود وضعیت ناظر بر اساس شناسه بنر اسلاید اکتیو فعلی
  const slideImpressionRef = useBannerImpression(currentSlide?.id || null);

  const getFullUrl = (path: string) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  if (totalSlides === 0) return null;

  if (!isMounted) {
    const initialSlide = slides[0];
    return (
      <div className={cn("relative w-full overflow-hidden rounded-2xl shadow-sm", aspectRatio, className)}>
        <Image
          src={getFullUrl(initialSlide.image)}
          alt={initialSlide.imageAlt || initialSlide.title}
          fill
          priority={true}
          sizes="100vw"
          className="object-cover rounded-2xl"
        />
      </div>
    );
  }

  const slideElement = (
    /* 
      انتقال هوشمند رفرنس ناظر (slideImpressionRef) به تگ نگهدارنده ثابت بیرونی کلِ اسلایدر.
      این کار مانع از صدور هشدارهای شبیه‌ساز انیمیشنِ AnimatePresence در کپی کردن رفرنس‌ها می‌شود.
    */
    <div 
      ref={slideImpressionRef}
      className={cn("relative w-full overflow-hidden rounded-2xl shadow-sm", aspectRatio)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={getFullUrl(currentSlide.image)}
            alt={currentSlide.imageAlt || currentSlide.title}
            fill
            priority={currentIndex === 0}
            sizes="100vw"
            className="object-cover rounded-2xl"
          />
        </motion.div>
      </AnimatePresence>

      {totalSlides > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-colors z-10"
            aria-label="اسلاید قبلی بنر"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev + 1) % totalSlides); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-colors z-10"
            aria-label="اسلاید بعدی بنر"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((_: any, index: number) => (
              <button
                key={index}
                onClick={(e) => { e.preventDefault(); setCurrentIndex(index); }}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentIndex ? "w-6 bg-primary" : "w-2 bg-white/50"
                )}
                aria-label={`نمایش اسلاید شماره ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  if (currentSlide.targetURL) {
    const href = currentSlide.targetURL.startsWith('http') ? currentSlide.targetURL : `https://${currentSlide.targetURL}`;
    return (
      <Link 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label={currentSlide.title || currentSlide.imageAlt || "اسلاید بنر تبلیغاتی"}
        className={cn("block w-full h-full", className)}
        onClick={() => bannerTracker.trackClick(currentSlide.id)} // ثبت رویداد کلیک
      >
        {slideElement}
      </Link>
    );
  }

  return <div className={cn("w-full h-full", className)}>{slideElement}</div>;
}

export function BannerSlider({ 
  group, 
  className, 
  autoPlayInterval = 5000,
  aspectRatio = 'aspect-[16/9] md:aspect-[16/7.5] lg:aspect-[16/7]'
}: BannerSliderProps) {
  if (!group || !group.banners || group.banners.length === 0) return null;

  const desktopSlides = group.banners.filter((b: any) => b.size === 'Desktop');
  const mobileSlides = group.banners.filter((b: any) => b.size === 'Mobile');

  const finalDesktopSlides = desktopSlides.length > 0 ? desktopSlides : group.banners;
  const finalMobileSlides = mobileSlides.length > 0 ? mobileSlides : group.banners;

  return (
    <div className="w-full h-full">
      <div className="hidden md:block w-full h-full">
        <BaseSlider 
          slides={finalDesktopSlides} 
          autoPlayInterval={autoPlayInterval} 
          aspectRatio={aspectRatio} 
          className={className}
        />
      </div>
      
      <div className="block md:hidden w-full h-full">
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