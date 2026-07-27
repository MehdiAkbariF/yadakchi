// src/components/features/ProductCard/ProductDealCard.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Hourglass } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { getProductUrl, toPersianDigits } from '@/core/utils/formatters';
import { useImpression } from '@/shared/hooks/useImpression';

interface ProductDealCardProps {
  product: any;
  serverTime?: string | Date;
  showTimer?: boolean;
  showRating?: boolean;
  className?: string;
}

export function ProductDealCard({
  product,
  serverTime,
  showTimer = true,
  showRating = true,
  className
}: ProductDealCardProps) {
  const nominated = product?.nominatedShopProduct || {};
  
  const originalPriceRaw = nominated.rialRetailPrice || product.price || nominated.price || 0;
  const finalPriceRaw = nominated.rialFinalPrice || product.discountPrice || nominated.discountPrice || 0;

  const originalPriceToman = Math.round(originalPriceRaw / 10);
  const finalPriceToman = Math.round(finalPriceRaw / 10);

  const hasDiscount = originalPriceRaw > finalPriceRaw;

  const discountPercent = hasDiscount
    ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100)
    : (nominated.discountPercentage || 0);

  const expirationStr = nominated.discountUntil || nominated.discountExpiration || product.discountExpiration;
  const hasExpiration = !!expirationStr;

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const shopProductId = product?.shopProductId || nominated?.id || null;
  
  const impressionRef = useImpression(shopProductId);

  useEffect(() => {
    if (!hasExpiration) return;

    const calculateTime = () => {
      const serverDate = serverTime ? new Date(serverTime) : new Date();
      const clientDate = new Date();
      const timeOffset = serverDate.getTime() - clientDate.getTime();

      const syncedNow = new Date(Date.now() + timeOffset);
      const diff = +new Date(expirationStr) - +syncedNow;

      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expirationStr, serverTime, hasExpiration]);

  const formatPersianDigits = (num: number) => {
    return new Intl.NumberFormat('fa-IR', { useGrouping: false })
      .format(num)
      .padStart(2, '۰');
  };

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const dx = Math.abs(e.clientX - dragStart.current.x);
    const dy = Math.abs(e.clientY - dragStart.current.y);
    if (dx > 6 || dy > 6) {
      setIsDragging(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      dragStart.current = { x: touch.clientX, y: touch.clientY };
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      const dx = Math.abs(touch.clientX - dragStart.current.x);
      const dy = Math.abs(touch.clientY - dragStart.current.y);
      if (dx > 6 || dy > 6) {
        setIsDragging(true);
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const renderStars = () => {
    const rating = product.averageRate || 5;
    return (
      <div className="flex items-center gap-1 select-none">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
        <span className="text-[10px] sm:text-xs font-iran-yekan text-muted-foreground font-medium">امتیاز {rating}</span>
      </div>
    );
  };

  const productCardUrl = getProductUrl(product?.productCode || product?.code, product?.title || product?.name);

  return (
    <Link 
      href={productCardUrl} 
      prefetch={false} // غیرفعال کردن پیش‌دانلود کدهای فرعی برای آزادسازی ترافیک شبکه موبایل
      className="block w-full h-full select-none" 
      draggable={false}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
    >
      <div ref={impressionRef} className={cn(
        "w-full h-full bg-background rounded-xl border hover:border-primary/40 hover:shadow-md transition-all duration-300 p-3 sm:p-3.5 flex flex-col items-center relative select-none",
        className
      )}>
        
        <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden mb-2 select-none" draggable={false}>
          <Image
            src={getFullUrl(product.image)}
            alt={product.imageAlt || product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
            className="object-contain rounded-lg select-none"
            draggable={false}
          />
        </div>

        <div className="w-full min-h-[2.6rem] mb-1 flex items-start justify-end select-none">
          <h4 className="text-sm sm:text-sm font-bold font-iran-yekan text-foreground text-right line-clamp-2 leading-relaxed w-full">
            {product.title}
          </h4>
        </div>

        {showRating && (
          <div className="w-full flex justify-start mb-3 mt-1.5 select-none">
            {renderStars()}
          </div>
        )}

        <div className="w-full mt-auto pt-2 flex items-center justify-between">
          
          <div className={cn(
            "shrink-0 bg-primary/10 text-primary border border-primary/20 text-xs font-black font-iran-yekan px-2.5 py-1 rounded-lg transition-opacity",
            hasDiscount ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            {toPersianDigits(discountPercent)}٪
          </div>

          <div className="flex flex-col items-end min-w-0">
            {hasDiscount && originalPriceToman > 0 && (
              <span className="text-[10px] sm:text-xs text-zinc-500 line-through font-iran-yekan font-medium">
                {formatPrice(originalPriceToman)}
              </span>
            )}
            <div className="flex items-center gap-0.5 mt-0.5">
              <span className="text-base sm:text-lg font-black font-iran-yekan text-foreground">
                {formatPrice(finalPriceToman)}
              </span>
              <span className="text-[10px] text-muted-foreground font-iran-yekan">تومان</span>
            </div>
          </div>

        </div>

        {showTimer && hasExpiration && (
          <div className="w-full mt-2.5 pt-1.5 flex items-center justify-between text-muted-foreground/80 font-iran-yekan border-t border-dashed">
            
            <div className="flex items-center gap-1 font-bold text-foreground" dir="ltr">
              <span className="bg-muted dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] font-iran-yekan">{formatPersianDigits(timeLeft.hours)}</span>
              <span className="text-muted-foreground">:</span>
              <span className="bg-muted dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] font-iran-yekan">{formatPersianDigits(timeLeft.minutes)}</span>
              <span className="text-muted-foreground">:</span>
              <span className="bg-muted dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] font-iran-yekan">{formatPersianDigits(timeLeft.seconds)}</span>
            </div>

            <Hourglass className="h-3.5 w-3.5 text-primary shrink-0 animate-spin" />

          </div>
        )}

      </div>
    </Link>
  );
}