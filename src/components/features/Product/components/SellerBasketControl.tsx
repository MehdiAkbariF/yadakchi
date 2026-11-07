'use client';

import * as React from 'react';
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/primitives/Button/Button';
import {
  useAddToBasket,
  useDeleteFromBasket,
  useGetBasket,
} from '@/domains/front/basket/hooks/basket.hooks';
import { showToast } from '@/core/utils/toast';
import { toPersianDigits } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';

export interface SellerBasketControlProps {
  seller: any;
  /** وقتی محصول برای اولین بار به سبد اضافه شد */
  onAddedToBasket?: () => void;
}

/**
 * کنترل سبد خرید برای یک فروشنده.
 *
 * رفتار:
 * - اگر در سبد نبود: دکمه «افزودن به سبد»
 * - اگر در سبد بود: کنترلر − N + با سقف موجودی
 *
 * منطق:
 *   افزایش → addToBasket با quantity: 1 (سرور اضافه می‌کند)
 *   کاهش   → deleteFromBasket با quantity: 1 (سرور کم می‌کند)
 *   وقتی به 0 رسید → حذف کامل خودکار توسط سرور
 */
export function SellerBasketControl({ seller, onAddedToBasket }: SellerBasketControlProps) {
  const { data: basketData, isLoading } = useGetBasket();
  const addToBasket = useAddToBasket();
  const deleteFromBasket = useDeleteFromBasket();

  const [pending, setPending] = React.useState(false);

  // ── سقف موجودی ────────────────────────────────────────────
  const maxStock = React.useMemo(() => {
    const raw =
      seller?.quantity ??
      seller?.stock ??
      seller?.availableQuantity ??
      seller?.shopProductQuantity ??
      seller?.shopProduct?.quantity ??
      seller?.maxQuantityPerOrder ??
      10;
    const num = Number(raw);
    return !isNaN(num) && num > 0 ? num : 10;
  }, [seller]);

  // ── پیدا کردن آیتم سبد مربوط به این فروشنده ───────────────
  const basketItem = React.useMemo(() => {
    if (!basketData) return null;

    // ساختارهای مختلف سبد را پشتیبانی می‌کنیم
    const items: any[] =
      (Array.isArray(basketData.items) && basketData.items) ||
      (Array.isArray((basketData as any).subBaskets) &&
        (basketData as any).subBaskets.flatMap(
          (sb: any) => sb.items || sb.subBasketItems || []
        )) ||
      [];

    return (
      items.find((it: any) => {
        const spid =
          it.shopProductId ??
          it.shopProduct?.id ??
          it.product?.shopProductId ??
          it.shopProduct?.shopProductId;
        return spid === seller.id;
      }) || null
    );
  }, [basketData, seller.id]);

  const currentQuantity = Number(basketItem?.quantity ?? 0);
  const isInBasket = currentQuantity > 0;
  const atMax = currentQuantity >= maxStock;

  // ── افزودن اولیه ──────────────────────────────────────────
  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (maxStock <= 0) {
      showToast.error('این محصول موجود نیست');
      return;
    }
    setPending(true);
    try {
      await addToBasket.mutateAsync({ shopProductId: seller.id, quantity: 1 });
      showToast.success('قطعه با موفقیت به سبد خرید افزوده شد');
      // خبر دادن به والد که محصول برای اولین بار اضافه شد
      onAddedToBasket?.();
    } catch (err: any) {
      showToast.error(err?.userMessage || 'خطا در افزودن به سبد');
    } finally {
      setPending(false);
    }
  };

  // ── افزایش تعداد ──────────────────────────────────────────
  const handleInc = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    if (atMax) {
      showToast.error(`حداکثر موجودی: ${toPersianDigits(maxStock)} عدد`);
      return;
    }
    setPending(true);
    try {
      await addToBasket.mutateAsync({ shopProductId: seller.id, quantity: 1 });
    } catch (err: any) {
      showToast.error(err?.userMessage || 'خطا در افزایش تعداد');
    } finally {
      setPending(false);
    }
  };

  // ── کاهش تعداد ────────────────────────────────────────────
  const handleDec = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    setPending(true);
    try {
      await deleteFromBasket.mutateAsync({
        shopProductId: seller.id,
        quantity: 1,
      });
      if (currentQuantity <= 1) {
        showToast.success('از سبد خرید حذف شد');
      }
    } catch (err: any) {
      showToast.error(err?.userMessage || 'خطا در کاهش تعداد');
    } finally {
      setPending(false);
    }
  };

  // ── حالت لودینگ اولیه ─────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-9 w-[6.875rem] items-center justify-center rounded-xl border border-border bg-muted/40">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── اگر در سبد نیست → دکمه افزودن ────────────────────────
  if (!isInBasket) {
    return (
      <Button
        variant="outline-primary"
        size="sm"
        onClick={handleAdd}
        disabled={pending || maxStock <= 0}
        className="h-9 gap-1.5 rounded-xl px-3 sm:px-4 text-xs font-bold shadow-xs whitespace-nowrap"
      >
        {pending ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <ShoppingBag aria-hidden="true" className="h-4 w-4" />
            <span>{maxStock <= 0 ? 'ناموجود' : 'افزودن به سبد'}</span>
          </>
        )}
      </Button>
    );
  }

  // ── اگر در سبد است → کنترلر کم/زیاد ──────────────────────
  return (
    <div
      className="flex h-9 items-center gap-1 rounded-xl border border-primary/40 bg-primary/5 px-1"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={handleInc}
        disabled={pending || atMax}
        aria-label="افزایش تعداد"
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg text-primary transition-colors',
          'hover:bg-primary/10 active:bg-primary/20',
          'disabled:cursor-not-allowed disabled:opacity-40'
        )}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

      <span className="min-w-[1.625rem] text-center text-xs font-bold text-primary">
        {pending ? (
          <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" />
        ) : (
          toPersianDigits(currentQuantity)
        )}
      </span>

      <button
        type="button"
        onClick={handleDec}
        disabled={pending}
        aria-label={currentQuantity <= 1 ? 'حذف از سبد' : 'کاهش تعداد'}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg text-primary transition-colors',
          'hover:bg-primary/10 active:bg-primary/20',
          'disabled:cursor-not-allowed disabled:opacity-40'
        )}
      >
        {currentQuantity <= 1 ? (
          <Trash2 className="h-3.5 w-3.5" />
        ) : (
          <Minus className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}