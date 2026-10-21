'use client';

import { useGetBasket, useCheckoutBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { BasketItemRow } from './components/BasketItemRow';
import { BasketInvoice } from './components/BasketInvoice';
import { MobileBottomAction } from '@/components/composites/MobileBottomAction/MobileBottomAction';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, Sparkles, Flame, ChevronLeft } from 'lucide-react';
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
    return <PageLoading message="در حال بارگذاری سبد خرید..." />;
  }

  if (!basket || basket.isEmpty) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center select-none bg-background rounded-2xl border border-dashed px-4">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/60 stroke-[1.5] mb-4 animate-bounce" />
        <Typography variant="h3" className="font-iran-yekan font-extrabold text-foreground">سبد خرید شما خالی است</Typography>
        <p className="text-xs text-muted-foreground mt-2 font-iran-yekan max-w-sm leading-relaxed">
          هیچ قطعه‌ای در سبد خرید شما وجود ندارد. می‌توانید برای جستجوی لوازم یدکی موردنیاز خود به صفحه قطعات مراجعه کنید.
        </p>
        <Link href="/search" prefetch={false} className="mt-4">
          <Button variant="primary" className="rounded-xl font-iran-yekan font-bold text-xs h-10 px-6">
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
      if (err?.status === 401 || err?.type === 'unauthorized') {
        router.push(`/login?redirect=${encodeURIComponent('/basket')}`);
        return;
      }
      showToast.error('خطا در فرآیند آماده‌سازی فاکتور خرید');
    }
  };

  const leftPriceContent = (
    <div className="flex flex-col text-right">
      <span className="text-[10px] text-muted-foreground font-iran-yekan mb-0.5">مبلغ قابل پرداخت:</span>
      <span className="text-sm font-black text-foreground font-iran-yekan">{basket.total?.finalPrice}</span>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-8 select-none" dir="rtl">
      
      {/* بخش اصلی سبد خرید و صورتحساب */}
      <div className="w-full flex flex-col lg:flex-row items-start gap-6">
        
        {/* ستون راست: آیتم‌های سبد خرید */}
        <div className="flex-1 flex flex-col w-full">
          
          {/* تب / هدر سبد خرید مطابق تصویر ۱ */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b-2 border-primary w-fit">
            <span className="text-sm md:text-base font-bold font-iran-yekan text-primary flex items-center gap-2">
              سبد خرید
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-iran-yekan">
                {allItems.length} کالا
              </span>
            </span>
          </div>

          <div className="w-full bg-background border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
            {allItems.map((item: any) => (
              <BasketItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* ستون چپ: صورتحساب */}
        <BasketInvoice basket={basket} />
      </div>

      {/* ✅ بخش پیشنهادات برای پر کردن فضای سفید خالی (مطابق تصویر ۱ پیوست) */}
      <div className="w-full flex flex-col gap-6 mt-4">
        
        {/* ۱. خریداران این کالاها، کالاهای زیر را نیز خریده‌اند */}
        <div className="w-full bg-background border border-zinc-200/80 rounded-2xl p-4 md:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold font-iran-yekan text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              خریداران این کالاها، کالاهای زیر را نیز خریده‌اند
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="border border-zinc-100 hover:border-zinc-200 rounded-xl p-3 flex flex-col items-center text-center gap-2 transition-all">
                <div className="w-20 h-20 bg-zinc-50 rounded-lg flex items-center justify-center p-1">
                  <img src="/Ylogo.png" className="w-12 h-12 object-contain opacity-70" alt="" />
                </div>
                <span className="text-[11px] font-bold text-foreground line-clamp-2 leading-tight">
                  دیسک و صفحه کلاچ والئو اصل
                </span>
                <span className="text-xs font-black text-primary font-iran-yekan mt-auto">
                  ۳,۴۵۰,۰۰۰ تومان
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ۲. پرفروش‌ترین قطعات یدکی */}
        <div className="w-full bg-background border border-zinc-200/80 rounded-2xl p-4 md:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold font-iran-yekan text-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-rose-500" />
              پرفروش‌ترین کالاها
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="border border-zinc-100 hover:border-zinc-200 rounded-xl p-3 flex flex-col items-center text-center gap-2 transition-all">
                <div className="w-20 h-20 bg-zinc-50 rounded-lg flex items-center justify-center p-1">
                  <img src="/Ylogo.png" className="w-12 h-12 object-contain opacity-70" alt="" />
                </div>
                <span className="text-[11px] font-bold text-foreground line-clamp-2 leading-tight">
                  لنت ترمز سرامیکی جلو پژو ۲۰۶
                </span>
                <span className="text-xs font-black text-primary font-iran-yekan mt-auto">
                  ۱,۲۵۰,۰۰۰ تومان
                </span>
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
        icon={<ArrowLeft className="h-4 w-4" />}
      />
    </div>
  );
}

export default BasketSummary;