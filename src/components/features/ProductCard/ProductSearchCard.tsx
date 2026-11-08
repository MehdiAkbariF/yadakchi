// src/components/features/ProductCard/ProductSearchCard.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Store, Package, Plus, Minus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';
import { Button } from '@/components/primitives/Button/Button';
import { useGetBasket, useAddToBasket, useDeleteFromBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { showToast } from '@/core/utils/toast';
import { getProductUrl, toPersianDigits, getFullUrl } from '@/core/utils/formatters';
import { useImpression } from '@/shared/hooks/useImpression';
import { trackShopProductClick } from '@/core/utils/impression-tracker';

export interface ProductSearchCardProps {
  product: any;
  showRating?: boolean;
  showAddToBasket?: boolean;
  className?: string;
}

export function ProductSearchCard({
  product,
  showRating = true,
  showAddToBasket = false,
  className,
}: ProductSearchCardProps) {
  const [tickerIndex, setTickerIndex] = React.useState(0);
  const [isMounted, setIsMounted] = React.useState(false);
  const [activeLoading, setActiveLoading] = React.useState(false);

  const { data: rawBasket } = useGetBasket();
  const addToBasket = useAddToBasket();
  const deleteFromBasket = useDeleteFromBasket();

  const rawBasketData = rawBasket as any;
  const lastValidBasketRef = React.useRef<any>(null);

  if (rawBasketData && !rawBasketData.isEmpty) {
    lastValidBasketRef.current = rawBasketData;
  }
  const basket =
    rawBasketData && !rawBasketData.isEmpty ? rawBasketData : lastValidBasketRef.current;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const nominated = product?.nominatedShopProduct || {};
  const shopProductId = product?.shopProductId || nominated?.id || product?.id || null;
  const impressionRef = useImpression(shopProductId);

  const title =
    product?.productTitle || product?.title || product?.name?.value || product?.name || '';

  const shopName = product?.shopTitle || nominated?.shopTitle || product?.shop?.name || '';
  const scoreValue = product?.score ?? nominated?.score ?? product?.averageRate ?? 5;
  const quantityValue = product?.quantity ?? nominated?.quantity ?? 0;

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
      (product?.discount?.hasDiscount
        ? product?.price?.raw * (1 - product?.discount?.percent / 100)
        : null) ??
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

  const basketItem = React.useMemo(() => {
    if (!basket || basket.isEmpty || !shopProductId) return null;
    for (const sub of basket.subBaskets) {
      const found = sub.items.find((item: any) => item.shopProductId === shopProductId);
      if (found) return found;
    }
    return null;
  }, [basket, shopProductId]);

  const isInBasket = Boolean(basketItem);
  const basketQuantity = basketItem?.quantity || 0;
  const maxLimit =
    basketItem?.maxQuantity ||
    product?.quantity ||
    nominated?.maxQuantityPerOrder ||
    nominated?.quantity ||
    10;

  // ✅ ساخت اسلایدر فاقد موارد تیکر در صورت ناموجود بودن کالا
  const tickerItems = React.useMemo(() => {
    if (isOutOfStock) return [];

    const items: { text: string; icon: any; isShop?: boolean }[] = [];

    const displayShopName = shopName && shopName.trim() !== '' ? shopName : 'یدکچی';
    items.push({
      text: `فروشگاه: ${displayShopName}`,
      icon: Store,
      isShop: true,
    });

    items.push({
      text: `امتیاز: ${toPersianDigits(scoreValue)} از ۵`,
      icon: Star,
    });

    items.push({
      text: quantityValue > 0 ? `موجودی در انبار: ${toPersianDigits(quantityValue)} عدد` : 'وضعیت: ناموجود در انبار',
      icon: Package,
    });

    return items;
  }, [shopName, scoreValue, quantityValue, isOutOfStock]);

  const tickerLength = tickerItems.length;

  React.useEffect(() => {
    if (!isMounted || tickerLength <= 1 || isOutOfStock) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerLength);
    }, 3000);
    return () => clearInterval(interval);
  }, [tickerLength, isMounted, isOutOfStock]);

  const formatPrice = (value: number) => new Intl.NumberFormat('fa-IR').format(value);

  const handleAddToBasket = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!shopProductId || isOutOfStock) return;
    setActiveLoading(true);
    try {
      await addToBasket.mutateAsync({ shopProductId, quantity: 1 });
      showToast.success('قطعه به سبد خرید اضافه شد');
    } catch (err: any) {
    } finally {
      setActiveLoading(false);
    }
  };

  const handleIncrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!shopProductId || activeLoading || basketQuantity >= maxLimit) return;
    setActiveLoading(true);
    try {
      await addToBasket.mutateAsync({ shopProductId, quantity: 1 });
      showToast.success('تعداد کالا افزایش یافت');
    } catch (err: any) {
    } finally {
      setActiveLoading(false);
    }
  };

  const handleDecrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!shopProductId || activeLoading) return;
    setActiveLoading(true);
    try {
      await deleteFromBasket.mutateAsync({ shopProductId, quantity: 1 });
      showToast.success('تعداد کالا کاهش یافت');
    } catch (err: any) {
    } finally {
      setActiveLoading(false);
    }
  };

  const handleCardClick = () => {
    if (shopProductId) trackShopProductClick(shopProductId);
  };

  const ratingValue = product?.averageRate || product?.rating?.average || scoreValue;
  const ratingCount = product?.rateCount || product?.rating?.count || 0;

  const CurrentTickerIcon = tickerItems[tickerIndex]?.icon || Store;
  const currentItem = tickerItems[tickerIndex];

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
    <div ref={impressionRef} className={cn('w-full min-w-0 select-none transition-all', className)}>
      
      {/* ================= نسخه دسکتاپ ================= */}
      <Link
        href={productCardUrl}
        prefetch={false}
        onClick={handleCardClick}
        className={cn(
          'relative hidden h-full w-full select-none flex-col rounded-lg border border-border bg-card p-3 transition-all duration-normal sm:p-3.5 md:flex',
          'hover:border-primary/40 hover:shadow-sm'
        )}
        draggable={false}
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

        <div className="mb-1 mt-2 h-9 w-full">
          <h4 className="line-clamp-2 text-sm font-semibold leading-relaxed text-foreground">
            {title}
          </h4>
        </div>

        {showRating && !isOutOfStock ? (
          <div className="mt-1 flex w-full select-none items-center justify-start gap-1">
            <Star aria-hidden="true" className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" />
            <span className="text-2xs font-bold text-foreground sm:text-xs">
              {formatPrice(ratingValue)}
            </span>
            {ratingCount > 0 ? (
              <span className="text-2xs text-muted-foreground">
                ({toPersianDigits(ratingCount)})
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex w-full select-none flex-col items-stretch">
          {isMounted && tickerLength > 0 && !isOutOfStock ? (
            <div className="relative mt-1.5 flex h-6 w-full shrink-0 select-none items-center justify-start overflow-hidden text-2xs text-muted-foreground sm:text-xs">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`desktop-ticker-${tickerIndex}`}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="flex h-full w-full items-center justify-start gap-1.5 truncate"
                >
                  <CurrentTickerIcon
                    aria-hidden="true"
                    className={cn(
                      'h-3.5 w-3.5 shrink-0',
                      currentItem?.isShop ? 'text-shop' : 'text-primary'
                    )}
                  />
                  <span
                    className={cn(
                      'truncate font-medium',
                      currentItem?.isShop ? 'text-shop font-semibold' : 'text-foreground'
                    )}
                  >
                    {currentItem?.text}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <div className="mt-1.5 h-6 w-full shrink-0 flex items-center text-2xs text-muted-foreground">
              {isOutOfStock ? 'وضعیت: ناموجود در انبار' : ''}
            </div>
          )}
        </div>

        <div
          className={cn(
            'mt-auto flex w-full items-center justify-between pt-2',
            isOutOfStock || !showAddToBasket
              ? 'pb-1'
              : 'border-b border-dashed border-border pb-3.5'
          )}
        >
          <div
            className={cn(
              'shrink-0 rounded-sm border border-accent bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground transition-opacity duration-fast',
              hasDiscount && discountPercent > 0 && !isOutOfStock ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
          >
            {toPersianDigits(discountPercent)}٪
          </div>

          <div className="flex min-w-0 flex-col items-end">
            {hasDiscount && originalPriceToman > finalPriceToman && !isOutOfStock ? (
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

        {showAddToBasket && !isOutOfStock ? (
          <div className="mt-3 h-9 w-full shrink-0">
            {isInBasket ? (
              <div className="flex h-full items-center justify-between gap-1 rounded-md border border-primary bg-card p-1 shadow-xs">
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={basketQuantity >= maxLimit || activeLoading}
                  aria-label="افزایش تعداد"
                  className="rounded-sm p-1 text-primary transition-colors hover:bg-muted disabled:opacity-30"
                >
                  <Plus aria-hidden="true" className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-primary">
                  {activeLoading ? (
                    <Loader2 aria-hidden="true" className="mx-auto h-4 w-4 animate-spin text-primary" />
                  ) : (
                    new Intl.NumberFormat('fa-IR').format(basketQuantity)
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={activeLoading}
                  aria-label="کاهش تعداد"
                  className="rounded-sm p-1 text-primary transition-colors hover:bg-muted"
                >
                  <Minus aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToBasket}
                isLoading={activeLoading}
                className="h-full w-full border-primary text-xs text-primary hover:bg-accent"
              >
                <span>افزودن به سبد خرید</span>
              </Button>
            )}
          </div>
        ) : null}
      </Link>

      {/* ================= نسخه موبایل ================= */}
      <Link
        href={productCardUrl}
        prefetch={false}
        onClick={handleCardClick}
        className="relative flex w-full min-w-0 select-none flex-col border-b border-border bg-card px-3 py-3.5 md:hidden"
        draggable={false}
      >
        <div className="flex w-full min-w-0 items-start gap-3">
          <div className="relative h-[96px] w-[96px] shrink-0 overflow-hidden rounded-md bg-muted">
            <Image
              src={getFullUrl(imageSource)}
              alt={product?.imageAlt || title}
              fill
              sizes="96px"
              className="select-none rounded-md object-contain"
              draggable={false}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
            <div className="w-full min-w-0">
              <h4 className="line-clamp-2 text-xs font-semibold leading-relaxed text-foreground">
                {title}
              </h4>

              {showRating && !isOutOfStock ? (
                <div className="mt-1 flex select-none items-center justify-start gap-1">
                  <Star aria-hidden="true" className="h-3 w-3 shrink-0 fill-warning text-warning" />
                  <span className="text-2xs font-bold text-foreground">
                    {formatPrice(ratingValue)}
                  </span>
                  {ratingCount > 0 ? (
                    <span className="text-2xs text-muted-foreground">
                      ({toPersianDigits(ratingCount)})
                    </span>
                  ) : null}
                </div>
              ) : null}

              {isMounted && tickerLength > 0 && !isOutOfStock ? (
                <div className="relative mt-1.5 flex h-5 w-full min-w-0 shrink-0 select-none items-center justify-start overflow-hidden text-2xs text-muted-foreground">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`mobile-ticker-${tickerIndex}`}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="flex h-full w-full min-w-0 items-center justify-start gap-1.5 truncate"
                    >
                      <CurrentTickerIcon
                        aria-hidden="true"
                        className={cn(
                          'h-3 w-3 shrink-0',
                          currentItem?.isShop ? 'text-shop' : 'text-primary'
                        )}
                      />
                      <span
                        className={cn(
                          'truncate text-2xs font-medium',
                          currentItem?.isShop ? 'text-shop font-semibold' : 'text-foreground'
                        )}
                      >
                        {currentItem?.text}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <div className="mt-1.5 h-5 w-full shrink-0 flex items-center text-2xs text-muted-foreground">
                  {isOutOfStock ? 'وضعیت: ناموجود در انبار' : ''}
                </div>
              )}
            </div>

            <div className="mt-2 flex w-full min-w-0 items-end justify-between pt-1">
              <div
                className={cn(
                  'rounded-sm border border-accent bg-accent px-2 py-0.5 text-2xs font-bold text-accent-foreground shrink-0',
                  hasDiscount && discountPercent > 0 && !isOutOfStock
                    ? 'opacity-100'
                    : 'pointer-events-none opacity-0'
                )}
              >
                {toPersianDigits(discountPercent)}٪
              </div>

              <div className="flex min-w-0 flex-col items-end">
                {hasDiscount && originalPriceToman > finalPriceToman && !isOutOfStock ? (
                  <span className="text-2xs text-muted-foreground line-through">
                    {formatPrice(originalPriceToman)}
                  </span>
                ) : null}
                <div className="flex items-center gap-0.5">
                  {isOutOfStock ? (
                    <span className="text-xs font-bold text-destructive">ناموجود</span>
                  ) : (
                    <>
                      <span className="text-title-sm">
                        {formatPrice(finalPriceToman)}
                      </span>
                      <span className="text-2xs text-muted-foreground">تومان</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showAddToBasket && !isOutOfStock ? (
          <div className="mt-3 h-8 w-full shrink-0">
            {isInBasket ? (
              <div className="flex h-full items-center justify-between gap-1 rounded-md border border-primary bg-card p-1 shadow-xs">
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={basketQuantity >= maxLimit || activeLoading}
                  aria-label="افزایش تعداد"
                  className="rounded-sm p-1 text-primary transition-colors hover:bg-muted"
                >
                  <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-bold text-primary">
                  {activeLoading ? (
                    <Loader2 aria-hidden="true" className="mx-auto h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    new Intl.NumberFormat('fa-IR').format(basketQuantity)
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={activeLoading}
                  aria-label="کاهش تعداد"
                  className="rounded-sm p-1 text-primary transition-colors hover:bg-muted"
                >
                  <Minus aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToBasket}
                isLoading={activeLoading}
                className="h-full w-full border-primary text-xs text-primary hover:bg-accent"
              >
                <span>افزودن به سبد خرید</span>
              </Button>
            )}
          </div>
        ) : null}
      </Link>
    </div>
  );
}