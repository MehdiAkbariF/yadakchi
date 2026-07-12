// src/components/features/ProductCard/ProductStandardCard.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
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

  // استخراج فیلدهای قیمت ریالی و تبدیل به تومان با فال‌بک‌های هوشمند عددی
  const nominated = product?.nominatedShopProduct || {};
  const serverOriginalPrice = nominated.rialRetailPrice || product.price || nominated.price || 0;
  const serverFinalPrice = nominated.rialFinalPrice || product.discountPrice || nominated.discountPrice || 0;

  const originalPriceRaw = serverOriginalPrice > 0 ? serverOriginalPrice : 500000;
  const finalPriceRaw = serverFinalPrice > 0 ? serverFinalPrice : 500000;

  const originalPriceToman = Math.round(originalPriceRaw / 10);
  const finalPriceToman = Math.round(finalPriceRaw / 10);

  const discountPercent = originalPriceRaw > finalPriceRaw 
    ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100) 
    : nominated.discountPercentage || 0;

  const hasDiscount = originalPriceRaw > finalPriceRaw || discountPercent > 0;

  // جمع‌آوری هوشمند اطلاعات متغیر دیتابیس با استفاده از useMemo جهت حفظ ثبات رندرسازی لود ابتدایی
  const tickerItems = useMemo(() => {
    const items: { text: string; icon: any }[] = [];
    
    if (nominated.shopTitle) {
      items.push({ text: `فروشگاه: ${nominated.shopTitle}`, icon: Store });
    }
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

  // راه اندازی چرخه حرکت بالا به پایین اسلایدر مینی‌مال با پایداری کامل در لودینگ
  useEffect(() => {
    if (tickerLength <= 1) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerLength);
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

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value);
  };

  const renderStars = () => {
    const rating = product.averageRate || 5;
    return (
      <div className="flex items-center gap-1 select-none">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span className="text-[10px] sm:text-xs font-iran-sans text-muted-foreground">امتیاز {rating}</span>
      </div>
    );
  };

  const CurrentTickerIcon = tickerItems[tickerIndex]?.icon || Store;

  return (
    <Link href={`/products/${product.productCode}`} className="block w-full h-full select-none" draggable={false}>
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
        </div>

        {/* عنوان کالا (فونت سایز بزرگتر در موبایل) */}
        <div className="w-full h-9 mb-1">
          <h4 className="text-sm sm:text-sm font-bold font-iran-sans text-foreground text-right line-clamp-2 leading-relaxed">
            {product.title}
          </h4>
        </div>

        {/* بخش امتیاز و باکس متحرک عمودی اطلاعات فروشگاه */}
        <div className="w-full flex flex-col items-stretch gap-1 mb-2">
          {showRating && <div className="w-full flex justify-start">{renderStars()}</div>}
          
          {/* باکس متحرک عمودی با افکت فنری فوق‌العاده باکیفیت و زنده */}
          {tickerLength > 0 && (
            <div className="h-7 overflow-hidden relative w-full flex items-center justify-start text-[10px] sm:text-xs text-muted-foreground bg-muted/40 dark:bg-zinc-800/40 rounded-lg px-2.5 mt-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={tickerIndex}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '-100%', opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                  className="absolute right-2.5 flex items-center gap-1.5 font-iran-sans truncate w-[calc(100%-20px)] h-full py-1.5"
                >
                  <CurrentTickerIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate font-medium">{tickerItems[tickerIndex]?.text}</span>
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* بخش قیمت‌ها و نشان درصد تخفیف */}
        <div className="w-full mt-auto pt-2 border-t flex items-center justify-between">
          
          {/* سمت راست: نشان درصد تخفیف */}
          <div className={cn(
            "shrink-0 bg-primary/10 text-primary border border-primary/20 text-xs font-black font-iran-sans px-2.5 py-1 rounded-lg transition-opacity",
            hasDiscount ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            %{discountPercent}
          </div>

          {/* سمت چپ: باکس مبالغ عمودی ترازشده */}
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