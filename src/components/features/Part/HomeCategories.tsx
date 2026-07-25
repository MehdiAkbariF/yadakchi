'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useGetPartCategoriesFlat } from '@/domains/front/part/hooks/part.hooks';
import { Typography } from '@/components/primitives/Typography';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';

interface PartCategoryItem {
  id: string;
  name: string;
  englishTitle: string;
  thumbnail: string | null;
  thumbnailAlt: string | null;
  icon: string | null;
  iconAlt: string | null;
  hasDiscount: boolean;
  isInMain: boolean;
}

export function HomeCategories() {
  const { data: categories = [], isLoading, isError } = useGetPartCategoriesFlat();
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setWidth] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const x = useMotionValue(0);

  const activeCategories = categories.filter((cat: PartCategoryItem) => cat.isInMain === true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [activeCategories]);

  const handleScroll = (direction: 'left' | 'right') => {
    const step = 350; 
    let newX = x.get() + (direction === 'right' ? -step : step);
    
    if (newX < 0) newX = 0;
    if (newX > dragWidth) newX = dragWidth;

    animate(x, newX, { type: 'spring', stiffness: 200, damping: 30 });
  };

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-5 py-4">
        <Typography variant="h5" className="font-iran-yekan font-bold text-center text-foreground/90">
          خرید بر اساس دسته‌بندی قطعات
        </Typography>
        <div className="w-full flex gap-6 sm:gap-8 px-4 md:px-12 py-2 overflow-hidden justify-center">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex flex-col items-center shrink-0 w-24 sm:w-28 gap-3.5 animate-in fade-in duration-300">
              <Skeleton variant="circle" className="w-20 h-20 sm:w-24 sm:h-24" />
              <Skeleton variant="text" className="w-16 h-3.5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-6 text-xs text-destructive font-iran-sans">
        خطا در دریافت اطلاعات دسته‌بندی قطعات از سرور اصلی.
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 py-4">
      <Typography variant="h5" className="font-iran-yekan font-bold text-center text-foreground/90">
        خرید بر اساس دسته‌بندی قطعات
      </Typography>

      {!isLoading && !isError && activeCategories.length > 0 && (
        <div className="relative w-full group">
          
          {activeCategories.length > 5 && (
            <button
              onClick={() => handleScroll('right')}
              className="hidden md:flex absolute right-0 top-12 -translate-y-1/2 z-10 p-2 rounded-full border bg-background/80 hover:bg-primary/10 text-foreground hover:text-primary backdrop-blur-sm transition-all shadow-sm outline-none cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          <div 
            ref={carouselRef}
            className="w-full overflow-hidden relative z-10 select-none"
          >
            <motion.div 
              drag="x"
              style={{ x }}
              dragConstraints={{ left: 0, right: dragWidth }}
              dragElastic={0.12} 
              className="flex gap-6 sm:gap-8 px-4 md:px-12 py-2 cursor-grab active:cursor-grabbing"
            >
              {activeCategories.map((cat: PartCategoryItem) => {
                const href = `/part-category/${cat.englishTitle}`;
                const imageSrc = cat.thumbnail || cat.icon;
                
                return (
                  <Link 
                    key={cat.id} 
                    href={href} 
                    className="flex flex-col items-center shrink-0 w-24 sm:w-28 group select-none text-center"
                    onClick={(e) => {
                      if (x.getVelocity() !== 0) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-border p-1 bg-background shadow-sm group-hover:border-primary/50 group-hover:scale-105 transition-all duration-300">
                      
                      {imageSrc ? (
                        <img
                          src={getFullUrl(imageSrc)}
                          alt={cat.thumbnailAlt || cat.name}
                          className="w-full h-full object-cover rounded-full"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center text-primary group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
                          <Settings className="h-8 w-8 sm:h-10 sm:w-10 stroke-[1.5]" />
                        </div>
                      )}

                      {cat.hasDiscount && (
                        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-destructive text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                          تخفیف ویژه
                        </span>
                      )}
                    </div>

                    <span className="text-xs sm:text-sm font-bold font-iran-sans text-foreground/85 group-hover:text-primary transition-colors mt-3.5 leading-relaxed line-clamp-2">
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </motion.div>
          </div>

          {activeCategories.length > 5 && (
            <button
              onClick={() => handleScroll('left')}
              className="hidden md:flex absolute left-0 top-12 -translate-y-1/2 z-10 p-2 rounded-full border bg-background/80 hover:bg-primary/10 text-foreground hover:text-primary backdrop-blur-sm transition-all shadow-sm outline-none cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

        </div>
      )}
    </div>
  );
}