// c:\Users\Raven\final-projects\yadakchi-front\yadakchi\src\components\features\Part\HomeCategories.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useGetPartCategoriesFlat } from '@/domains/front/part/hooks/part.hooks';
import { Typography } from '@/components/primitives/Typography';
import { ChevronLeft, ChevronRight, Settings, MoreHorizontal } from 'lucide-react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';
import { getFullUrl } from '@/core/utils/formatters';

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
  const { data: rawCategories = [], isLoading, isError } = useGetPartCategoriesFlat();

  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setWidth] = useState(0);
  const x = useMotionValue(0);
  const isDraggingRef = useRef(false);

  // پاکسازی دیتای تست
  const categories = (rawCategories as PartCategoryItem[]).filter(
    (cat) => cat.name && cat.name.trim() !== '' && cat.englishTitle !== 'asd'
  );

  // انتخاب ۷ دسته‌بندی برتر برای گرید موبایل
  const mobileCategories = categories.slice(0, 7);

  // محاسبه حداکثر بازه حرکت اسلایدر دسکتاپ
  useEffect(() => {
    if (carouselRef.current) {
      const scrollW = carouselRef.current.scrollWidth;
      const offsetW = carouselRef.current.offsetWidth;
      setWidth(Math.max(0, scrollW - offsetW));
    }
  }, [categories]);

  // کنترل ناوبری با دکمه‌ها
  const handleScroll = (direction: 'left' | 'right') => {
    const step = 340;
    let newX = x.get() + (direction === 'right' ? -step : step);

    if (newX < 0) newX = 0;
    if (newX > dragWidth) newX = dragWidth;

    animate(x, newX, { type: 'spring', stiffness: 220, damping: 28 });
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6 py-6">
        <Typography variant="h5" className="font-iran-yekan font-bold text-center text-foreground/90">
          خرید بر اساس دسته‌بندی قطعات
        </Typography>
        {/* اسکلتون موبایل */}
        <div className="grid grid-cols-4 gap-y-6 gap-x-2 px-3 md:hidden">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <Skeleton variant="circle" className="w-16 h-16 sm:w-20 sm:h-20" />
              <Skeleton variant="text" className="w-12 h-3" />
            </div>
          ))}
        </div>
        {/* اسکلتون دسکتاپ */}
        <div className="hidden md:flex gap-8 px-12 py-2 overflow-hidden justify-center">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="flex flex-col items-center shrink-0 w-28 gap-3">
              <Skeleton variant="circle" className="w-24 h-24" />
              <Skeleton variant="text" className="w-16 h-3.5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || categories.length === 0) return null;

  return (
    <div className="w-full space-y-6 py-6 select-none font-iran-yekan">
      <Typography
        variant="h5"
        className="font-iran-yekan font-black text-center text-foreground/90 text-base sm:text-xl"
      >
        خرید بر اساس دسته‌بندی قطعات
      </Typography>

      {/* =========================================================================
          ۱. نسخه موبایل: گرید دو ردیفه + آیتم هشتم "سایر دسته‌ها"
          ========================================================================= */}
      <div className="grid grid-cols-4 gap-y-6 gap-x-2 px-2 sm:px-4 md:hidden">
        {mobileCategories.map((cat) => {
          const href = `/part-category/${cat.englishTitle}`;
          const imageSrc = cat.thumbnail || cat.icon;

          return (
            <Link
              key={cat.id}
              href={href}
              className="flex flex-col items-center group/cat text-center"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#f4ece6] dark:bg-zinc-800 p-2 flex items-center justify-center transition-transform active:scale-95 shadow-xs">
                {imageSrc ? (
                  <img
                    src={getFullUrl(imageSrc)}
                    alt={cat.thumbnailAlt || cat.name}
                    className="w-full h-full object-contain rounded-full drop-shadow-sm"
                    loading="lazy"
                  />
                ) : (
                  <Settings className="h-7 w-7 text-zinc-400 stroke-[1.5]" />
                )}

                {/* لیبل نارنجی تخفیف ویژه برای موبایل */}
                {cat.hasDiscount && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#f04812] text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm pointer-events-none">
                    تخفیف ویژه
                  </span>
                )}
              </div>

              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mt-3 leading-tight line-clamp-2 min-h-[28px] flex items-center justify-center">
                {cat.name}
              </span>
            </Link>
          );
        })}

        {/* دکمه هشتم در موبایل: سایر دسته‌ها با ارجاع به /categories */}
        <Link
          href="/categories"
          className="flex flex-col items-center text-center"
        >
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#f4ece6] dark:bg-zinc-800 flex items-center justify-center transition-transform active:scale-95 hover:bg-[#ebdcd3] shadow-xs">
            <MoreHorizontal className="h-7 w-7 text-zinc-500 dark:text-zinc-400" />
          </div>
          <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mt-3 leading-tight line-clamp-2 min-h-[28px] flex items-center justify-center">
            سایر دسته‌ها
          </span>
        </Link>
      </div>

      {/* =========================================================================
          ۲. نسخه دسکتاپ: حذف group از کانتینر بیرونی جهت عدم تداخل هاور آیتم‌ها
          ========================================================================= */}
      <div className="hidden md:block relative w-full">
        {/* دکمه حرکت به راست */}
        {categories.length > 6 && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-3 top-12 -translate-y-1/2 z-20 p-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-all shadow-md outline-none cursor-pointer"
            aria-label="Previous"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        <div ref={carouselRef} className="w-full overflow-hidden relative z-10">
          <motion.div
            drag="x"
            style={{ x }}
            dragConstraints={{ left: 0, right: dragWidth }}
            dragElastic={0.12}
            dragMomentum={true}
            onDragStart={() => {
              isDraggingRef.current = true;
            }}
            onDragEnd={() => {
              setTimeout(() => {
                isDraggingRef.current = false;
              }, 80);
            }}
            className="flex gap-8 px-14 py-2 cursor-grab active:cursor-grabbing justify-start"
          >
            {categories.map((cat) => {
              const href = `/part-category/${cat.englishTitle}`;
              const imageSrc = cat.thumbnail || cat.icon;

              return (
                <Link
                  key={cat.id}
                  href={href}
                  draggable={false}
                  onClick={(e) => {
                    if (isDraggingRef.current) e.preventDefault();
                  }}
                  className="flex flex-col items-center shrink-0 w-28 group/cat text-center cursor-pointer"
                >
                  {/* دایره تصویر قطعه - فقط با هاور روی این آیتم زوم می‌شود */}
                  <div className="relative w-24 h-24 rounded-full bg-[#f4ece6] dark:bg-zinc-800 p-2.5 flex items-center justify-center shadow-xs transition-transform duration-300 ease-out group-hover/cat:scale-105">
                    {imageSrc ? (
                      <img
                        src={getFullUrl(imageSrc)}
                        alt={cat.thumbnailAlt || cat.name}
                        draggable={false}
                        className="w-full h-full object-contain rounded-full transition-transform duration-300 group-hover/cat:scale-110 pointer-events-none drop-shadow-sm"
                        loading="lazy"
                      />
                    ) : (
                      <Settings className="h-9 w-9 text-zinc-400 group-hover/cat:text-black dark:group-hover/cat:text-white transition-colors stroke-[1.5]" />
                    )}

                    {/* لیبل نارنجی تخفیف ویژه مطابق تصویر پیوست */}
                    {cat.hasDiscount && (
                      <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#f04812] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm pointer-events-none">
                        تخفیف ویژه
                      </span>
                    )}
                  </div>

                  {/* عنوان دسته‌بندی - واکنش رنگ و فونت فقط برای آیتم هاور شده */}
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover/cat:text-black dark:group-hover/cat:text-white group-hover/cat:font-extrabold transition-all duration-200 mt-3.5 line-clamp-2 min-h-[34px] flex items-center justify-center leading-relaxed">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        </div>

        {/* دکمه حرکت به چپ */}
        {categories.length > 6 && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-3 top-12 -translate-y-1/2 z-20 p-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-all shadow-md outline-none cursor-pointer"
            aria-label="Next"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}