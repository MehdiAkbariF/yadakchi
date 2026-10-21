'use client';

import * as React from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, Truck, LineChart, Loader2, Sparkles, ShoppingBag, Info, Eye, Star, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { useAddToBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { useGetProductPriceChart } from '@/domains/front/product/hooks/product.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';

export interface ProductSideInvoiceProps {
  product: any;
  seller: any | null;
  sellersCount?: number;
}

function LottiePlayer({ path, className = 'w-48 h-48', loop = false }: { path: string; className?: string; loop?: boolean }) {
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
  const [isNotifying, setIsNotifying] = React.useState(false);
  const [metaIndex, setMetaIndex] = React.useState(0);
  const [lottieKey, setLottieKey] = React.useState(0);

  const addToBasket = useAddToBasket();
  const { data: chartData, isLoading: isChartLoading } = useGetProductPriceChart(
    product.id,
    seller ? seller.type : 'New'
  );

  const metaItems = [
    { icon: Info, text: `${toPersianDigits(product.salesCount || '۰')} خرید موفق` },
    { icon: Eye, text: `${toPersianDigits(product.views || '۰')} بازدید اخیر` },
    { icon: Star, text: `امتیاز ${toPersianDigits(product.averageRate || '۵')}` },
  ];

  React.useEffect(() => {
    const iv = setInterval(() => setMetaIndex((i) => (i + 1) % 3), 3000);
    return () => clearInterval(iv);
  }, []);

  const handleAddToBasket = async () => {
    if (!seller) return;
    setIsSubmitting(true);
    try {
      await addToBasket.mutateAsync({ shopProductId: seller.id, quantity: 1 });
      showToast.success('قطعه با موفقیت به سبد خرید شما افزوده شد');
    } catch {} finally {
      setIsSubmitting(false);
    }
  };

  const handleNotifyMe = async () => {
    if (isNotifying) return;
    setIsNotifying(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setLottieKey((k) => k + 1);
      setIsNotifySuccessOpen(true);
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
    <Card className="flex w-full flex-col overflow-hidden">
      {seller && seller.hasDiscount && discountPercentage > 0 ? (
        <div className="w-full shrink-0 bg-destructive px-4 py-2 text-center text-xs font-bold text-destructive-foreground">
          با تخفیف ویژه {toPersianDigits(discountPercentage)} درصد
        </div>
      ) : null}

      <div className="flex flex-col gap-4 p-5">
        {seller ? (
          <>
            <div className="flex w-full items-center justify-between border-b border-border pb-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                  {seller.shop.logo ? (
                    <img src={getFullUrl(seller.shop.logo)} className="h-full w-full object-contain" alt="" />
                  ) : (
                    <Store aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-shop md:text-sm">
                    {seller.shop.title}
                  </span>
                  <span className="mt-0.5 block text-2xs text-muted-foreground">
                    عملکرد عالی فروشنده
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="shrink-0 border-b border-shop pb-0.5 text-2xs font-bold text-shop outline-none transition-opacity hover:opacity-80"
              >
                همه فروشندگان ({formatPrice(sellersCount)})
              </button>
            </div>

            <div className="flex w-full flex-col gap-3 border-b border-border pb-3.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-success" />
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
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-destructive text-sm font-bold text-destructive-foreground shadow-xs transition-colors hover:bg-destructive/90 disabled:opacity-80 md:text-base"
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

        {seller ? (
          <div className="relative flex h-8 w-full shrink-0 items-center justify-center overflow-hidden border-b border-dashed border-border py-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={metaIndex}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex items-center justify-center gap-1.5 text-2xs font-bold text-foreground"
              >
                {(() => {
                  const Icon = metaItems[metaIndex].icon;
                  return <Icon aria-hidden="true" className="h-3.5 w-3.5 text-primary" />;
                })()}
                <span>{metaItems[metaIndex].text}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}

        {isLowStock ? (
          <div className="w-full rounded-md bg-destructive/10 py-1.5 text-center text-2xs font-bold text-destructive">
            فقط {toPersianDigits(seller.quantity)} عدد در انبار باقی مانده
          </div>
        ) : null}

        {seller ? (
          <div className="flex w-full items-center justify-between pt-1">
            <div className="flex flex-col">
              <span className="mb-0.5 text-2xs text-muted-foreground">قیمت فروشنده:</span>
              {seller.hasDiscount ? (
                <span className="mb-1 text-2xs leading-none text-muted-foreground line-through">
                  {seller.retailPrice}
                </span>
              ) : null}
              <span className="text-base font-bold leading-none text-foreground md:text-lg">
                {seller.finalPrice}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsChartOpen(true)}
              aria-label="نمودار قیمت"
              className="shrink-0 rounded-md border border-border p-2 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-primary"
            >
              <LineChart aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {seller ? (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleAddToBasket}
            isLoading={isSubmitting || addToBasket.isPending}
            className="mt-1 flex h-11 items-center justify-center gap-1.5 text-xs font-bold"
          >
            <ShoppingBag aria-hidden="true" className="h-4 w-4" />
            <span>افزودن به سبد خرید</span>
          </Button>
        ) : null}
      </div>

      <Modal isOpen={isChartOpen} onClose={() => setIsChartOpen(false)} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsChartOpen(false)}>
          <ModalTitle className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <LineChart aria-hidden="true" className="h-4 w-4 text-shop" />
            نمودار تغییرات قیمت فروش
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="p-0 pt-4 text-center">
          {isChartLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">در حال لود نمودار قیمت...</span>
            </div>
          ) : chartData && chartData.prices && chartData.prices.length > 0 ? (
            <div className="w-full py-2">
              <PriceChart data={chartData} />
            </div>
          ) : (
            <div className="w-full py-12 text-center text-xs text-muted-foreground">
              دیتای تغییرات قیمتی برای این فروشنده در بازار ثبت نشده است.
            </div>
          )}
          <Button
            variant="outline"
            fullWidth
            onClick={() => setIsChartOpen(false)}
            className="mt-4 h-10 text-xs font-bold"
          >
            متوجه شدم
          </Button>
        </ModalBody>
      </Modal>

      <Modal isOpen={isNotifySuccessOpen} onClose={() => setIsNotifySuccessOpen(false)} className="w-full max-w-md">
        <ModalBody className="flex flex-col items-center justify-center gap-3 p-6 pt-4 text-center">
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
              className="h-10 w-full text-xs font-bold"
            >
              متوجه شدم
            </Button>

            <Link
              href="/search"
              className="py-1 text-center text-xs font-bold text-shop hover:underline"
              onClick={() => setIsNotifySuccessOpen(false)}
            >
              جستجوی قطعات در یدک‌چی
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
          return <circle key={i} cx={x} cy={y} r="2.5" fill="currentColor" className="text-shop" />;
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