// src/components/features/ProductCard/ShopProductAdBanner.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Store, Sparkles, ArrowLeft } from 'lucide-react';
import { useGetShopProductBanners } from '@/domains/front/banner/hooks/banner.hooks';
import { useBannerImpression } from '@/shared/hooks/useBannerImpression';
import { bannerTracker } from '@/core/utils/banner-tracker';
import { toPersianDigits, getProductUrl, getFullUrl } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';

export interface ShopProductAdBannerProps {
  partCategoryId?: string;
  partId?: string;
  carId?: string;
  className?: string;
}

export function ShopProductAdBanner({
  partCategoryId,
  partId,
  carId,
  className,
}: ShopProductAdBannerProps) {
  const { data: banners = [], isLoading } = useGetShopProductBanners({
    partCategoryId,
    partId,
    carId,
  });

  const ad = banners[0];
  const impressionRef = useBannerImpression(ad?.id || null, ad?.product?.id || null);

  if (isLoading || !ad) return null;
  const adProductUrl = getProductUrl(ad.product.code, ad.product.name);

  const shopName = ad.product.shopName || 'یدکچی';
  const hasDiscount = ad.product.discount.hasDiscount && !!ad.product.discount.discountPrice;
  const discountPercent = ad.product.discount.discountPercent || 0;

  return (
    <div className={cn('relative w-full select-none', className)} ref={impressionRef}>
      
      {/* ================= نسخه دسکتاپ (کارت عمودی لوکس و پرمخاطب) ================= */}
      <Link
        href={adProductUrl}
        className="hidden h-full w-full select-none md:block group/ad"
        onClick={() => bannerTracker.trackClick(ad.id, ad.product.id)}
      >
        <div
          className={cn(
            'relative flex w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/30 p-4 shadow-xs transition-all duration-300',
            'hover:-translate-y-1 hover:border-primary/50 hover:shadow-md'
          )}
        >
          {/* هدر کارت: تگ منتخب */}
          <div className="absolute end-3 top-3 z-10 flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-2xs font-bold text-primary backdrop-blur-md">
            <Sparkles className="h-3 w-3 shrink-0" />
            <span>منتخب یدکچی</span>
          </div>

          {/* تصویر محصول */}
          <div className="relative mb-3 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/20 p-2">
            <Image
              src={getFullUrl(ad.imageUrl)}
              alt={ad.title}
              fill
              sizes="250px"
              className="object-contain transition-transform duration-500 ease-out group-hover/ad:scale-105"
            />
          </div>

          {/* اطلاعات کالا */}
          <div className="flex w-full flex-col gap-2 min-h-[4.5rem]">
            <h4 className="line-clamp-2 text-xs font-bold leading-relaxed text-foreground group-hover/ad:text-primary transition-colors">
              {ad.product.name}
            </h4>

            <div className="flex items-center justify-between text-2xs text-muted-foreground">
              <div className="flex items-center gap-1.5 min-w-0">
                <Store aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
                <span className="truncate">فروشنده: {shopName}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Star aria-hidden="true" className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" />
                <span className="font-bold text-foreground">۵.۰</span>
              </div>
            </div>
          </div>

          {/* فوتر کارت: قیمت و تخفیف */}
          <div className="mt-3 flex w-full items-center justify-between border-t border-border/70 pt-3">
            {hasDiscount && discountPercent > 0 ? (
              <div className="rounded-full bg-destructive/10 border border-destructive/20 px-2 py-0.5 text-2xs font-bold text-destructive">
                {toPersianDigits(discountPercent)}٪ تخفیف
              </div>
            ) : (
              <span className="text-2xs text-muted-foreground font-medium">ارسال فوری</span>
            )}

            <div className="flex flex-col items-end">
              {hasDiscount ? (
                <span className="text-2xs leading-none text-muted-foreground line-through">
                  {ad.product.price.toman}
                </span>
              ) : null}
              <span className="mt-1 text-xs font-extrabold leading-none text-foreground">
                {hasDiscount ? ad.product.discount.discountPrice : ad.product.price.toman}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* ================= نسخه موبایل (بنر افقی مینی‌مال و مدرن) ================= */}
      <Link
        href={adProductUrl}
        className="block w-full select-none md:hidden group/ad-mobile"
        onClick={() => bannerTracker.trackClick(ad.id, ad.product.id)}
      >
        <div
          className={cn(
            'relative flex h-24 w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-muted/30 p-3 shadow-xs transition-all duration-300',
            'active:scale-[0.99] hover:border-primary/40 hover:shadow-sm'
          )}
        >
          {/* عکس محصول در موبایل */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/20 p-1.5">
            <Image
              src={getFullUrl(ad.imageUrl)}
              alt={ad.title}
              fill
              sizes="80px"
              className="object-contain transition-transform duration-300 group-hover/ad-mobile:scale-105"
            />
          </div>

          {/* متن و فروشنده */}
          <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-0.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.2 text-3xs font-bold text-primary">
                <Sparkles className="h-2.5 w-2.5" />
                منتخب
              </span>
              <span className="text-3xs text-muted-foreground truncate">فروشگاه: {shopName}</span>
            </div>

            <h4 className="line-clamp-2 text-xs font-bold leading-tight text-foreground group-hover/ad-mobile:text-primary transition-colors">
              {ad.product.name}
            </h4>

            <div className="flex items-center gap-1 text-2xs text-muted-foreground">
              <Star aria-hidden="true" className="h-3 w-3 shrink-0 fill-warning text-warning" />
              <span className="font-bold text-foreground">۵.۰</span>
            </div>
          </div>

          {/* قیمت و اکشن */}
          <div className="flex shrink-0 flex-col items-end justify-between self-stretch py-0.5 ps-2">
            {hasDiscount && discountPercent > 0 ? (
              <span className="rounded-full bg-destructive/10 px-2 py-0.2 text-3xs font-bold text-destructive">
                {toPersianDigits(discountPercent)}٪
              </span>
            ) : (
              <div />
            )}

            <div className="flex flex-col items-end">
              {hasDiscount ? (
                <span className="text-3xs leading-none text-muted-foreground line-through">
                  {ad.product.price.toman}
                </span>
              ) : null}
              <span className="mt-1 text-xs font-black leading-none text-foreground">
                {hasDiscount ? ad.product.discount.discountPrice : ad.product.price.toman}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}