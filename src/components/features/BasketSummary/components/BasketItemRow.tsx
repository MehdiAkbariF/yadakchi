'use client';

import * as React from 'react';
import { Store, ShieldCheck, ShieldAlert, Truck, Trash2, Plus, Minus, Loader2 } from 'lucide-react';
import { useAddToBasket, useDeleteFromBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { showToast } from '@/core/utils/toast';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';

export interface BasketItemRowProps {
  item: any;
}

export function BasketItemRow({ item }: BasketItemRowProps) {
  const [activeLoading, setActiveLoading] = React.useState(false);
  const addToBasket = useAddToBasket();
  const deleteFromBasket = useDeleteFromBasket();

  const originalPrice = item.price?.originalPriceRaw || 0;
  const finalPrice = item.price?.finalTotalPriceRaw / item.quantity || 0;
  const discountPercentage =
    originalPrice > finalPrice
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      : 0;

  const handleIncrease = async () => {
    if (activeLoading || !item.canIncrease) return;
    setActiveLoading(true);
    try {
      await addToBasket.mutateAsync({ shopProductId: item.shopProductId, quantity: 1 });
      showToast.success('تعداد کالا افزایش یافت');
    } catch {} finally {
      setActiveLoading(false);
    }
  };

  const handleDecrease = async () => {
    if (activeLoading || !item.canDecrease) return;
    setActiveLoading(true);
    try {
      await deleteFromBasket.mutateAsync({ shopProductId: item.shopProductId, quantity: 1 });
      showToast.success('تعداد کالا کاهش یافت');
    } catch {} finally {
      setActiveLoading(false);
    }
  };

  const handleRemove = async () => {
    if (activeLoading) return;
    setActiveLoading(true);
    try {
      await deleteFromBasket.mutateAsync({ shopProductId: item.shopProductId, quantity: item.quantity });
      showToast.success('کالا از سبد خرید حذف شد');
    } catch {} finally {
      setActiveLoading(false);
    }
  };

  const formatPersianNumber = (value: number) => new Intl.NumberFormat('fa-IR').format(value);

  return (
    <div className="relative flex select-none flex-col items-start justify-between gap-4 border-b border-border bg-card p-4 last:border-b-0 md:flex-row md:gap-6 md:p-5">
      <div className="flex shrink-0 flex-row items-center gap-3 md:flex-col">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border border-border bg-muted p-2 md:h-28 md:w-28">
          <img
            src={getFullUrl(item.product?.image)}
            alt={item.product?.title || 'محصول'}
            className="h-full w-full object-contain"
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex h-8 items-center gap-2 rounded-sm border border-border bg-card px-1 py-0.5 shadow-xs">
            <button
              type="button"
              onClick={handleIncrease}
              disabled={!item.canIncrease || activeLoading}
              aria-label="افزایش تعداد"
              className="p-1 text-muted-foreground transition-colors hover:text-primary disabled:opacity-30"
            >
              <Plus aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
            <span className="w-5 text-center text-xs font-bold text-primary">
              {activeLoading ? (
                <Loader2 aria-hidden="true" className="mx-auto h-3 w-3 animate-spin text-primary" />
              ) : (
                formatPersianNumber(item.quantity)
              )}
            </span>
            <button
              type="button"
              onClick={handleDecrease}
              disabled={!item.canDecrease || activeLoading}
              aria-label="کاهش تعداد"
              className="p-1 text-muted-foreground transition-colors hover:text-primary disabled:opacity-30"
            >
              <Minus aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-2xs text-muted-foreground">
            حداکثر {formatPersianNumber(item.maxQuantity || 5)} عدد
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <h3 className="text-xs font-bold leading-6 text-foreground md:text-sm">{item.product?.title}</h3>

        <div className="flex flex-col gap-2 text-2xs text-muted-foreground md:text-xs">
          <div className="flex items-center gap-1.5">
            <Store aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span>فروشنده: {item.shop?.title || item.product?.shopName || 'پیروز یدک'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {item.warranty ? (
              <>
                <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-success" />
                <span>{item.warranty}</span>
              </>
            ) : (
              <>
                <ShieldAlert aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span>گارانتی اصالت و سلامت فیزیکی کالا</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Truck aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />
            {item.isTipaxShipping ? (
              <span>ارسال توسط تیپاکس</span>
            ) : item.isDirectShipping ? (
              <span>ارسال مستقیم توسط فروشنده</span>
            ) : (
              <span>ارسال فوری با یدکچی اکسپرس</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full items-end justify-between gap-3 self-stretch border-t border-dashed border-border pt-2 md:w-auto md:flex-col md:justify-between md:border-t-0 md:pt-0">
        <button
          type="button"
          onClick={handleRemove}
          disabled={activeLoading}
          className="order-2 flex items-center gap-1 text-2xs text-muted-foreground transition-colors hover:text-destructive md:order-1"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          <span>حذف</span>
        </button>

        <div className="order-1 flex flex-col items-end gap-1 md:order-2">
          {item.price?.hasDiscount && discountPercentage > 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="text-2xs text-muted-foreground line-through">{item.price.unitPrice}</span>
              <span className="rounded-full bg-destructive px-1.5 py-0.5 text-2xs font-bold text-destructive-foreground">
                {toPersianDigits(discountPercentage)}٪
              </span>
            </div>
          ) : null}
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-foreground md:text-base">{item.price?.finalTotalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
