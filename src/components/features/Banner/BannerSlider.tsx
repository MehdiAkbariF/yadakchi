// src/components/features/Banner/BannerSlider.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { BannerGroup, BannerItem } from './Banner';

interface BannerSliderProps {
  group?: BannerGroup;
  className?: string;
  autoPlayInterval?: number;
  aspectRatio?: string;
}

export function BannerSlider({ 
  group, 
  className, 
  autoPlayInterval = 5000,
  aspectRatio = 'aspect-[16/9] lg:aspect-[16/7]'
}: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // هوک ۱: ثبت وضعیت مانت شدن کلاینت در اولین خطوط
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getFullUrl = (path: string) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const desktopSlides = group?.banners ? group.banners.filter((b) => b.size === 'Desktop') : [];
  const mobileSlides = group?.banners ? group.banners.filter((b) => b.size === 'Mobile') : [];

  // محاسبه اسلایدهای فعال بر اساس درگاه مرورگر با تضمین پایداری در SSR
  const activeSlides = isMounted && typeof window !== 'undefined' && window.innerWidth < 768 
    ? (mobileSlides.length > 0 ? mobileSlides : desktopSlides)
    : (desktopSlides.length > 0 ? desktopSlides : mobileSlides);

  const totalSlides = activeSlides.length;

  // هوک ۲: ثانیه‌شمار تغییر اسلایدها (unconditional - بدون شرط خروج زودهنگام قبل از هوک)
  useEffect(() => {
    if (!isMounted || totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [totalSlides, autoPlayInterval, isMounted]);

  // کنترل موارد استثنای داده‌های خالی
  if (!group || !group.banners || group.banners.length === 0) return null;

  // ۲. رندر خروجی استاتیک سرور (SSR) پس از اجرای تمامی هوک‌ها
  if (!isMounted) {
    const initialSlide = desktopSlides[0] || group.banners[0];
    if (!initialSlide) return null;

    const initialElement = (
      <div className={cn("relative w-full overflow-hidden rounded-2xl shadow-sm", aspectRatio)}>
        <img
          src={getFullUrl(initialSlide.image)}
          alt={initialSlide.imageAlt || initialSlide.title}
          className="w-full h-full object-cover rounded-2xl absolute inset-0"
        />
      </div>
    );

    if (initialSlide.targetURL) {
      const href = initialSlide.targetURL.startsWith('http') ? initialSlide.targetURL : `https://${initialSlide.targetURL}`;
      return (
        <Link href={href} target="_blank" rel="noopener noreferrer" className={cn("block w-full h-full", className)}>
          {initialElement}
        </Link>
      );
    }
    return <div className={cn("w-full h-full", className)}>{initialElement}</div>;
  }

  // ۳. رندر داینامیک کلاینت مجهز به Framer Motion
  if (totalSlides === 0) return null;
  const currentSlide = activeSlides[currentIndex];
  if (!currentSlide) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const slideElement = (
    <div className={cn("relative w-full overflow-hidden rounded-2xl shadow-sm", aspectRatio)}>
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSlide.id}
          src={getFullUrl(currentSlide.image)}
          alt={currentSlide.imageAlt || currentSlide.title}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35 }}
          className="w-full h-full object-cover rounded-2xl absolute inset-0"
        />
      </AnimatePresence>

      {totalSlides > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); handlePrev(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-colors z-10"
            aria-label="اسلاید قبلی"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); handleNext(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-colors z-10"
            aria-label="اسلاید بعدی"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {activeSlides.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.preventDefault(); setCurrentIndex(index); }}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentIndex ? "w-6 bg-primary" : "w-2 bg-white/50"
                )}
                aria-label={`رفتن به اسلاید ${index + 1}`}
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
      <Link href={href} target="_blank" rel="noopener noreferrer" className={cn("block w-full h-full", className)}>
        {slideElement}
      </Link>
    );
  }

  return <div className={cn("w-full h-full", className)}>{slideElement}</div>;
}