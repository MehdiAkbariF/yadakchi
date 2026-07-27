// src/components/features/ProductCard/ProductSlider.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ProductStandardCard } from './ProductStandardCard';
import { ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import { Typography } from '@/components/primitives/Typography';
import { motion, useMotionValue, animate } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';
import { SliderSkeleton } from './SliderSkeleton';

interface ProductSliderProps {
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
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setWidth] = useState(0);
  const x = useMotionValue(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [products]);

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
    return <SliderSkeleton title={title} />;
  }

  if (isError || products.length === 0) return null;

  return (
    <div className={cn("w-full flex flex-col space-y-3.5 py-4 animate-in fade-in duration-300", className)}>
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary shrink-0" />
          <Typography variant="h4" className="font-iran-yekan font-extrabold text-foreground">
            {title}
          </Typography>
        </div>
        
        {/* غیرفعال کردن prefetch برای جلوگیری از شلوغی شبکه */}
        <Link 
          href={viewAllLink} 
          prefetch={false}
          className="text-xs sm:text-sm font-bold font-iran-yekan text-primary hover:underline transition-colors shrink-0"
        >
          مشاهده همه &lt;
        </Link>
      </div>

      {/* ۱. نمایش مخصوص دسکتاپ با انیمیشن درگ افکت زیبای Framer Motion */}
      <div className="hidden md:block w-full bg-background rounded-xl border p-4 relative group overflow-hidden">
        {products.length > 4 && (
          <>
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border bg-background hover:bg-muted text-foreground transition-all shadow-md outline-none cursor-pointer"
              aria-label="Previous"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border bg-background hover:bg-muted text-foreground transition-all shadow-md outline-none cursor-pointer"
              aria-label="Next"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
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
            onClickCapture={handleDragClickCapture}
            className="flex gap-4 py-1 cursor-grab active:cursor-grabbing"
          >
            {products.map((prod: any) => (
              <div key={prod.id} className="w-[250px] shrink-0">
                <ProductStandardCard product={prod} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ۲. نمایش مخصوص موبایل با اسکرول بومی سخت‌افزاری و فوق‌العاده نرم با مصرف باتری و پردازنده صفر درصد */}
      <div className="block md:hidden w-full overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-1 py-1">
        <div className="flex gap-3.5 w-max">
          {products.map((prod: any) => (
            <div key={prod.id} className="w-[195px] shrink-0 snap-start">
              <ProductStandardCard product={prod} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}