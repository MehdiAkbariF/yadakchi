'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useGetBasket, useCheckoutBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { BasketItemRow } from './components/BasketItemRow';
import { BasketInvoice } from './components/BasketInvoice';
import { MobileBottomAction } from '@/components/composites/MobileBottomAction/MobileBottomAction';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Button } from '@/components/primitives/Button';
import { Typography } from '@/components/primitives/Typography';
import { showToast } from '@/core/utils/toast';
import { toPersianDigits } from '@/core/utils/formatters';
import { formatRialToToman, extractPureNumber } from '@/core/utils/currency';

function LottiePlayer({
  path,
  className = 'w-48 h-48',
  loop = true,
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

export function BasketSummary() {
  const router = useRouter();
  const { data: basketData, isLoading, isFetching } = useGetBasket();
  const checkoutBasket = useCheckoutBasket();
  const basket = basketData as any;

  // تجمیع اقلام سبد خرید از تمامی زیرسبدها
  const allItems = React.useMemo(() => {
    if (!basket?.subBaskets || !Array.isArray(basket.subBaskets)) return [];
    return basket.subBaskets.flatMap((sub: any) => {
      const items = sub.subBasketItems || sub.items || [];
      return items.map((item: any) => ({
        ...item,
        shop: item.shop || sub.shop,
        shipmentMethod: sub.shipmentMethod,
      }));
    });
  }, [basket]);

  // محاسبه مجموع قیمت اقلام به عنوان فال‌بک تضمینی
  const fallbackItemsTotal = React.useMemo(() => {
    return allItems.reduce((sum: number, item: any) => {
      const rawPrice = item.finalTotalPrice ?? item.price?.finalTotalPriceRaw ?? 0;
      return sum + extractPureNumber(rawPrice);
    }, 0);
  }, [allItems]);

  // محاسبه قطعی و امن مبلغ نهایی قابل پرداخت
  const finalPriceValue = React.useMemo(() => {
    if (!basket) return 0;

    const basketProductPrice =
      basket.totalFinalPrice ??
      basket.total?.finalPriceRaw ??
      basket.total?.finalPrice ??
      basket.finalPrice;

    const numericProductPrice =
      basketProductPrice !== undefined && basketProductPrice !== null
        ? extractPureNumber(basketProductPrice)
        : fallbackItemsTotal;

    const rawShipment = basket.totalShipmentPrice ?? 0;
    const numericShipmentPrice = extractPureNumber(rawShipment);

    return numericProductPrice + numericShipmentPrice;
  }, [basket, fallbackItemsTotal]);

  if (isLoading || (isFetching && !basket)) {
    return <PageLoading label="در حال بارگذاری سبد خرید..." />;
  }

  if (!basket || basket.isEmpty || allItems.length === 0) {
    return (
      <div className="flex w-full select-none flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card px-4 py-16 text-center shadow-xs">
        <div className="-mt-2 mb-2 flex h-52 w-52 max-w-full items-center justify-center">
          <LottiePlayer path="/anumations/shopping-cart.json" className="h-full w-full" />
        </div>

        <Typography variant="h3" className="text-base font-black text-foreground md:text-xl">
          سبد خرید شما خالی است
        </Typography>
        <p className="mt-2 max-w-sm text-base leading-relaxed text-muted-foreground md:text-base">
          هیچ قطعه‌ای در سبد خرید شما وجود ندارد. می‌توانید برای جستجوی لوازم یدکی موردنیاز خود به صفحه جستجو مراجعه کنید.
        </p>
        <Link href="/search" prefetch={false} className="mt-6">
          <Button variant="primary" className="h-11 rounded-2xl px-8 text-sm font-bold shadow-sm">
            شروع خرید قطعات یدکی
          </Button>
        </Link>
      </div>
    );
  }

  const handleContinue = async () => {
    try {
      await checkoutBasket.mutateAsync(undefined);
      router.push('/checkout');
    } catch (err: any) {
      const responseData = err?.response?.data || err?.data;
      if (
        err?.status === 409 ||
        err?.response?.status === 409 ||
        responseData?.code === 'basket_already_checked_out'
      ) {
        router.push('/checkout');
        return;
      }
      if (err?.status === 401 || err?.type === 'unauthorized') {
        router.push(`/login?redirect=${encodeURIComponent('/basket')}`);
        return;
      }
      showToast.error('خطا در فرآیند آماده‌سازی فاکتور خرید');
    }
  };

  const formattedFinalPrice = formatRialToToman(finalPriceValue);

  const leftPriceContent = (
    <div className="flex flex-col text-right">
      <span className="mb-0.5 text-2xs text-muted-foreground">مبلغ قابل پرداخت:</span>
      <span className="text-sm font-bold text-foreground" dir="rtl">
        {formattedFinalPrice}
      </span>
    </div>
  );

  return (
    <div className="flex w-full select-none flex-col gap-8" dir="rtl">
      <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
        <div className="flex w-full flex-1 flex-col">
          <div className="mb-2 flex w-fit items-center justify-between border-b-2 border-primary pb-3">
            <span className="flex items-center gap-2 text-sm font-bold text-primary md:text-base">
              سبد خرید
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-accent-foreground">
                {toPersianDigits(allItems.length)} کالا
              </span>
            </span>
          </div>

          <div className="w-full overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
            {allItems.map((item: any) => (
              <BasketItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        <BasketInvoice
          basket={basket}
          onContinue={handleContinue}
          isLoading={checkoutBasket.isPending}
        />
      </div>

      <MobileBottomAction
        label="ادامه فرآیند خرید"
        leftContent={leftPriceContent}
        onClick={handleContinue}
        isLoading={checkoutBasket.isPending}
        icon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />}
        hasBottomNav
      />
    </div>
  );
}

export default BasketSummary;