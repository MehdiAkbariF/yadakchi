'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Store,
  ShieldCheck,
  Truck,
  LineChart,
  Loader2,
  Sparkles,
  ShoppingBag,
  Info,
  Eye,
  Star,
  Bell,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import {
  useGetBasket,
  useAddToBasket,
  useDeleteFromBasket,
} from '@/domains/front/basket/hooks/basket.hooks';
import { useGetProductPriceChart } from '@/domains/front/product/hooks/product.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { getHttpClient } from '@/core/http/client';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';

export interface ProductSideInvoiceProps {
  product: any;
  seller: any | null;
  sellersCount?: number;
}

function LottiePlayer({
  path,
  className = 'w-48 h-48',
  loop = false,
}: {
  path: string;
  className?: string;
  loop?: boolean;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let anim: any = null;
    let isMounted = true;

    const init = async () => {
      try {
        const altPath = path.includes('/anumations/')
          ? path.replace('/anumations/', '/animations/')
          : path.replace('/animations/', '/anumations/');
        let animationData: any = null;
        for (const p of [path, altPath]) {
          try {
            const res = await fetch(p);
            if (res.ok) {
              animationData = await res.json();
              break;
            }
          } catch {}
        }
        if (!animationData || !isMounted || !containerRef.current) return;
        const lottieModule = await import('lottie-web');
        const lottie = lottieModule.default || lottieModule;
        if (containerRef.current && isMounted) {
          anim = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay: true,
            animationData,
          });
        }
      } catch {}
    };

    init();
    return () => {
      isMounted = false;
      anim?.destroy();
    };
  }, [path, loop]);

  return <div ref={containerRef} className={className} />;
}

