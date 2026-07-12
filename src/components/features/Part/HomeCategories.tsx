// src/components/features/Part/HomeCategories.tsx

'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useGetPartCategoriesFlat } from '@/domains/front/part/hooks/part.hooks';
import { Typography } from '@/components/primitives/Typography';
import { Loader2, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

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
  // واکشی داده‌های دسته بندی مجهز به فیلدهای تصاویر و تخفیف
  const { data: categories = [], isLoading, isError } = useGetPartCategoriesFlat();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // فیلتر داینامیک دسته‌بندی‌ها فقط بر اساس تاییدیه isInMain دیتابیس شما
  const activeCategories = categories.filter((cat: PartCategoryItem) => cat.isInMain === true);

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollOffset = clientWidth * 0.7;
      const offset = direction === 'left' ? -scrollOffset : scrollOffset;
      
      scrollContainerRef.current.scrollBy({
        left: offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full space-y-5 py-4">
      {/* عنوان بخش دسته‌بندی قطعات */}
      <Typography variant="h5" className="font-iran-yekan font-bold text-center text-foreground/90">
        خرید بر اساس دسته‌بندی قطعات
      </Typography>

      {/* نمایش لودینگ */}
      {isLoading && (
        <div className="w-full flex items-center justify-center py-8 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-xs font-iran-sans">در حال بارگذاری دسته‌بندی‌های دیتابیس...</span>
        </div>
      )}

      {/* نمایش خطا */}
      {isError && (
        <div className="text-center py-6 text-xs text-destructive font-iran-sans">
          خطا در دریافت اطلاعات دسته‌بندی قطعات از سرور اصلی.
        </div>
      )}

      {/* رندرسازی اسلایدی کاملاً داینامیک دسته‌بندی‌های واقعی */}
      {!isLoading && !isError && activeCategories.length > 0 && (
        <div className="relative w-full group">
          
          {/* دکمه اسلاید راست */}
          {activeCategories.length > 5 && (
            <button
              onClick={() => handleScroll('right')}
              className="hidden md:flex absolute right-0 top-12 -translate-y-1/2 z-10 p-2 rounded-full border bg-background/80 hover:bg-primary/10 text-foreground hover:text-primary backdrop-blur-sm transition-all shadow-sm outline-none cursor-pointer"
              aria-label="اسلاید بعدی"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* کانتینر اسلایدی لمسی و شیک بدون اسکرول‌بار مرورگر */}
          <div 
            ref={scrollContainerRef}
            className="w-full overflow-x-auto scroll-smooth no-scrollbar"
          >
            <div className="flex flex-nowrap items-start gap-6 sm:gap-8 px-4 md:px-12 py-2">
              {activeCategories.map((cat: PartCategoryItem) => {
                const href = `/categories/${cat.englishTitle}`;
                const imageSrc = cat.thumbnail || cat.icon;
                
                return (
                  <Link 
                    key={cat.id} 
                    href={href} 
                    className="flex flex-col items-center shrink-0 w-24 sm:w-28 group select-none text-center"
                  >
                    {/* تصویر دایره‌ای واقعی دسته‌بندی از دیتابیس شما */}
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

                      {/* نمایش برچسب واقعی تخفیف ویژه در صورت True بودن فیلد hasDiscount سرور */}
                      {cat.hasDiscount && (
                        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-destructive text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                          تخفیف ویژه
                        </span>
                      )}
                    </div>

                    {/* نام واقعی دسته‌بندی دیتابیس */}
                    <span className="text-xs sm:text-sm font-bold font-iran-sans text-foreground/85 group-hover:text-primary transition-colors mt-3.5 leading-relaxed line-clamp-2">
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* دکمه اسلاید چپ */}
          {activeCategories.length > 5 && (
            <button
              onClick={() => handleScroll('left')}
              className="hidden md:flex absolute left-0 top-12 -translate-y-1/2 z-10 p-2 rounded-full border bg-background/80 hover:bg-primary/10 text-foreground hover:text-primary backdrop-blur-sm transition-all shadow-sm outline-none cursor-pointer"
              aria-label="اسلاید قبلی"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

        </div>
      )}
    </div>
  );
}