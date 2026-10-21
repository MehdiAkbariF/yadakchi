'use client';

import * as React from 'react';
import Link from 'next/link';
import { Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useGetMainBrands } from '@/domains/front/reference/brand/hooks/brand.hooks';
import { Typography } from '@/components/primitives/Typography';
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl } from '@/core/utils/formatters';

export function BrandSlider() {
  const { data: brands = [], isLoading, isError } = useGetMainBrands();
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [dragWidth, setDragWidth] = React.useState(0);
  const x = useMotionValue(0);
  const isDraggingRef = React.useRef(false);

  React.useEffect(() => {
    if (carouselRef.current) {
      setDragWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [brands]);

  const handleScroll = (direction: 'left' | 'right') => {
    const step = 350;
    let newX = x.get() + (direction === 'left' ? step : -step);
    if (newX < 0) newX = 0;
    if (newX > dragWidth) newX = dragWidth;
    animate(x, newX, { type: 'spring', stiffness: 200, damping: 30 });
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = () => {
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  const handleDragClickCapture = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4 py-4">
        <div className="flex items-center gap-2 px-1">
          <Skeleton className="h-5 w-5" variant="circle" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex w-full justify-center gap-4 overflow-hidden rounded-lg border border-border bg-card p-4">
          {[...Array(8)].map((_, index) => (
            <Skeleton key={index} className="h-24 w-24 shrink-0 rounded-md sm:h-28 sm:w-28" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || brands.length === 0) return null;

  return (
    <div className="flex w-full flex-col space-y-3.5 py-4">
      <div className="flex w-full items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Award aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
          <Typography variant="h4" className="font-bold text-foreground">
            برندهای محبوب
          </Typography>
        </div>
      </div>

      <div className="group relative w-full overflow-hidden rounded-lg border border-border bg-card p-4">
        {brands.length > 6 ? (
          <>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="absolute start-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-border bg-card p-2 text-foreground shadow-sm transition-colors duration-fast hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
              aria-label="برندهای قبلی"
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="absolute end-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-border bg-card p-2 text-foreground shadow-sm transition-colors duration-fast hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
              aria-label="برندهای بعدی"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
          </>
        ) : null}

        <div ref={carouselRef} className="relative z-10 w-full select-none overflow-hidden">
          <motion.div
            drag="x"
            style={{ x }}
            dragConstraints={{ left: 0, right: dragWidth }}
            dragElastic={0.15}
            dragMomentum
            dragTransition={{ power: 0.2, bounceStiffness: 200, bounceDamping: 25 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClickCapture={handleDragClickCapture}
            className="flex cursor-grab gap-4 py-1 active:cursor-grabbing"
          >
            {brands.map((brand: any) => (
              <Link
                key={brand.id}
                href={`/search?brandIds=${brand.id}`}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                className="flex h-24 w-24 shrink-0 select-none items-center justify-center rounded-md border border-border bg-card p-2 transition-colors duration-fast hover:border-primary/40 sm:h-28 sm:w-28"
              >
                <img
                  src={getFullUrl(brand.logo)}
                  alt={brand.imageAlt || brand.name}
                  draggable={false}
                  className="pointer-events-none h-full w-full select-none rounded-sm object-contain"
                />
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

