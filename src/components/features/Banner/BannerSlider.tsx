'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

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
  aspectRatio = 'aspect-[16/9] md:aspect-[16/7.5] lg:aspect-[16/7]'
}: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

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

  if (!group || !group.banners || group.banners.length === 0) return null;

  const slides = group.banners;
  const totalSlides = slides.length;

  useEffect(() => {
    if (!isMounted || totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [totalSlides, autoPlayInterval, isMounted]);

  if (!isMounted) {
    const initialSlide = slides[0];
    return (
      <div className={cn("relative w-full overflow-hidden rounded-2xl shadow-sm", aspectRatio, className)}>
        <img
          src={getFullUrl(initialSlide.image)}
          alt={initialSlide.imageAlt || initialSlide.title}
          className="w-full h-full object-cover rounded-2xl absolute inset-0"
        />
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

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
            onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-colors z-10"
            aria-label="Previous Slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev + 1) % totalSlides); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-colors z-10"
            aria-label="Next Slide"
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
                aria-label={`Go to slide ${index + 1}`}
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