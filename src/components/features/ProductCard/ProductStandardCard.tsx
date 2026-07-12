// src/components/features/ProductCard/ProductStandardCard.tsx

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Star, Store, BadgeCheck, Truck, Eye } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // متغیرهای وضعیت برای تشخیص اسلاید/درگ از کلیک واقعی
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // استخراج فیلدهای قیمت ریالی واقعی از پاسخ سرور
  const nominated = product?.nominatedShopProduct || {};
  const originalPriceRaw = nominated.rialRetailPrice || product.price || nominated.price || 0;
  const finalPriceRaw = nominated.rialFinalPrice || product.discountPrice || nominated.discountPrice || 0;

  const originalPriceToman = Math.round(originalPriceRaw / 10);
  const finalPriceToman = Math.round(finalPriceRaw / 10);

  // بررسی واقعی وجود تخفیف
  const hasDiscount = originalPriceRaw > finalPriceRaw;

  // محاسبه داینامیک درصد تخفیف واقعی
  const discountPercent = hasDiscount
    ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100)
    : (nominated.discountPercentage || 0);

  // جمع‌آوری اطلاعات داینامیک دیتابیس
  const tickerItems = useMemo(() => {
    const items: { text: string; icon: any }[] = [];
    
    if (product.totalSalesCount > 0) {
      items.push({ text: `${product.totalSalesCount} فروش موفق در یادکچی`, icon: BadgeCheck });
    }
    if (nominated.isTipaxShipping) {
      items.push({ text: 'ارسال سریع با تیپاکس', icon: Truck });
    }
    if (nominated.isDirectShipping) {
      items.push({ text: 'ارسال مستقیم فروشگاه', icon: Truck });
    }
    if (product.viewsAndClicks > 0) {
      items.push({ text: `${product.viewsAndClicks} بازدید اخیر`, icon: Eye });
    }
    
    return items;
  }, [nominated, product]);

  const tickerLength = tickerItems.length;

  // مدیریت چرخه حرکت بالا به پایین اسلایدر مینی‌مال شفاف
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

  // هندلر تشخیص شروع حرکت موس
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
    setIsDragging(false);
  };

  // هندلر تشخیص کشیدن موس (اگر جابه‌جایی بیش از ۶ پیکسل باشد، درگ تایید می‌شود)
  const handleMouseMove = (e: React.MouseEvent) => {
    const dx = Math.abs(e.clientX - dragStart.current.x);
    const dy = Math.abs(e.clientY - dragStart.current.y);
    if (dx > 6 || dy > 6) {
      setIsDragging(true);
    }
  };

  // هندلر لمسی موبایل برای شروع اسلاید
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      dragStart.current = { x: touch.clientX, y: touch.clientY };
      setIsDragging(false);
    }
  };

  // هندلر لمسی موبایل در حین حرکت دست
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

  // جلوگیری از ریدایرکت ناخواسته در صورت فعال بودن وضعیت درگ
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
        <span className="text-[10px] sm:text-[11px] font-iran-sans font-bold text-foreground">
          {formatPrice(rating)}
        </span>
      </div>
    );
  };

  const CurrentTickerIcon = tickerItems[tickerIndex]?.icon || Store;

  return (
    <Link 
      href={`/products/${product.productCode}`} 
      className="block w-full h-full select-none" 
      draggable={false}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
    >
      <div className={cn(
        "w-full h-full bg-background rounded-xl border hover:border-primary/40 hover:shadow-md transition-all duration-300 p-3 sm:p-3.5 flex flex-col items-center relative select-none",
        className
      )}>
        
        {/* تصویر کالا */}
        <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden mb-2 select-none" draggable={false}>
          <img
            src={getFullUrl(product.image)}
            alt={product.imageAlt || product.title}
            draggable={false}
            className="w-full h-full object-contain rounded-lg hover:scale-[1.01] transition-transform duration-500 absolute inset-0 select-none"
          />
          
          {/* ستاره و امتیاز فلوتینگ روی عکس (گوشه بالا راست) */}
          {showRating && (
            <div className="absolute top-2 left-2 
             dark:bg-zinc-900/85 backdrop-blur-sm 
             px-2 py-0.5 rounded-lg shadow-sm border 
             border-border/20 z-10 flex items-center justify-center">
              {renderStars()}
            </div>
          )}
        </div>

        {/* نام فروشگاه ثابت (بالای اسلاید متحرک) */}
  
        
        {/* عنوان کالا */}
        <div className="w-full h-9 mb-1 mt-2">
          <h4 className="text-sm sm:text-sm font-bold font-iran-sans text-foreground text-right line-clamp-2 leading-relaxed">
            {product.title}
          </h4>
        </div>
      {nominated.shopTitle && (
          <div className="w-full flex items-center gap-1 text-[10px] sm:text-xs 
          text-muted-foreground/85 hover:text-primary transition-colors select-none mt-1">
            <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground/75" />
            <span className="font-iran-sans font-medium truncate">فروشگاه: {nominated.shopTitle}</span>
          </div>
        )}
        {/* بخش اطلاعات فروشگاه و اسلایدر متنی مینی‌مال */}
        <div className="w-full flex flex-col items-stretch select-none">
          
          {/* اسلایدر متنی متحرک بدون پس‌زمینه (شفاف) مابین داده‌های واقعی */}
          {isMounted && tickerLength > 0 ? (
            <div className="h-6 overflow-hidden relative w-full flex items-center justify-start 
            text-[10px] sm:text-xs text-muted-foreground mt-0.5 select-none shrink-0">
              <AnimatePresence mode="wait">
                <motion.span
                  key={tickerIndex}
                  initial={{ y: 15, opacity: 0 }} // انیمیشن پیکسلی عمودی
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="absolute inset-x-0 top-0 bottom-0 flex items-center gap-1.5 font-iran-sans truncate h-full py-1"
                >
                  <CurrentTickerIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate font-medium">{tickerItems[tickerIndex]?.text}</span>
                </motion.span>
              </AnimatePresence>
            </div>
          ) : (
            isMounted && tickerLength > 0 && <div className="h-6 mt-0.5 w-full shrink-0" />
          )}
        </div>

        {/* بخش قیمت‌ها و نشان درصد تخفیف */}
        <div className="w-full mt-auto pt-2  flex items-center justify-between">
          
          {/* نشان درصد تخفیف واقعی */}
          <div className={cn(
            "shrink-0 bg-primary/10 text-primary border border-primary/20 text-xs font-black font-iran-sans px-2.5 py-1 rounded-lg transition-opacity",
            hasDiscount ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            %{discountPercent}
          </div>

          {/* باکس مبالغ تومانی */}
          <div className="flex flex-col items-end min-w-0">
            {hasDiscount && originalPriceToman > 0 && (
              <span className="text-[10px] sm:text-xs text-zinc-500 line-through font-iran-sans font-medium">
                {formatPrice(originalPriceToman)}
              </span>
            )}
            <div className="flex items-center gap-0.5 mt-0.5">
              <span className="text-base sm:text-lg font-black font-iran-sans text-foreground">
                {formatPrice(finalPriceToman)}
              </span>
              <span className="text-[10px] text-muted-foreground font-iran-sans">تومان</span>
            </div>
          </div>

        </div>

      </div>
    </Link>
  );
}