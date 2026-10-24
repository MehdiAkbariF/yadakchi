'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Truck, CreditCard, Lock, MapPin, Info } from 'lucide-react';
import {
  useGetCheckoutBasket,
  useGetUserLocations,
  useSetBasketShipment,
  useSetBasketLocationAndPrice,
} from '@/domains/front/basket/hooks/basket.hooks';
import { CheckoutAddress } from './components/CheckoutAddress';
import { CheckoutShipmentGroup } from './components/CheckoutShipmentGroup';
import { CheckoutInvoice } from './components/CheckoutInvoice';
import { AddressModal } from './components/AddressModal';
import { AddressMapModal } from '@/components/composites/AddressMapModal/AddressMapModal';
import { MobileBottomAction } from '@/components/composites/MobileBottomAction/MobileBottomAction';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

export function CheckoutContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { data: rawBasket, isLoading: isBasketLoading } = useGetCheckoutBasket();
  const { data: locations = [], isLoading: isLocationsLoading } = useGetUserLocations();

  const setBasketLocation = useSetBasketLocationAndPrice();
  const setBasketShipment = useSetBasketShipment();

  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = React.useState(false);
  const [isNewAddressOpen, setIsNewAddressOpen] = React.useState(false);
  const [selectedMethods, setSelectedMethods] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // پرچم‌ها برای مدیریت استعلام خودکار آدرس بدون ایجاد حلقه بی‌نهایت
  const hasInitializedLocationRef = React.useRef(false);
  const prevAddressIdRef = React.useRef<string | null>(null);

  const [mapAddressData, setMapAddressData] = React.useState<{
    address: string;
    latitude: number;
    longitude: number;
    cityId: string;
    cityName: string;
    provinceName: string;
  } | null>(null);

  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      showToast.error('لطفاً ابتدا وارد حساب کاربری خود شوید');
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isAuthLoading, router, pathname]);

  const basket = rawBasket as any;

  // انتخاب هوشمند آدرس فعال (ابتدا آدرس متصل به سبد، سپس پیش‌فرض، سپس اولین آدرس)
  const activeAddress = React.useMemo(() => {
    if (!locations || locations.length === 0) return null;
    return (
      locations.find((l: any) => l.id === basket?.userLocationId) ||
      locations.find((l: any) => l.isDefault) ||
      locations[0]
    );
  }, [locations, basket?.userLocationId]);

  // ✅ استعلام فوری هزینه‌های حمل در لحظه لود شدن صفحه (با آدرس پیش‌فرض) یا تغییر آدرس
  React.useEffect(() => {
    if (!activeAddress?.id || !basket) return;

    // ۱. اجرای خودکار در بدو ورود به صفحه با آدرس دیفالت
    if (!hasInitializedLocationRef.current) {
      hasInitializedLocationRef.current = true;
      prevAddressIdRef.current = activeAddress.id;
      setBasketLocation.mutate(activeAddress.id);
      return;
    }

    // ۲. اجرا در صورت تعویض آدرس توسط کاربر
    if (prevAddressIdRef.current !== activeAddress.id && !setBasketLocation.isPending) {
      prevAddressIdRef.current = activeAddress.id;
      setBasketLocation.mutate(activeAddress.id);
    }
  }, [activeAddress?.id, basket, setBasketLocation]);

  // مقداردهی اولیه به شیوه‌های ارسال پس از دریافت یا به‌روزرسانی سبد
  React.useEffect(() => {
    if (basket?.subBaskets) {
      const initial: Record<string, string> = {};
      basket.subBaskets.forEach((sub: any) => {
        const directPrice = sub.directShipmentPrice ?? sub.sellerShipmentPrice ?? 0;
        const snappPrice = sub.snappBoxShipmentPrice ?? sub.snappShipmentPrice ?? 0;

        if (sub.shipmentMethod) {
          initial[sub.id] = sub.shipmentMethod === 'Seller' ? 'DirectShipment' : sub.shipmentMethod;
        } else if (sub.tipaxShipmentPrice > 0) {
          initial[sub.id] = 'Tipax';
        } else if (directPrice > 0) {
          initial[sub.id] = 'DirectShipment';
        } else if (snappPrice > 0) {
          initial[sub.id] = 'SnappBox';
        } else if (sub.isLocalShipmentAvailable) {
          initial[sub.id] = 'Local';
        }
      });
      setSelectedMethods(initial);
    }
  }, [basket]);

  if (isAuthLoading || isBasketLoading || isLocationsLoading) {
    return <PageLoading label="در حال بارگذاری اطلاعات تسویه حساب و آدرس‌ها..." />;
  }

  if (!isAuthenticated || !basket || !basket.subBaskets?.length) return null;

  const isAddressSynced = activeAddress && basket?.userLocationId === activeAddress.id;
  // قفل بودن گزینه‌ها حین استعلام قیمت جدید
  const isShipmentLocked = !activeAddress || !isAddressSynced || setBasketLocation.isPending;

  const handleSelectShipment = (subBasketId: string, method: string) => {
    if (isShipmentLocked) return;
    setSelectedMethods((prev) => ({ ...prev, [subBasketId]: method }));
  };

  const handlePayment = async () => {
    if (!activeAddress) {
      showToast.error('لطفاً ابتدا آدرس تحویل سفارش خود را انتخاب کنید');
      setIsAddressModalOpen(true);
      return;
    }

    if (isShipmentLocked) {
      showToast.error('در حال بروزرسانی هزینه‌های ارسال، لطفاً کمی صبر کنید');
      return;
    }

    const unselectedSubBasket = basket.subBaskets.find((sub: any) => !selectedMethods[sub.id]);
    if (unselectedSubBasket) {
      showToast.error(
        `لطفاً شیوه ارسال مرسوله فروشگاه «${unselectedSubBasket.shop?.shopTitle || ''}» را مشخص کنید`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // ۱. اگر آدرس در سرور سینک نیست، آدرس نهایی را ست کن
      if (basket.userLocationId !== activeAddress.id) {
        await setBasketLocation.mutateAsync(activeAddress.id);
      }

      // ۲. ثبت روش‌های ارسال انتخاب‌شده برای هر ساب‌باکت
      const methodsPayload = basket.subBaskets.map((sub: any) => ({
        subBasketId: sub.id,
        shipmentMethod: selectedMethods[sub.id] || 'Tipax',
      }));
      await setBasketShipment.mutateAsync(methodsPayload);

      showToast.success('اطلاعات نحوه ارسال تایید شد');
      router.push('/basket-payment');
    } catch (err: any) {
      showToast.error(err.userMessage || err?.response?.data?.message || 'خطا در ثبت نهایی شیوه ارسال');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateShipmentTotals = () => {
    if (isShipmentLocked) return 0;
    let total = 0;
    basket.subBaskets.forEach((sub: any) => {
      const method = selectedMethods[sub.id];
      const directPrice = sub.directShipmentPrice ?? sub.sellerShipmentPrice ?? 0;
      const snappPrice = sub.snappBoxShipmentPrice ?? sub.snappShipmentPrice ?? 0;

      if (method === 'Tipax') total += sub.tipaxShipmentPrice || 0;
      else if (method === 'DirectShipment' || method === 'Seller') total += directPrice;
      else if (method === 'SnappBox') total += snappPrice;
    });
    return total;
  };

  const handleConfirmMapAddress = (data: {
    address: string;
    latitude: number;
    longitude: number;
    cityId: string;
    cityName: string;
    provinceName: string;
  }) => {
    setMapAddressData(data);
    setIsNewAddressOpen(true);
    setIsAddressModalOpen(true);
  };

  const totalShipment = calculateShipmentTotals();
  const finalPayablePrice = (basket.totalFinalPrice || 0) + totalShipment;

  const leftPriceContent = (
    <div className="flex flex-col">
      <span className="mb-0.5 text-2xs text-muted-foreground">
        {isShipmentLocked ? 'در حال استعلام هزینه ارسال...' : 'مبلغ نهایی سفارش:'}
      </span>
      <span className={cn('text-sm font-bold', isShipmentLocked ? 'text-muted-foreground/60' : 'text-foreground')}>
        {isShipmentLocked ? '---' : `${new Intl.NumberFormat('fa-IR').format(finalPayablePrice / 10)} تومان`}
      </span>
    </div>
  );

  return (
    <div className="flex w-full select-none flex-col gap-6 py-2">
      {/* مرحله‌بندی پیشرفت خرید */}
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-2 sm:px-4 pb-2">
        {/* مرحله ۱: سبد خرید */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 text-muted-foreground">
          <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap">سبد خرید</span>
        </div>

        {/* خط جداکننده */}
        <div className="mx-1.5 sm:mx-3 h-[2px] flex-1 bg-primary/40" />

        {/* مرحله ۲: زمان و شیوه ارسال */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 font-bold text-primary">
          <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
            <Truck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </div>
          <span className="text-[10px] sm:text-xs whitespace-nowrap">زمان و شیوه ارسال</span>
        </div>

        {/* خط جداکننده */}
        <div className="mx-1.5 sm:mx-3 h-[2px] flex-1 bg-border/80" />

        {/* مرحله ۳: پرداخت نهایی */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 text-muted-foreground/60">
          <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-border bg-card">
            <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </div>
          <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">پرداخت نهایی</span>
        </div>
      </div>

      {/* بنر وضعیت */}
      {isShipmentLocked && (
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
          <Info className="h-5 w-5 shrink-0 text-warning" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              {!activeAddress
                ? 'برای مشاهده شیوه‌های ارسال، ابتدا آدرس خود را انتخاب کنید'
                : 'در حال بروزرسانی هزینه‌های ارسال بر اساس آدرس شما...'}
            </span>
            <span className="mt-0.5 text-xs text-muted-foreground">
              {!activeAddress
                ? 'پس از انتخاب آدرس، لیست روش‌های ارسال و هزینه‌های آن به صورت خودکار نمایش داده می‌شود.'
                : 'لطفاً چند لحظه صبر کنید.'}
            </span>
          </div>
        </div>
      )}

      {/* بدنه اصلی */}
      <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
        <div className="flex w-full flex-1 flex-col gap-6">
          {/* بخش انتخاب آدرس */}
          <CheckoutAddress
            activeAddress={activeAddress}
            onOpenModal={() => setIsAddressModalOpen(true)}
            isLocked={!activeAddress}
          />

          {/* بخش انتخاب شیوه ارسال */}
          <div className="relative">
            <div className="mb-3 flex items-center gap-2">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-2xs font-bold',
                  isShipmentLocked ? 'bg-secondary text-muted-foreground/60' : 'bg-shop text-shop-foreground'
                )}
              >
                ۲
              </div>
              <span
                className={cn(
                  'text-sm font-bold',
                  isShipmentLocked ? 'text-muted-foreground/60' : 'text-foreground'
                )}
              >
                شیوه ارسال
              </span>
            </div>

            {isShipmentLocked ? (
              <div className="relative min-h-[200px] overflow-hidden rounded-lg border border-dashed border-border bg-secondary/30">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center backdrop-blur-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-md">
                    <Lock className="h-7 w-7 text-muted-foreground/70" />
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {!activeAddress ? 'این بخش پس از انتخاب آدرس فعال می‌شود' : 'در حال محاسبه هزینه ارسال...'}
                  </span>
                  <p className="max-w-sm text-xs text-muted-foreground">
                    {!activeAddress
                      ? 'با کلیک روی دکمه «انتخاب آدرس» در بالا، آدرس خود را مشخص کنید تا گزینه‌های ارسال نمایش داده شوند.'
                      : 'در حال دریافت اطلاعات پست، تیپاکس و پیک بر اساس موقعیت مکانی شما...'}
                  </p>
                  {!activeAddress && (
                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="mt-2 flex items-center gap-1.5 rounded-md bg-shop px-4 py-2 text-xs font-bold text-shop-foreground transition-colors hover:bg-shop-hover"
                    >
                      <MapPin className="h-4 w-4" />
                      انتخاب آدرس
                    </button>
                  )}
                </div>
                <div className="pointer-events-none opacity-20">
                  <div className="p-4">
                    <div className="h-24 rounded-md bg-muted" />
                    <div className="mt-3 h-24 rounded-md bg-muted" />
                  </div>
                </div>
              </div>
            ) : (
              basket.subBaskets.map((sub: any, index: number) => (
                <CheckoutShipmentGroup
                  key={sub.id}
                  sub={sub}
                  index={index}
                  totalSubBaskets={basket.subBaskets.length}
                  selectedMethod={selectedMethods[sub.id] || null}
                  onSelectMethod={(method) => handleSelectShipment(sub.id, method)}
                />
              ))
            )}
          </div>
        </div>

        {/* فاکتور */}
        <CheckoutInvoice
          basket={basket}
          totalShipment={totalShipment}
          finalPayablePrice={finalPayablePrice}
          onSubmit={handlePayment}
          isLoading={isSubmitting || isShipmentLocked}
        />
      </div>

      {/* اکشن بار پایین برای موبایل */}
      <MobileBottomAction
        label={
          !activeAddress
            ? 'ابتدا آدرس را انتخاب کنید'
            : isShipmentLocked
            ? 'در حال بروزرسانی...'
            : 'تایید و رفتن به پرداخت'
        }
        leftContent={leftPriceContent}
        onClick={handlePayment}
        isLoading={isSubmitting}
        icon={!activeAddress ? <MapPin className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
      />

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        locations={locations}
        activeAddress={activeAddress}
        onOpenMapModal={() => {
          setIsAddressModalOpen(false);
          setIsMapModalOpen(true);
        }}
        mapAddressData={mapAddressData}
        isNewAddressOpen={isNewAddressOpen}
        setIsNewAddressOpen={setIsNewAddressOpen}
      />

      <AddressMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onConfirmAddress={handleConfirmMapAddress}
      />
    </div>
  );
}

export default CheckoutContent;