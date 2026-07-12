// src/components/features/ProductCard/ProductDealCard.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Hourglass } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

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
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 13 });

  // استخراج فیلدهای قیمت ریالی و تبدیل به تومان با فال‌بک‌های هوشمند عددی
  const nominated = product?.nominatedShopProduct || {};
  const serverOriginalPrice = nominated.rialRetailPrice || product.price || nominated.price || 0;
  const serverFinalPrice = nominated.rialFinalPrice || product.discountPrice || nominated.discountPrice || 0;

  const originalPriceRaw = serverOriginalPrice > 0 ? serverOriginalPrice : 1200000;
  const finalPriceRaw = serverFinalPrice > 0 ? serverFinalPrice : 756000;

  const originalPriceToman = Math.round(originalPriceRaw / 10);
  const finalPriceToman = Math.round(finalPriceRaw / 10);

  // محاسبه درصد تخفیف شگفت‌انگیز
  const discountPercent = originalPriceRaw > finalPriceRaw 
    ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100) 
    : nominated.discountPercentage || 37;

  const hasDiscount = originalPriceRaw > finalPriceRaw || discountPercent > 0;

  // زمان انقضای دریافتی از سرور
  const expirationStr = nominated.discountUntil || nominated.discountExpiration || product.discountExpiration || new Date(Date.now() + 14.5 * 60 * 60 * 1000).toISOString();

  useEffect(() => {
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
  }, [expirationStr, serverTime]);

  // حل‌کننده اعداد فارسی
  const toPersianDigits = (num: number) => {
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

  const renderStars = () => {
    const rating = product.averageRate || 5;
    return (
      <div className="flex items-center gap-1 select-none">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span className="text-[10px] sm:text-xs font-iran-sans text-muted-foreground">امتیاز {rating} از کاربران</span>
      </div>
    );
  };

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

        {/* عنوان کالا (فونت سایز یک پرده بزرگتر در موبایل) */}
        <div className="w-full h-9 mb-1">
          <h4 className="text-sm sm:text-sm font-bold font-iran-sans text-foreground text-right line-clamp-2 leading-relaxed">
            {product.title}
          </h4>
        </div>

        {/* بخش امتیاز */}
        {showRating && <div className="w-full flex justify-start mb-2">{renderStars()}</div>}

        {/* بخش قیمت‌ها و بج تخفیف شیک */}
        <div className="w-full mt-auto pt-2 flex items-center justify-between">
          
          {/* سمت راست: نشان درصد تخفیف (نمایش هوشمند) */}
          <div className={cn(
            "shrink-0 bg-primary/10 text-primary border border-primary/20 text-xs font-black font-iran-sans px-2.5 py-1 rounded-lg transition-opacity",
            hasDiscount ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            %{discountPercent}
          </div>

          {/* سمت چپ: باکس مبالغ (تغییر رنگ قیمت خط‌خورده به زینک ۵۰۰ برای پررنگ‌تر شدن) */}
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

        {/* بخش شمارنده معکوس شگفت‌انگیز */}
        {showTimer && nominated.discountUntil && (
          <div className="w-full mt-2.5 pt-1.5 flex items-center justify-between text-muted-foreground/80 font-iran-sans">
            
            {/* زمان دیجیتال لایوت چپ‌به‌راست */}
            <div className="flex items-center gap-1 font-bold text-foreground" dir="ltr">
              <span className="bg-muted dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] font-iran-sans">{toPersianDigits(timeLeft.hours)}</span>
              <span className="text-muted-foreground">:</span>
              <span className="bg-muted dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] font-iran-sans">{toPersianDigits(timeLeft.minutes)}</span>
              <span className="text-muted-foreground">:</span>
              <span className="bg-muted dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] font-iran-sans">{toPersianDigits(timeLeft.seconds)}</span>
            </div>

            {/* ساعت شنی متحرک لایت */}
            <Hourglass className="h-3.5 w-3.5 text-primary shrink-0 animate-spin [animation-duration:4s]" />

          </div>
        )}

      </div>
    </Link>
  );
}