'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useGetShopCards } from '@/domains/front/shop/hooks/shop.hooks';
import { Typography } from '@/components/primitives/Typography';
import { ChevronLeft, ChevronRight, Store, Star, Tag, Award, ShieldCheck, Truck } from 'lucide-react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';

function ShopSliderCard({ shop }: { shop: any }) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const discount = shop.highestDiscount || 0;
  const rating = shop.rating || 0;
  const rank = shop.rank || 0;

  const tickerItems = useMemo(() => {
    const items: { text: string; icon: any }[] = [];
    
    if (rating > 0) {
      items.push({ text: `امتیاز ${rating}`, icon: Star });
    }
    if (discount > 0) {
      items.push({ text: `تا ${discount}% تخفیف`, icon: Tag });
    }
    if (rank > 0) {
      items.push({ text: `رتبه ${rank}`, icon: Award });
    }
    
    items.push({ text: 'تایید شده یدکچی', icon: ShieldCheck });
    items.push({ text: 'ضمانت اصالت قطعات', icon: ShieldCheck });
    items.push({ text: 'ارسال سریع کالا', icon: Truck });
    
    return items;
  }, [rating, discount, rank]);

  const tickerLength = tickerItems.length;

  useEffect(() => {
    if (tickerLength <= 1) return;
    const interval = setInterval(() => {
      setFade(false);
      const timeout = setTimeout(() => {
        setTickerIndex((prev) => (prev + 1) % tickerLength);
        setFade(true);
      }, 300);
      return () => clearTimeout(timeout);
    }, 3000);
    return () => clearInterval(interval);
  }, [tickerLength]);

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const CurrentIcon = tickerItems[tickerIndex]?.icon || ShieldCheck;

  return (
    <Link
      href={`/shops/${shop.id}`}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      className="w-36 h-36 sm:w-44 sm:h-44 shrink-0 rounded-xl border bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden flex flex-col justify-end p-3 transition-all select-none hover:scale-[1.02] shadow-md group hover:border-primary/40"
    >
      <img
        src={getFullUrl(shop.logo)}
        alt={shop.name}
        draggable={false}
        className="w-full h-full object-cover rounded-xl select-none pointer-events-none absolute inset-0 z-0"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10 rounded-xl" />

      <div className="relative z-20 w-full flex flex-col gap-1.5 text-white select-none">
        <div className="w-full flex items-center gap-1 text-[11px] sm:text-xs font-bold truncate">
          <Store className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate text-white">{shop.name}</span>
        </div>

        <div className="h-5 overflow-hidden relative w-full flex items-center justify-start text-[8px] sm:text-[9px] text-zinc-300 select-none shrink-0 border-t border-white/20 pt-1">
          <div className={cn(
            "flex items-center gap-1 transition-opacity duration-300",
            fade ? "opacity-100" : "opacity-0"
          )}>
            <CurrentIcon className="h-3 w-3 text-primary shrink-0" />
            <span className="truncate font-medium text-right text-zinc-200">{tickerItems[tickerIndex]?.text}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ShopSlider() {
  const { data: rawShops, isLoading, isError } = useGetShopCards({ orderBy: 'Rank', pageNumber: 1, pageSize: 30 });
  const shops = rawShops?.items || [];
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setWidth] = useState(0);
  const x = useMotionValue(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [shops]);

  const handleScroll = (direction: 'left' | 'right') => {
    const step = 350;
    let newX = x.get() + (direction === 'right' ? -step : step);
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
      <div className="w-full space-y-4 py-4 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 px-1">
          <Store className="h-5 w-5 text-primary shrink-0" />
          <Skeleton className="w-32 h-5" />
        </div>
        <div className="w-full bg-background rounded-xl border p-4 flex gap-4 overflow-hidden justify-center">
          {[...Array(8)].map((_, index) => (
            <Skeleton key={index} className="w-36 h-36 sm:w-44 sm:h-44 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || shops.length === 0) return null;

  return (
    <div className="w-full flex flex-col space-y-3.5 py-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-primary shrink-0" />
          <Typography variant="h4" className="font-iran-yekan font-extrabold text-foreground">
            فروشندگان منتخب یدکچی
          </Typography>
        </div>
      </div>

      <div className="w-full bg-background rounded-xl border p-4 relative group overflow-hidden">
        {shops.length > 6 && (
          <>
            <button
              onClick={() => handleScroll('right')}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border bg-background hover:bg-muted text-foreground transition-all shadow-md outline-none cursor-pointer"
              aria-label="Previous"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleScroll('left')}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border bg-background hover:bg-muted text-foreground transition-all shadow-md outline-none cursor-pointer"
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
            dragElastic={0.15}
            dragMomentum={true}
            dragTransition={{ power: 0.2, bounceStiffness: 200, bounceDamping: 25 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClickCapture={handleDragClickCapture}
            className="flex gap-4 py-1 cursor-grab active:cursor-grabbing"
          >
            {shops.map((shop: any) => (
              <ShopSliderCard key={shop.id} shop={shop} />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}