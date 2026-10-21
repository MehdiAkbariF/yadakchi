'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { ProductStandardCard } from './ProductStandardCard';
import { Typography } from '@/components/primitives/Typography';
import { SliderSkeleton } from './SliderSkeleton';
import { cn } from '@/design-system/utils/cn';

export interface ProductSliderProps {
  title: string;
  products: any[];
  isLoading: boolean;
  isError: boolean;
  viewAllLink?: string;
  className?: string;
  showTimer?: boolean;
}

export function ProductSlider({
  title,
  products = [],
  isLoading,
  isError,
  viewAllLink = '#',
  className,
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wrench aria-hidden="true" className="h-4 w-4 shrink-0" />
          </div>
          <Typography variant="h4" className="font-bold text-foreground">
            {title}
          </Typography>
        </div>

        {/* دکمه مشاهده همه با هویت بصری مشخص */}
        <Link
          href={viewAllLink}
          prefetch={false}
          className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-hover sm:text-sm"
        >
          <span>مشاهده همه</span>
          <ChevronLeft aria-hidden="true" className="h-4 w-4 stroke-[2.25] transition-transform duration-fast group-hover:-translate-x-1" />
        </Link>
      </div>

      {/* کانتینر اسلایدر: سفید شفاف (bg-card) با حاشیه بسیار ظریف و سایه نرم */}
      <div className="group relative w-full overflow-hidden rounded-xl border border-border/70 bg-card p-4 shadow-xs">
        {products.length > 4 ? (
          <>
            {/* دکمه راست: شناور، سفید با سایه متمایز */}
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="absolute start-3 top-1/2 z-20 hidden -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-card p-2.5 text-foreground shadow-md transition-all duration-fast hover:border-primary/50 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
              aria-label="محصولات قبلی"
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>

            {/* دکمه چپ: شناور، سفید با سایه متمایز */}
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="absolute end-3 top-1/2 z-20 hidden -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-card p-2.5 text-foreground shadow-md transition-all duration-fast hover:border-primary/50 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
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
            dragElastic={0.12}
            dragMomentum
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            dragTransition={{ power: 0.2, bounceStiffness: 200, bounceDamping: 25 }}
            onClickCapture={handleDragClickCapture}
            className="flex cursor-grab gap-4 py-1 active:cursor-grabbing"
          >
            {products.map((prod: any) => (
              <div key={prod.id} className="w-[190px] shrink-0 sm:w-[250px]">
                <ProductStandardCard product={prod} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
