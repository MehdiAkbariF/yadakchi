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
  Crown,
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
    (shopTitle ? `فروشگاه رسمی و تخصصی ${shopTitle} در یدکچی` : 'تامین‌کننده قطعات با ضمانت اصالت');

  const productCount = shopPageData?.shopProductCount ?? shop.productCount;
  const onTimePercentage = shopPageData?.shopPerformanceReport?.sellerSentOnTimePercentage;
  const averageRate = shopPageData?.averageRate ?? shop.averageRate ?? shop.rating;

  let satisfactionRate: number | null = null;
  if (typeof onTimePercentage === 'number' && onTimePercentage > 0) {
    satisfactionRate = Math.round(onTimePercentage);
  } else if (typeof averageRate === 'number' && averageRate > 0) {
    satisfactionRate = Math.min(100, Math.round(averageRate * 20));
  }

  const firstLetter = shopTitle ? shopTitle.trim().charAt(0).toUpperCase() : 'ی';

  if (isLoading) {
    return (
      <div className="relative flex h-[216px] w-[310px] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-4/5 rounded-md" />
        </div>
        <div className="flex gap-2 pt-2 border-t border-border/50">
          <Skeleton className="h-7 flex-1 rounded-full" />
          <Skeleton className="h-7 flex-1 rounded-full" />
          <Skeleton className="h-7 flex-1 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/shops/${shop.id}`}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      className="group relative flex h-[216px] w-[310px] shrink-0 cursor-pointer select-none flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/40 p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md"
    >
      {/* بخش فوقانی: لوگو، مشخصات و بج مینیمال */}
      <div className="flex items-start justify-between gap-3">
        {/* لوگو و نام فروشگاه */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-muted/30 p-1 shadow-2xs">
            {shop.logoUrl ? (
              <img
                src={shop.logoUrl}
                alt={shopTitle}
                className="h-full w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-sm font-black text-foreground">
                {firstLetter}
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <h3 className="line-clamp-1 text-sm font-bold text-foreground transition-colors group-hover:text-foreground/80">
              {shopTitle}
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground mt-0.5">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-foreground/70" />
              <span>فروشنده رسمی</span>
            </span>
          </div>
        </div>

        {/* بج خنثی و تمیز */}
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-3xs font-semibold text-foreground">
          <Crown className="h-3 w-3 text-muted-foreground" />
          <span>برگزیده</span>
        </span>
      </div>

      {/* بخش میانی: توضیح آرام */}
      <div className="my-auto py-1">
        <p className="line-clamp-2 text-xs font-normal leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {/* بخش پایینی: میکروچیپ‌های آمار کاملاً خنثی و مینیمال */}
      <div className="flex items-center gap-2 border-t border-border/70 pt-3">
        {/* کالاها */}
        <div className="flex flex-1 min-w-0 items-center justify-center gap-1 rounded-full border border-border/70 bg-muted/30 px-2 py-1 text-muted-foreground transition-colors group-hover:bg-muted/60">
          <Package className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="text-3xs font-medium">کالا:</span>
          <span className="truncate text-2xs font-bold text-foreground">
            {productCount !== undefined && productCount !== null
              ? toPersianDigits(productCount.toLocaleString('fa-IR'))
              : '-'}
          </span>
        </div>

        {/* رضایت */}
        <div className="flex flex-1 min-w-0 items-center justify-center gap-1 rounded-full border border-border/70 bg-muted/30 px-2 py-1 text-muted-foreground transition-colors group-hover:bg-muted/60">
          <ShieldCheck className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="text-3xs font-medium">رضایت:</span>
          <span className="truncate text-2xs font-bold text-foreground">
            {satisfactionRate !== null ? `${toPersianDigits(satisfactionRate)}٪` : '-'}
          </span>
        </div>

        {/* عملکرد */}
        <div className="flex flex-1 min-w-0 items-center justify-center gap-1 rounded-full border border-border/70 bg-muted/30 px-2 py-1 text-muted-foreground transition-colors group-hover:bg-muted/60">
          <Star className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="text-3xs font-medium">عملکرد:</span>
          <span className="truncate text-2xs font-bold text-foreground">
            {onTimePercentage !== undefined && onTimePercentage !== null
              ? `${toPersianDigits(Math.round(onTimePercentage))}٪`
              : 'عالی'}
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
    const step = 326;
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
        <div className="flex w-full gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-[216px] w-[310px] shrink-0 rounded-2xl overflow-hidden border border-border p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-8 w-full" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-7 flex-1 rounded-full" />
                <Skeleton className="h-7 flex-1 rounded-full" />
                <Skeleton className="h-7 flex-1 rounded-full" />
              </div>
            </div>
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
            فروشندگان منتخب یدکچی
          </Typography>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
        {shops.length > 3 && (
          <>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="absolute start-3 top-1/2 z-20 hidden -translate-y-1/2 cursor-pointer rounded-full border border-border bg-card/90 p-2 text-foreground shadow-md backdrop-blur transition-all hover:bg-muted hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
              aria-label="فروشگاه‌های قبلی"
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="absolute end-3 top-1/2 z-20 hidden -translate-y-1/2 cursor-pointer rounded-full border border-border bg-card/90 p-2 text-foreground shadow-md backdrop-blur transition-all hover:bg-muted hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
              aria-label="فروشگاه‌های بعدی"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
          </>
        )}

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