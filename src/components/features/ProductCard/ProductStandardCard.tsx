'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Store, BadgeCheck, Truck, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';
import { getProductUrl, toPersianDigits, getFullUrl } from '@/core/utils/formatters';
import { useImpression } from '@/shared/hooks/useImpression';
import { trackShopProductClick } from '@/core/utils/impression-tracker';

export interface ProductStandardCardProps {
  product: any;
  showRating?: boolean;
  className?: string;
}

export function ProductStandardCard({
  product,
  showRating = true,
  className,
}: ProductStandardCardProps) {
  const [tickerIndex, setTickerIndex] = React.useState(0);
  const [isMounted, setIsMounted] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStart = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const nominated = product?.nominatedShopProduct || {};

  const shopProductId = product?.shopProductId || nominated?.id || product?.id || null;
  const impressionRef = useImpression(shopProductId);

  const title =
    product?.productTitle ||
    product?.title ||
    product?.name?.value ||
    product?.name ||
    '';

  const shopName = product?.shopTitle || nominated?.shopTitle || product?.shop?.name || null;

  const isTipax = product?.isTipaxShipping || nominated?.isTipaxShipping || false;
  const isDirect = product?.isDirectShipping || nominated?.isDirectShipping || false;
  const salesCount = product?.totalSalesCount || product?.salesCount || 0;
  const views = product?.viewsAndClicks || product?.views || 0;

  const originalPriceRaw = Number(
    product?.rialRetailPrice ??
      nominated?.rialRetailPrice ??
      product?.price?.raw ??
      (typeof product?.price === 'number' ? product.price : 0) ??
      nominated?.price ??
      0
  );

  const finalPriceRaw = Number(
    product?.rialFinalPrice ??
      nominated?.rialFinalPrice ??
      product?.discount?.discountedPriceRaw ??
      product?.discountPrice ??
      nominated?.discountPrice ??
      product?.price?.raw ??
      (typeof product?.price === 'number' ? product.price : 0) ??
      originalPriceRaw
  );

  const originalPriceToman = Math.round(originalPriceRaw / 10);
  const finalPriceToman = Math.round(finalPriceRaw / 10);

  const isOutOfStock =
    finalPriceRaw === 0 || (product?.quantity !== undefined && product.quantity === 0);

  const hasDiscount =
    product?.isDiscountApplied !== undefined
      ? product.isDiscountApplied
      : originalPriceRaw > finalPriceRaw && !isOutOfStock;

  const discountPercent =
    product?.discountPercentage ??
    (hasDiscount && originalPriceRaw > 0
      ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100)
      : nominated?.discountPercentage || product?.discount?.percent || 0);

  const tickerItems = React.useMemo(() => {
    const items: { text: string; icon: any }[] = [];
    if (salesCount > 0) {
      items.push({ text: `${toPersianDigits(salesCount)} فروش موفق در یدک‌چی`, icon: BadgeCheck });
    }
    if (isTipax) items.push({ text: 'ارسال سریع با تیپاکس', icon: Truck });
    if (isDirect) items.push({ text: 'ارسال مستقیم فروشگاه', icon: Truck });
    if (views > 0) {
      items.push({ text: `${toPersianDigits(views)} بازدید اخیر`, icon: Eye });
    }
    return items;
  }, [isTipax, isDirect, salesCount, views]);

  const tickerLength = tickerItems.length;

  React.useEffect(() => {
    if (!isMounted || tickerLength <= 1) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerLength);
    }, 3000);
    return () => clearInterval(interval);
  }, [tickerLength, isMounted]);

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
      return;
    }
    if (shopProductId) trackShopProductClick(shopProductId);
  };

  const renderStars = () => {
    const rating = product?.averageRate || product?.rating?.average || 5;
    return (
      <div className="flex select-none items-center gap-1">
        <Star aria-hidden="true" className="h-3 w-3 shrink-0 fill-warning text-warning" />
        <span className="text-2xs font-bold text-foreground sm:text-xs">
          {formatPrice(rating)}
        </span>
      </div>
    );
  };

  const CurrentTickerIcon = tickerItems[tickerIndex]?.icon || Store;

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

          {showRating ? (
            <div className="absolute start-2 top-2 z-10 flex items-center justify-center rounded-sm bg-card/85 px-2 py-0.5 backdrop-blur-sm">
              {renderStars()}
            </div>
          ) : null}
        </div>

        <div className="mb-1 mt-2 h-9 w-full">
          <h4 className="line-clamp-2 w-full text-sm font-semibold leading-relaxed text-foreground">
            {title}
          </h4>
        </div>

        {shopName ? (
          <div className="mt-1 flex w-full select-none items-center gap-1 text-2xs transition-colors hover:text-primary sm:text-xs">
            <Store aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium text-shop">فروشگاه: {shopName}</span>
          </div>
        ) : null}

        <div className="flex w-full select-none flex-col items-stretch">
          {isMounted && tickerLength > 0 ? (
            <div className="relative mt-0.5 flex h-6 w-full shrink-0 select-none items-center justify-start overflow-hidden text-2xs text-muted-foreground sm:text-xs">
              <div className="relative hidden h-full w-full md:block">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={tickerIndex}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="absolute inset-x-0 bottom-0 top-0 flex h-full items-center justify-start gap-1.5 truncate py-1"
                  >
                    <CurrentTickerIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate font-medium text-foreground">
                      {tickerItems[tickerIndex]?.text}
                    </span>
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="flex h-full w-full items-center justify-start gap-1.5 truncate md:hidden">
                <CurrentTickerIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate text-2xs font-medium">{tickerItems[0]?.text}</span>
              </div>
            </div>
          ) : (
            <div className="mt-0.5 h-6 w-full shrink-0" />
          )}
        </div>

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
              {isOutOfStock ? (
                <span className="text-sm font-bold text-destructive sm:text-base">ناموجود</span>
              ) : (
                <>
                  <span className="text-base font-bold text-foreground sm:text-lg">
                    {formatPrice(finalPriceToman)}
                  </span>
                  <span className="text-2xs text-muted-foreground">تومان</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
