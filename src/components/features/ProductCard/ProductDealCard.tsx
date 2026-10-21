'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Hourglass } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { getProductUrl, toPersianDigits, getFullUrl } from '@/core/utils/formatters';
import { useImpression } from '@/shared/hooks/useImpression';

export interface ProductDealCardProps {
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

  const expirationStr =
    nominated.discountUntil ||
    nominated.discountExpiration ||
    product?.discountExpiration;
  const hasExpiration = Boolean(expirationStr);

  const [timeLeft, setTimeLeft] = React.useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStart = React.useRef({ x: 0, y: 0 });

  const shopProductId = product?.shopProductId || nominated?.id || product?.id || null;
  const impressionRef = useImpression(shopProductId);

  React.useEffect(() => {
    if (!hasExpiration) return;

    const calculateTime = () => {
      const serverDate = serverTime ? new Date(serverTime) : new Date();
      const clientDate = new Date();
      const timeOffset = serverDate.getTime() - clientDate.getTime();
      const syncedNow = new Date(Date.now() + timeOffset);
      const diff = +new Date(expirationStr as string) - +syncedNow;

      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expirationStr, serverTime, hasExpiration]);

  const formatPersianDigits = (num: number) =>
    new Intl.NumberFormat('fa-IR', { useGrouping: false })
      .format(num)
      .padStart(2, '۰');

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
        <span className="text-2xs font-medium text-muted-foreground sm:text-xs">
          امتیاز {toPersianDigits(rating)}
        </span>
      </div>
    );
  };

  const codeOrId =
    product?.productCode || product?.code || product?.productId || product?.id;
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
          'relative flex h-full w-full select-none flex-col items-center rounded-lg border border-border bg-card p-3 transition-all duration-normal sm:p-3.5',
          'hover:border-primary/40 hover:shadow-sm',
          className
        )}
      >
        <div className="relative mb-2 aspect-[4/3] w-full select-none overflow-hidden rounded-md" draggable={false}>
          <Image
            src={getFullUrl(imageSource)}
            alt={product?.imageAlt || title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
            className="select-none rounded-md object-contain"
            draggable={false}
          />
        </div>

        <div className="mb-1 flex min-h-[2.6rem] w-full items-start justify-end select-none">
          <h4 className="line-clamp-2 w-full text-sm font-semibold leading-relaxed text-foreground">
            {title}
          </h4>
        </div>

        {showRating ? (
          <div className="mb-3 mt-1.5 flex w-full select-none justify-start">
            {renderStars()}
          </div>
        ) : null}

        <div className="mt-auto flex w-full items-center justify-between pt-2">
          <div
            className={cn(
              'shrink-0 rounded-sm border border-accent bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground transition-opacity duration-fast',
              hasDiscount && discountPercent > 0 ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
          >
            {toPersianDigits(discountPercent)}٪
          </div>

          <div className="flex min-w-0 flex-col items-end">
            {hasDiscount && originalPriceToman > finalPriceToman ? (
              <span className="text-2xs font-medium text-muted-foreground line-through sm:text-xs">
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

        {showTimer && hasExpiration ? (
          <div className="mt-2.5 flex w-full items-center justify-between border-t border-dashed border-border pt-1.5 text-muted-foreground">
            <div className="flex items-center gap-1 font-bold text-foreground" dir="ltr">
              <span className="rounded-sm bg-muted px-1.5 py-0.5 text-2xs">
                {formatPersianDigits(timeLeft.hours)}
              </span>
              <span className="text-muted-foreground">:</span>
              <span className="rounded-sm bg-muted px-1.5 py-0.5 text-2xs">
                {formatPersianDigits(timeLeft.minutes)}
              </span>
              <span className="text-muted-foreground">:</span>
              <span className="rounded-sm bg-muted px-1.5 py-0.5 text-2xs">
                {formatPersianDigits(timeLeft.seconds)}
              </span>
            </div>
            <Hourglass aria-hidden="true" className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
          </div>
        ) : null}
      </div>
    </Link>
  );
}
