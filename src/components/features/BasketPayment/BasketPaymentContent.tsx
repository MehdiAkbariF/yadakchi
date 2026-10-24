'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle2, Truck, CreditCard } from 'lucide-react';
import {
  useGetBasket,
  useInitiatePayment,
} from '@/domains/front/basket/hooks/basket.hooks';
import { MobileBottomAction } from '@/components/composites/MobileBottomAction/MobileBottomAction';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { PaymentMethodCard } from './components/PaymentMethodCard';
import { DiscountCard } from './components/DiscountCard';
import { ReferralCard } from './components/ReferralCard';
import { ItemsSummaryCard } from './components/ItemsSummaryCard';
import { PaymentInvoice } from './components/PaymentInvoice';
import { TrackingDetailsModal } from './components/TrackingDetailsModal';
import { showToast } from '@/core/utils/toast';

export default function BasketPaymentContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: basketData, isLoading: isBasketLoading } = useGetBasket();
  const initiatePayment = useInitiatePayment();

  const [isLegalInvoice, setIsLegalInvoice] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      showToast.error('لطفاً ابتدا وارد حساب کاربری خود شوید');
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isAuthLoading, router, pathname]);

  const basket = basketData as any;

  if (isAuthLoading || isBasketLoading) {
    return <PageLoading label="در حال آماده‌سازی امن درگاه پرداخت..." />;
  }

  if (!isAuthenticated || !basket) return null;

  const isLegalUser = !!user?.isOrganizationInfoConfirmed;

  const handlePayment = async () => {
    setIsSubmitting(true);
    try {
      const paymentResponse = await initiatePayment.mutateAsync(isLegalInvoice);
      const targetUrl = paymentResponse?.link || paymentResponse?.paymentUrl;
      if (targetUrl) {
        showToast.success('در حال انتقال به درگاه شاپرک...');
        window.location.href = targetUrl;
      } else {
        showToast.error('خطا در دریافت آدرس درگاه پرداخت');
      }
    } catch {
      showToast.error('خطا در اتصال به درگاه پرداخت. لطفاً مجدداً تلاش کنید');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteLegalInfo = () => {
    router.push('/profile/legal');
  };

  const productPriceRaw = basket.total?.totalPriceRaw || 0;
  const discountPriceRaw = basket.total?.totalDiscountRaw || 0;
  const finalPriceRaw = basket.total?.finalPriceRaw || 0;
  const shippingPriceRaw = Math.max(0, finalPriceRaw - (productPriceRaw - discountPriceRaw));

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('fa-IR').format(Math.round(value / 10));

  const leftPriceContent = (
    <div className="flex flex-col">
      <span className="mb-0.5 text-2xs text-muted-foreground">مبلغ نهایی سفارش:</span>
      <span className="text-sm font-bold text-foreground">{formatPrice(finalPriceRaw)} تومان</span>
    </div>
  );

  return (
    <div className="flex w-full select-none flex-col gap-6 py-2">
      {/* مرحله‌بندی پیشرفت خرید (Checkout Stepper - مرحله آخر فعال) */}
     <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-2 sm:px-4 pb-4 sm:pb-2">
  {/* مرحله ۱: سبد خرید */}
  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 text-success font-semibold">
    <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-success/15 text-success">
      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    </div>
    <span className="text-[10px] sm:text-xs">سبد خرید</span>
  </div>

  {/* خط جداکننده */}
  <div className="h-[2px] flex-1 bg-success/50 mx-1.5 sm:mx-3" />

  {/* مرحله ۲: زمان و شیوه ارسال */}
  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 text-success font-semibold">
    <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-success/15 text-success">
      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    </div>
    <span className="text-[10px] sm:text-xs">زمان و شیوه ارسال</span>
  </div>

  {/* خط جداکننده */}
  <div className="h-[2px] flex-1 bg-primary/50 mx-1.5 sm:mx-3" />

  {/* مرحله ۳: پرداخت نهایی */}
  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 text-primary font-bold">
    <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
      <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
    </div>
    <span className="text-[10px] sm:text-xs">پرداخت نهایی</span>
  </div>
</div>

      <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
        {/* ستون اصلی کارت‌ها */}
        <div className="flex w-full flex-1 flex-col gap-5">
          {/* نوار رزرو زمان‌دار شیک */}
          <div className="flex items-center gap-2.5 rounded-xl border border-warning/40 bg-warning/[0.08] p-3.5 text-xs font-semibold text-warning">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              قیمت و موجودی قطعات سبد شما به مدت <strong>۱۵ دقیقه</strong> در انبار رزرو شده است.
            </span>
          </div>

          <PaymentMethodCard />
          <DiscountCard />
          <ReferralCard />
          <ItemsSummaryCard onOpenTracking={() => setIsTrackingModalOpen(true)} />
        </div>

        {/* سایدبار فاکتور نهایی */}
        <PaymentInvoice
          productPrice={productPriceRaw / 10}
          discountPrice={discountPriceRaw / 10}
          shippingPrice={shippingPriceRaw / 10}
          finalPrice={finalPriceRaw / 10}
          isLegalInvoice={isLegalInvoice}
          isLegalUser={isLegalUser}
          isSubmitting={isSubmitting}
          onLegalInvoiceChange={(checked) => setIsLegalInvoice(checked)}
          onPayment={handlePayment}
          onCompleteLegalInfo={handleCompleteLegalInfo}
        />
      </div>

      <MobileBottomAction
        label="پرداخت و تکمیل سفارش"
        leftContent={leftPriceContent}
        onClick={handlePayment}
        isLoading={isSubmitting}
        icon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />}
      />

      <TrackingDetailsModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
      />
    </div>
  );
}