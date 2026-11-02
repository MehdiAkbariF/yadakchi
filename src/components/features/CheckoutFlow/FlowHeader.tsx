'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, LogIn } from 'lucide-react';
import { useGetBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
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
 * هدر مینیمال فقط برای موبایل — با طیف رنگ آبی ملایم (`shop` token)
 * در دسکتاپ (lg) رندر نمی‌شود.
 */
export function FlowHeader({ step, title }: FlowHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: basketData } = useGetBasket();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const totalCount = basketData?.summary?.itemCount || 0;

  const config = STEP_CONFIG[step];

  const isBasketPage = pathname === '/basket' || pathname.startsWith('/basket/');
  const loginHref = `/login?redirect=${encodeURIComponent(pathname || '/')}`;

  return (
    <header
      className="lg:hidden fixed top-0 inset-x-0 z-40 flex h-14 w-full items-center justify-between border-b border-shop/15 bg-card/95 px-4 backdrop-blur-xl shadow-xs"
      dir="rtl"
    >
      {/* دکمه بازگشت */}
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="بازگشت"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-shop/20 bg-shop/5 text-shop shadow-xs transition-transform active:scale-90 hover:bg-shop/10"
      >
        <ArrowRight className="h-4 w-4" />
      </button>

      {/* عنوان و زیرعنوان */}
      <div className="flex min-w-0 flex-1 flex-col items-center px-2">
        <span className="block truncate text-xs font-bold text-foreground sm:text-sm">
          {title || config.title}
        </span>
        <span className="block truncate text-[10px] text-shop/80 font-bold">
          {config.subtitle}
        </span>
      </div>

      {/* سمت چپ: سبد خرید یا ورود */}
      <div className="shrink-0">
        {isAuthLoading ? (
          <div className="h-9 w-9" />
        ) : !isAuthenticated ? (
          // 🔐 دکمه ورود (آبی ملایم)
          <Link
            href={loginHref}
            className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-shop/25 bg-shop/5 px-3 text-2xs font-bold text-shop shadow-xs transition-all active:scale-95 hover:bg-shop/10"
            aria-label="ورود به حساب کاربری"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>ورود</span>
          </Link>
        ) : !isBasketPage ? (
          // 🛒 آیکون سبد (آبی ملایم)
          <Link
            href="/basket"
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-shop/20 bg-shop/5 text-shop shadow-xs transition-transform active:scale-90 hover:bg-shop/10"
            aria-label="سبد خرید"
          >
            <ShoppingCart className="h-4 w-4" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -end-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-shop px-1 text-[10px] font-black text-shop-foreground">
                {toPersianDigits(totalCount)}
              </span>
            )}
          </Link>
        ) : (
          <div className="h-9 w-9" />
        )}
      </div>
    </header>
  );
}