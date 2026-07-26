'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Star, Store, BadgeCheck, Truck, Eye } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductUrl, toPersianDigits } from '@/core/utils/formatters';
import { useImpression } from '@/shared/hooks/useImpression';

interface ProductStandardCardProps {
  product: any;
  showRating?: boolean;
  className?: string;
}

export function ProductStandardCard({
  product,
  showRating = true,
  className
}: ProductStandardCardProps) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const nominated = product?.nominatedShopProduct || {};
  const shopProductId = product?.shopProductId || nominated?.id || null;

  const impressionRef = useImpression(shopProductId);
  
  const shopName = nominated?.shopTitle || product?.shop?.name || product?.shopTitle || null;
  const isTipax = nominated?.isTipaxShipping || product?.isTipaxShipping || false;
  const isDirect = nominated?.isDirectShipping || product?.isDirectShipping || false;
  const salesCount = product?.totalSalesCount || product?.salesCount || 0;
  const views = product?.viewsAndClicks || product?.views || 0;

  const originalPriceRaw = nominated.rialRetailPrice || product?.price?.raw || product?.price || nominated.price || 0;
  const finalPriceRaw = nominated.rialFinalPrice || product?.discount?.discountedPriceRaw || product?.discountPrice || nominated.discountPrice || 0;

  const originalPriceToman = Math.round(originalPriceRaw / 10);
  const finalPriceToman = Math.round(finalPriceRaw / 10);
  
  const isOutOfStock = finalPriceRaw === 0;
  const hasDiscount = originalPriceRaw > finalPriceRaw && !isOutOfStock;

  const discountPercent = hasDiscount
    ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100)
    : (nominated.discountPercentage || product?.discount?.percent || 0);

  const tickerItems = useMemo(() => {
    const items: { text: string; icon: any }[] = [];
    
    if (salesCount > 0) {
      items.push({ text: `${toPersianDigits(salesCount)} فروش موفق در یدک‌چی`, icon: BadgeCheck });
    }
    if (isTipax) {
      items.push({ text: 'ارسال سریع با تیپاکس', icon: Truck });
    }
    if (isDirect) {
      items.push({ text: 'ارسال مستقیم فروشگاه', icon: Truck });
    }
    if (views > 0) {
      items.push({ text: `${toPersianDigits(views)} بازدید اخیر`, icon: Eye });
    }
    
    return items;
  }, [isTipax, isDirect, salesCount, views]);

  const tickerLength = tickerItems.length;

  useEffect(() => {
    if (!isMounted || tickerLength <= 1) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerLength);
    }, 3000);
    return () => clearInterval(interval);
  }, [tickerLength, isMounted]);

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
    const rating = product?.averageRate || product?.rating?.average || 5;
    return (
      <div className="flex items-center gap-1 select-none">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
        <span className="text-[10px] sm:text-[11px] font-iran-sans font-bold text-foreground">
          {formatPrice(rating)}
        </span>
      </div>
    );
  };

  const CurrentTickerIcon = tickerItems[tickerIndex]?.icon || Store;
  const productCardUrl = getProductUrl(product?.productCode || product?.code, product?.title || product?.name);

  return (
    <Link 
      href={productCardUrl} 
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
          <img
            src={getFullUrl(product?.image || product?.images?.[0]?.medium)}
            alt={product?.imageAlt || product?.title || product?.name}
            draggable={false}
            className="w-full h-full object-contain rounded-lg absolute inset-0 select-none"
          />
          
          {showRating && (
            <div className="absolute top-2 left-2 dark:bg-zinc-900/85 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm border border-border/20 z-10 flex items-center justify-center">
              {renderStars()}
            </div>
          )}
        </div>

        <div className="w-full h-9 mb-1 mt-2">
          <h4 className="text-sm sm:text-sm font-bold font-iran-sans text-foreground text-right line-clamp-2 leading-relaxed">
            {product?.title || product?.name}
          </h4>
        </div>

        {shopName && (
          <div className="w-full flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground/85 hover:text-primary transition-colors select-none mt-1">
            <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground/75" />
            <span className="font-iran-sans font-medium truncate">فروشگاه: {shopName}</span>
          </div>
        )}

        {/* فیکس تداخل هیدریشن: لود همگن تگ ساختاری فضا پر کن در حالت SSR و کلاینت */}
        <div className="w-full flex flex-col items-stretch select-none">
          {isMounted && tickerLength > 0 ? (
            <div className="h-6 overflow-hidden relative w-full flex items-center justify-start text-[10px] sm:text-xs text-muted-foreground mt-0.5 select-none shrink-0">
              <AnimatePresence mode="wait">
                <motion.span
                  key={tickerIndex}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="absolute inset-x-0 top-0 bottom-0 flex items-center gap-1.5 font-iran-sans truncate h-full py-1 justify-start"
                >
                  <CurrentTickerIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate font-medium text-right">{tickerItems[tickerIndex]?.text}</span>
                </motion.span>
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-6 mt-0.5 w-full shrink-0" /> // تگ همگن لود شونده در سرور و کلاینت
          )}
        </div>

        <div className="w-full mt-auto pt-2 flex items-center justify-between">
          <div className={cn(
            "shrink-0 bg-primary/10 text-primary border border-primary/20 text-xs font-black font-iran-sans px-2.5 py-1 rounded-lg transition-opacity",
            hasDiscount ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            {toPersianDigits(discountPercent)}٪
          </div>

          <div className="flex flex-col items-end min-w-0">
            {hasDiscount && originalPriceToman > 0 && (
              <span className="text-[10px] sm:text-xs text-zinc-500 line-through font-iran-sans font-medium">
                {formatPrice(originalPriceToman)}
              </span>
            )}
            <div className="flex items-center gap-0.5 mt-0.5">
              {isOutOfStock ? (
                <span className="text-sm sm:text-base font-bold font-iran-sans text-destructive">
                  ناموجود
                </span>
              ) : (
                <>
                  <span className="text-base sm:text-lg font-black font-iran-sans text-foreground">
                    {formatPrice(finalPriceToman)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-iran-sans">تومان</span>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}