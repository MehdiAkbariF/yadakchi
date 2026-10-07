// c:\Users\Raven\final-projects\yadakchi-front\yadakchi\src\components\sections\Header\components\CartButton\CartButton.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, Loader2, Store, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { useGetBasket, useAddToBasket, useDeleteFromBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { cn } from '@/design-system/utils/cn';
import { showToast } from '@/core/utils/toast';

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

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  return (
    <div className="relative group select-none">
      <Link href="/basket">
        {/* کادر مربعی با بوردر و نشانگر دایره‌ای نارنجی مطابق عکس */}
        <div 
          className="relative h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800/60 shadow-2xs transition-colors cursor-pointer"
          aria-label="سبد خرید"
        >
          <ShoppingCart className="h-4.5 w-4.5 text-zinc-700 dark:text-zinc-200" strokeWidth={1.8} />
          
          {mounted && itemCount > 0 && (
            <span
              className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-[#ea580c] text-white flex items-center justify-center text-[10px] font-black rounded-full shadow-xs border-2 border-white dark:border-zinc-900 animate-in zoom-in-75 duration-200"
            >
              {itemCount}
            </span>
          )}
        </div>
      </Link>

      {/* منوی هاور سبد خرید */}
      {mounted && (
        <div className="absolute left-0 top-full pt-2 w-[360px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 flex flex-col text-right origin-top-left">
          <div className="w-full bg-background border border-border/80 rounded-2xl shadow-2xl p-4 flex flex-col">
            {!basket || basket.isEmpty ? (
              <div className="w-full py-8 flex flex-col items-center justify-center text-center">
                <ShoppingCart className="h-9 w-9 text-muted-foreground/40 stroke-[1.5] mb-2" />
                <span className="text-xs font-bold font-iran-yekan text-muted-foreground">سبد خرید شما خالی است</span>
              </div>
            ) : (
              <>
                <div className="w-full flex items-center justify-between border-b pb-2 mb-2">
                  <span className="text-xs font-bold font-iran-yekan text-foreground">اقلام سبد خرید</span>
                  <span className="text-[10px] font-bold font-iran-yekan text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {new Intl.NumberFormat('fa-IR').format(itemCount)} کالا
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-60 pr-1 pl-1">
                  {basket.subBaskets.map((sub: any) => (
                    <div key={sub.id} className="w-full flex flex-col gap-1 py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground mb-1">
                        <Store className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{sub.shop.title}</span>
                      </div>

                      {sub.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2.5 py-2">
                          <div className="w-11 h-11 rounded-lg border overflow-hidden shrink-0 bg-muted/10">
                            <img
                              src={getFullUrl(item.product.image)}
                              className="w-full h-full object-contain"
                              alt={item.product.title}
                            />
                          </div>

                          <div className="flex-1 min-w-0 text-right">
                            <h5 className="text-xs font-bold text-foreground truncate">{item.product.title}</h5>
                            <span className="text-xs font-black text-primary block mt-0.5">
                              {item.price.finalTotalPrice}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/20 shrink-0" dir="ltr">
                            <button
                              type="button"
                              onClick={(e) => handleDecrease(e, item.shopProductId, item.quantity)}
                              disabled={activeLoadingId === item.shopProductId}
                              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-background text-foreground hover:text-destructive transition-all disabled:opacity-40"
                            >
                              {item.quantity === 1 ? <Trash2 className="h-3 w-3 text-destructive" /> : <Minus className="h-3 w-3" />}
                            </button>

                            <span className="text-xs font-bold font-iran-yekan min-w-[20px] text-center">
                              {activeLoadingId === item.shopProductId ? (
                                <Loader2 className="h-3 w-3 animate-spin text-primary mx-auto" />
                              ) : (
                                new Intl.NumberFormat('fa-IR').format(item.quantity)
                              )}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => handleIncrease(e, item.shopProductId)}
                              disabled={activeLoadingId === item.shopProductId || !item.canIncrease}
                              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-background text-foreground hover:text-primary transition-all disabled:opacity-40"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 mt-2 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground">مبلغ قابل پرداخت:</span>
                    <span className="text-sm font-black text-foreground">{basket.total.finalPrice}</span>
                  </div>
                  <Link href="/basket" className="w-full">
                    <Button variant="primary" size="sm" fullWidth className="rounded-xl text-xs h-9 font-bold">
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