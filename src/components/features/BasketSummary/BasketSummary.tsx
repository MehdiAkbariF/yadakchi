'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Typography } from '@/components/primitives/Typography';
import { useGetBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { BasketMerchantGroup } from './components/BasketMerchantGroup';
import { BasketInvoice } from './components/BasketInvoice';

export function BasketSummary() {
  const { data: basketData, isLoading, isFetching } = useGetBasket();
  const basket = basketData as any;

  if (isLoading || (isFetching && !basket)) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm font-medium font-iran-sans text-muted-foreground">در حال بارگذاری سبد خرید...</span>
      </div>
    );
  }

  if (!basket || basket.isEmpty) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center select-none bg-background rounded-2xl border border-dashed px-4">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/60 stroke-[1.5] mb-4 animate-bounce" />
        <Typography variant="h3" className="font-iran-yekan font-extrabold text-foreground">سبد خرید شما خالی است</Typography>
        <p className="text-xs text-muted-foreground mt-2 font-iran-sans max-w-sm leading-relaxed">
          هیچ قطعه‌ای در سبد خرید شما وجود ندارد. می‌توانید برای جستجوی لوازم یدکی موردنیاز خود به صفحه قطعات مراجعه کنید.
        </p>
        <Link href="/search" className="mt-6">
          <Button variant="primary" className="rounded-xl font-iran-sans font-bold text-xs h-10 px-6">
            شروع خرید قطعات
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col lg:flex-row items-start gap-6 md:gap-8 select-none">
      <div className="flex-1 flex flex-col gap-6 w-full">
        {basket.subBaskets.map((sub: any) => (
          <BasketMerchantGroup key={sub.id} sub={sub} />
        ))}
      </div>
      <BasketInvoice basket={basket} />
    </div>
  );
}

export default BasketSummary