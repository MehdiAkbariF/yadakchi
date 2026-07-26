'use client';

import { useState } from 'react';
import { Store, ShieldCheck, ShieldAlert, Truck, Sparkles, Plus, Minus, Loader2, Trash2 } from 'lucide-react';
import { useAddToBasket, useDeleteFromBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';
import { toPersianDigits } from '@/core/utils/formatters';

interface BasketItemRowProps {
  item: any;
}

export function BasketItemRow({ item }: BasketItemRowProps) {
  const [activeLoading, setActiveLoading] = useState(false);
  const addToBasket = useAddToBasket();
  const deleteFromBasket = useDeleteFromBasket();

  // محاسبه درصد تخفیف واقعی بر اساس قیمت خام واحد و قیمت نهایی
  const originalPrice = item.price.originalPriceRaw || 0;
  const finalPrice = (item.price.finalTotalPriceRaw / item.quantity) || 0;
  const discountPercentage = originalPrice > finalPrice
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  const handleIncrease = async () => {
    if (activeLoading || !item.canIncrease) return;
    setActiveLoading(true);
    try {
      await addToBasket.mutateAsync({ shopProductId: item.shopProductId, quantity: 1 });
      showToast.success('تعداد کالا افزایش یافت');
    } catch (err: any) {
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
    } catch (err: any) {
    } finally {
      setActiveLoading(false);
    }
  };

  const handleRemove = async () => {
    if (activeLoading) return;
    setActiveLoading(true);
    try {
      await deleteFromBasket.mutateAsync({ shopProductId: item.shopProductId, quantity: item.quantity });
      showToast.success('قطعه با موفقیت از سبد خرید حذف شد');
    } catch (err: any) {
    } finally {
      setActiveLoading(false);
    }
  };

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const formatPersianNumber = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value);
  };

  return (
    <div className="relative p-5 md:p-6 flex flex-col md:flex-row justify-between gap-5 bg-background border-b 
    border-zinc-150 last:border-b-0 select-none text-right">
      
      {/* بخش اطلاعات محصول (سمت راست کارت) */}
      <div className="flex-1 min-w-0 flex flex-col gap-3.5">
        
        {/* نشان تخفیف ویژه در بالای اطلاعات محصول (سمت راست بالا) */}
        {item.price.hasDiscount && discountPercentage > 0 && (
          <div className="self-start bg-destructive/10 text-destructive border border-destructive/20 text-[10px] md:text-xs font-black px-2.5 py-1 rounded-lg animate-in zoom-in duration-200">
            تخفیف ویژه {toPersianDigits(discountPercentage)}٪
          </div>
        )}

        <h4 className="text-sm md:text-base font-extrabold text-foreground font-iran-yekan leading-relaxed break-words">
          {item.product.title}
        </h4>

        {/* لیست اطلاعات با یک درجه فونت سایز بزرگتر (text-xs md:text-sm) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground font-iran-yekan">
            {item.shop?.logo ? (
              <img 
                src={getFullUrl(item.shop.logo)} 
                className="w-4.5 h-4.5 object-contain rounded-md" 
                alt="" 
              />
            ) : (
              <Store className="h-4.5 w-4.5 text-muted-foreground/80 shrink-0" />
            )}
            <span>{item.shop?.title || item.product?.shopName || 'پیروز یدک'}</span>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground font-iran-yekan">
            {item.warranty ? (
              <>
                <ShieldCheck className="h-4.5 w-4.5 text-success-500 shrink-0" />
                <span>{item.warranty}</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
                <span>بدون گارانتی</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground font-iran-yekan">
            <Sparkles className="h-4.5 w-4.5 text-primary shrink-0" />
            <span>{item.type === 'New' || item.type === 'نو' ? 'قطعه نو' : 'قطعه استوک'}</span>
          </div>

          <div className="flex flex-col gap-2 text-xs md:text-sm text-muted-foreground font-iran-yekan">
            {item.isTipaxShipping && (
              <div className="flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
                <span>ارسال توسط تیپاکس</span>
              </div>
            )}
            {item.isDirectShipping && (
              <div className="flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
                <span>ارسال توسط فروشنده ({formatPersianNumber(item.dayOfDelivery)} روز دیگر)</span>
              </div>
            )}
            {!item.isTipaxShipping && !item.isDirectShipping && (
              <div className="flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
                <span>تحویل حضوری</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* چیدمان ستونی دسکتاپ (سمت چپ کارت): عکس -> قیمت -> دکمه‌های کنترل -> دکمه حذف */}
      <div className="hidden md:flex flex-col items-center shrink-0 w-44 gap-4 border-r border-dashed pr-6 mr-2">
        
        {/* ۱. عکس در بالاترین قسمت قرار گرفته است */}
        <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden border bg-muted/10 flex items-center justify-center p-1 shadow-sm">
          <img
            src={getFullUrl(item.product.image)}
            alt={item.product.title}
            className="w-full h-full object-contain"
          />
        </div>

        {/* ۲. قیمت در زیر عکس قرار گرفته است */}
        <div className="flex flex-col items-center text-center gap-1.5">
          {item.price.hasDiscount && (
            <span className="text-xs text-zinc-400 line-through font-iran-yekan leading-none">
              {item.price.unitPrice}
            </span>
          )}
          <span className="text-base md:text-lg font-black text-foreground font-iran-yekan leading-none">
            {item.price.finalTotalPrice}
          </span>
        </div>

        {/* ۳. دکمه‌های کنترل تعداد و تعداد مجاز در زیر قیمت */}
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="flex items-center border border-primary rounded-xl bg-background p-1 gap-1 shadow-sm h-9 w-full justify-between">
            <button
              type="button"
              onClick={handleIncrease}
              disabled={!item.canIncrease || activeLoading}
              className="p-1 hover:bg-muted text-primary rounded-lg disabled:opacity-30 transition-colors outline-none"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold font-iran-yekan text-primary">
              {activeLoading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin text-primary mx-auto" />
              ) : (
                formatPersianNumber(item.quantity)
              )}
            </span>
            <button
              type="button"
              onClick={handleDecrease}
              disabled={!item.canDecrease || activeLoading}
              className="p-1 hover:bg-muted text-primary rounded-lg disabled:opacity-30 transition-colors outline-none"
            >
              <Minus className="h-4.5 w-4.5" />
            </button>
          </div>
          
          <span className="text-[10px] text-muted-foreground font-iran-yekan font-bold">
            (حداکثر {formatPersianNumber(item.maxQuantity)} عدد)
          </span>

          {/* ۴. دکمه دیلیت در پایین ستون */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={activeLoading}
            className="p-2 w-full border border-zinc-200 hover:border-destructive/20 hover:bg-destructive/5 text-muted-foreground hover:text-destructive rounded-xl transition-all h-9 flex items-center justify-center gap-1.5 outline-none text-xs font-bold"
          >
            <Trash2 className="h-4 w-4" />
            <span>حذف کالا</span>
          </button>
        </div>
      </div>

      {/* چیدمان موبایل کارت محصول (سایز تاچ بزرگتر و چیدمان متراکم) */}
      <div className="flex md:hidden flex-col gap-4 border-t border-dashed pt-4 mt-2 w-full">
        <div className="flex items-start justify-between gap-4">
          
          {/* ستون چپ موبایل: عکس بالا، قیمت پایین */}
          <div className="flex flex-col items-center gap-2.5 shrink-0">
            <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border bg-muted/10 flex items-center justify-center p-1">
              <img src={getFullUrl(item.product.image)} className="w-full h-full object-contain" alt="" />
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              {item.price.hasDiscount && (
                <span className="text-[10px] text-zinc-400 line-through font-iran-yekan">
                  {item.price.unitPrice}
                </span>
              )}
              <span className="text-sm font-black text-foreground font-iran-yekan">
                {item.price.finalTotalPrice}
              </span>
            </div>
          </div>

          {/* ستون راست موبایل: کنترل تعداد، حداکثر تعداد، دکمه حذف */}
          <div className="flex-1 flex flex-col items-end gap-2.5">
            <div className="flex items-center border border-primary rounded-xl bg-background p-1 gap-1 shadow-sm h-9 w-32 justify-between">
              <button
                type="button"
                onClick={handleIncrease}
                disabled={!item.canIncrease || activeLoading}
                className="p-1 hover:bg-muted text-primary rounded-lg disabled:opacity-30 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold font-iran-yekan text-primary">
                {activeLoading ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-primary mx-auto" />
                ) : (
                  formatPersianNumber(item.quantity)
                )}
              </span>
              <button
                type="button"
                onClick={handleDecrease}
                disabled={!item.canDecrease || activeLoading}
                className="p-1 hover:bg-muted text-primary rounded-lg disabled:opacity-30 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
            
            <span className="text-[10px] text-muted-foreground font-iran-yekan font-bold">
              (حداکثر {formatPersianNumber(item.maxQuantity)} عدد)
            </span>

            <button
              type="button"
              onClick={handleRemove}
              disabled={activeLoading}
              className="p-2 border border-zinc-200 hover:border-destructive/20 hover:bg-destructive/5 text-muted-foreground hover:text-destructive rounded-xl transition-all h-9 flex items-center justify-center gap-1.5 text-xs font-bold"
            >
              <Trash2 className="h-4 w-4" />
              <span>حذف</span>
            </button>
          </div>
          
        </div>
      </div>

    </div>
  );
}