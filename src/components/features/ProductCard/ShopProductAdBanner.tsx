'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Store } from 'lucide-react';
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

  return (
    <div className={cn('relative w-full select-none', className)}>
      {/* دسکتاپ */}
      <Link
        href={adProductUrl}
        className="hidden h-full w-full select-none md:block"
        onClick={() => bannerTracker.trackClick(ad.id, ad.product.id)}
      >
        <div
          ref={impressionRef}
          className={cn(
            'group relative flex w-full flex-col gap-3 rounded-lg border border-accent bg-accent/50 p-4 shadow-xs transition-all duration-normal',
            'hover:border-primary/50'
          )}
        >
          <div className="absolute start-3 top-3 z-10 select-none rounded-sm bg-primary px-2 py-0.5 text-2xs font-bold text-primary-foreground shadow-xs">
            منتخب
          </div>

          <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-md border border-border bg-card p-2">
            <Image
              src={getFullUrl(ad.imageUrl)}
              alt={ad.title}
              fill
              sizes="250px"
              className="object-contain transition-transform duration-normal group-hover:scale-105"
            />
          </div>

          <div className="flex w-full flex-col gap-1.5">
            <h4 className="line-clamp-2 text-xs font-bold leading-relaxed text-foreground">
              {ad.product.name}
            </h4>

            <div className="flex items-center gap-1 text-2xs text-muted-foreground">
              <Store aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
              <span>فروشگاه: {ad.product.shopName}</span>
            </div>

            <div className="mt-0.5 flex items-center justify-start gap-1.5">
              <Star aria-hidden="true" className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" />
              <span className="text-2xs font-bold text-foreground">
                امتیاز: {toPersianDigits(5)}
              </span>
            </div>
          </div>

          <div className="mt-1 flex w-full items-center justify-between border-t border-dashed border-accent pt-3">
            <div
              className={cn(
                'shrink-0 rounded-sm bg-primary px-2 py-0.5 text-2xs font-bold text-primary-foreground',
                ad.product.discount.hasDiscount ? 'opacity-100' : 'opacity-0'
              )}
            >
              ٪{toPersianDigits(ad.product.discount.discountPercent || 0)}
            </div>

            <div className="flex min-w-0 flex-col items-end">
              {ad.product.discount.hasDiscount && ad.product.discount.discountPrice ? (
                <span className="text-2xs leading-none text-muted-foreground line-through">
                  {ad.product.price.toman}
                </span>
              ) : null}
              <span className="mt-1 text-xs font-bold leading-none text-foreground">
                {ad.product.discount.hasDiscount
                  ? ad.product.discount.discountPrice
                  : ad.product.price.toman}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* موبایل */}
      <Link
        href={adProductUrl}
        className="block w-full select-none md:hidden"
        onClick={() => bannerTracker.trackClick(ad.id, ad.product.id)}
      >
        <div
          ref={impressionRef}
          className={cn(
            'group relative flex h-20 w-full items-center justify-between gap-3 rounded-lg border border-accent bg-accent/50 p-2.5 shadow-xs transition-all duration-normal',
            'hover:border-primary/40'
          )}
        >
          <div className="absolute end-2.5 top-2.5 z-10 select-none rounded-sm bg-primary px-1.5 py-0.5 text-2xs font-bold text-primary-foreground shadow-xs">
            منتخب
          </div>

          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card p-1">
            <Image
              src={getFullUrl(ad.imageUrl)}
              alt={ad.title}
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 pe-1.5 pt-2">
            <h4 className="line-clamp-2 ps-4 text-2xs font-bold leading-relaxed text-foreground">
              {ad.product.name}
            </h4>
            <div className="flex items-center gap-1 text-2xs text-muted-foreground">
              <Store aria-hidden="true" className="h-3 w-3 shrink-0 text-muted-foreground/75" />
              <span className="truncate">فروشگاه: {ad.product.shopName}</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end justify-center gap-1 ps-7">
            {ad.product.discount.hasDiscount ? (
              <div className="shrink-0 rounded-sm bg-primary px-1 py-0.5 text-2xs font-bold text-primary-foreground">
                ٪{toPersianDigits(ad.product.discount.discountPercent || 0)}
              </div>
            ) : null}

            <div className="flex flex-col items-end">
              {ad.product.discount.hasDiscount && ad.product.discount.discountPrice ? (
                <span className="text-2xs leading-none text-muted-foreground line-through">
                  {ad.product.price.toman}
                </span>
              ) : null}
              <span className="mt-0.5 text-2xs font-bold leading-none text-foreground">
                {ad.product.discount.hasDiscount
                  ? ad.product.discount.discountPrice
                  : ad.product.price.toman}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
