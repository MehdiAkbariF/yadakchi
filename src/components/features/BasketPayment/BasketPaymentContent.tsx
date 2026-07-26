'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGetBasket, useInitiatePayment, useApplyDiscountCode, useApplyReferralCode } from '@/domains/front/basket/hooks/basket.hooks';

import { MobileBottomAction } from '@/components/composites/MobileBottomAction/MobileBottomAction';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { PaymentMethodCard } from './components/PaymentMethodCard';
import { DiscountCard } from './components/DiscountCard';
import { ReferralCard } from './components/ReferralCard';
import { ItemsSummaryCard } from './components/ItemsSummaryCard';
import { PaymentInvoice } from './components/PaymentInvoice';
import { TrackingDetailsModal } from './components/TrackingDetailsModal';
import { ArrowLeft } from 'lucide-react';
import { showToast } from '@/core/utils/toast';

export default function BasketPaymentContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: basketData, isLoading: isBasketLoading } = useGetBasket();
  const initiatePayment = useInitiatePayment();

  const [isLegalInvoice, setIsLegalInvoice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      showToast.error('لطفاً ابتدا وارد حساب کاربری خود شوید');
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isAuthLoading, router, pathname]);

  const basket = basketData as any;

  if (isAuthLoading || isBasketLoading) {
    return <PageLoading message="در حال راه‌اندازی امن درگاه پرداخت..." />;
  }

  if (!isAuthenticated || !basket) {
    return null;
  }

  const isLegalUser = !!user?.isOrganizationInfoConfirmed;

  const handlePayment = async () => {
    setIsSubmitting(true);
    try {
      const paymentResponse = await initiatePayment.mutateAsync(isLegalInvoice);
      const targetUrl = paymentResponse?.link || paymentResponse?.paymentUrl;

      if (targetUrl) {
        showToast.success('در حال انتقال به درگاه بانکی...');
        window.location.href = targetUrl;
      } else {
        showToast.error('خطا در دریافت درگاه بانکی');
      }
    } catch (err: any) {
      showToast.error('خطا در اتصال به درگاه پرداخت. لطفاً مجدداً تلاش کنید');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteLegalInfo = () => {
    router.push('/profile/legal');
  };

  const productPriceRaw = basket.total.totalPriceRaw || 0;
  const discountPriceRaw = basket.total.totalDiscountRaw || 0;
  const finalPriceRaw = basket.total.finalPriceRaw || 0;
  const shippingPriceRaw = Math.max(0, finalPriceRaw - (productPriceRaw - discountPriceRaw));

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value);
  };

  const leftPriceContent = (
    <div className="flex flex-col text-right">
      <span className="text-[10px] text-muted-foreground font-iran-yekan mb-0.5">مبلغ نهایی قابل پرداخت:</span>
      <span className="text-sm font-black text-foreground font-iran-yekan">
        {formatPrice(finalPriceRaw / 10)} تومان
      </span>
    </div>
  );

  return (
    <div className="w-full flex flex-col lg:flex-row items-start gap-6 md:gap-8 select-none text-right" dir="rtl">
      
      <div className="flex-1 flex flex-col gap-6 w-full">
        <PaymentMethodCard />
        <DiscountCard />
        <ReferralCard />
        <ItemsSummaryCard onOpenTracking={() => setIsTrackingModalOpen(true)} />
      </div>

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

      <MobileBottomAction
        label="پرداخت و تکمیل سفارش"
        leftContent={leftPriceContent}
        onClick={handlePayment}
        isLoading={isSubmitting}
        icon={<ArrowLeft className="h-4 w-4" />}
      />

      <TrackingDetailsModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
      />

    </div>
  );
}