'use client';

import * as React from 'react';
import Link from 'next/link';
import { Settings, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useGetPartCategoriesFlat } from '@/domains/front/part/hooks/part.hooks';
import { Typography } from '@/components/primitives/Typography';
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';
import { cn } from '@/design-system/utils/cn';
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

  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [dragWidth, setDragWidth] = React.useState(0);
  const x = useMotionValue(0);
  const isDraggingRef = React.useRef(false);

  const categories = (rawCategories as PartCategoryItem[]).filter(
    (cat) => cat.name && cat.name.trim() !== '' && cat.englishTitle !== 'asd'
  );

  const mobileCategories = categories.slice(0, 7);

  React.useEffect(() => {
    if (carouselRef.current) {
      const scrollW = carouselRef.current.scrollWidth;
      const offsetW = carouselRef.current.offsetWidth;
      setDragWidth(Math.max(0, scrollW - offsetW));
    }
  }, [categories]);

  // در RTL: اسکرول به راست x را کم می‌کند، اسکرول به چپ x را زیاد می‌کند
  const handleScroll = (direction: 'left' | 'right') => {
    const step = 340;
    let newX = x.get() + (direction === 'left' ? step : -step);
    if (newX < 0) newX = 0;
    if (newX > dragWidth) newX = dragWidth;
    animate(x, newX, { type: 'spring', stiffness: 220, damping: 28 });
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6 py-6">
        <Typography variant="h5" className="text-center font-bold text-foreground">
          خرید بر اساس دسته‌بندی قطعات
        </Typography>
        <div className="grid grid-cols-4 gap-x-2 gap-y-6 px-3 md:hidden">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <Skeleton variant="circle" className="h-16 w-16 sm:h-20 sm:w-20" />
              <Skeleton variant="text" className="h-3 w-12" />
            </div>
          ))}
        </div>
        <div className="hidden justify-center gap-8 overflow-hidden px-12 py-2 md:flex">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="flex w-28 shrink-0 flex-col items-center gap-3">
              <Skeleton variant="circle" className="h-24 w-24" />
              <Skeleton variant="text" className="h-3.5 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || categories.length === 0) return null;

  return (
    <div className="w-full select-none space-y-6 py-6">
      <Typography
        variant="h5"
        className="text-center text-base font-bold text-foreground sm:text-xl"
      >
        خرید بر اساس دسته‌بندی قطعات
      </Typography>

      {/* نمای موبایل */}
      <div className="grid grid-cols-4 gap-x-2 gap-y-6 px-2 sm:px-4 md:hidden">
        {mobileCategories.map((cat) => {
          const href = `/part-category/${cat.englishTitle}`;
          const imageSrc = cat.thumbnail || cat.icon;

          return (
            <Link
              key={cat.id}
              href={href}
              className="group/cat flex flex-col items-center text-center"
            >
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-border/80 bg-card p-2 shadow-xs transition-colors group-hover/cat:border-primary/50 sm:h-20 sm:w-20">
                {imageSrc ? (
                  <img
                    src={getFullUrl(imageSrc)}
                    alt={cat.thumbnailAlt || cat.name}
                    className="h-full w-full rounded-full object-contain drop-shadow-sm"
                    loading="lazy"
                  />
                ) : (
                  <Settings aria-hidden="true" className="h-7 w-7 text-muted-foreground" />
                )}

                {cat.hasDiscount ? (
                  <span className="pointer-events-none absolute -bottom-2 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-2xs font-bold text-primary-foreground shadow-xs rtl:translate-x-1/2">
                    تخفیف ویژه
                  </span>
                ) : null}
              </div>

              <span className="mt-3 flex min-h-[28px] items-center justify-center text-2xs font-bold leading-tight text-foreground line-clamp-2">
                {cat.name}
              </span>
            </Link>
          );
        })}

        <Link href="/categories" className="flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-border/80 bg-card shadow-xs transition-colors hover:border-primary/50 sm:h-20 sm:w-20">
            <MoreHorizontal aria-hidden="true" className="h-7 w-7 text-muted-foreground" />
          </div>
          <span className="mt-3 flex min-h-[28px] items-center justify-center text-2xs font-bold leading-tight text-foreground line-clamp-2">
            سایر دسته‌ها
          </span>
        </Link>
      </div>

      {/* نمای دسکتاپ */}
      <div className="relative hidden w-full md:block">
        {categories.length > 6 ? (
          <>
            {/* دکمه سمت راست (شروع در RTL): رفتن به دسته‌های قبلی */}
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="absolute start-3 top-12 z-20 -translate-y-1/2 cursor-pointer rounded-full border border-border/80 bg-card p-2.5 text-foreground shadow-md transition-all duration-fast hover:border-primary/50 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="دسته‌بندی‌های قبلی"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>

            {/* دکمه سمت چپ (پایان در RTL): رفتن به دسته‌های بعدی */}
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="absolute end-3 top-12 z-20 -translate-y-1/2 cursor-pointer rounded-full border border-border/80 bg-card p-2.5 text-foreground shadow-md transition-all duration-fast hover:border-primary/50 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="دسته‌بندی‌های بعدی"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>
          </>
        ) : null}

        <div ref={carouselRef} className="relative z-10 w-full overflow-hidden">
          <motion.div
            drag="x"
            style={{ x }}
            dragConstraints={{ left: 0, right: dragWidth }}
            dragElastic={0.12}
            dragMomentum
            onDragStart={() => {
              isDraggingRef.current = true;
            }}
            onDragEnd={() => {
              setTimeout(() => {
                isDraggingRef.current = false;
              }, 80);
            }}
            className="flex cursor-grab justify-start gap-8 px-14 py-2 active:cursor-grabbing"
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
                  className="group/cat flex w-28 shrink-0 cursor-pointer flex-col items-center text-center"
                >
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-border/80 bg-card p-2.5 shadow-xs transition-all duration-fast group-hover/cat:border-primary/50 group-hover/cat:shadow-sm">
                    {imageSrc ? (
                      <img
                        src={getFullUrl(imageSrc)}
                        alt={cat.thumbnailAlt || cat.name}
                        draggable={false}
                        className="pointer-events-none h-full w-full rounded-full object-contain drop-shadow-sm transition-transform duration-fast group-hover/cat:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <Settings
                        aria-hidden="true"
                        className="h-9 w-9 text-muted-foreground transition-transform duration-fast group-hover/cat:rotate-45"
                      />
                    )}

                    {cat.hasDiscount ? (
                      <span className="pointer-events-none absolute -bottom-2.5 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2.5 py-0.5 text-2xs font-bold text-primary-foreground shadow-xs rtl:translate-x-1/2">
                        تخفیف ویژه
                      </span>
                    ) : null}
                  </div>

                  <span className="mt-3.5 flex min-h-[34px] items-center justify-center text-xs font-semibold leading-relaxed text-muted-foreground line-clamp-2 transition-colors group-hover/cat:text-foreground">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}