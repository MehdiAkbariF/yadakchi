'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Store,
  Star,
  CheckCircle2,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useGetShopCards, useGetShopPage } from '@/domains/front/shop/hooks/shop.hooks';
import { Typography } from '@/components/primitives/Typography';
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';

const toPersianDigits = (n: number | string | undefined | null) => {
  if (n === undefined || n === null || n === '') return '-';
  return n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
};

function ShopSliderCard({ shop }: { shop: any }) {
  const { data: shopPageData, isLoading } = useGetShopPage(shop.id);

  const shopTitle = shopPageData?.shopTitle || shop.shopTitle || shop.name || '';
  const description =
    shopPageData?.seoInformation?.description?.trim() ||
    (shopTitle ? `فروشگاه رسمی ${shopTitle} در یدکچی` : '');

  const productCount = shopPageData?.shopProductCount ?? shop.productCount;
  const onTimePercentage = shopPageData?.shopPerformanceReport?.sellerSentOnTimePercentage;
  const averageRate = shopPageData?.averageRate ?? shop.averageRate ?? shop.rating;

  let satisfactionRate: number | null = null;
  if (typeof onTimePercentage === 'number' && onTimePercentage > 0) {
    satisfactionRate = Math.round(onTimePercentage);
  } else if (typeof averageRate === 'number' && averageRate > 0) {
    satisfactionRate = Math.min(100, Math.round(averageRate * 20));
  }

  if (isLoading) {
    return (
      <div className="flex h-[255px] w-[310px] shrink-0 flex-col justify-between rounded-lg border border-border bg-card p-4 sm:w-[330px] sm:p-5">
        <div className="space-y-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <div className="my-2 h-px w-full bg-border" />
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
      className="flex w-[310px] shrink-0 cursor-pointer select-none flex-col justify-between overflow-hidden rounded-lg border border-border bg-card p-4 transition-colors duration-fast hover:border-primary/40 sm:w-[330px] sm:p-5"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-start">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            <span>فروشنده منتخب</span>
            <Star aria-hidden="true" className="h-3.5 w-3.5 fill-warning text-warning" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="line-clamp-1 text-base font-bold text-foreground sm:text-lg">{shopTitle}</h3>
          <p className="line-clamp-2 min-h-[36px] text-xs font-normal leading-relaxed text-muted-foreground">
            {description || 'اطلاعات و قطعات این فروشگاه در یدک‌چی تایید شده است.'}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-2xs font-medium text-muted-foreground">
            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
            <span>احراز شده</span>
          </div>
        </div>
      </div>

      <div className="my-4 h-px w-full bg-border" />

      <div className="grid w-full grid-cols-3 divide-x divide-border text-center">
        <div className="flex min-w-0 flex-col items-center justify-center gap-1 px-1">
          <Package aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="w-full truncate whitespace-nowrap text-2xs font-normal text-muted-foreground">
            تعداد محصولات
          </span>
          <span className="w-full truncate text-xs font-bold text-foreground sm:text-sm">
            {productCount !== undefined && productCount !== null
              ? toPersianDigits(productCount.toLocaleString('fa-IR'))
              : '-'}
          </span>
        </div>

        <div className="flex min-w-0 flex-col items-center justify-center gap-1 px-1">
          <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span
            title="میزان رضایت مشتریان"
            className="w-full truncate whitespace-nowrap text-2xs font-normal tracking-tight text-muted-foreground"
          >
            میزان رضایت مشتریان
          </span>
          <span className="w-full truncate text-xs font-bold text-foreground sm:text-sm">
            {satisfactionRate !== null ? `${toPersianDigits(satisfactionRate)}٪` : '-'}
          </span>
        </div>

        <div className="flex min-w-0 flex-col items-center justify-center gap-1 px-1">
          <Star aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="w-full truncate whitespace-nowrap text-2xs font-normal text-muted-foreground">
            امتیاز عملکرد
          </span>
          <span className="w-full truncate text-xs font-bold text-foreground sm:text-sm">
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
  const { data: rawShops, isLoading, isError } = useGetShopCards({
    orderBy: 'Rating',
    pageNumber: 1,
    pageSize: 30,
  });

  const shops = rawShops?.items || [];
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [dragWidth, setDragWidth] = React.useState(0);
  const x = useMotionValue(0);
  const isDraggingRef = React.useRef(false);

  React.useEffect(() => {
    if (carouselRef.current) {
      setDragWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [shops]);

  const handleScroll = (direction: 'left' | 'right') => {
    const step = 330;
    let newX = x.get() + (direction === 'left' ? step : -step);
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
      <div className="w-full space-y-4 py-4">
        <div className="flex items-center gap-2 px-1">
          <Store aria-hidden="true" className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Skeleton className="h-6 w-36 rounded-md" />
        </div>
        <div className="flex w-full gap-4 overflow-hidden rounded-lg border border-border bg-card p-4">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-[255px] w-[310px] shrink-0 rounded-lg sm:w-[330px]" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || shops.length === 0) return null;

  return (
    <div className="flex w-full flex-col space-y-4 py-4">
      <div className="flex w-full items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Store aria-hidden="true" className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Typography variant="h4" className="text-base font-bold text-foreground sm:text-lg">
            فروشندگان منتخب یدک‌چی
          </Typography>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-lg border border-border bg-card p-4">
        {shops.length > 3 ? (
          <>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="absolute start-3 top-1/2 z-20 hidden -translate-y-1/2 cursor-pointer rounded-full border border-border bg-card p-2.5 text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
              aria-label="فروشگاه‌های قبلی"
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="absolute end-3 top-1/2 z-20 hidden -translate-y-1/2 cursor-pointer rounded-full border border-border bg-card p-2.5 text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
              aria-label="فروشگاه‌های بعدی"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
          </>
        ) : null}

        <div ref={carouselRef} className="relative z-10 w-full select-none overflow-hidden">
          <motion.div
            drag="x"
            style={{ x }}
            dragConstraints={{ left: 0, right: dragWidth }}
            dragElastic={0.15}
            dragMomentum
            dragTransition={{ power: 0.2, bounceStiffness: 200, bounceDamping: 25 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClickCapture={handleDragClickCapture}
            className="flex cursor-grab gap-4 py-1 active:cursor-grabbing"
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

