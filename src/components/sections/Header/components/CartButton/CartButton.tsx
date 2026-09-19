'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, Loader2, Store, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
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

  // افزایش تعداد کالا (+)
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

  // کاهش تعداد کالا (-) یا حذف در صورت رسیدن به ۱
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

  // حذف کامل مستقیم
  const handleRemove = async (e: React.MouseEvent, shopProductId: string, quantity: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveLoadingId(shopProductId);
    try {
      await deleteFromBasket.mutateAsync({ shopProductId, quantity });
      showToast.success('قطعه از سبد خرید حذف شد');
    } catch (err: any) {
      showToast.error(err.userMessage || 'خطا در حذف قطعه');
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
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl" aria-label="سبد خرید">
          <ShoppingCart className="h-5 w-5 text-foreground" />
          {mounted && itemCount > 0 && (
            <Badge
              variant="destructive"
              size="sm"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold rounded-full animate-in zoom-in duration-200"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      </Link>

      {mounted && (
        <div className="absolute left-0 top-full pt-3 w-[380px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 flex flex-col text-right origin-top-left">
          <div className="w-full bg-background border rounded-2xl shadow-2xl p-4 flex flex-col">
            {!basket || basket.isEmpty ? (
              <div className="w-full py-8 flex flex-col items-center justify-center text-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/50 stroke-[1.5] mb-2 animate-bounce" />
                <span className="text-xs font-bold font-iran-yekan text-muted-foreground">سبد خرید شما خالی است</span>
              </div>
            ) : (
              <>
                <div className="w-full flex items-center justify-between border-b pb-2 mb-2">
                  <span className="text-xs font-bold font-iran-yekan text-foreground">اقلام سبد خرید</span>
                  <span className="text-[10px] font-bold font-iran-yekan text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                    {new Intl.NumberFormat('fa-IR').format(itemCount)} کالا
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-64 pr-1 pl-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                  {basket.subBaskets.map((sub: any) => (
                    <div key={sub.id} className="w-full flex flex-col gap-1 py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground mb-1">
                        <Store className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{sub.shop.title}</span>
                      </div>

                      {sub.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 py-2.5">
                          <div className="w-12 h-12 rounded-lg border overflow-hidden shrink-0 bg-muted/10">
                            <img
                              src={getFullUrl(item.product.image)}
                              className="w-full h-full object-contain"
                              alt={item.product.title}
                            />
                          </div>

                          <div className="flex-1 min-w-0 text-right">
                            <h5 className="text-xs font-bold text-foreground truncate">{item.product.title}</h5>
                            <span className="text-xs font-black text-primary block mt-1">
                              {item.price.finalTotalPrice}
                            </span>
                          </div>

                          {/* کنترلرهای تعداد (+ / - / حذف) */}
                          <div
                            className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/20 shrink-0"
                            dir="ltr"
                          >
                            {/* دکمه کاهش (-) یا حذف */}
                            <button
                              type="button"
                              onClick={(e) => handleDecrease(e, item.shopProductId, item.quantity)}
                              disabled={activeLoadingId === item.shopProductId}
                              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-background text-foreground hover:text-destructive transition-all disabled:opacity-40"
                              title={item.quantity === 1 ? 'حذف' : 'کاهش'}
                            >
                              {item.quantity === 1 ? (
                                <Trash2 className="h-3 w-3 text-destructive" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                            </button>

                            {/* نمایش تعداد یا لودینگ */}
                            <span className="text-xs font-bold font-iran-yekan min-w-[22px] text-center">
                              {activeLoadingId === item.shopProductId ? (
                                <Loader2 className="h-3 w-3 animate-spin text-primary mx-auto" />
                              ) : (
                                new Intl.NumberFormat('fa-IR').format(item.quantity)
                              )}
                            </span>

                            {/* دکمه افزایش (+) */}
                            <button
                              type="button"
                              onClick={(e) => handleIncrease(e, item.shopProductId)}
                              disabled={activeLoadingId === item.shopProductId || !item.canIncrease}
                              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-background text-foreground hover:text-primary transition-all disabled:opacity-40 disabled:hover:bg-transparent"
                              title="افزایش"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 mt-2 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-muted-foreground font-iran-yekan">مبلغ قابل پرداخت:</span>
                    <span className="text-sm font-black text-foreground">{basket.total.finalPrice}</span>
                  </div>
                  <Link href="/basket" className="w-full">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      className="rounded-xl text-xs h-9 font-iran-yekan font-bold shadow-md shadow-primary/10 flex items-center justify-center gap-1"
                    >
                      <span>تسویه حساب</span>
                      <ArrowLeft className="h-3.5 w-3.5" />
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

interface ArrowLeftProps extends React.SVGProps<SVGSVGElement> {}

function ArrowLeft({ className, ...props }: ArrowLeftProps) {
  return (
    <svg
      className={cn('h-3.5 w-3.5 text-white', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}