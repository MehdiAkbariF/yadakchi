// src/components/features/ProductCard/ProductSlider.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { ProductStandardCard } from './ProductStandardCard';
import { SliderSkeleton } from './SliderSkeleton';
import { cn } from '@/design-system/utils/cn';
import { toPersianDigits } from '@/core/utils/formatters';

export interface ProductSliderProps {
  title: string;
  products: any[];
  isLoading: boolean;
  isError: boolean;
  viewAllLink?: string;
  className?: string;
  showTimer?: boolean;
  totalSalesCount?: number;
  customIcon?: React.ReactNode;
}

export function ProductSlider({
  title,
  products = [],
  isLoading,
  isError,
  viewAllLink = '#',
  className,
  totalSalesCount,
  customIcon,
}: ProductSliderProps) {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [dragWidth, setDragWidth] = React.useState(0);
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    if (carouselRef.current) {
      setDragWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [products]);

  const handleScroll = (direction: 'left' | 'right') => {
    const step = 450;
    let newX = x.get() + (direction === 'left' ? step : -step);
    if (newX < 0) newX = 0;
    if (newX > dragWidth) newX = dragWidth;
    animate(x, newX, { type: 'spring', stiffness: 200, damping: 30 });
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setTimeout(() => {
      setIsDragging(false);
    }, 50);
  };

  const handleDragClickCapture = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (isLoading) {
    return <SliderSkeleton title={title} />;
  }

  if (isError || products.length === 0) return null;

  return (
    <div className={cn('flex w-full flex-col space-y-4 py-4', className)}>
      {/* هدر اسلایدر */}
      <div className="flex w-full items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          {customIcon ? (
            customIcon
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wrench aria-hidden="true" className="h-4 w-4 shrink-0" />
            </div>
          )}
          <div className="flex items-center gap-2">
            {/* تیتر سمانتیک h3 برای حفظ سلسله‌مراتب تیترهای لایت‌هاوس */}
            <h3 className="font-bold text-foreground text-base sm:text-lg">
              {title}
            </h3>
            {totalSalesCount !== undefined && totalSalesCount > 0 && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-label-2xs tabular-nums">
                {toPersianDigits(totalSalesCount)} کالا
              </span>
            )}
          </div>
        </div>

        {/* دکمه مشاهده همه */}
        <Link
          href={viewAllLink}
          prefetch={false}
          className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-info/90 transition-colors hover:text-info/90 dark:text-info/90 sm:text-sm"
        >
          <span>مشاهده همه</span>
          <ChevronLeft aria-hidden="true" className="h-4 w-4 stroke-[2.25] transition-transform duration-fast group-hover:-translate-x-1" />
        </Link>
      </div>

      {/* کانتینر اسلایدر */}
      <div className="group relative w-full overflow-hidden rounded-xl border border-border/70 bg-card p-4 shadow-xs">
        {products.length > 4 ? (
          <>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="absolute start-3 top-1/2 z-20 hidden -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-card p-3 text-foreground shadow-md transition-all duration-fast hover:border-primary/50 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
              aria-label="محصولات قبلی"
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="absolute end-3 top-1/2 z-20 hidden -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-card p-3 text-foreground shadow-md transition-all duration-fast hover:border-primary/50 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
              aria-label="محصولات بعدی"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
          </>
        ) : null}

        <div ref={carouselRef} className="relative z-10 w-full select-none overflow-hidden">
          <motion.div
            drag="x"
            style={{ x, touchAction: 'pan-y' }}
            dragConstraints={{ left: 0, right: dragWidth }}
            dragElastic={0.1}
            dragMomentum
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            dragTransition={{ power: 0.2, bounceStiffness: 220, bounceDamping: 28 }}
            onClickCapture={handleDragClickCapture}
            className="flex cursor-grab gap-4 py-1 active:cursor-grabbing transform-gpu will-change-transform"
          >
            {products.map((prod: any) => (
              <div key={prod.id} className="w-[11.875rem] shrink-0 sm:w-[15.625rem]">
                <ProductStandardCard product={prod} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}