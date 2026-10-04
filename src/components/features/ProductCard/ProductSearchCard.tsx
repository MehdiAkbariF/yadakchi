// src/components/features/ProductCard/ProductSearchCard.tsx

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Store, BadgeCheck, Truck, Eye, Plus, Minus, Loader2 } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Button } from '@/components/primitives/Button/Button';
import { useGetBasket, useAddToBasket, useDeleteFromBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { showToast } from '@/core/utils/toast';
import { getProductUrl, toPersianDigits } from '@/core/utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { useImpression } from '@/shared/hooks/useImpression';
import { trackShopProductClick } from '@/core/utils/impression-tracker';

interface ProductSearchCardProps {
  product: any;
  showRating?: boolean;
  showAddToBasket?: boolean;
  className?: string;
}

export function ProductSearchCard({
  product,
  showRating = true,
  showAddToBasket = false,
  className
}: ProductSearchCardProps) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [activeLoading, setActiveLoading] = useState(false);

  const { data: rawBasket } = useGetBasket();
  const addToBasket = useAddToBasket();
  const deleteFromBasket = useDeleteFromBasket();

  const rawBasketData = rawBasket as any;
  const lastValidBasketRef = useRef<any>(null);

  if (rawBasketData && !rawBasketData.isEmpty) {
    lastValidBasketRef.current = rawBasketData;
  }

  const basket = rawBasketData && !rawBasketData.isEmpty ? rawBasketData : lastValidBasketRef.current;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const nominated = product?.nominatedShopProduct || {};
  
  // ✅ استخراج شناسه فروشگاه کالا (مستقیم از OpenSearch یا ساختار قدیمی)
  const shopProductId = product?.shopProductId || nominated?.id || product?.id || null;
  const impressionRef = useImpression(shopProductId);

  // ✅ عنوان کالا
  const title = product?.productTitle || product?.title || product?.name?.value || product?.name || '';

  // ✅ نام فروشگاه
  const shopName = product?.shopTitle || nominated?.shopTitle || product?.shop?.name || null;

  const isTipax = product?.isTipaxShipping || nominated?.isTipaxShipping || false;
  const isDirect = product?.isDirectShipping || nominated?.isDirectShipping || false;
  const salesCount = product?.totalSalesCount || product?.salesCount || 0;
  const views = product?.viewsAndClicks || product?.views || 0;

  // ✅ استخراج هوشمند قیمت‌ها (پشتیبانی مستقیم از rialRetailPrice و rialFinalPrice در OpenSearch)
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
    (product?.discount?.hasDiscount ? (product?.price?.raw * (1 - product?.discount?.percent / 100)) : null) ?? 
    product?.price?.raw ?? 
    (typeof product?.price === 'number' ? product.price : 0) ?? 
    originalPriceRaw
  );

  const originalPriceToman = Math.round(originalPriceRaw / 10);
  const finalPriceToman = Math.round(finalPriceRaw / 10);
  
  // وضعیت موجودی انبار
  const isOutOfStock = finalPriceRaw === 0 || (product?.quantity !== undefined && product.quantity === 0);

  // وضعیت تخفیف
  const hasDiscount = 
    product?.isDiscountApplied !== undefined 
      ? product.isDiscountApplied 
      : (originalPriceRaw > finalPriceRaw && !isOutOfStock);

  // درصد تخفیف
  const discountPercent = 
    product?.discountPercentage ?? 
    (hasDiscount && originalPriceRaw > 0 
      ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100) 
      : (nominated?.discountPercentage || product?.discount?.percent || 0));

  const basketItem = useMemo(() => {
    if (!basket || basket.isEmpty || !shopProductId) return null;
    for (const sub of basket.subBaskets) {
      const found = sub.items.find((item: any) => item.shopProductId === shopProductId);
      if (found) return found;
    }
    return null;
  }, [basket, shopProductId]);

  const isInBasket = !!basketItem;
  const basketQuantity = basketItem?.quantity || 0;
  
  const maxLimit = basketItem?.maxQuantity || product?.quantity || nominated?.maxQuantityPerOrder || nominated?.quantity || 10;

  const tickerItems = useMemo(() => {
    const items: { text: string; icon: any }[] = [];
    
    if (salesCount > 0) {
      items.push({ text: `${toPersianDigits(salesCount)} فروش موفق در یدک‌چی`, icon: BadgeCheck });
    }
    if (isTipax) {
      items.push({ text: 'ارسال سریع با تیپاکس', icon: Truck });
    }
    if (isDirect) {
      items.push({ text: 'ارسال مستقیم فروشگاه', icon: Truck });
    }
    if (views > 0) {
      items.push({ text: `${toPersianDigits(views)} بازدید اخیر`, icon: Eye });
    }
    
    return items;
  }, [isTipax, isDirect, salesCount, views]);

  const tickerLength = tickerItems.length;

  useEffect(() => {
    if (!isMounted || tickerLength <= 1) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerLength);
    }, 3000);
    return () => clearInterval(interval);
  }, [tickerLength, isMounted]);

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value);
  };

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
    if (shopProductId) {
      trackShopProductClick(shopProductId);
    }
  };

  const ratingValue = product?.averageRate || product?.rating?.average || 5;
  const ratingCount = product?.rateCount || product?.rating?.count || 0;

  const CurrentTickerIcon = tickerItems[tickerIndex]?.icon || Store;

  // ✅ لینک‌دهی مطمئن (کد کالا یا آیدی محصول OpenSearch)
  const codeOrId = product?.productCode || product?.code || product?.productId || product?.id;
  const productCardUrl = getProductUrl(codeOrId, title);

  // استخراج تصویر
  const imageSource = product?.image || product?.images?.[0]?.medium || product?.images?.[0]?.url || product?.images?.[0] || null;

  return (
    <div ref={impressionRef} className={cn("w-full transition-all select-none", className)}>
      
      {/* نسخه دسکتاپ */}
      <Link 
        href={productCardUrl}
        prefetch={false}
        onClick={handleCardClick}
        className="hidden md:flex w-full h-full flex-col bg-background rounded-xl border hover:border-primary/40 hover:shadow-md p-3 sm:p-3.5 relative select-none"
        draggable={false}
      >
        <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden mb-2 select-none" draggable={false}>
          <Image
            src={getFullUrl(imageSource)}
            alt={product?.imageAlt || title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
            className="object-contain rounded-lg select-none"
            draggable={false}
          />
        </div>

        <div className="w-full h-9 mb-1 mt-2 text-right">
          <h4 className="text-sm font-bold font-iran-sans text-foreground line-clamp-2 leading-relaxed">
            {title}
          </h4>
        </div>

        {showRating && (
          <div className="w-full flex items-center gap-1 mt-1 justify-start select-none">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-iran-sans font-bold text-foreground">
              {formatPrice(ratingValue)}
            </span>
            {ratingCount > 0 && (
              <span className="text-[9px] text-muted-foreground font-iran-sans">
                ({toPersianDigits(ratingCount)})
              </span>
            )}
          </div>
        )}

        {shopName && (
          <div className="w-full flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground/85 hover:text-primary transition-colors select-none mt-1.5 justify-start">
            <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground/75" />
            <span className="font-iran-sans font-medium truncate">فروشگاه: {shopName}</span>
          </div>
        )}

        <div className="w-full flex flex-col items-stretch select-none">
          {isMounted && tickerLength > 0 ? (
            <div className="h-6 overflow-hidden relative w-full flex items-center justify-start text-[10px] sm:text-xs text-muted-foreground mt-0.5 select-none shrink-0">
              <div className="hidden md:block w-full h-full relative">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={tickerIndex}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="absolute inset-x-0 top-0 bottom-0 flex items-center gap-1.5 font-iran-sans truncate h-full py-1 justify-start"
                  >
                    <CurrentTickerIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate font-medium text-right text-foreground">{tickerItems[tickerIndex]?.text}</span>
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="flex md:hidden items-center gap-1.5 font-iran-sans truncate w-full justify-start h-full">
                <CurrentTickerIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate font-medium text-right text-[10px]">{tickerItems[0]?.text}</span>
              </div>
            </div>
          ) : (
            <div className="h-6 mt-0.5 w-full shrink-0" />
          )}
        </div>

        <div className={cn(
          "w-full mt-auto pt-2 flex items-center justify-between",
          (isOutOfStock || !showAddToBasket) ? "pb-1" : "border-b border-dashed pb-3.5"
        )}>
          <div className={cn(
            "shrink-0 bg-primary/10 text-primary border border-primary/20 text-xs font-black font-iran-sans px-2.5 py-1 rounded-lg transition-opacity",
            hasDiscount && discountPercent > 0 ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            {toPersianDigits(discountPercent)}٪
          </div>

          <div className="flex flex-col items-end min-w-0">
            {hasDiscount && originalPriceToman > finalPriceToman && (
              <span className="text-[10px] sm:text-xs text-zinc-500 line-through font-iran-sans font-medium">
                {formatPrice(originalPriceToman)}
              </span>
            )}
            <div className="flex items-center gap-0.5 mt-0.5">
              {isOutOfStock ? (
                <span className="text-sm sm:text-base font-bold font-iran-sans text-destructive">
                  ناموجود
                </span>
              ) : (
                <>
                  <span className="text-base sm:text-lg font-black font-iran-sans text-foreground">
                    {formatPrice(finalPriceToman)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-iran-sans">تومان</span>
                </>
              )}
            </div>
          </div>
        </div>

        {showAddToBasket && !isOutOfStock && (
          <div className="w-full mt-3 h-9 shrink-0">
            {isInBasket ? (
              <div className="flex items-center border border-primary rounded-xl bg-background p-1 gap-1 shadow-sm h-full justify-between">
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={basketQuantity >= maxLimit || activeLoading}
                  className="p-1 hover:bg-muted text-primary rounded-lg transition-colors disabled:opacity-30"
                >
                  <Plus className="h-4.5 w-4.5" />
                </button>
                <span className="text-xs font-bold font-iran-sans text-primary">
                  {activeLoading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-primary mx-auto" />
                  ) : (
                    new Intl.NumberFormat('fa-IR').format(basketQuantity)
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={activeLoading}
                  className="p-1 hover:bg-muted text-primary rounded-lg transition-colors"
                >
                  <Minus className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToBasket}
                isLoading={activeLoading}
                className="w-full rounded-xl text-xs h-full text-primary border-primary hover:bg-primary/5"
              >
                <span>افزودن به سبد خرید</span>
              </Button>
            )}
          </div>
        )}
      </Link>

      {/* نسخه موبایل */}
      <Link
        href={productCardUrl}
        prefetch={false}
        onClick={handleCardClick}
        className="md:hidden flex flex-col w-full bg-background border-b border-zinc-100 dark:border-zinc-800/80 py-4 px-0 relative select-none"
        draggable={false}
      >
        <div className="flex w-full items-stretch gap-3">
          <div className="w-[100px] h-[100px] shrink-0 relative rounded-lg overflow-hidden bg-muted/10">
            <Image
              src={getFullUrl(imageSource)}
              alt={product?.imageAlt || title}
              fill
              sizes="100px"
              className="object-contain rounded-lg select-none"
              draggable={false}
            />
          </div>

          <div className="flex-1 flex flex-col justify-between min-w-0 text-right">
            <div className="w-full">
              <h4 className="text-xs font-bold font-iran-sans text-foreground line-clamp-2 leading-relaxed">
                {title}
              </h4>

              {showRating && (
                <div className="flex items-center gap-1 mt-1 justify-start select-none">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                  <span className="text-[10px] font-iran-sans font-bold text-foreground">
                    {formatPrice(ratingValue)}
                  </span>
                  {ratingCount > 0 && (
                    <span className="text-[9px] text-muted-foreground font-iran-sans">
                      ({toPersianDigits(ratingCount)})
                    </span>
                  )}
                </div>
              )}
              
              {shopName && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1.5 justify-start">
                  <Store className="h-3 w-3 shrink-0 text-muted-foreground/75" />
                  <span className="truncate">فروشگاه: {shopName}</span>
                </div>
              )}

              {isMounted && tickerLength > 0 ? (
                <div className="h-5 overflow-hidden relative w-full flex items-center justify-start text-[9px] sm:text-[10px] text-muted-foreground mt-1 select-none shrink-0">
                  <div className="flex items-center gap-1.5 font-iran-sans truncate w-full justify-start h-full">
                    <CurrentTickerIcon className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate font-medium text-right text-[10px]">{tickerItems[0]?.text}</span>
                  </div>
                </div>
              ) : (
                <div className="h-5 mt-1 w-full shrink-0" />
              )}
            </div>

            <div className="w-full flex items-end justify-between mt-2">
              <div className={cn(
                "bg-primary/10 text-primary border border-primary/20 text-[10px] font-black font-iran-sans px-2 py-0.5 rounded-lg",
                hasDiscount && discountPercent > 0 ? "opacity-100" : "opacity-0 pointer-events-none"
              )}>
                {toPersianDigits(discountPercent)}٪
              </div>

              <div className="flex flex-col items-end min-w-0">
                {hasDiscount && originalPriceToman > finalPriceToman && (
                  <span className="text-[9px] text-zinc-500 line-through font-iran-sans">
                    {formatPrice(originalPriceToman)}
                  </span>
                )}
                <div className="flex items-center gap-0.5">
                  {isOutOfStock ? (
                    <span className="text-xs font-bold font-iran-sans text-destructive">
                      ناموجود
                    </span>
                  ) : (
                    <>
                      <span className="text-sm font-black text-foreground font-iran-sans">
                        {formatPrice(finalPriceToman)}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-iran-sans">تومان</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showAddToBasket && !isOutOfStock && (
          <div className="w-full mt-3 h-8 shrink-0">
            {isInBasket ? (
              <div className="flex items-center border border-primary rounded-xl bg-background p-1 gap-1 shadow-sm h-full justify-between">
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={basketQuantity >= maxLimit || activeLoading}
                  className="p-1 hover:bg-muted text-primary rounded-lg transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-bold font-iran-sans text-primary">
                  {activeLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary mx-auto" />
                  ) : (
                    new Intl.NumberFormat('fa-IR').format(basketQuantity)
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={activeLoading}
                  className="p-1 hover:bg-muted text-primary rounded-lg transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToBasket}
                isLoading={activeLoading}
                className="w-full rounded-xl text-xs h-full text-primary border-primary hover:bg-primary/5"
              >
                <span>افزودن به سبد خرید</span>
              </Button>
            )}
          </div>
        )}
      </Link>

    </div>
  );
}