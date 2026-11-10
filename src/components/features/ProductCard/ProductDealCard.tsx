// src/components/features/ProductCard/ProductDealCard.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Timer } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { getProductUrl, toPersianDigits, getFullUrl } from '@/core/utils/formatters';
import { useImpression } from '@/shared/hooks/useImpression';
import { useDiscountCountdown } from '@/shared/hooks/useDiscountCountdown';

export interface ProductDealCardProps {
  product: any;
  showTimer?: boolean;
  showRating?: boolean;
  className?: string;
}

export function ProductDealCard({
  product,
  showTimer = true,
  showRating = true,
  className,
}: ProductDealCardProps) {
  const nominated = product?.nominatedShopProduct || {};

  const title =
    product?.productTitle ||
    product?.title ||
    product?.name?.value ||
    product?.name ||
    '';

  const originalPriceRaw =
    product?.rialRetailPrice ??
    product?.price?.raw ??
    product?.price ??
    nominated?.rialRetailPrice ??
    nominated?.price ??
    0;

  const finalPriceRaw =
    product?.rialFinalPrice ??
    product?.discountPrice ??
    nominated?.rialFinalPrice ??
    nominated?.discountPrice ??
    originalPriceRaw;

  const originalPriceToman = Math.round(originalPriceRaw / 10);
  const finalPriceToman = Math.round(finalPriceRaw / 10);

  const hasDiscount =
    product?.isDiscountApplied !== undefined
      ? product.isDiscountApplied
      : originalPriceRaw > finalPriceRaw && finalPriceRaw > 0;

  const discountPercent =
    product?.discountPercentage ??
    product?.discount?.percent ??
    nominated?.discountPercentage ??
    (hasDiscount && originalPriceRaw > 0
      ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100)
      : 0);

  // استخراج تاریخ انقضای تخفیف
  const expirationStr =
    product?.discountUntil ||
    nominated?.discountUntil ||
    product?.discountExpiration ||
    nominated?.discountExpiration ||
    product?.discount?.expirationDate ||
    null;


  // اتصال به هوک شمارش معکوس همگام با ساعت سرور
  const { isExpired, formattedPersian } = useDiscountCountdown(expirationStr);
  const isTimerVisible = showTimer && Boolean(expirationStr) && !isExpired;

  const [isDragging, setIsDragging] = React.useState(false);
  const dragStart = React.useRef({ x: 0, y: 0 });

  const shopProductId = product?.shopProductId || nominated?.id || product?.id || null;
  const impressionRef = useImpression(shopProductId);

  const formatPrice = (value: number) => new Intl.NumberFormat('fa-IR').format(value);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const dx = Math.abs(e.clientX - dragStart.current.x);
    const dy = Math.abs(e.clientY - dragStart.current.y);
    if (dx > 6 || dy > 6) setIsDragging(true);
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
      if (dx > 6 || dy > 6) setIsDragging(true);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const renderStars = () => {
    const rating = product?.averageRate || product?.rating?.average || 5;
    return (
      <div className="flex select-none items-center gap-1">
        <Star aria-hidden="true" className="h-3 w-3 shrink-0 fill-warning text-warning" />
        <span className="text-2xs font-bold text-foreground sm:text-xs">
          {toPersianDigits(rating)}
        </span>
      </div>
    );
  };

  const codeOrId = product?.productCode || product?.code || product?.productId || product?.id;
  const productCardUrl = getProductUrl(codeOrId, title);

  const imageSource =
    product?.image ||
    product?.images?.[0]?.medium ||
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    null;

  return (
    <Link
      href={productCardUrl}
      prefetch={false}
      className="block h-full w-full select-none"
      draggable={false}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
    >
      <div
        ref={impressionRef}
        className={cn(
          'relative flex h-full w-full select-none flex-col items-center rounded-xl border border-border bg-card p-3 transition-all duration-normal sm:p-3.5',
          'hover:border-primary/40 hover:shadow-sm',
          className
        )}
      >
        <div className="relative mb-2 aspect-[4/3] w-full select-none overflow-hidden rounded-lg" draggable={false}>
          <Image
            src={getFullUrl(imageSource)}
            alt={product?.imageAlt || title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
            className="select-none rounded-lg object-contain"
            draggable={false}
          />

          {showRating ? (
            <div className="absolute start-2 top-2 z-10 flex items-center justify-center rounded-md bg-card/90 px-1.5 py-0.5 shadow-2xs backdrop-blur-sm border border-border/60">
              {renderStars()}
            </div>
          ) : null}
        </div>

        <div className="mb-1 flex min-h-[2.6rem] w-full items-start justify-end select-none">
          <h4 className="line-clamp-2 w-full text-xs sm:text-sm font-semibold leading-relaxed text-foreground">
            {title}
          </h4>
        </div>

        <div className="mt-auto flex w-full items-center justify-between pt-2">
          <div
            className={cn(
              'shrink-0 rounded-md bg-destructive text-destructive-foreground px-2 py-0.5 text-xs font-bold transition-opacity duration-fast',
              hasDiscount && discountPercent > 0 ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
          >
            {toPersianDigits(discountPercent)}%
          </div>

          <div className="flex min-w-0 flex-col items-end">
            {hasDiscount && originalPriceToman > finalPriceToman ? (
              <span className="text-2xs font-medium text-muted-foreground/80 line-through sm:text-xs">
                {formatPrice(originalPriceToman)}
              </span>
            ) : null}
            <div className="mt-0.5 flex items-center gap-0.5">
              <span className="text-base font-bold text-foreground sm:text-lg">
                {formatPrice(finalPriceToman)}
              </span>
              <span className="text-2xs text-muted-foreground">تومان</span>
            </div>
          </div>
        </div>

        {/* تایمر مینیمال و زنده همگام با سرور */}
        {isTimerVisible ? (
          <div className="mt-2.5 flex w-full items-center justify-between border-t border-dashed border-border/80 pt-2 text-muted-foreground">
            <div className="flex items-center gap-1 font-bold text-foreground" dir="ltr">
              <span className="rounded bg-muted px-1.5 py-0.5 text-2xs font-bold tabular-nums">
                {formattedPersian.hours}
              </span>
              <span className="text-muted-foreground/60 leading-none">:</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-2xs font-bold tabular-nums">
                {formattedPersian.minutes}
              </span>
              <span className="text-muted-foreground/60 leading-none">:</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-2xs font-bold tabular-nums">
                {formattedPersian.seconds}
              </span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <Timer aria-hidden="true" className="h-3.5 w-3.5" />
              <span className="text-3xs font-bold hidden">فرصت تخفیف</span>
            </div>
          </div>
        ) : null}
      </div>
    </Link>
  );
}