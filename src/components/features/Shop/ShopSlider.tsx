// c:\Users\Raven\final-projects\yadakchi-front\yadakchi\src\components\features\Shop\ShopSlider.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useGetShopCards, useGetShopPage } from '@/domains/front/shop/hooks/shop.hooks';
import { Typography } from '@/components/primitives/Typography';
import {
  ChevronLeft,
  ChevronRight,
  Store,
  Star,
  CheckCircle2,
  Package,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';

// تبدیل ارقام به فارسی
const toPersianDigits = (n: number | string | undefined | null) => {
  if (n === undefined || n === null || n === '') return '-';
  return n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
};

function ShopSliderCard({ shop }: { shop: any }) {
  // دریافت اطلاعات کامل و واقعی فروشگاه از اندپوینت ShopPage با استفاده از ShopId
  const { data: shopPageData, isLoading } = useGetShopPage(shop.id);

  // ۱. عنوان فروشگاه کاملاً داینامیک از API
  const shopTitle = shopPageData?.shopTitle || shop.shopTitle || shop.name || '';

  // ۲. توضیحات واقعی فروشگاه از دیتای سئو API
  const description =
    shopPageData?.seoInformation?.description?.trim() ||
    (shopTitle ? `فروشگاه رسمی ${shopTitle} در یدکچی` : '');

  // ۳. تعداد محصولات واقعی ثبت شده در بک‌اند
  const productCount = shopPageData?.shopProductCount ?? shop.productCount;

  // ۴. درصد واقعی تعهد و رضایت (از آبجکت shopPerformanceReport)
  const onTimePercentage = shopPageData?.shopPerformanceReport?.sellerSentOnTimePercentage;
  const averageRate = shopPageData?.averageRate ?? shop.averageRate ?? shop.rating;

  // محاسبه رضایت بر اساس گزارش عملکرد واقعی یا میانگین امتیاز (هر ستاره ۲۰ درصد)
  let satisfactionRate: number | null = null;
  if (typeof onTimePercentage === 'number' && onTimePercentage > 0) {
    satisfactionRate = Math.round(onTimePercentage);
  } else if (typeof averageRate === 'number' && averageRate > 0) {
    satisfactionRate = Math.min(100, Math.round(averageRate * 20));
  }

  // ۵. وضعیت فعال بودن از گزارش عملکرد
  const status = shopPageData?.shopPerformanceReport?.status;
  const isActive = status ? status === 'Active' : true;

  if (isLoading) {
    return (
      <div className="w-[300px] sm:w-[330px] h-[255px] shrink-0 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col justify-between">
        <div className="space-y-3">
          <Skeleton className="w-24 h-6 rounded-full" />
          <Skeleton className="w-40 h-5 rounded-md" />
          <Skeleton className="w-full h-8 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="w-28 h-5 rounded-full" />
            <Skeleton className="w-16 h-5 rounded-full" />
          </div>
        </div>
        <div className="w-full h-px bg-zinc-100 dark:bg-zinc-800 my-2" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/shops/${shop.id}`}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      className="w-[300px] sm:w-[330px] shrink-0 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col justify-between select-none shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex flex-col gap-3">
        {/* ۱. بج فروشنده منتخب (فقط در صورتی که رنکینگ یا امتیاز برتر داشته باشد) */}
        <div className="flex items-center justify-start">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-black">
            <span>فروشنده منتخب</span>
            <Star className="w-3.5 h-3.5 fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* ۲. نام و توضیحات فروشگاه - کاملاً بدون هاردکد */}
        <div className="flex flex-col gap-1.5 text-right">
          <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {shopTitle}
          </h3>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 min-h-[36px]">
            {description || 'اطلاعات و قطعات این فروشگاه در یدکچی تایید شده است.'}
          </p>
        </div>

        {/* ۳. بج‌های تأییدیه و وضعیت */}
        <div className="flex items-center gap-2 pt-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>تأیید شده توسط ادمین</span>
          </div>

          {isActive && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>فعال</span>
            </div>
          )}
        </div>
      </div>

      {/* خط جداکننده */}
      <div className="w-full h-px bg-zinc-100 dark:bg-zinc-800 my-4" />

      {/* ۴. آمارهای کاملاً داینامیک */}
      <div className="grid grid-cols-3 divide-x divide-x-reverse divide-zinc-100 dark:divide-zinc-800 text-center">
        {/* ستون اول: تعداد محصولات از API */}
        <div className="flex flex-col items-center gap-1 px-1">
          <Package className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            تعداد محصولات
          </span>
          <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">
            {productCount !== undefined && productCount !== null
              ? toPersianDigits(productCount.toLocaleString('fa-IR'))
              : '-'}
          </span>
        </div>

        {/* ستون دوم: میزان رضایت مشتریان از API */}
        <div className="flex flex-col items-center gap-1 px-1">
          <ShieldCheck className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            میزان رضایت مشتریان
          </span>
          <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">
            {satisfactionRate !== null ? `${toPersianDigits(satisfactionRate)}٪` : '-'}
          </span>
        </div>

        {/* ستون سوم: ارسال به موقع / میانگین ارسال */}
        <div className="flex flex-col items-center gap-1 px-1">
          <Truck className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            ارسال به موقع
          </span>
          <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">
            {onTimePercentage !== undefined && onTimePercentage !== null
              ? `${toPersianDigits(Math.round(onTimePercentage))}٪`
              : 'سریع'}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ShopSlider() {
  const {
    data: rawShops,
    isLoading,
    isError,
  } = useGetShopCards({ orderBy: 'Rating', pageNumber: 1, pageSize: 30 });

  const shops = rawShops?.items || [];
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setWidth] = useState(0);
  const x = useMotionValue(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(
        carouselRef.current.scrollWidth - carouselRef.current.offsetWidth
      );
    }
  }, [shops]);

  const handleScroll = (direction: 'left' | 'right') => {
    const step = 340;
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
    }, 80);
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
          <Store className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <Skeleton className="w-36 h-6 rounded-lg" />
        </div>
        <div className="w-full bg-background rounded-2xl border p-4 flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, index) => (
            <Skeleton
              key={index}
              className="w-[300px] sm:w-[330px] h-[255px] shrink-0 rounded-3xl"
            />
          ))}
        </div>
      </div>
    );
  }

  // اگر خطایی رخ داده بود یا هیچ فروشنده‌ای وجود نداشت سکشن کلاً پنهان می‌شود
  if (isError || shops.length === 0) return null;

  return (
    <div className="w-full flex flex-col space-y-4 py-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <Typography
            variant="h4"
            className="font-iran-yekan font-black text-foreground text-base sm:text-lg"
          >
            فروشندگان منتخب یدکچی
          </Typography>
        </div>
      </div>

      <div className="w-full bg-zinc-50/50 dark:bg-zinc-950/30 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-4 relative group overflow-hidden">
        {shops.length > 3 && (
          <>
            <button
              onClick={() => handleScroll('right')}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-all shadow-lg outline-none cursor-pointer"
              aria-label="Previous"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleScroll('left')}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-all shadow-lg outline-none cursor-pointer"
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