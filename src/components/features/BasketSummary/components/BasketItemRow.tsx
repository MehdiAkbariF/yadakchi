'use client';

import { useState } from 'react';
import { Store, ShieldCheck, ShieldAlert, Truck, Sparkles, Plus, Minus, Loader2, Trash2 } from 'lucide-react';
import { useAddToBasket, useDeleteFromBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { showToast } from '@/core/utils/toast';

interface BasketItemRowProps {
  item: any;
}

export function BasketItemRow({ item }: BasketItemRowProps) {
  const [activeLoading, setActiveLoading] = useState(false);
  const addToBasket = useAddToBasket();
  const deleteFromBasket = useDeleteFromBasket();

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
    <div className="p-4 md:p-6 flex justify-between gap-4 md:gap-6 bg-background border-b border-zinc-100 last:border-b-0 select-none">
      
      <div className="flex-1 flex flex-col gap-2.5 text-right min-w-0">
        <h4 className="text-sm md:text-base font-bold text-foreground font-iran-sans leading-relaxed truncate md:whitespace-normal">
          {item.product.title}
        </h4>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-iran-sans">
          {item.shop?.logo ? (
            <img 
              src={getFullUrl(item.shop.logo)} 
              className="w-4 h-4 object-contain rounded-md" 
              alt="" 
            />
          ) : (
            <Store className="h-4 w-4 text-muted-foreground/80 shrink-0" />
          )}
          <span>{item.shop?.title || item.product?.shopName || 'پیروز یدک'}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-iran-sans">
          {item.warranty ? (
            <>
              <ShieldCheck className="h-4 w-4 text-success-500 shrink-0" />
              <span>{item.warranty}</span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-4 w-4 text-zinc-400 shrink-0" />
              <span>بدون گارانتی</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-iran-sans">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span>{item.type === 'New' || item.type === 'نو' ? 'قطعه نو' : 'قطعه استوک'}</span>
        </div>

        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground font-iran-sans">
          {item.isTipaxShipping && (
            <div className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-zinc-500 shrink-0" />
              <span>ارسال توسط تیپاکس</span>
            </div>
          )}
          {item.isDirectShipping && (
            <div className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-zinc-500 shrink-0" />
              <span>ارسال توسط فروشنده ({formatPersianNumber(item.dayOfDelivery)} روز دیگر)</span>
            </div>
          )}
          {!item.isTipaxShipping && !item.isDirectShipping && (
            <div className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-zinc-500 shrink-0" />
              <span>تحویل حضوری</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center border rounded-xl bg-background p-1 gap-1 shadow-sm h-9">
            <button
              type="button"
              onClick={handleIncrease}
              disabled={!item.canIncrease || activeLoading}
              className="p-1 hover:bg-muted text-primary rounded-lg disabled:opacity-30 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-xs font-bold font-iran-sans text-primary">
              {activeLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary mx-auto" />
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
          <button
            type="button"
            onClick={handleRemove}
            disabled={activeLoading}
            className="p-2 border border-zinc-200 hover:border-destructive/20 hover:bg-destructive/5 text-muted-foreground hover:text-destructive rounded-xl transition-all h-9 flex items-center justify-center"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

<<<<<<< HEAD
      <div className="w-full md:w-36 flex flex-row md:flex-col items-center justify-between md:justify-center 
      gap-4 shrink-0 md:order-2 border-t md:border-t-0 md:border-r md:pr-6 border-dashed pt-4 md:pt-0">
        <div className="w-20 h-20 md:w-28 md:h-28 shrink-0 rounded-xl overflow-hidden border bg-muted/10 flex items-center justify-center">
=======
      <div className="flex flex-col items-end justify-between shrink-0 w-24 md:w-32">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl border bg-muted/5 flex items-center justify-center overflow-hidden">
>>>>>>> ee1c3b6c9d64849d437b098183bfbfd112f4929a
          <img
            src={getFullUrl(item.product.image)}
            alt={item.product.title}
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="flex flex-col items-end text-right mt-2">
          {item.price.hasDiscount && (
            <span className="text-[10px] text-zinc-400 line-through font-iran-sans leading-none mb-1">
              {item.price.unitPrice}
            </span>
          )}
          <span className="text-sm md:text-base font-black text-foreground font-iran-sans leading-none">
            {item.price.finalTotalPrice}
          </span>
        </div>
      </div>

    </div>
  );
}