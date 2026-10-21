'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, Sparkles, Flame } from 'lucide-react';
import { useGetBasket, useCheckoutBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { BasketItemRow } from './components/BasketItemRow';
import { BasketInvoice } from './components/BasketInvoice';
import { MobileBottomAction } from '@/components/composites/MobileBottomAction/MobileBottomAction';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Button } from '@/components/primitives/Button';
import { Typography } from '@/components/primitives/Typography';
import { showToast } from '@/core/utils/toast';

export function BasketSummary() {
  const router = useRouter();
  const { data: basketData, isLoading, isFetching } = useGetBasket();
  const checkoutBasket = useCheckoutBasket();
  const basket = basketData as any;

  if (isLoading || (isFetching && !basket)) {
    return <PageLoading label="در حال بارگذاری سبد خرید..." />;
  }

  if (!basket || basket.isEmpty) {
    return (
      <div className="flex w-full select-none flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-4 py-20 text-center">
        <ShoppingCart aria-hidden="true" className="mb-4 h-16 w-16 text-muted-foreground/60" />
        <Typography variant="h3" className="font-bold text-foreground">
          سبد خرید شما خالی است
        </Typography>
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
          هیچ قطعه‌ای در سبد خرید شما وجود ندارد. می‌توانید برای جستجوی لوازم یدکی موردنیاز خود به صفحه قطعات مراجعه کنید.
        </p>
        <Link href="/search" prefetch={false} className="mt-4">
          <Button variant="primary" className="h-10 px-6 text-xs font-bold">
            شروع خرید قطعات
          </Button>
        </Link>
      </div>
    );
  }

  const allItems = basket.subBaskets?.flatMap((sub: any) => sub.items) || [];

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

  const leftPriceContent = (
    <div className="flex flex-col">
      <span className="mb-0.5 text-2xs text-muted-foreground">مبلغ قابل پرداخت:</span>
      <span className="text-sm font-bold text-foreground">{basket.total?.finalPrice}</span>
    </div>
  );

  return (
    <div className="flex w-full select-none flex-col gap-8">
      <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
        <div className="flex w-full flex-1 flex-col">
          <div className="mb-2 flex w-fit items-center justify-between border-b-2 border-primary pb-3">
            <span className="flex items-center gap-2 text-sm font-bold text-primary md:text-base">
              سبد خرید
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                {allItems.length} کالا
              </span>
            </span>
          </div>

          <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-xs">
            {allItems.map((item: any) => (
              <BasketItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        <BasketInvoice basket={basket} />
      </div>

      <div className="mt-4 flex w-full flex-col gap-6">
        <div className="w-full rounded-lg border border-border bg-card p-4 shadow-xs md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Sparkles aria-hidden="true" className="h-4 w-4 text-warning" />
              خریداران این کالاها، کالاهای زیر را نیز خریده‌اند
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 rounded-md border border-border p-3 text-center transition-colors hover:border-primary/40"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-md bg-muted p-1">
                  <img src="/Ylogo.png" className="h-12 w-12 object-contain opacity-70" alt="" />
                </div>
                <span className="line-clamp-2 text-2xs font-bold leading-tight text-foreground">
                  دیسک و صفحه کلاچ والئو اصل
                </span>
                <span className="mt-auto text-xs font-bold text-primary">۳,۴۵۰,۰۰۰ تومان</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full rounded-lg border border-border bg-card p-4 shadow-xs md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Flame aria-hidden="true" className="h-4 w-4 text-destructive" />
              پرفروش‌ترین کالاها
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 rounded-md border border-border p-3 text-center transition-colors hover:border-primary/40"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-md bg-muted p-1">
                  <img src="/Ylogo.png" className="h-12 w-12 object-contain opacity-70" alt="" />
                </div>
                <span className="line-clamp-2 text-2xs font-bold leading-tight text-foreground">
                  لنت ترمز سرامیکی جلو پژو ۲۰۶
                </span>
                <span className="mt-auto text-xs font-bold text-primary">۱,۲۵۰,۰۰۰ تومان</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MobileBottomAction
        label="ادامه فرآیند خرید"
        leftContent={leftPriceContent}
        onClick={handleContinue}
        isLoading={checkoutBasket.isPending}
        icon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />}
      />
    </div>
  );
}

export default BasketSummary;