// src/components/features/BasketPayment/BasketPaymentContent.tsx
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
  Building,
  X,
  Save,
} from 'lucide-react';
import { useGetBasket, useInitiatePayment } from '@/domains/front/basket/hooks/basket.hooks';
import { useUpdateProfile } from '@/domains/userpanel/hooks/userpanel.hooks';
import { MobileBottomAction } from '@/components/composites/MobileBottomAction/MobileBottomAction';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { PaymentMethodCard } from './components/PaymentMethodCard';
import { DiscountCard } from './components/DiscountCard';
import { ReferralCard } from './components/ReferralCard';
import { ItemsSummaryCard } from './components/ItemsSummaryCard';
import { PaymentInvoice } from './components/PaymentInvoice';
import { TrackingDetailsModal } from './components/TrackingDetailsModal';
import { Modal } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { showToast } from '@/core/utils/toast';
import { formatRialToToman, extractPureNumber } from '@/core/utils/currency';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface PendingPaymentInfo {
  paymentUrl: string;
  orderId?: string;
  totalPrice?: number;
  timestamp: number;
}

// اسکیما اعتبارسنچی اطلاعات حقوقی
const legalSchema = z.object({
  organizationName: z.string().min(2, 'نام سازمان یا شرکت الزامی است'),
  organizationType: z.string().optional().or(z.literal('')),
  organizationEconomicCode: z.string().min(12, 'کد اقتصادی باید ۱۲ رقم باشد').max(12, 'کد اقتصادی باید ۱۲ رقم باشد'),
  organizationNationalCode: z.string().min(11, 'شناسه ملی باید ۱۱ رقم باشد').max(11, 'شناسه ملی باید ۱۱ رقم باشد'),
  organizationRegisterationCode: z.string().optional().or(z.literal('')),
  organizationHeadOfficeTel: z.string().optional().or(z.literal('')),
});

type LegalFormValues = z.infer<typeof legalSchema>;

