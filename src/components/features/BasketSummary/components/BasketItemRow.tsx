'use client';

import { useState } from 'react';
import { Trash2, Minus, Plus, Loader2, ShieldCheck, ShieldAlert, Truck, Clipboard, Sparkles } from 'lucide-react';
import { Badge } from '@/components/primitives/Badge';
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
    <div className="p-5 md:p-6 flex flex-col md:flex-row items-stretch gap-6 select-none bg-background">
      
      <div className="flex-1 flex flex-col justify-between min-w-0 text-right gap-4 md:order-1">
        <div className="w-full flex flex-col items-start gap-2.5">
          <h4 className="text-sm sm:text-base font-bold font-iran-sans text-foreground leading-relaxed text-right">
            {item.product.title}
          </h4>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-bold font-iran-sans text-muted-foreground bg-muted px-2.5 py-0.5 rounded-lg">
              کد کالا: {formatPersianNumber(item.product.code)}
            </span>
            {item.partNumber && (
              <span className="text-[10px] font-bold font-iran-sans text-muted-foreground bg-muted px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                <Clipboard className="h-3 w-3 text-muted-foreground/80" />
                کد فنی: {item.partNumber}
              </span>
            )}
            <span className="text-[10px] font-bold font-iran-sans text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
              شرایط: {item.type}
            </span>
            {item.warranty ? (
              <span className="text-[10px] font-bold font-iran-sans text-success-500 bg-success-50 dark:bg-success-950/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-success-500" />
                {item.warranty}
              </span>
            ) : (
              <span className="text-[10px] font-bold font-iran-sans text-destructive bg-destructive/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                بدون گارانتی
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5 items-center pt-1 border-t border-dashed w-full justify-start">
            {item.isTipaxShipping && (
              <span className="text-[10px] sm:text-xs font-medium font-iran-sans text-muted-foreground flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-primary" />
                ارسال با تیپاکس
              </span>
            )}
            {item.isDirectShipping && (
              <span className="text-[10px] sm:text-xs font-medium font-iran-sans text-muted-foreground flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-primary" />
                ارسال مستقیم فروشگاه
              </span>
            )}
            <span className="text-[10px] sm:text-xs font-medium font-iran-sans text-success-500 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-success-500" />
              ارسال تا {formatPersianNumber(item.dayOfDelivery)} روز کاری
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-start shrink-0 mt-2">
          <div className="flex items-center border rounded-xl bg-background p-1 gap-1 shadow-sm h-9">
            <button
              type="button"
              onClick={handleIncrease}
              disabled={!item.canIncrease || activeLoading}
              className="p-1 hover:bg-muted text-primary rounded-lg disabled:opacity-30 transition-colors"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold font-iran-sans text-primary">
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
              <Minus className="h-4.5 w-4.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={activeLoading}
            className="p-2 border hover:border-destructive/20 hover:bg-destructive/5 text-muted-foreground hover:text-destructive rounded-xl transition-all h-9 flex items-center justify-center"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="w-full md:w-36 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 shrink-0 md:order-2 border-t md:border-t-0 md:border-r md:pr-6 border-dashed pt-4 md:pt-0">
        <div className="w-20 h-20 md:w-28 md:h-28 shrink-0 rounded-xl overflow-hidden border bg-muted/10 flex items-center justify-center">
          <img
            src={getFullUrl(item.product.image)}
            alt={item.product.title}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col items-end text-right min-w-0">
          {item.price.hasDiscount && (
            <span className="text-[10px] sm:text-xs text-zinc-500 line-through font-iran-sans">
              {item.price.unitPrice}
            </span>
          )}
          <div className="flex items-center gap-0.5 mt-0.5">
            <span className="text-base sm:text-lg font-black font-iran-sans text-foreground">
              {item.price.finalTotalPrice}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}