'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, Loader2, Store, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { useGetBasket, useAddToBasket, useDeleteFromBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { showToast } from '@/core/utils/toast';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';

export function CartButton() {
  const [mounted, setMounted] = useState(false);
  const { data: rawBasket } = useGetBasket();
  const addToBasket = useAddToBasket();
  const deleteFromBasket = useDeleteFromBasket();
  const [activeLoadingId, setActiveLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const basket = mounted ? (rawBasket as any) : null;
  const itemCount = basket?.summary?.itemCount || 0;

  const handleIncrease = async (e: React.MouseEvent, shopProductId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveLoadingId(shopProductId);
    try {
      await addToBasket.mutateAsync({ shopProductId, quantity: 1 });
    } catch (err: any) {
      showToast.error(err.userMessage || 'خطا در افزایش تعداد');
    } finally {
      setActiveLoadingId(null);
    }
  };

  const handleDecrease = async (e: React.MouseEvent, shopProductId: string, currentQuantity: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveLoadingId(shopProductId);
    try {
      await deleteFromBasket.mutateAsync({ shopProductId, quantity: 1 });
      if (currentQuantity === 1) {
        showToast.success('قطعه از سبد خرید حذف شد');
      }
    } catch (err: any) {
      showToast.error(err.userMessage || 'خطا در کاهش تعداد');
    } finally {
      setActiveLoadingId(null);
    }
  };

  return (
    <div className="relative group select-none">
      <Link href="/basket" aria-label={`سبد خرید با ${toPersianDigits(itemCount)} کالا`}>
        <div 
          className="relative h-10 w-10 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-muted/80 shadow-xs transition-colors cursor-pointer"
        >
          <ShoppingCart className="h-4 w-4 text-foreground" strokeWidth={1.8} />
          
          {mounted && itemCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 h-4.5 min-w-[1.125rem] px-1 bg-primary text-primary-foreground flex items-center justify-center text-[0.625rem] font-bold rounded-full shadow-xs border-2 border-background animate-in zoom-in-75 duration-200"
            >
              {toPersianDigits(itemCount)}
            </span>
          )}
        </div>
      </Link>

      {/* منوی هاور سبد خرید */}
      {mounted && (
        <div className="absolute left-0 top-full pt-2 w-[22.5rem] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 flex flex-col origin-top-left">
          <div className="w-full bg-card border border-border rounded-xl shadow-lg p-4 flex flex-col">
            {!basket || basket.isEmpty ? (
              <div className="w-full py-8 flex flex-col items-center justify-center text-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/40 stroke-[1.5] mb-2" />
                <span className="text-xs font-semibold text-muted-foreground">سبد خرید شما خالی است</span>
              </div>
            ) : (
              <>
                <div className="w-full flex items-center justify-between border-b border-border/70 pb-2 mb-2">
                  <span className="text-xs font-bold text-foreground">اقلام سبد خرید</span>
                  <span className="text-2xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {toPersianDigits(itemCount)} کالا
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-60 pe-1 ps-1 scrollbar-thin">
                  {basket.subBaskets.map((sub: any) => (
                    <div key={sub.id} className="w-full flex flex-col gap-1 py-2 border-b border-border/60 last:border-b-0">
                      <div className="flex items-center gap-1.5 text-2xs font-bold text-muted-foreground mb-1">
                        <Store className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{sub.shop.title}</span>
                      </div>

                      {sub.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2.5 py-2">
                          <div className="relative w-12 h-12 rounded-lg border border-border/70 overflow-hidden shrink-0 bg-muted/20">
                            <Image
                              src={getFullUrl(item.product.image)}
                              alt={item.product.title || 'تصویر کالا'}
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-semibold truncate text-foreground">{item.product.title}</h5>
                            <span className="text-xs font-bold text-primary block mt-0.5">
                              {item.price.finalTotalPrice}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-muted/30 shrink-0" dir="ltr">
                            <button
                              type="button"
                              aria-label="کاهش تعداد یا حذف"
                              onClick={(e) => handleDecrease(e, item.shopProductId, item.quantity)}
                              disabled={activeLoadingId === item.shopProductId}
                              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-card text-foreground hover:text-destructive transition-all disabled:opacity-40"
                            >
                              {item.quantity === 1 ? <Trash2 className="h-3 w-3 text-destructive" /> : <Minus className="h-3 w-3" />}
                            </button>

                            <span className="text-xs font-bold min-w-[1.25rem] text-center">
                              {activeLoadingId === item.shopProductId ? (
                                <Loader2 className="h-3 w-3 animate-spin text-primary mx-auto" />
                              ) : (
                                toPersianDigits(item.quantity)
                              )}
                            </span>

                            <button
                              type="button"
                              aria-label="افزایش تعداد"
                              onClick={(e) => handleIncrease(e, item.shopProductId)}
                              disabled={activeLoadingId === item.shopProductId || !item.canIncrease}
                              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-card text-foreground hover:text-primary transition-all disabled:opacity-40"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/70 pt-3 mt-2 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground">مبلغ قابل پرداخت:</span>
                    <span className="text-sm font-bold text-foreground">{basket.total.finalPrice}</span>
                  </div>
                  <Link href="/basket" className="w-full">
                    <Button variant="primary" size="sm" fullWidth className="rounded-lg text-sm h-9 font-bold">
                      تسویه حساب
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}