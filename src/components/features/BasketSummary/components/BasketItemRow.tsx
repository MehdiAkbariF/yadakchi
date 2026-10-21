'use client';

import { useState } from 'react';
import { Store, ShieldCheck, ShieldAlert, Truck, Trash2, Plus, Minus, Loader2 } from 'lucide-react';
import { useAddToBasket, useDeleteFromBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { showToast } from '@/core/utils/toast';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';

interface BasketItemRowProps {
  item: any;
}

export function BasketItemRow({ item }: BasketItemRowProps) {
  const [activeLoading, setActiveLoading] = useState(false);
  const addToBasket = useAddToBasket();
  const deleteFromBasket = useDeleteFromBasket();

  const originalPrice = item.price?.originalPriceRaw || 0;
  const finalPrice = (item.price?.finalTotalPriceRaw / item.quantity) || 0;
  const discountPercentage = originalPrice > finalPrice
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  const handleIncrease = async () => {
    if (activeLoading || !item.canIncrease) return;
    setActiveLoading(true);
    try {
      await addToBasket.mutateAsync({ shopProductId: item.shopProductId, quantity: 1 });
      showToast.success('تعداد کالا افزایش یافت');
    } catch {
    } finally {
      setActiveLoading(false);
    }
  };

  const handleDecrease = async () => {
    if (activeLoading || !item.canDecrease) return;
    setActiveLoading(true);
    try {
      await deleteFromBasket.mutateAsync({ shopProductId: item.shopProductId, quantity: 1 });
      showToast.success('تعداد کالا کاهش یافت');
    } catch {
    } finally {
      setActiveLoading(false);
    }
  };

  const handleRemove = async () => {
    if (activeLoading) return;
    setActiveLoading(true);
    try {
      await deleteFromBasket.mutateAsync({ shopProductId: item.shopProductId, quantity: item.quantity });
      showToast.success('کالا از سبد خرید حذف شد');
    } catch {
    } finally {
      setActiveLoading(false);
    }
  };

  const formatPersianNumber = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value);
  };

  return (
    <div className="relative p-4 md:p-5 flex flex-col md:flex-row items-start justify-between gap-4 md:gap-6 bg-background border-b border-zinc-100 last:border-b-0 text-right select-none" dir="rtl">
      
      {/* بخش راست: تصویر و کنترل تعداد در زیر آن */}
      <div className="flex flex-row md:flex-col items-center gap-3 shrink-0">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-2 flex items-center justify-center overflow-hidden">
          <img
            src={getFullUrl(item.product?.image)}
            alt={item.product?.title || 'محصول'}
            className="w-full h-full object-contain"
          />
        </div>

        {/* کنترلر تعداد (+ ۱ -) زیر عکس طبق دیزاین */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center border border-zinc-200 rounded-lg bg-background px-1 py-0.5 gap-2 shadow-xs h-8">
            <button
              type="button"
              onClick={handleIncrease}
              disabled={!item.canIncrease || activeLoading}
              className="p-1 hover:text-primary text-zinc-600 disabled:opacity-30 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <span className="w-5 text-center text-xs font-bold font-iran-yekan text-primary">
              {activeLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mx-auto text-primary" />
              ) : (
                formatPersianNumber(item.quantity)
              )}
            </span>
            <button
              type="button"
              onClick={handleDecrease}
              disabled={!item.canDecrease || activeLoading}
              className="p-1 hover:text-primary text-zinc-600 disabled:opacity-30 transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-[10px] text-zinc-400 font-iran-yekan">
            حداکثر {formatPersianNumber(item.maxQuantity || 5)} عدد
          </span>
        </div>
      </div>

      {/* بخش میانی: اطلاعات کالا و مشخصات */}
      <div className="flex-1 min-w-0 flex flex-col gap-2.5">
        <h3 className="text-xs md:text-sm font-bold text-foreground font-iran-yekan leading-6">
          {item.product?.title}
        </h3>

        <div className="flex flex-col gap-2 text-[11px] md:text-xs text-muted-foreground font-iran-yekan">
          <div className="flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span>فروشنده: {item.shop?.title || item.product?.shopName || 'پیروز یدک'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {item.warranty ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>{item.warranty}</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span>گارانتی اصالت و سلامت فیزیکی کالا</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-zinc-600">
            <Truck className="h-3.5 w-3.5 text-primary shrink-0" />
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

      {/* بخش چپ: قیمت، تخفیف و دکمه حذف */}
      <div className="w-full md:w-auto flex md:flex-col justify-between md:justify-between items-end gap-3 self-stretch pt-2 md:pt-0 border-t md:border-t-0 border-dashed border-zinc-100">
        
        {/* دکمه حذف کالا */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={activeLoading}
          className="text-zinc-400 hover:text-destructive flex items-center gap-1 text-[11px] font-iran-yekan transition-colors order-2 md:order-1"
        >
          <Trash2 className="h-4 w-4" />
          <span>حذف</span>
        </button>

        {/* قیمت و تخفیف */}
        <div className="flex flex-col items-end gap-1 order-1 md:order-2">
          {item.price?.hasDiscount && discountPercentage > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-400 line-through font-iran-yekan">
                {item.price.unitPrice}
              </span>
              <span className="bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {toPersianDigits(discountPercentage)}٪
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-sm md:text-base font-black text-foreground font-iran-yekan">
              {item.price?.finalTotalPrice}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}