// src/components/features/ProductCard/ProductStandardCard.tsx

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Store, BadgeCheck, Truck, Eye } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductUrl, toPersianDigits } from '@/core/utils/formatters';
import { useImpression } from '@/shared/hooks/useImpression';
import { trackShopProductClick } from '@/core/utils/impression-tracker';

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
  
  // ✅ استخراج شناسه فروشگاه کالا (مستقیم از OpenSearch یا ساختار قدیمی)
  const shopProductId = product?.shopProductId || nominated?.id || product?.id || null;
  const impressionRef = useImpression(shopProductId);
  
  // ✅ عنوان کالا
  const title = product?.productTitle || product?.title || product?.name?.value || product?.name || '';

  // ✅ نام فروشگاه
  const shopName = product?.shopTitle || nominated?.shopTitle || product?.shop?.name || null;

  const isTipax = product?.isTipaxShipping || nominated?.isTipaxShipping || false;
  const isDirect = product?.isDirectShipping || nominated?.isDirectShipping || false;
  const salesCount = product?.totalSalesCount || product?.salesCount || 0;
  const views = product?.viewsAndClicks || product?.views || 0;

  // ✅ استخراج هوشمند قیمت‌ها (پشتیبانی مستقیم از rialRetailPrice و rialFinalPrice در OpenSearch)
  const originalPriceRaw = Number(
    product?.rialRetailPrice ?? 
    nominated?.rialRetailPrice ?? 
    product?.price?.raw ?? 
    (typeof product?.price === 'number' ? product.price : 0) ?? 
    nominated?.price ?? 
    0
  );

  const finalPriceRaw = Number(
    product?.rialFinalPrice ?? 
    nominated?.rialFinalPrice ?? 
    product?.discount?.discountedPriceRaw ?? 
    product?.discountPrice ?? 
    nominated?.discountPrice ?? 
    product?.price?.raw ?? 
    (typeof product?.price === 'number' ? product.price : 0) ?? 
    originalPriceRaw
  );

  const originalPriceToman = Math.round(originalPriceRaw / 10);
  const finalPriceToman = Math.round(finalPriceRaw / 10);
  
  // وضعیت موجودی انبار
  const isOutOfStock = finalPriceRaw === 0 || (product?.quantity !== undefined && product.quantity === 0);

  // وضعیت تخفیف
  const hasDiscount = 
    product?.isDiscountApplied !== undefined 
      ? product.isDiscountApplied 
      : (originalPriceRaw > finalPriceRaw && !isOutOfStock);

  // درصد تخفیف
  const discountPercent = 
    product?.discountPercentage ?? 
    (hasDiscount && originalPriceRaw > 0 
      ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100) 
      : (nominated?.discountPercentage || product?.discount?.percent || 0));

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
      return;
    }
    // ثبت کلیک فروشنده برگزیده کالا
    if (shopProductId) {
      trackShopProductClick(shopProductId);
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

  // ✅ لینک‌دهی مطمئن با اولویت کد کالا و در صورت عدم وجود، استفاده از آیدی محصول OpenSearch
  const codeOrId = product?.productCode || product?.code || product?.productId || product?.id;
  const productCardUrl = getProductUrl(codeOrId, title);

  // استخراج تصویر
  const imageSource = product?.image || product?.images?.[0]?.medium || product?.images?.[0]?.url || product?.images?.[0] || null;

  return (
    <Link 
      href={productCardUrl} 
      prefetch={false}
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
        
        {/* تصویر کالا */}
        <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden mb-2 select-none" draggable={false}>
          <Image
            src={getFullUrl(imageSource)}
            alt={product?.imageAlt || title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
            className="object-contain rounded-lg select-none"
            draggable={false}
          />
          
          {showRating && (
            <div className="absolute top-2 left-2 dark:bg-zinc-900/85 px-2 py-0.5 rounded-lg z-10 flex items-center justify-center">
              {renderStars()}
            </div>
          )}
        </div>

        {/* عنوان کالا */}
        <div className="w-full h-9 mb-1 mt-2">
          <h4 className="text-sm sm:text-sm font-bold font-iran-sans text-foreground line-clamp-2 leading-relaxed text-right w-full">
            {title}
          </h4>
        </div>

        {/* نام فروشگاه */}
        {shopName && (
          <div className="w-full flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground/85 hover:text-primary transition-colors select-none mt-1">
            <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground/75" />
            <span className="font-iran-sans font-medium truncate">فروشگاه: {shopName}</span>
          </div>
        )}

        {/* تیکر اطلاعات تکمیلی (فروش موفق / تیپاکس و...) */}
        <div className="w-full flex flex-col items-stretch select-none">
          {isMounted && tickerLength > 0 ? (
            <div className="h-6 overflow-hidden relative w-full flex items-center justify-start text-[10px] sm:text-xs text-muted-foreground mt-0.5 select-none shrink-0">
              <div className="hidden md:block w-full h-full relative">
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
                    <span className="truncate font-medium text-right text-foreground">{tickerItems[tickerIndex]?.text}</span>
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="flex md:hidden items-center gap-1.5 font-iran-sans truncate w-full justify-start h-full">
                <CurrentTickerIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate font-medium text-right text-[10px]">{tickerItems[0]?.text}</span>
              </div>
            </div>
          ) : (
            <div className="h-6 mt-0.5 w-full shrink-0" />
          )}
        </div>

        {/* باکس قیمت و تخفیف */}
        <div className="w-full mt-auto pt-2 flex items-center justify-between">
          <div className={cn(
            "shrink-0 bg-primary/10 text-primary border border-primary/20 text-xs font-black font-iran-sans px-2.5 py-1 rounded-lg transition-opacity",
            hasDiscount && discountPercent > 0 ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            {toPersianDigits(discountPercent)}٪
          </div>

          <div className="flex flex-col items-end min-w-0">
            {hasDiscount && originalPriceToman > finalPriceToman && (
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