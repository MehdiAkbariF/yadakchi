'use client';

import { useGetBasket, useCheckoutBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { BasketItemRow } from './components/BasketItemRow';
import { BasketInvoice } from './components/BasketInvoice';
import { MobileBottomAction } from '@/components/composites/MobileBottomAction/MobileBottomAction';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Typography } from '@/components/primitives/Typography';
import { showToast } from '@/core/utils/toast';
import Link from 'next/link';

export function BasketSummary() {
  const router = useRouter();
  const { data: basketData, isLoading, isFetching } = useGetBasket();
  const checkoutBasket = useCheckoutBasket();
  const basket = basketData as any;

  if (isLoading || (isFetching && !basket)) {
    return <PageLoading message="در حال بارگذاری سبد خرید شما..." />;
  }

  if (!basket || basket.isEmpty) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center select-none bg-background rounded-2xl border border-dashed px-4">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/60 stroke-[1.5] mb-4 animate-bounce" />
        <Typography variant="h3" className="font-iran-yekan font-extrabold text-foreground">سبد خرید شما خالی است</Typography>
        <p className="text-xs text-muted-foreground mt-2 font-iran-yekan max-w-sm leading-relaxed">
          هیچ قطعه‌ای در سبد خرید شما وجود ندارد. می‌توانید برای جستجوی لوازم یدکی موردنیاز خود به صفحه قطعات مراجعه کنید.
        </p>
        <Link href="/search" className="mt-6">
          <Button variant="primary" className="rounded-xl font-iran-yekan font-bold text-xs h-10 px-6">
            شروع خرید قطعات
          </Button>
        </Link>
      </div>
    );
  }

  const allItems = basket.subBaskets.flatMap((sub: any) => sub.items);

  const handleContinue = async () => {
    try {
      await checkoutBasket.mutateAsync(undefined);
      router.push('/checkout');
    } catch (err: any) {
      showToast.error('خطا در فرآیند آماده‌سازی فاکتور خرید');
    }
  };

  const leftPriceContent = (
    <div className="flex flex-col text-right">
      <span className="text-[10px] text-muted-foreground font-iran-yekan mb-0.5">جمع کل سبد خرید:</span>
      <span className="text-sm font-black text-foreground font-iran-yekan">{basket.total.finalPrice}</span>
    </div>
  );

  return (
    <div className="w-full flex flex-col lg:flex-row items-start gap-6 md:gap-8 select-none">
      <div className="flex-1 flex flex-col w-full bg-background border rounded-xl shadow-sm divide-y divide-zinc-100 overflow-hidden">
        {allItems.map((item: any) => (
          <BasketItemRow key={item.id} item={item} />
        ))}
      </div>
      <BasketInvoice basket={basket} />

      <MobileBottomAction
        label="ادامه فرآیند خرید"
        leftContent={leftPriceContent}
        onClick={handleContinue}
        isLoading={checkoutBasket.isPending}
        icon={<ArrowLeft className="h-4 w-4" />}
      />
    </div>
  );
}

export default BasketSummary;