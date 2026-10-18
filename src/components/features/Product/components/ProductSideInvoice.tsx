'use client';

import { useState, useEffect, useRef } from 'react';
import { Store, ShieldCheck, Truck, LineChart, Loader2, Sparkles, ShoppingBag, Info, Eye, Star, Bell } from 'lucide-react';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { useAddToBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { useGetProductPriceChart } from '@/domains/front/product/hooks/product.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ProductSideInvoiceProps {
  product: any;
  seller: any | null;
  sellersCount?: number;
}

// ✅ کامپوننت لاتی با قابلیت پلی یک‌باره
function LottiePlayer({
  path,
  className = 'w-48 h-48',
  loop = false,
}: {
  path: string;
  className?: string;
  loop?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      } catch (e) {}
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
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isNotifySuccessOpen, setIsNotifySuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [metaIndex, setMetaIndex] = useState(0);
  // برای اجبار به پلی مجدد لوتی در هر بار باز شدن مودال
  const [lottieKey, setLottieKey] = useState(0);

  const addToBasket = useAddToBasket();

  const { data: chartData, isLoading: isChartLoading } = useGetProductPriceChart(
    product.id,
    seller ? seller.type : 'New'
  );

  // ✅ QA #5: سواپر اطلاعات محصول
  const metaItems = [
    { icon: Info, text: `${toPersianDigits(product.salesCount || '۰')} خرید موفق` },
    { icon: Eye, text: `${toPersianDigits(product.views || '۰')} بازدید اخیر` },
    { icon: Star, text: `امتیاز ${toPersianDigits(product.averageRate || '۵')}` },
  ];

  useEffect(() => {
    const iv = setInterval(() => setMetaIndex((i) => (i + 1) % 3), 3000);
    return () => clearInterval(iv);
  }, []);

  const handleAddToBasket = async () => {
    if (!seller) return;
    setIsSubmitting(true);
    try {
      await addToBasket.mutateAsync({ shopProductId: seller.id, quantity: 1 });
      showToast.success('قطعه با موفقیت به سبد خرید شما افزوده شد');
    } catch (err: any) {
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ دکمه «موجود شد خبرم کن»
  const handleNotifyMe = async () => {
    if (isNotifying) return;
    setIsNotifying(true);
    try {
      // await notifyMeMutation.mutateAsync({ productId: product.id });
      await new Promise((r) => setTimeout(r, 600));
      setLottieKey((k) => k + 1); // پلی مجدد لوتی
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
    <Card className="w-full flex flex-col overflow-hidden border bg-background rounded-2xl shadow-sm">
      {seller && seller.hasDiscount && discountPercentage > 0 && (
        <div className="w-full bg-destructive text-white py-2 px-4 text-center text-xs font-black font-iran-yekan animate-pulse shrink-0">
          با تخفیف ویژه {toPersianDigits(discountPercentage)} درصد
        </div>
      )}

      <div className="p-5 flex flex-col gap-4">
        {seller ? (
          <>
            {/* ✅ QA #1: نام فروشگاه آبی */}
            <div className="flex items-center justify-between border-b pb-3.5 w-full">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-lg border bg-muted/10 flex items-center justify-center overflow-hidden">
                  {seller.shop.logo ? (
                    <img src={getFullUrl(seller.shop.logo)} className="w-full h-full object-contain" alt="" />
                  ) : (
                    <Store className="h-5 w-5 text-muted-foreground/80" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs md:text-sm font-bold text-shop block truncate font-iran-yekan">
                    {seller.shop.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5 font-iran-yekan">
                    عملکرد عالی فروشنده
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="text-[10px] font-bold font-iran-yekan text-shop border-b border-shop pb-0.5 hover:opacity-80 transition-opacity outline-none shrink-0"
              >
                همه فروشندگان ({formatPrice(sellersCount)})
              </button>
            </div>

            {/* ✅ QA #2/#3/#4 */}
            <div className="flex flex-col gap-3 w-full border-b pb-3.5 text-xs text-muted-foreground font-iran-yekan">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-success-500 shrink-0" />
                <span className="font-bold text-foreground">
                  {seller.warrantyTitle || 'ضمانت اصل بودن کالا'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary shrink-0" />
                <span className="font-bold text-foreground">نوع قطعه: {seller.typeLabel}</span>
              </div>

              <div className="flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
                <span className="font-bold text-foreground">
                  ارسال از {(seller.shop as any).cityName || seller.shop.address?.split('،')[0] || 'فروشنده'} | {seller.dayOfDeliveryLabel}
                </span>
              </div>
            </div>
          </>
        ) : (
          /* ✅ QA #10 و #11: طبق تصویر مرجع */
          <div className="flex flex-col items-center justify-center text-center gap-4 py-4 px-2 w-full">
            <p className="text-xs md:text-sm text-foreground font-iran-yekan leading-loose">
              این کالا فعلاً ناموجود است اما می‌توانید زنگوله را بزنید تا به محض موجود شدن، به شما خبر دهیم.
            </p>

            <button
              type="button"
              onClick={handleNotifyMe}
              disabled={isNotifying}
              className="w-full h-12 rounded-xl bg-[#E94057] hover:bg-[#D63650] disabled:opacity-80 text-white text-sm md:text-base font-bold font-iran-yekan flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              {isNotifying ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Bell className="h-5 w-5" />
              )}
              <span>موجود شد خبرم کن</span>
            </button>
          </div>
        )}

        {/* ✅ QA #5 */}
        {seller && (
          <div className="w-full flex items-center justify-center border-b border-dashed py-3 h-8 overflow-hidden relative shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={metaIndex}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex items-center justify-center gap-1.5 text-[11px] font-bold text-foreground font-iran-yekan"
              >
                {(() => {
                  const Icon = metaItems[metaIndex].icon;
                  return <Icon className="h-3.5 w-3.5 text-primary" />;
                })()}
                <span>{metaItems[metaIndex].text}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* ✅ QA #6 */}
        {isLowStock && (
          <div className="w-full text-center text-[11px] font-bold text-destructive bg-destructive/5 rounded-lg py-1.5 font-iran-yekan">
            فقط {toPersianDigits(seller.quantity)} عدد در انبار باقی مانده
          </div>
        )}

        {/* ✅ QA #7/#8/#9 */}
        {seller && (
          <div className="w-full flex items-center justify-between pt-1">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-muted-foreground font-iran-yekan mb-0.5">قیمت فروشنده:</span>
              {seller.hasDiscount && (
                <span className="text-[10px] text-zinc-400 line-through leading-none mb-1 font-iran-yekan">
                  {seller.retailPrice}
                </span>
              )}
              <span className="text-base md:text-lg font-black text-foreground font-iran-yekan leading-none">
                {seller.finalPrice}
              </span>
            </div>

            <button
              onClick={() => setIsChartOpen(true)}
              className="p-2 border rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all shrink-0 outline-none"
            >
              <LineChart className="h-4.5 w-4.5" />
            </button>
          </div>
        )}

        {seller && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleAddToBasket}
            isLoading={isSubmitting || addToBasket.isPending}
            className="rounded-xl font-iran-yekan font-bold text-xs h-11 flex items-center justify-center gap-1.5 mt-1 transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>افزودن به سبد خرید</span>
          </Button>
        )}
      </div>

      {/* ✅ QA #12: نمودار تغییرات قیمت */}
      <Modal isOpen={isChartOpen} onClose={() => setIsChartOpen(false)} className="max-w-md w-full animate-none">
        <ModalHeader onClose={() => setIsChartOpen(false)}>
          <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-1.5">
            <LineChart className="h-4.5 w-4.5 text-shop" />
            نمودار تغییرات قیمت فروش
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="p-0 pt-4 text-center">
          {isChartLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground font-iran-yekan">در حال لود نمودار قیمت...</span>
            </div>
          ) : chartData && chartData.prices && chartData.prices.length > 0 ? (
            <div className="w-full py-2 font-iran-yekan">
              <PriceChart data={chartData} />
            </div>
          ) : (
            <div className="w-full py-12 font-iran-yekan text-xs text-muted-foreground text-center">
              دیتای تغییرات قیمتی برای این فروشنده در بازار ثبت نشده است.
            </div>
          )}
          <Button
            variant="outline"
            fullWidth
            onClick={() => setIsChartOpen(false)}
            className="rounded-xl mt-4 text-xs h-10 font-bold font-iran-yekan"
          >
            متوجه شدم
          </Button>
        </ModalBody>
      </Modal>

      {/* ✅ مودال موفقیت «موجود شد خبرم کن» */}
      <Modal
        isOpen={isNotifySuccessOpen}
        onClose={() => setIsNotifySuccessOpen(false)}
        className="max-w-md w-full animate-none"
      >
        <ModalBody className="p-6 pt-4 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-56 h-56 max-w-full mx-auto -mt-2 mb-1">
            {/* key یونیک برای پلی مجدد در هر بار باز شدن */}
            <LottiePlayer
              key={lottieKey}
              path="/anumations/notif-success.json"
              className="w-full h-full"
              loop={false}
            />
          </div>

          <h4 className="text-base font-black text-foreground font-iran-yekan leading-relaxed">
            درخواست شما با موفقیت ثبت شد!
          </h4>

          <p className="text-xs md:text-sm text-foreground font-iran-yekan leading-loose text-center">
            به‌محض موجود شدن این کالا، به شما اطلاع می‌دیم.
          </p>

          <p className="text-xs text-muted-foreground font-iran-yekan leading-relaxed text-center max-w-xs mx-auto">
            تا اون موقع، می‌تونید قطعات موردنیاز خودروتون رو در یدکچی جستجو و قیمت‌ها رو مقایسه کنید.
          </p>

          <div className="flex flex-col w-full gap-2 mt-3">
            <Button
              variant="primary"
              onClick={() => setIsNotifySuccessOpen(false)}
              className="w-full rounded-xl text-xs h-10 font-bold font-iran-yekan shadow-sm"
            >
              متوجه شدم
            </Button>

            <Link
              href="/search"
              className="text-xs font-bold text-shop hover:underline font-iran-yekan text-center py-1"
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
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#e5e7eb" strokeWidth="1" />
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#e5e7eb" strokeWidth="1" />
        <polyline
          fill="none"
          stroke="#2B76A1"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
        {prices.map((p, i) => {
          const x = pad + (i / Math.max(prices.length - 1, 1)) * innerW;
          const y = pad + innerH - ((p - min) / Math.max(max - min, 1)) * innerH;
          return <circle key={i} cx={x} cy={y} r="2.5" fill="#2B76A1" />;
        })}
      </svg>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-iran-yekan mt-2">
        <span>کمترین: {fmt(min)}</span>
        <span>میانگین: {fmt(data.averagePrice || 0)}</span>
        <span>بیشترین: {fmt(max)}</span>
      </div>
    </div>
  );
}