'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Truck,
  CreditCard,
  Lock,
  MapPin,
  Info,
} from 'lucide-react';
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

/**
 * ✅ مقدار enum ارسالی به سرور برای ارسال مستقیم = 'DirectShipment'
 * مقدار 'Seller' فقط alias legacy است و نباید به سرور ارسال شود.
 */
const DIRECT_SHIPMENT_METHOD = 'DirectShipment';

export function CheckoutContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { data: rawBasket, isLoading: isBasketLoading } =
    useGetCheckoutBasket();
  const { data: locations = [], isLoading: isLocationsLoading } =
    useGetUserLocations();

  const setBasketLocation = useSetBasketLocationAndPrice();
  const setBasketShipment = useSetBasketShipment();

  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = React.useState(false);
  const [isNewAddressOpen, setIsNewAddressOpen] = React.useState(false);
  const [selectedMethods, setSelectedMethods] = React.useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const prevAddressIdRef = React.useRef<string | null>(null);
  const hasTriggeredInitialLocationRef = React.useRef(false);

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

  // انتخاب هوشمند آدرس فعال
  const activeAddress = React.useMemo(() => {
    if (!locations || locations.length === 0) return null;
    return (
      locations.find((l: any) => l.id === basket?.userLocationId) ||
      locations.find((l: any) => l.isDefault) ||
      locations[0]
    );
  }, [locations, basket?.userLocationId]);

  /**
   * ✅ اصلاح ۱: در لود اول همیشه setBasketLocation را صدا بزن
   * تا سرور هزینه‌های ارسال را بر اساس آدرس فعال محاسبه کند.
   */
  React.useEffect(() => {
    if (!activeAddress?.id || !basket) return;

    if (!hasTriggeredInitialLocationRef.current) {
      hasTriggeredInitialLocationRef.current = true;
      prevAddressIdRef.current = activeAddress.id;
      if (!setBasketLocation.isPending) {
        setBasketLocation.mutate(activeAddress.id);
      }
      return;
    }

    if (
      prevAddressIdRef.current !== activeAddress.id &&
      !setBasketLocation.isPending
    ) {
      prevAddressIdRef.current = activeAddress.id;
      setBasketLocation.mutate(activeAddress.id);
    }
  }, [activeAddress?.id, basket, setBasketLocation]);

  /**
   * ✅ اصلاح ۲: مقداردهی پیش‌فرض selectedMethods
   * - اگر سرور مقدار legacy 'Seller' برگرداند، به 'DirectShipment' نرمال می‌شود
   *   تا در UI از 'DirectShipment' استفاده شود و هنگام ارسال هم همین مقدار برود.
   * - اگر shipmentMethod از سرور نیامد، بر اساس price > 0 یک متد پیش‌فرض انتخاب می‌شود.
   */
  React.useEffect(() => {
    if (!basket?.subBaskets?.length) return;

    setSelectedMethods((prev) => {
      const next = { ...prev };
      basket.subBaskets.forEach((sub: any) => {
        if (next[sub.id]) return;

        if (sub.shipmentMethod) {
          // نرمال‌سازی legacy: 'Seller' → 'DirectShipment'
          next[sub.id] =
            sub.shipmentMethod === 'Seller'
              ? DIRECT_SHIPMENT_METHOD
              : sub.shipmentMethod;
          return;
        }

        const directPrice =
          sub.directShipmentPrice ?? sub.sellerShipmentPrice ?? 0;
        const snappPrice =
          sub.snappBoxShipmentPrice ?? sub.snappShipmentPrice ?? 0;
        const tipaxPrice = sub.tipaxShipmentPrice ?? 0;

        if (snappPrice > 0) next[sub.id] = 'SnappBox';
        else if (tipaxPrice > 0) next[sub.id] = 'Tipax';
        else if (directPrice > 0) next[sub.id] = DIRECT_SHIPMENT_METHOD;
        else if (sub.isLocalShipmentAvailable) next[sub.id] = 'Local';
      });
      return next;
    });
  }, [basket]);

  if (isAuthLoading || isBasketLoading || isLocationsLoading) {
    return (
      <PageLoading label="در حال بارگذاری اطلاعات تسویه حساب و آدرس‌ها..." />
    );
  }

  if (!isAuthenticated || !basket || !basket.subBaskets?.length) return null;

  const isShipmentLocked = !activeAddress || setBasketLocation.isPending;

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

    const unselectedSubBasket = basket.subBaskets.find(
      (sub: any) => !selectedMethods[sub.id],
    );
    if (unselectedSubBasket) {
      showToast.error(
        `لطفاً شیوه ارسال مرسوله فروشگاه «${
          unselectedSubBasket.shop?.shopTitle || ''
        }» را مشخص کنید`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (basket.userLocationId !== activeAddress.id) {
        await setBasketLocation.mutateAsync(activeAddress.id);
      }

      /**
       * ✅ payload مستقیم ارسال می‌شود؛ 'DirectShipment' مقدار درست سرور است.
       * هیچ mapping اضافی به 'Seller' انجام نمی‌شود.
       */
      const methodsPayload = basket.subBaskets.map((sub: any) => ({
        subBasketId: sub.id,
        shipmentMethod: selectedMethods[sub.id],
      }));
      await setBasketShipment.mutateAsync(methodsPayload);

      showToast.success('اطلاعات نحوه ارسال تایید شد');
      router.push('/basket-payment');
    } catch (err: any) {
      showToast.error(
        err.userMessage ||
          err?.response?.data?.message ||
          'خطا در ثبت نهایی شیوه ارسال',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateShipmentTotals = () => {
    if (isShipmentLocked) return 0;
    let total = 0;
    basket.subBaskets.forEach((sub: any) => {
      const method = selectedMethods[sub.id];
      const directPrice =
        sub.directShipmentPrice ?? sub.sellerShipmentPrice ?? 0;
      const snappPrice =
        sub.snappBoxShipmentPrice ?? sub.snappShipmentPrice ?? 0;

      if (method === 'SnappBox') total += snappPrice;
      else if (method === 'Tipax') total += sub.tipaxShipmentPrice || 0;
      else if (method === DIRECT_SHIPMENT_METHOD) total += directPrice;
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
        {isShipmentLocked
          ? 'در حال استعلام هزینه ارسال...'
          : 'مبلغ نهایی سفارش:'}
      </span>
      <span
        className={cn(
          'text-sm font-bold',
          isShipmentLocked ? 'text-muted-foreground/60' : 'text-foreground',
        )}
      >
        {isShipmentLocked
          ? '---'
          : `${new Intl.NumberFormat('fa-IR').format(
              Math.round(finalPayablePrice / 10),
            )} تومان`}
      </span>
    </div>
  );

  return (
    <div className="flex w-full select-none flex-col gap-6 py-2">
      {/* مرحله‌بندی پیشرفت خرید */}
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-2 pb-2 sm:px-4">
        <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground sm:gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success sm:h-7 sm:w-7">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="whitespace-nowrap text-[10px] font-semibold sm:text-xs">
            سبد خرید
          </span>
        </div>

        <div className="mx-1.5 h-[2px] flex-1 bg-primary/40 sm:mx-3" />

        <div className="flex shrink-0 items-center gap-1.5 font-bold text-primary sm:gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs sm:h-7 sm:w-7">
            <Truck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </div>
          <span className="whitespace-nowrap text-[10px] sm:text-xs">
            زمان و شیوه ارسال
          </span>
        </div>

        <div className="mx-1.5 h-[2px] flex-1 bg-border/80 sm:mx-3" />

        <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground/60 sm:gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card sm:h-7 sm:w-7">
            <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </div>
          <span className="whitespace-nowrap text-[10px] font-medium sm:text-xs">
            پرداخت نهایی
          </span>
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
          <CheckoutAddress
            activeAddress={activeAddress}
            onOpenModal={() => setIsAddressModalOpen(true)}
            isLocked={!activeAddress}
          />

          <div className="relative">
            <div className="mb-3 flex items-center gap-2">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-2xs font-bold',
                  isShipmentLocked
                    ? 'bg-secondary text-muted-foreground/60'
                    : 'bg-primary text-primary-foreground',
                )}
              >
                ۲
              </div>
              <span
                className={cn(
                  'text-sm font-bold',
                  isShipmentLocked
                    ? 'text-muted-foreground/60'
                    : 'text-foreground',
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
                    {!activeAddress
                      ? 'این بخش پس از انتخاب آدرس فعال می‌شود'
                      : 'در حال محاسبه هزینه ارسال...'}
                  </span>
                  <p className="max-w-sm text-xs text-muted-foreground">
                    {!activeAddress
                      ? 'با کلیک روی دکمه «انتخاب آدرس» در بالا، آدرس خود را مشخص کنید تا گزینه‌های ارسال نمایش داده شوند.'
                      : 'در حال دریافت اطلاعات پست، تیپاکس و پیک بر اساس موقعیت مکانی شما...'}
                  </p>
                  {!activeAddress && (
                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="mt-2 flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
                    >
                      <MapPin className="h-4 w-4" />
                      انتخاب آدرس
                    </button>
                  )}
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
                  onSelectMethod={(method) =>
                    handleSelectShipment(sub.id, method)
                  }
                />
              ))
            )}
          </div>
        </div>

        <CheckoutInvoice
          basket={basket}
          totalShipment={totalShipment}
          finalPayablePrice={finalPayablePrice}
          onSubmit={handlePayment}
          isLoading={isSubmitting || isShipmentLocked}
          isMethodSelected={
            Object.keys(selectedMethods).length === basket.subBaskets.length
          }
        />
      </div>

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
        icon={
          !activeAddress ? (
            <MapPin className="h-4 w-4" />
          ) : (
            <ArrowLeft className="h-4 w-4" />
          )
        }
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