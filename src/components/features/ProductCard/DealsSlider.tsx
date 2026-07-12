// src/components/features/ProductCard/DealsSlider.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useGetNominatedProducts } from '@/domains/front/product/hooks/product.hooks';
import { useGetCurrentTime } from '@/domains/front/static/hooks/static.hooks';
import { ProductDealCard } from './ProductDealCard';
import { ChevronLeft, ChevronRight, Loader2, AlarmClock } from 'lucide-react';
import { Typography } from '@/components/primitives/Typography';
import { motion, useMotionValue, animate } from 'framer-motion';

export function DealsSlider() {
  const { data: rawData, isLoading, isError } = useGetNominatedProducts();
  const { data: serverTime } = useGetCurrentTime();
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setWidth] = useState(0);
  const x = useMotionValue(0);

  const productItems = rawData?.products?.items || [];

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [productItems]);

  const handleScroll = (direction: 'left' | 'right') => {
    const step = 450;
    // تغییر جهت اسکرول دکمه‌ها متناسب با راندمان کشیدن به چپ در دیسپلی
    let newX = x.get() + (direction === 'left' ? -step : step);
    
    if (newX < -dragWidth) newX = -dragWidth;
    if (newX > 0) newX = 0;

    animate(x, newX, { type: 'spring', stiffness: 200, damping: 30 });
  };

  if (isLoading) {
    return (
      <div className="w-full h-[250px] flex flex-col items-center justify-center gap-3 bg-muted/10 rounded-xl animate-pulse">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm font-medium font-iran-sans text-muted-foreground">در حال بارگذاری تخفیف‌های شگفت‌انگیز...</span>
      </div>
    );
  }

  if (isError || productItems.length === 0) return null;

  return (
    <div className="w-full flex flex-col space-y-3.5 py-4 animate-in fade-in duration-300">
      
      {/* هدر بالایی اسلایدر در موبایل */}
      <div className="flex md:hidden items-center justify-between w-full px-1">
        <div className="flex items-center gap-2">
          <AlarmClock className="h-5 w-5 text-primary shrink-0 animate-bounce [animation-duration:3s]" />
          <Typography variant="h4" className="font-iran-yekan font-extrabold text-foreground">
            تخفیف‌های شگفت‌انگیز
          </Typography>
        </div>
        
        <Link 
          href="/special" 
          className="text-xs font-bold font-iran-sans text-primary hover:underline transition-colors shrink-0"
        >
          مشاهده همه &lt;
        </Link>
      </div>

      {/* کانتینر اصلی اسلایدر */}
      <div className="w-full bg-zinc-100/60 dark:bg-zinc-900/40 rounded-xl border p-4 flex flex-col md:flex-row items-stretch gap-4 relative group overflow-hidden">
        
        {/* بنر تبلیغاتی دسکتاپ */}
        <div className="hidden md:flex w-[210px] shrink-0 flex-col items-center justify-center text-center text-white bg-gradient-to-br from-primary to-primary-600 rounded-xl p-6 relative overflow-hidden shadow-sm select-none">
          <Typography variant="h4" className="font-iran-yekan font-extrabold text-white leading-tight">
            تخفیف‌های شگفت‌انگیز
          </Typography>
          
          <div className="my-4 p-3 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm animate-bounce [animation-duration:3s]">
            <AlarmClock className="h-10 w-10 text-white stroke-[1.5]" />
          </div>

          <Link 
            href="/special" 
            className="text-xs font-bold font-iran-sans border-b border-white hover:text-white/80 pb-0.5 transition-colors"
          >
            مشاهده همه &lt;
          </Link>
        </div>

        {/* دکمه‌های ناوبری اسلایدر دسکتاپ */}
        {productItems.length > 3 && (
          <>
            <button
              onClick={() => handleScroll('left')}
              className="hidden md:flex absolute right-[235px] top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border bg-background hover:bg-muted text-foreground transition-all shadow-md outline-none cursor-pointer"
              aria-label="اسلاید بعدی"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border bg-background hover:bg-muted text-foreground transition-all shadow-md outline-none cursor-pointer"
              aria-label="اسلاید قبلی"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}

        {/* لیست محصولات با درگ سخت‌افزاری تراز شده به بازه منفی جهت اسلاید فوق‌العاده روان سراسری */}
        <div 
          ref={carouselRef}
          className="w-full overflow-hidden relative z-10 select-none"
        >
          <motion.div 
            drag="x"
            style={{ x }}
            dragConstraints={{ left: -dragWidth, right: 0 }}
            dragElastic={0.12}
            className="flex gap-4 py-1 cursor-grab active:cursor-grabbing"
          >
            {productItems.map((prod: any) => (
              <div key={prod.id} className="w-[190px] sm:w-[250px] shrink-0">
                <ProductDealCard product={prod} serverTime={serverTime} />
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
}