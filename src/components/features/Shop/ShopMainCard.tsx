'use client';

import * as React from 'react';
import {
  Check,
  ShieldCheck,
  Truck,
  Award,
  CheckCircle2,
  MapPin,
  Package,
} from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';

export interface ShopMainCardProps {
  shopData: any | undefined;
  isLoading?: boolean;
  cardRef?: React.Ref<HTMLDivElement>;
}

/**
 * کارت اصلی مشخصات فروشگاه (بنر + لوگو + نام + آمار عملکرد)
 * این کارت در ShopDetailsContent قبلاً inline بود و به ref تشخیص اسکرول متصل می‌شد.
 */
export function ShopMainCard({ shopData, isLoading = false, cardRef }: ShopMainCardProps) {
  const delayedPercent = shopData?.shopPerformanceReport?.sellerSentDelayedPercentage ?? 0;
  const returnPercent = shopData?.shopPerformanceReport?.nonUserReturnPercentage ?? 0;
  const onTimePercent = shopData?.shopPerformanceReport?.sellerSentOnTimePercentage ?? 0;

  const onTimeScore = Math.max(0, Math.min(100, Math.round(100 - delayedPercent)));
  const noReturnScore = Math.max(0, Math.min(100, Math.round(100 - returnPercent)));
  const commitmentScore = Math.max(0, Math.min(100, Math.round(onTimePercent)));

  const shopInitial = shopData?.shopTitle
    ? shopData.shopTitle.trim().charAt(0).toUpperCase()
    : 'ی';

  if (isLoading) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs sm:rounded-3xl">
        <Skeleton className="hidden h-32 w-full rounded-none sm:block" />
        <div className="relative px-3 pb-3 pt-3 sm:px-7 sm:pb-7 sm:pt-0">
          <div className="flex items-center gap-2.5 sm:-mt-14 sm:items-end sm:gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-xl border-2 border-card sm:h-28 sm:w-28 sm:rounded-2xl sm:border-4" />
            <div className="space-y-1.5 pb-0.5 sm:space-y-2 sm:pb-2">
              <Skeleton className="h-4 w-32 rounded-md sm:h-6 sm:w-48" />
              <Skeleton className="h-3 w-24 rounded-md sm:h-4 sm:w-32" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5 border-t border-border/50 pt-3 sm:mt-6 sm:gap-3 sm:pt-5">
            <Skeleton className="h-10 rounded-lg sm:h-16 sm:rounded-2xl" />
            <Skeleton className="h-10 rounded-lg sm:h-16 sm:rounded-2xl" />
            <Skeleton className="h-10 rounded-lg sm:h-16 sm:rounded-2xl" />
            <Skeleton className="h-10 rounded-lg sm:h-16 sm:rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className="relative w-full overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/30 shadow-xs transition-all sm:rounded-3xl"
    >
      {/* بنر بالایی: فقط در دسکتاپ */}
      <div className="relative hidden h-15 w-full overflow-hidden border-b border-border/60 bg-gradient-to-l from-muted/60 via-muted/30 to-muted/10 p-4 sm:block">
        <div className="absolute end-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-foreground shadow-2xs backdrop-blur-md">
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full text-xs font-semibold text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-success" />
            فروشنده رسمی
          </span>
        </div>
      </div>

      {/* بخش اطلاعات و آمار فروشگاه */}
      <div className="relative px-3 pb-3 pt-3 sm:px-7 sm:pb-7 sm:pt-0">
        <div className="flex flex-row items-center gap-2.5 sm:-mt-14 sm:items-end sm:gap-4.5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-card bg-muted/20 p-0.5 shadow-sm sm:h-28 sm:w-28 sm:rounded-2xl sm:border-4 sm:p-1">
            {shopData?.logo ? (
              <img
                src={getFullUrl(shopData.logo)}
                className="h-full w-full rounded-lg object-contain sm:rounded-xl"
                alt={shopData.shopTitle}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-base font-bold text-foreground sm:rounded-xl sm:text-3xl">
                {shopInitial}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-0.5 pb-0.5 sm:gap-1.5 sm:pb-1">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <h1 className="truncate text-title-sm sm:text-2xl">
                {shopData?.shopTitle}
              </h1>
              <span
                className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-success/10 px-1.5 py-0.5 text-3xs font-semibold text-success sm:hidden"
                title="فروشنده رسمی"
              >
                <CheckCircle2 className="h-3 w-3" />
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-3xs font-medium text-muted-foreground sm:gap-3 sm:text-2xs">
              <span className="flex items-center gap-0.5 sm:gap-1">
                <Package className="h-3 w-3 text-muted-foreground sm:h-3.5 sm:w-3.5" />
                {toPersianDigits(shopData?.shopProductCount || 0)} قطعه
              </span>

              {shopData?.address && (
                <>
                  <span className="text-border">|</span>
                  <span className="flex max-w-[10rem] items-center gap-0.5 truncate sm:max-w-[20rem] sm:gap-1">
                    <MapPin className="h-3 w-3 shrink-0 text-muted-foreground sm:h-3.5 sm:w-3.5" />
                    {shopData.address}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* کارت‌های عملکرد */}
        <div className="mt-3 grid grid-cols-4 gap-1.5 border-t border-border/70 pt-3 sm:mt-6 sm:gap-3 sm:pt-5">
          <div className="flex flex-col items-center gap-0.5 rounded-lg border border-border/70 bg-muted/30 p-1.5 text-center transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:gap-3 sm:rounded-2xl sm:p-3 sm:text-right">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground sm:h-10 sm:w-10 sm:rounded-xl">
              <Award className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[0.5625rem] font-medium text-muted-foreground sm:text-3xs">
                عملکرد
              </span>
              <span className="truncate text-[0.625rem] font-bold text-foreground sm:text-sm">
                عالی
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5 rounded-lg border border-border/70 bg-muted/30 p-1.5 text-center transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:gap-3 sm:rounded-2xl sm:p-3 sm:text-right">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground sm:h-10 sm:w-10 sm:rounded-xl">
              <Truck className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[0.5625rem] font-medium text-muted-foreground sm:text-3xs">
                ارسال
              </span>
              <span
                className="truncate text-[0.625rem] font-bold text-foreground sm:text-sm"
                dir="ltr"
              >
                {toPersianDigits(onTimeScore)}٪
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5 rounded-lg border border-border/70 bg-muted/30 p-1.5 text-center transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:gap-3 sm:rounded-2xl sm:p-3 sm:text-right">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground sm:h-10 sm:w-10 sm:rounded-xl">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[0.5625rem] font-medium text-muted-foreground sm:text-3xs">
                مرجوعی
              </span>
              <span
                className="truncate text-[0.625rem] font-bold text-foreground sm:text-sm"
                dir="ltr"
              >
                {toPersianDigits(noReturnScore)}٪
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5 rounded-lg border border-border/70 bg-muted/30 p-1.5 text-center transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:gap-3 sm:rounded-2xl sm:p-3 sm:text-right">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground sm:h-10 sm:w-10 sm:rounded-xl">
              <Check className="h-3.5 w-3.5 stroke-[2.5] sm:h-5 sm:w-5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[0.5625rem] font-medium text-muted-foreground sm:text-3xs">
                تعهد
              </span>
              <span
                className="truncate text-[0.625rem] font-bold text-foreground sm:text-sm"
                dir="ltr"
              >
                {toPersianDigits(commitmentScore)}٪
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopMainCard;