'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  CreditCard,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useGetBasket, useInitiatePayment } from '@/domains/front/basket/hooks/basket.hooks';
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
import { formatRialToToman, extractPureNumber } from '@/core/utils/currency';

interface PendingPaymentInfo {
  paymentUrl: string;
  orderId?: string;
  totalPrice?: number;
  timestamp: number;
}

export default function BasketPaymentContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: basketData, isLoading: isBasketLoading } = useGetBasket();
  const initiatePayment = useInitiatePayment();

  const [isLegalInvoice, setIsLegalInvoice] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = React.useState(false);
  const [pendingPayment, setPendingPayment] = React.useState<PendingPaymentInfo | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('yadakchi_pending_payment');
        if (cached) {
          const parsed: PendingPaymentInfo = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 20 * 60 * 1000) {
            setPendingPayment(parsed);
          } else {
            sessionStorage.removeItem('yadakchi_pending_payment');
          }
        }
      } catch {}
    }
  }, []);

  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      showToast.error('لطفاً ابتدا وارد حساب کاربری خود شوید');
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isAuthLoading, router, pathname]);

  const basket = (basketData as any)?.basket || (basketData as any)?.data || basketData;

  // تمام اقلام موجود در تمام مرسوله‌ها
  const allItems = React.useMemo(() => {
    if (!basket?.subBaskets || !Array.isArray(basket.subBaskets)) return [];
    return basket.subBaskets.flatMap((sub: any) => sub.subBasketItems || sub.items || []);
  }, [basket]);

  // محاسبه قیمت پایه محصولات
  const productPriceRaw = React.useMemo(() => {
    const rawPrice =
      basket?.totalOriginalPrice ??
      basket?.total?.totalPriceRaw ??
      basket?.totalFinalPrice;

    if (rawPrice && extractPureNumber(rawPrice) > 0) {
      return extractPureNumber(rawPrice);
    }

    return allItems.reduce((sum: number, item: any) => {
      return sum + extractPureNumber(item.originalPrice ?? item.finalTotalPrice ?? 0);
    }, 0);
  }, [basket, allItems]);

  // تخفیف کل
  const discountPriceRaw = extractPureNumber(
    basket?.totalDiscountValue ?? basket?.total?.totalDiscountRaw ?? 0
  );

  // قیمت نهایی محصولات (بدون هزینه ارسال)
  const finalProductsPriceRaw = React.useMemo(() => {
    const rawFinal =
      basket?.totalFinalPrice ??
      basket?.total?.finalPriceRaw;

    if (rawFinal && extractPureNumber(rawFinal) > 0) {
      return extractPureNumber(rawFinal);
    }

    return Math.max(0, productPriceRaw - discountPriceRaw);
  }, [basket, productPriceRaw, discountPriceRaw]);

  // هزینه ارسال کل (با فال‌بک از روی شیوه‌های انتخابی هر مرسوله)
  const shippingPriceRaw = React.useMemo(() => {
    if (typeof basket?.totalShipmentPrice === 'number' && basket.totalShipmentPrice > 0) {
      return basket.totalShipmentPrice;
    }

    if (!basket?.subBaskets || !Array.isArray(basket.subBaskets)) return 0;

    return basket.subBaskets.reduce((sum: number, sub: any) => {
      const method = sub.shipmentMethod;
      const snappPrice = sub.snappBoxShipmentPrice ?? sub.snappShipmentPrice ?? 0;
      const tipaxPrice = sub.tipaxShipmentPrice ?? 0;
      const directPrice = sub.sellerShipmentPrice ?? sub.directShipmentPrice ?? 0;

      if (method === 'SnappBox') return sum + extractPureNumber(snappPrice);
      if (method === 'Tipax') return sum + extractPureNumber(tipaxPrice);
      if (method === 'DirectShipment' || method === 'Seller') return sum + extractPureNumber(directPrice);
      return sum;
    }, 0);
  }, [basket]);

  // مبلغ کل قابل پرداخت
  const grandTotalRaw = finalProductsPriceRaw + shippingPriceRaw;

  if (isAuthLoading || isBasketLoading) {
    return <PageLoading label="در حال آماده‌سازی امن درگاه پرداخت..." />;
  }

  if (!isAuthenticated) return null;

  const isBasketEmpty = !basket || (allItems.length === 0 && grandTotalRaw === 0);

  // ۱. حالت بازگشت از درگاه پرداخت
  if (isBasketEmpty && pendingPayment) {
    return (
      <div
        className="mx-auto flex w-full max-w-xl flex-col items-center justify-center py-12 px-4 text-center select-none"
        dir="rtl"
      >
        <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-warning/15 text-warning ring-8 ring-warning/5">
          <Clock className="h-10 w-10 animate-pulse" />
        </div>

        <h2 className="text-lg font-black text-foreground sm:text-xl">
          سفارش شما ثبت شده و در انتظار پرداخت است
        </h2>

        <p className="mt-2.5 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
          سبد خرید شما به سفارش تبدیل شده و قطعات تا چند دقیقه دیگر برای شما رزرو خواهند ماند. چنانچه پرداخت را انجام نداده‌اید، می‌توانید مجدداً وارد درگاه شوید.
        </p>

        {pendingPayment.totalPrice ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground">
            <span className="text-muted-foreground">مبلغ قابل پرداخت:</span>
            <span className="text-primary text-sm font-black">
              {formatRialToToman(pendingPayment.totalPrice)}
            </span>
          </div>
        ) : null}

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => {
              window.location.href = pendingPayment.paymentUrl;
            }}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
          >
            <span>ورود مجدد به درگاه و پرداخت</span>
            <ExternalLink className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('yadakchi_pending_payment');
              router.push('/profile/orders');
            }}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-input bg-card px-5 text-xs font-bold text-foreground transition-all hover:bg-accent active:scale-95"
          >
            <span>مشاهده سفارش در پروفایل</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem('yadakchi_pending_payment');
            router.push('/');
          }}
          className="mt-6 text-2xs font-semibold text-muted-foreground hover:text-foreground"
        >
          انصراف و بازگشت به صفحه اصلی
        </button>
      </div>
    );
  }

  // ۲. حالت سبد خالی
  if (isBasketEmpty) {
    return (
      <div
        className="mx-auto flex w-full max-w-md flex-col items-center justify-center py-20 px-4 text-center select-none"
        dir="rtl"
      >
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground/60">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-base font-bold text-foreground">سبد خرید شما در حال حاضر خالی است</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          برای ادامه خرید می‌توانید به صفحه قطعات و محصولات بازگردید.
        </p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-6 flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs font-bold text-primary-foreground shadow-xs transition-transform active:scale-95"
        >
          <span>مشاهده و انتخاب قطعات</span>
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // ۳. پرداخت سفارش
  const isLegalUser = !!user?.isOrganizationInfoConfirmed;

  const handlePayment = async () => {
    setIsSubmitting(true);
    try {
      const paymentResponse = await initiatePayment.mutateAsync(isLegalInvoice);
      const targetUrl = paymentResponse?.link || paymentResponse?.paymentUrl;

      if (targetUrl) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            'yadakchi_pending_payment',
            JSON.stringify({
              paymentUrl: targetUrl,
              orderId: paymentResponse?.orderId || paymentResponse?.id,
              totalPrice: grandTotalRaw,
              timestamp: Date.now(),
            })
          );
        }

        showToast.success('در حال انتقال امن به درگاه شاپرک...');
        window.location.replace(targetUrl);
      } else {
        showToast.error('خطا در دریافت آدرس درگاه پرداخت');
        setIsSubmitting(false);
      }
    } catch {
      showToast.error('خطا در اتصال به درگاه پرداخت. لطفاً مجدداً تلاش کنید');
      setIsSubmitting(false);
    }
  };

  const leftPriceContent = (
    <div className="flex flex-col text-right">
      <span className="mb-0.5 text-2xs text-muted-foreground">مبلغ نهایی سفارش:</span>
      <span className="text-sm font-black text-foreground" dir="rtl">
        {formatRialToToman(grandTotalRaw)}
      </span>
    </div>
  );

  return (
    <div className="flex w-full select-none flex-col gap-6" dir="rtl">
      {/* مرحله‌بندی */}
      <div className="hidden lg:flex mx-auto w-full max-w-2xl items-center justify-between px-2 pb-4 sm:px-4 sm:pb-2">
        <div className="flex shrink-0 items-center gap-1.5 font-semibold text-success sm:gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success sm:h-7 sm:w-7">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="text-[10px] sm:text-xs">سبد خرید</span>
        </div>

        <div className="mx-1.5 h-[2px] flex-1 bg-success/50 sm:mx-3" />

        <div className="flex shrink-0 items-center gap-1.5 font-semibold text-success sm:gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success sm:h-7 sm:w-7">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="text-[10px] sm:text-xs">زمان و شیوه ارسال</span>
        </div>

        <div className="mx-1.5 h-[2px] flex-1 bg-primary/50 sm:mx-3" />

        <div className="flex shrink-0 items-center gap-1.5 font-bold text-primary sm:gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs sm:h-7 sm:w-7">
            <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </div>
          <span className="text-[10px] sm:text-xs">پرداخت نهایی</span>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
        <div className="flex w-full flex-1 flex-col gap-5">
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

        <PaymentInvoice
          productPrice={productPriceRaw}
          discountPrice={discountPriceRaw}
          shippingPrice={shippingPriceRaw}
          finalPrice={grandTotalRaw}
          isLegalInvoice={isLegalInvoice}
          isLegalUser={isLegalUser}
          isSubmitting={isSubmitting}
          onLegalInvoiceChange={(checked) => setIsLegalInvoice(checked)}
          onPayment={handlePayment}
          onCompleteLegalInfo={() => router.push('/profile/legal')}
        />
      </div>

      <MobileBottomAction
        label="پرداخت و تکمیل سفارش"
        leftContent={leftPriceContent}
        onClick={handlePayment}
        isLoading={isSubmitting}
        icon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />}
        hasBottomNav
      />

      <TrackingDetailsModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
      />
    </div>
  );
}