// کامپوننت داخلی مودال تکمیل مدارک حقوقی
function LegalInfoModal({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onSuccess: () => void;
}) {
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LegalFormValues>({
    resolver: zodResolver(legalSchema),
    defaultValues: {
      organizationName: '',
      organizationType: '',
      organizationEconomicCode: '',
      organizationNationalCode: '',
      organizationRegisterationCode: '',
      organizationHeadOfficeTel: '',
    },
  });

  React.useEffect(() => {
    if (currentUser?.legalInfo) {
      reset({
        organizationName: currentUser.legalInfo.organizationName || '',
        organizationType: currentUser.legalInfo.organizationType || '',
        organizationEconomicCode: currentUser.legalInfo.organizationEconomicCode || '',
        organizationNationalCode: currentUser.legalInfo.organizationNationalCode || '',
        organizationRegisterationCode: currentUser.legalInfo.organizationRegisterationCode || '',
        organizationHeadOfficeTel: currentUser.legalInfo.organizationHeadOfficeTel || '',
      });
    }
  }, [currentUser, reset]);

  const onSubmit = async (data: LegalFormValues) => {
    const formData = new FormData();
    formData.append('FullName', currentUser?.fullName || 'کاربر مهمان');
    if (currentUser?.nationalCode) formData.append('NationalCode', currentUser.nationalCode);
    if (currentUser?.email) formData.append('Email', currentUser.email);
    if (currentUser?.job) formData.append('Job', currentUser.job);

    formData.append('HasLegalInfo', 'true');
    formData.append('OrganizationName', data.organizationName);
    formData.append('OrganizationType', data.organizationType || '');
    formData.append('OrganizationEconomicCode', data.organizationEconomicCode);
    formData.append('OrganizationNationalCode', data.organizationNationalCode);
    formData.append('OrganizationRegisterationCode', data.organizationRegisterationCode || '');
    formData.append('OrganizationHeadOfficeTel', data.organizationHeadOfficeTel || '');

    try {
      await updateProfile.mutateAsync(formData);
      showToast.success('اطلاعات حقوقی با موفقیت ثبت و تایید شد');
      onSuccess();
      onClose();
    } catch {}
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-modal flex h-full max-h-full w-full max-w-none flex-col rounded-none bg-card p-0 md:relative md:h-[37.5rem] md:max-h-[90vh] md:max-w-2xl md:overflow-hidden md:rounded-2xl md:border md:border-border md:shadow-2xl"
      overlayClassName="bg-black/50 backdrop-blur-sm"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-5 py-4" dir="rtl">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building className="h-4 w-4" />
          </div>
          <span className="text-title-sm">تکمیل و ارسال مدارک حقوقی شرکت</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="بستن پنجره"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden" dir="rtl">
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
            جهت صدور فاکتور رسمی شرکت، لطفاً اطلاعات ثبتی سازمان خود را با دقت وارد نمایید. پس از ثبت، این اطلاعات بررسی و تایید خواهند شد.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="نام سازمان / شرکت *"
              placeholder="نام کامل ثبتی شرکت"
              error={errors.organizationName?.message}
              {...register('organizationName')}
            />

            <Input
              label="نوع سازمان / نوع صنف"
              placeholder="مثال: با مسئولیت محدود، سهامی خاص"
              error={errors.organizationType?.message}
              {...register('organizationType')}
            />

            <Input
              label="شناسه ملی ۱۱ رقمی *"
              placeholder="شناسه ملی شرکت"
              maxLength={11}
              dir="ltr"
              error={errors.organizationNationalCode?.message}
              {...register('organizationNationalCode')}
            />

            <Input
              label="شماره ثبت"
              placeholder="شماره ثبت شرکت"
              dir="ltr"
              error={errors.organizationRegisterationCode?.message}
              {...register('organizationRegisterationCode')}
            />

            <Input
              label="کد اقتصادی حقوقی ۱۲ رقمی *"
              placeholder="کد اقتصادی ۱۲ رقمی"
              maxLength={12}
              dir="ltr"
              error={errors.organizationEconomicCode?.message}
              {...register('organizationEconomicCode')}
            />

            <Input
              label="تلفن ثابت دفتر مرکزی"
              placeholder="مثال: 02188888888"
              dir="ltr"
              error={errors.organizationHeadOfficeTel?.message}
              {...register('organizationHeadOfficeTel')}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-xl px-5 text-xs font-bold"
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={updateProfile.isPending}
            className="h-10 gap-1.5 rounded-xl px-6 text-xs font-bold shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>ثبت و تایید اطلاعات</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
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
  const [isLegalModalOpen, setIsLegalModalOpen] = React.useState(false); // ✅ استیت باز و بسته شدن مودال حقوقی
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

  const allItems = React.useMemo(() => {
    if (!basket?.subBaskets || !Array.isArray(basket.subBaskets)) return [];
    return basket.subBaskets.flatMap((sub: any) => sub.subBasketItems || sub.items || []);
  }, [basket]);

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

  const discountPriceRaw = extractPureNumber(
    basket?.totalDiscountValue ?? basket?.total?.totalDiscountRaw ?? 0
  );

  const finalProductsPriceRaw = React.useMemo(() => {
    const rawFinal =
      basket?.totalFinalPrice ??
      basket?.total?.finalPriceRaw;

    if (rawFinal && extractPureNumber(rawFinal) > 0) {
      return extractPureNumber(rawFinal);
    }

    return Math.max(0, productPriceRaw - discountPriceRaw);
  }, [basket, productPriceRaw, discountPriceRaw]);

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

  const grandTotalRaw = finalProductsPriceRaw + shippingPriceRaw;

  if (isAuthLoading || isBasketLoading) {
    return <PageLoading label="در حال آماده‌سازی امن درگاه پرداخت..." />;
  }

  if (!isAuthenticated) return null;

  const isBasketEmpty = !basket || (allItems.length === 0 && grandTotalRaw === 0);

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

        <p className="mt-2.5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-base">
          سبد خرید شما به سفارش تبدیل شده و قطعات تا چند دقیقه دیگر برای شما رزرو خواهند ماند. چنانچه پرداخت را انجام نداده‌اید، می‌توانید مجدداً وارد درگاه شوید.
        </p>

        {pendingPayment.totalPrice ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-label">
            <span className="text-muted-foreground">مبلغ قابل پرداخت:</span>
            <span className="text-primary text-sm font-bold">
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
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-input bg-card px-5 text-label transition-all hover:bg-accent active:scale-95"
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
        <p className="mt-2 text-base text-muted-foreground">
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

  const isLegalUser = Boolean(user?.isOrganizationInfoConfirmed || user?.legalInfo?.organizationName);

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
      <span className="text-sm font-bold text-foreground" dir="rtl">
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
          <span className="text-[0.625rem] sm:text-xs">سبد خرید</span>
        </div>

        <div className="mx-1.5 h-[0.125rem] flex-1 bg-success/50 sm:mx-3" />

        <div className="flex shrink-0 items-center gap-1.5 font-semibold text-success sm:gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success sm:h-7 sm:w-7">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="text-[0.625rem] sm:text-xs">زمان و شیوه ارسال</span>
        </div>

        <div className="mx-1.5 h-[0.125rem] flex-1 bg-primary/50 sm:mx-3" />

        <div className="flex shrink-0 items-center gap-1.5 font-bold text-primary sm:gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs sm:h-7 sm:w-7">
            <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </div>
          <span className="text-[0.625rem] sm:text-xs">پرداخت نهایی</span>
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
          onCompleteLegalInfo={() => setIsLegalModalOpen(true)} // ✅ باز کردن مودال حقوقی بدون جابجایی صفحه
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

      {/* ✅ مودال کامل تکمیل مدارک حقوقی در صفحه پرداخت */}
      <LegalInfoModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        currentUser={user}
        onSuccess={() => {
          setIsLegalInvoice(true);
        }}
      />
    </div>
  );
}