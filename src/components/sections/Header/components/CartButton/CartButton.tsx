'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, Loader2, Store } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { useGetBasket, useDeleteFromBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { cn } from '@/design-system/utils/cn';
import { showToast } from '@/core/utils/toast';

export function CartButton() {
  const [mounted, setMounted] = useState(false);
  const { data: rawBasket } = useGetBasket();
  const deleteFromBasket = useDeleteFromBasket();
  const [activeLoadingId, setActiveLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const basket = mounted ? (rawBasket as any) : null;
  const itemCount = basket?.summary?.itemCount || 0;

  const handleRemove = async (e: React.MouseEvent, shopProductId: string, quantity: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveLoadingId(shopProductId);
    try {
      await deleteFromBasket.mutateAsync({ shopProductId, quantity });
      showToast.success('قطعه از سبد خرید حذف شد');
    } catch (err: any) {
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
            <Badge variant="destructive" size="sm" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold rounded-full animate-in zoom-in duration-200">
              {itemCount}
            </Badge>
          )}
        </Button>
      </Link>

      {mounted && (
        <div className="absolute left-0 top-full pt-3 w-[360px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 flex flex-col text-right origin-top-left">
          <div className="w-full bg-background border rounded-2xl shadow-2xl p-4 flex flex-col">
            {!basket || basket.isEmpty ? (
              <div className="w-full py-8 flex flex-col items-center justify-center text-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/50 stroke-[1.5] mb-2 animate-bounce" />
                <span className="text-xs font-bold font-iran-sans text-muted-foreground">سبد خرید شما خالی است</span>
              </div>
            ) : (
              <>
                <div className="w-full flex items-center justify-between border-b pb-2 mb-2">
                  <span className="text-xs font-bold font-iran-yekan text-foreground">اقلام سبد خرید</span>
                  <span className="text-[10px] font-bold font-iran-sans text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
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
                        <div key={item.id} className="flex items-center gap-3 py-2">
                          <div className="w-11 h-11 rounded-lg border overflow-hidden shrink-0 bg-muted/10">
                            <img src={getFullUrl(item.product.image)} className="w-full h-full object-contain" alt="" />
                          </div>
                          <div className="flex-1 min-w-0 text-right">
                            <h5 className="text-xs font-bold text-foreground truncate">{item.product.title}</h5>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] text-muted-foreground font-iran-sans">{new Intl.NumberFormat('fa-IR').format(item.quantity)} عدد</span>
                              <span className="text-xs font-black text-primary">{item.price.finalTotalPrice}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleRemove(e, item.shopProductId, item.quantity)}
                            disabled={activeLoadingId === item.shopProductId}
                            className="p-1.5 border hover:border-destructive/20 hover:bg-destructive/5 text-muted-foreground hover:text-destructive rounded-lg transition-all"
                            aria-label="Remove"
                          >
                            {activeLoadingId === item.shopProductId ? (
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 mt-2 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-muted-foreground font-iran-sans">مبلغ قابل پرداخت:</span>
                    <span className="text-sm font-black text-foreground">{basket.total.finalPrice}</span>
                  </div>
                  <Link href="/basket" className="w-full">
                    <Button variant="primary" size="sm" fullWidth className="rounded-xl text-xs h-9 font-iran-sans font-bold shadow-md shadow-primary/10 flex items-center justify-center gap-1">
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
      className={cn("h-3.5 w-3.5 text-white", className)}
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