'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, AlarmClock } from 'lucide-react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useGetNominatedProducts } from '@/domains/front/product/hooks/product.hooks';
import { useGetCurrentTime } from '@/domains/front/static/hooks/static.hooks';
import { ProductDealCard } from './ProductDealCard';
import { Typography } from '@/components/primitives/Typography';
import { SliderSkeleton } from './SliderSkeleton';

export function DealsSlider() {
  const { data: rawData, isLoading, isError } = useGetNominatedProducts();
  const { data: serverTime } = useGetCurrentTime();

  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [dragWidth, setDragWidth] = React.useState(0);
  const x = useMotionValue(0);

  const productItems = rawData?.products?.items || [];

  React.useEffect(() => {
    if (carouselRef.current) {
      setDragWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [productItems]);

  const handleScroll = (direction: 'left' | 'right') => {
    const step = 450;
    let newX = x.get() + (direction === 'left' ? step : -step);
    if (newX < 0) newX = 0;
    if (newX > dragWidth) newX = dragWidth;
    animate(x, newX, { type: 'spring', stiffness: 200, damping: 30 });
  };

  const handleDragClickCapture = (e: React.MouseEvent) => {
    if (Math.abs(x.getVelocity()) > 15) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (isLoading) {
    return <SliderSkeleton title="تخفیف‌های شگفت‌انگیز" />;
  }

  if (isError || productItems.length === 0) return null;

  return (
    <div className="flex w-full flex-col space-y-3.5 py-4">
      {/* هدر موبایل */}
      <div className="flex w-full items-center justify-between px-1 md:hidden">
        <div className="flex items-center gap-2">
          <AlarmClock aria-hidden="true" className="h-5 w-5 shrink-0 animate-bounce text-primary [animation-duration:3s]" />
          <Typography variant="h4" className="font-bold text-foreground">
            تخفیف‌های شگفت‌انگیز
          </Typography>
        </div>

        <Link
          href="/special"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-foreground transition-opacity hover:opacity-75"
        >
          <span>مشاهده همه</span>
          <ChevronLeft aria-hidden="true" className="h-4 w-4 stroke-[2.25]" />
        </Link>
      </div>

      <div className="group relative flex w-full flex-col items-stretch gap-4 overflow-hidden rounded-lg border border-border bg-muted p-4 md:flex-row">
        <div className="relative hidden w-[210px] shrink-0 select-none flex-col items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary-hover p-6 text-center text-primary-foreground shadow-xs md:flex">
          <Typography variant="h4" className="font-bold leading-tight text-primary-foreground">
            تخفیف‌های شگفت‌انگیز
          </Typography>

          <div className="my-4 animate-bounce rounded-full border border-primary-foreground/20 bg-primary-foreground/10 p-3 backdrop-blur-sm [animation-duration:3s]">
            <AlarmClock aria-hidden="true" className="h-10 w-10 stroke-[1.5] text-primary-foreground" />
          </div>

          <Link
            href="/special"
            className="inline-flex items-center gap-1 border-b border-primary-foreground pb-0.5 text-xs font-medium transition-colors hover:text-primary-foreground/80"
          >
            <span>مشاهده همه</span>
            <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5 stroke-2" />
          </Link>
        </div>

        {productItems.length > 3 ? (
          <>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="absolute start-[235px] top-1/2 z-20 hidden -translate-y-1/2 cursor-pointer rounded-full border border-border bg-card p-2 text-foreground shadow-sm transition-colors duration-fast hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
              aria-label="محصولات قبلی"
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="absolute end-2 top-1/2 z-20 hidden -translate-y-1/2 cursor-pointer rounded-full border border-border bg-card p-2 text-foreground shadow-sm transition-colors duration-fast hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
              aria-label="محصولات بعدی"
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
            dragElastic={0.12}
            onClickCapture={handleDragClickCapture}
            className="flex cursor-grab gap-4 py-1 active:cursor-grabbing"
          >
            {productItems.map((prod: any) => (
              <div key={prod.id} className="w-[190px] shrink-0 sm:w-[250px]">
                <ProductDealCard product={prod} serverTime={serverTime} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

