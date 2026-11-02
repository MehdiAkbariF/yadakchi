'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { useGetBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { toPersianDigits } from '@/core/utils/formatters';

export type FlowStep = 'basket' | 'checkout' | 'payment';

export interface FlowHeaderProps {
  step: FlowStep;
  title?: string;
}

const STEP_CONFIG: Record<FlowStep, { title: string; subtitle: string }> = {
  basket: {
    title: 'سبد خرید',
    subtitle: 'مرور و ویرایش سبد',
  },
  checkout: {
    title: 'تسویه حساب',
    subtitle: 'انتخاب آدرس و شیوه ارسال',
  },
  payment: {
    title: 'پرداخت نهایی',
    subtitle: 'پرداخت امن از طریق درگاه',
  },
};

/**
 * هدر مینیمال فقط برای موبایل.
 * در دسکتاپ (lg) رندر نمی‌شود و هدر سراسری سایت کار خودش را می‌کند.
 */
export function FlowHeader({ step, title }: FlowHeaderProps) {
  const router = useRouter();
  const { data: basketData } = useGetBasket();
  const totalCount = basketData?.summary?.itemCount || 0;

  const config = STEP_CONFIG[step];

  return (
    <header
      className="lg:hidden sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-xl shadow-xs"
      dir="rtl"
    >
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="بازگشت"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card/85 text-foreground shadow-xs transition-transform active:scale-90 hover:bg-muted"
      >
        <ArrowRight className="h-4 w-4" />
      </button>

      <div className="flex min-w-0 flex-1 flex-col items-center px-2">
        <span className="block truncate text-xs font-bold text-foreground sm:text-sm">
          {title || config.title}
        </span>
        <span className="block truncate text-[10px] text-muted-foreground">
          {config.subtitle}
        </span>
      </div>

      <Link
        href="/basket"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card/85 text-foreground shadow-xs transition-transform active:scale-90 hover:bg-muted"
        aria-label="سبد خرید"
      >
        <ShoppingCart className="h-4 w-4" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -end-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground">
            {toPersianDigits(totalCount)}
          </span>
        )}
      </Link>
    </header>
  );
}