export function ProductSideInvoice({ product, seller, sellersCount = 0 }: ProductSideInvoiceProps) {
  const [isChartOpen, setIsChartOpen] = React.useState(false);
  const [isNotifySuccessOpen, setIsNotifySuccessOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isBasketUpdating, setIsBasketUpdating] = React.useState(false);
  const [isNotifying, setIsNotifying] = React.useState(false);
  const [metaIndex, setMetaIndex] = React.useState(0);
  const [lottieKey, setLottieKey] = React.useState(0);

  // هوک‌های سبد خرید
  const { data: basketData } = useGetBasket();
  const addToBasket = useAddToBasket();
  const deleteFromBasket = useDeleteFromBasket();

  const { data: chartData, isLoading: isChartLoading } = useGetProductPriceChart(
    product.id,
    seller ? seller.type : 'New'
  );

  // استخراج تمام اقلام سبد خرید
  const basketItems: any[] = React.useMemo(() => {
    if (!basketData) return [];
    if (Array.isArray(basketData.items)) return basketData.items;
    if (Array.isArray((basketData as any).subBaskets)) {
      return (basketData as any).subBaskets.flatMap((sb: any) => sb.items || sb.subBasketItems || []);
    }
    return [];
  }, [basketData]);

  // بررسی وضعیت موجود بودن فروشنده انتخاب‌شده در سبد خرید
  const currentBasketItem = React.useMemo(() => {
    if (!seller || basketItems.length === 0) return null;
    return (
      basketItems.find(
        (it: any) => (it.shopProductId || it.shopProduct?.id) === seller.id
      ) || null
    );
  }, [seller, basketItems]);

  const isInBasket = !!currentBasketItem && currentBasketItem.quantity > 0;
  const basketQuantity = currentBasketItem?.quantity || 0;

  // ✅ محاسبه دقیق سقف مجاز سفارش بر اساس موجودی انبار فروشنده (seller.quantity)
  const maxAllowedQuantity = React.useMemo(() => {
    const stockQuantity = Number(seller?.quantity);
    if (!isNaN(stockQuantity) && stockQuantity > 0) {
      return stockQuantity;
    }
    return Number(
      currentBasketItem?.inventory?.maxQuantity ||
      currentBasketItem?.maxQuantity ||
      seller?.maxQuantityPerOrder ||
      10
    );
  }, [seller, currentBasketItem]);

  // شرط غیرفعال‌سازی دکمه افزایش بر اساس سقف موجودی انبار
  const isMaxStockReached = basketQuantity >= maxAllowedQuantity;

  const metaItems = [
    { icon: Info, text: `${toPersianDigits(product.salesCount || '۰')} خرید موفق` },
    { icon: Eye, text: `${toPersianDigits(product.views || '۰')} بازدید اخیر` },
    { icon: Star, text: `امتیاز ${toPersianDigits(product.averageRate || '۵')}` },
  ];

  React.useEffect(() => {
    const iv = setInterval(() => setMetaIndex((i) => (i + 1) % 3), 3000);
    return () => clearInterval(iv);
  }, []);

  // افزودن اولیه به سبد خرید
  const handleAddToBasket = async () => {
    if (!seller || isSubmitting) return;
    if (maxAllowedQuantity <= 0) {
      showToast.error('این کالا در انبار فروشنده ناموجود است');
      return;
    }
    setIsSubmitting(true);
    try {
      await addToBasket.mutateAsync({ shopProductId: seller.id, quantity: 1 });
      showToast.success('قطعه با موفقیت به سبد خرید شما افزوده شد');
    } catch (err: any) {
      showToast.error(err?.userMessage || 'خطا در افزودن به سبد خرید');
    } finally {
      setIsSubmitting(false);
    }
  };

  // افزایش تعداد کالا در سبد خرید با رعایت موجودی انبار
  const handleIncreaseQuantity = async () => {
    if (!seller || isBasketUpdating) return;
    if (isMaxStockReached) {
      showToast.error(`امکان سفارش بیشتر وجود ندارد. حداکثر موجودی انبار ${toPersianDigits(maxAllowedQuantity)} عدد است.`);
      return;
    }
    setIsBasketUpdating(true);
    try {
      await addToBasket.mutateAsync({ shopProductId: seller.id, quantity: 1 });
      showToast.success('تعداد کالا افزایش یافت');
    } catch (err: any) {
      showToast.error(err?.userMessage || 'خطا در افزایش تعداد');
    } finally {
      setIsBasketUpdating(false);
    }
  };

  // کاهش یا حذف کالا از سبد خرید
  const handleDecreaseQuantity = async () => {
    if (!seller || isBasketUpdating || basketQuantity <= 0) return;
    setIsBasketUpdating(true);
    try {
      await deleteFromBasket.mutateAsync({ shopProductId: seller.id, quantity: 1 });
      if (basketQuantity === 1) {
        showToast.success('کالا از سبد خرید حذف شد');
      } else {
        showToast.success('تعداد کالا کاهش یافت');
      }
    } catch (err: any) {
      showToast.error(err?.userMessage || 'خطا در کاهش تعداد');
    } finally {
      setIsBasketUpdating(false);
    }
  };

  const handleNotifyMe = async () => {
    if (isNotifying || !product?.id) return;
    setIsNotifying(true);
    try {
      const client = getHttpClient();
      await client.post('/api/Front/ProductInStockNotificationRequest', null, {
        params: { ProductId: product.id },
      });
      setLottieKey((k) => k + 1);
      setIsNotifySuccessOpen(true);
      showToast.success('درخواست اطلاع‌رسانی با موفقیت ثبت شد');
    } catch (error: any) {
      showToast.error(error?.userMessage || 'خطا در ثبت درخواست اطلاع‌رسانی موجودی');
    } finally {
      setIsNotifying(false);
    }
  };

  const formatPrice = (value: number) => new Intl.NumberFormat('fa-IR').format(value);

  const discountPercentage =
    seller && seller.hasDiscount && seller.retailPriceRaw && seller.finalPriceRaw
      ? Math.round(((seller.retailPriceRaw - seller.finalPriceRaw) / seller.retailPriceRaw) * 100)
      : seller?.discountPercentage || 0;

  const isLowStock = seller && seller.quantity > 0 && seller.quantity < 4;

  return (
    <Card className="flex w-full flex-col overflow-hidden rounded-2xl border-border/80 shadow-xs" dir="rtl">
      {seller && seller.hasDiscount && discountPercentage > 0 && (
        <div className="w-full shrink-0 bg-destructive px-4 py-2 text-center text-xs font-bold text-destructive-foreground">
          با تخفیف ویژه {toPersianDigits(discountPercentage)} درصد
        </div>
      )}

      <div className="flex flex-col gap-4 p-5">
        {seller ? (
          <>
            <div className="flex w-full items-center justify-between border-b border-border/60 pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-muted/30 p-1">
                  {seller.shop.logo ? (
                    <img src={getFullUrl(seller.shop.logo)} className="h-full w-full object-contain" alt="" />
                  ) : (
                    <Store aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <span className="block truncate text-xs font-bold text-shop md:text-sm">
                    {seller.shop.title}
                  </span>
                  <span className="mt-1 block text-3xs text-muted-foreground">
                    عملکرد عالی فروشنده
                  </span>
                </div>
              </div>

              <span className="shrink-0 text-2xs font-bold text-muted-foreground">
                همه فروشندگان ({formatPrice(sellersCount)})
              </span>
            </div>

            <div className="flex w-full flex-col gap-3 border-b border-border/60 pb-4 text-xs text-muted-foreground text-right">
              <div className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="font-bold text-foreground">
                  {seller.warrantyTitle || 'ضمانت اصل بودن کالا'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
                <span className="font-bold text-foreground">نوع قطعه: {seller.typeLabel}</span>
              </div>

              <div className="flex items-center gap-2">
                <Truck aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-bold text-foreground">
                  ارسال از {(seller.shop as any).cityName || seller.shop.address?.split('،')[0] || 'فروشنده'} | {seller.dayOfDeliveryLabel}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-4 px-2 py-4 text-center">
            <p className="text-sm leading-reading text-foreground">
              این کالا فعلاً ناموجود است اما می‌توانید زنگوله را بزنید تا به محض موجود شدن، به شما خبر دهیم.
            </p>

            <button
              type="button"
              onClick={handleNotifyMe}
              disabled={isNotifying}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-destructive text-sm font-bold text-destructive-foreground shadow-xs transition-colors hover:bg-destructive/90 disabled:opacity-80 md:text-base"
            >
              {isNotifying ? (
                <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
              ) : (
                <Bell aria-hidden="true" className="h-5 w-5" />
              )}
              <span>موجود شد خبرم کن</span>
            </button>
          </div>
        )}

        {/* اطلاعات متحرک */}
        {seller && (
          <div className="relative flex h-8 w-full shrink-0 items-center justify-start overflow-hidden py-3 text-right">
            <AnimatePresence mode="wait">
              <motion.div
                key={metaIndex}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex items-center justify-start gap-2 text-2xs font-bold text-foreground"
              >
                {(() => {
                  const Icon = metaItems[metaIndex].icon;
                  return <Icon aria-hidden="true" className="h-4 w-4 text-primary shrink-0" />;
                })()}
                <span className="truncate">{metaItems[metaIndex].text}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {isLowStock && (
          <div className="w-full rounded-xl bg-destructive/10 py-2 text-center text-2xs font-bold text-destructive">
            فقط {toPersianDigits(seller.quantity)} عدد در انبار باقی مانده
          </div>
        )}

        {seller && (
          <div className="flex w-full items-center justify-between pt-1">
            <div className="flex flex-col text-right">
              <span className="mb-1 text-2xs text-muted-foreground">قیمت فروشنده:</span>
              {seller.hasDiscount && (
                <span className="mb-1 text-2xs leading-none text-muted-foreground line-through">
                  {seller.retailPrice}
                </span>
              )}
              <span className="text-base font-black leading-none text-foreground md:text-lg" dir="ltr">
                {seller.finalPrice}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsChartOpen(true)}
              aria-label="نمودار قیمت"
              className="shrink-0 rounded-xl border border-border p-2 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-primary shadow-xs"
            >
              <LineChart aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* اکشن باکس: کنترلر کم/زیاد با غیرفعال‌سازی دکمه افزایش هنگام رسیدن به سقف موجودی انبار */}
        {seller && (
          isInBasket && basketQuantity > 0 ? (
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex h-11 w-full items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3 shadow-xs select-none">
                {/* دکمه افزایش - غیرفعال‌شده هنگام رسیدن به سقف موجودی انبار */}
                <button
                  type="button"
                  onClick={handleIncreaseQuantity}
                  disabled={isBasketUpdating || isMaxStockReached}
                  aria-label="افزایش تعداد"
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs transition-all active:scale-90',
                    (isBasketUpdating || isMaxStockReached) && 'opacity-40 cursor-not-allowed active:scale-100'
                  )}
                >
                  <Plus className="h-4 w-4" />
                </button>

                {/* شمارنده در وسط */}
                <div className="flex flex-col items-center justify-center px-2">
                  {isBasketUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <>
                      <span className="text-sm font-black text-primary tabular-nums">
                        {toPersianDigits(basketQuantity)} عدد
                      </span>
                      {isMaxStockReached ? (
                        <span className="text-3xs font-bold text-destructive leading-none mt-0.5 whitespace-nowrap">
                          حداکثر موجودی ({toPersianDigits(maxAllowedQuantity)})
                        </span>
                      ) : (
                        <span className="text-3xs text-muted-foreground font-medium leading-none mt-0.5">
                          در سبد خرید شما
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* دکمه کاهش یا حذف */}
                <button
                  type="button"
                  onClick={handleDecreaseQuantity}
                  disabled={isBasketUpdating}
                  aria-label={basketQuantity === 1 ? 'حذف از سبد' : 'کاهش تعداد'}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-90',
                    basketQuantity === 1
                      ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                      : 'bg-primary/10 text-primary hover:bg-primary/20',
                    isBasketUpdating && 'opacity-40 cursor-not-allowed active:scale-100'
                  )}
                >
                  {basketQuantity === 1 ? (
                    <Trash2 className="h-4 w-4" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* دکمه میانبر ورود به سبد خرید */}
              <Link
                href="/basket"
                className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-card text-xs font-bold text-primary transition-colors hover:bg-primary/5 shadow-xs"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>مشاهده و تسویه سبد خرید</span>
              </Link>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleAddToBasket}
              isLoading={isSubmitting || addToBasket.isPending}
              disabled={maxAllowedQuantity <= 0}
              className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold shadow-xs"
            >
              <ShoppingBag aria-hidden="true" className="h-4 w-4" />
              <span>افزودن به سبد خرید</span>
            </Button>
          )
        )}
      </div>

      {/* مودال نمودار قیمت */}
      <Modal isOpen={isChartOpen} onClose={() => setIsChartOpen(false)} className="w-full max-w-md overflow-hidden rounded-2xl">
        <ModalHeader onClose={() => setIsChartOpen(false)}>
          <ModalTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
            <LineChart aria-hidden="true" className="h-4 w-4 text-shop" />
            <span>نمودار تغییرات قیمت فروش</span>
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="p-5 pt-3 text-center" dir="rtl">
          {isChartLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">در حال بارگذاری نمودار قیمت...</span>
            </div>
          ) : chartData && chartData.prices && chartData.prices.length > 0 ? (
            <div className="w-full py-2">
              <PriceChart data={chartData} />
            </div>
          ) : (
            <div className="w-full py-12 text-center text-xs text-muted-foreground">
              اطلاعات تغییرات قیمتی برای این فروشنده ثبت نشده است.
            </div>
          )}
          <Button
            variant="outline"
            fullWidth
            onClick={() => setIsChartOpen(false)}
            className="mt-4 h-10 rounded-xl text-xs font-bold"
          >
            متوجه شدم
          </Button>
        </ModalBody>
      </Modal>

      {/* مودال اطلاع‌رسانی موجودی */}
      <Modal isOpen={isNotifySuccessOpen} onClose={() => setIsNotifySuccessOpen(false)} className="w-full max-w-md overflow-hidden rounded-2xl">
        <ModalBody className="flex flex-col items-center justify-center gap-3 p-6 pt-4 text-center" dir="rtl">
          <div className="mx-auto -mt-2 mb-1 h-56 w-56 max-w-full">
            <LottiePlayer key={lottieKey} path="/anumations/notif-success.json" className="h-full w-full" loop={false} />
          </div>

          <h4 className="text-base font-bold leading-relaxed text-foreground">
            درخواست شما با موفقیت ثبت شد!
          </h4>

          <p className="text-center text-sm leading-reading text-foreground">
            به‌محض موجود شدن این کالا، به شما اطلاع می‌دیم.
          </p>

          <p className="mx-auto max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
            تا اون موقع، می‌تونید قطعات موردنیاز خودروتون رو در یدکچی جستجو و قیمت‌ها رو مقایسه کنید.
          </p>

          <div className="mt-3 flex w-full flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => setIsNotifySuccessOpen(false)}
              className="h-10 w-full rounded-xl text-xs font-bold"
            >
              متوجه شدم
            </Button>

            <Link
              href="/search"
              className="py-1 text-center text-xs font-bold text-shop hover:underline"
              onClick={() => setIsNotifySuccessOpen(false)}
            >
              جستجوی قطعات در یدکچی
            </Link>
          </div>
        </ModalBody>
      </Modal>
    </Card>
  );
}

function PriceChart({ data }: { data: any }) {
  const prices: number[] = data.prices || [];
  if (prices.length === 0) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const W = 320;
  const H = 160;
  const pad = 20;
  const innerW = W - pad * 2;
  const innerH = H - pad * 2;

  const points = prices
    .map((p, i) => {
      const x = pad + (i / Math.max(prices.length - 1, 1)) * innerW;
      const y = pad + innerH - ((p - min) / Math.max(max - min, 1)) * innerH;
      return `${x},${y}`;
    })
    .join(' ');

  const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);

  return (
    <div className="w-full px-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full">
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="currentColor" className="text-border" strokeWidth="1" />
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="currentColor" className="text-border" strokeWidth="1" />
        <polyline
          fill="none"
          stroke="currentColor"
          className="text-shop"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
        {prices.map((p, i) => {
          const x = pad + (i / Math.max(prices.length - 1, 1)) * innerW;
          const y = pad + innerH - ((p - min) / Math.max(max - min, 1)) * innerH;
          return <circle key={i} cx={x} cy={y} r="3" fill="currentColor" className="text-shop" />;
        })}
      </svg>
      <div className="mt-2 flex items-center justify-between text-2xs text-muted-foreground">
        <span>کمترین: {fmt(min)}</span>
        <span>میانگین: {fmt(data.averagePrice || 0)}</span>
        <span>بیشترین: {fmt(max)}</span>
      </div>
    </div>
  );
}