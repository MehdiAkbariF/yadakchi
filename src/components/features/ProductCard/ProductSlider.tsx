// src/components/features/ProductCard/ProductSlider.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ProductDealCard } from './ProductDealCard';
import { ChevronLeft, ChevronRight, Loader2, Wrench } from 'lucide-react';
import { Typography } from '@/components/primitives/Typography';
import { motion, useMotionValue, animate } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';

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
  showTimer = false,
}: ProductSliderProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setWidth] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [products]);

  const handleScroll = (direction: 'left' | 'right') => {
    const step = 450;
    let newX = x.get() + (direction === 'right' ? -step : step);
    
    if (newX < 0) newX = 0;
    if (newX > dragWidth) newX = dragWidth;

    animate(x, newX, { type: 'spring', stiffness: 200, damping: 30 });
  };

  if (isLoading) {
    return (
      <div className="w-full h-[250px] flex flex-col items-center justify-center gap-3 bg-muted/10 rounded-xl animate-pulse">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm font-medium font-iran-sans text-muted-foreground">در حال بارگذاری محصولات...</span>
      </div>
    );
  }

  if (isError || products.length === 0) return null;

  return (
    <div className={cn("w-full flex flex-col space-y-3.5 py-4 animate-in fade-in duration-300", className)}>
      {/* هدر بالایی اسلایدر */}
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary shrink-0" />
          <Typography variant="h4" className="font-iran-yekan font-extrabold text-foreground">
            {title}
          </Typography>
        </div>
        
        <Link 
          href={viewAllLink} 
          className="text-xs sm:text-sm font-bold font-iran-sans text-primary hover:underline transition-colors shrink-0"
        >
          مشاهده همه &lt;
        </Link>
      </div>

      {/* کانتینر اصلی اسلایدر با لغزش و درگ ۱۰۰٪ روان فریمور موشن */}
      <div className="w-full bg-background rounded-xl border p-4 relative group overflow-hidden">
        
        {/* دکمه‌های ناوبری دسکتاپ */}
        {products.length > 4 && (
          <>
            <button
              onClick={() => handleScroll('right')}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border bg-background hover:bg-muted text-foreground transition-all shadow-md outline-none cursor-pointer"
              aria-label="اسلاید بعدی"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleScroll('left')}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border bg-background hover:bg-muted text-foreground transition-all shadow-md outline-none cursor-pointer"
              aria-label="اسلاید قبلی"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}

        {/* لیست محصولات با درگ سخت‌افزاری روان در دسکتاپ و موبایل */}
        <div 
          ref={carouselRef}
          className="w-full overflow-hidden relative z-10 select-none"
        >
          <motion.div 
            drag="x"
            style={{ x }}
            dragConstraints={{ left: 0, right: dragWidth }}
            dragElastic={0.12}
            className="flex gap-4 py-1 cursor-grab active:cursor-grabbing"
          >
            {products.map((prod: any) => (
              <div key={prod.id} className="w-[190px] sm:w-[250px] shrink-0">
                <ProductDealCard product={prod} showTimer={showTimer} />
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
}