'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Truck,
  CreditCard,
  MapPin,
  Info,
} from 'lucide-react';
import {
  useGetBasket,
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
import { formatRialToToman, extractPureNumber } from '@/core/utils/currency';
import { cn } from '@/design-system/utils/cn';

const DIRECT_SHIPMENT_METHOD = 'DirectShipment';

function ShipmentSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-border bg-card p-4 shadow-xs"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 shrink-0 rounded-lg bg-muted/70 animate-pulse" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-32 rounded-md bg-muted/70 animate-pulse" />
                <div className="h-2.5 w-20 rounded-md bg-muted/50 animate-pulse" />
              </div>
            </div>
            <div className="h-2.5 w-16 rounded-md bg-muted/50 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3"
              >
                <div className="h-4 w-4 shrink-0 rounded-full bg-muted/60 animate-pulse" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-2.5 w-24 rounded-md bg-muted/60 animate-pulse" />
                  <div className="h-2 w-16 rounded-md bg-muted/40 animate-pulse" />
                </div>
                <div className="h-2.5 w-14 rounded-md bg-muted/40 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-center gap-2 py-2 text-2xs font-medium text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-shop/40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-shop" />
        </span>
        در حال محاسبه و دریافت شیوه‌های ارسال بر اساس آدرس شما...
      </div>
    </div>
  );
}

function AddressRequiredPlaceholder({
  onSelectAddress,
}: {
  onSelectAddress: () => void;
}) {
  return (
    <div className="relative flex min-h-[12.5rem] flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-dashed border-border bg-gradient-to-b from-card to-muted/20 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-shop/10 text-shop">
        <MapPin className="h-7 w-7" />
      </div>
      <span className="text-title-sm">
        ابتدا آدرس تحویل سفارش را انتخاب کنید
      </span>
      <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
        پس از انتخاب آدرس، روش‌های ارسال پستی، تیپاکس و پیک بر اساس موقعیت مکانی شما نمایش داده می‌شود.
      </p>
      <button
        onClick={onSelectAddress}
        className="mt-2 flex items-center gap-1.5 rounded-lg bg-shop px-4 py-2 text-xs font-bold text-shop-foreground shadow-xs transition-colors hover:bg-shop-hover active:scale-95"
      >
        <MapPin className="h-4 w-4" />
        انتخاب آدرس
      </button>
    </div>
  );
}

export function CheckoutContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { data: rawBasket, isLoading: isBasketLoading } = useGetBasket();
  const { data: locations = [], isLoading: isLocationsLoading } = useGetUserLocations();

  const setBasketLocation = useSetBasketLocationAndPrice();
  const setBasketShipment = useSetBasketShipment();

  // استیت مستقیم برای نگهداری سبد به محض دریافت پاسخ سرور
  const [syncedBasket, setSyncedBasket] = React.useState<any>(null);

  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = React.useState(false);
  const [isNewAddressOpen, setIsNewAddressOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [userSelectedMethods, setUserSelectedMethods] = React.useState<Record<string, string>>({});
  const requestedAddressIdRef = React.useRef<string | null>(null);

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

  // دیتای سبد جاری: اولویت مطلق با پاسخ مستقیم سرور است
  const basket = React.useMemo(() => {
    if (syncedBasket?.subBaskets?.length) {
      return syncedBasket;
    }
    const mut = setBasketLocation.data;
    const fromMut = mut?.subBaskets ? mut : mut?.basket || mut?.data?.basket || mut?.data;
    if (fromMut?.subBaskets?.length) {
      return fromMut;
    }
    const raw = rawBasket;
    return (raw?.subBaskets ? raw : raw?.basket || raw?.data?.basket || raw?.data || raw) as any;
  }, [syncedBasket, setBasketLocation.data, rawBasket]);

  // تعیین آدرس فعال کاربر
  const activeAddress = React.useMemo(() => {
    if (!locations || locations.length === 0) return null;
    return (
      locations.find((l: any) => l.id === basket?.userLocationId) ||
      locations.find((l: any) => l.isDefault) ||
      locations[0]
    );
  }, [locations, basket?.userLocationId]);

  // اجرای استعلام قیمت در بدو ورود با آدرس فعال
  React.useEffect(() => {
    if (!activeAddress?.id) return;

    if (requestedAddressIdRef.current !== activeAddress.id) {
      requestedAddressIdRef.current = activeAddress.id;
      setBasketLocation.mutate(activeAddress.id, {
        onSuccess: (res: any) => {
          // استخراج دقیق داده بازگشتی با توجه به ریسپانس ارسال‌شده
          const parsed = res?.subBaskets ? res : res?.basket || res?.data?.basket || res?.data || res;
          if (parsed?.subBaskets) {
            setSyncedBasket(parsed);
          }
        },
      });
    }
  }, [activeAddress?.id, setBasketLocation]);

  // متدهای انتخابی مرسوله‌ها
  const selectedMethods = React.useMemo(() => {
    const result: Record<string, string> = {};
    if (!basket?.subBaskets) return result;

    basket.subBaskets.forEach((sub: any) => {
      if (userSelectedMethods[sub.id]) {
        result[sub.id] = userSelectedMethods[sub.id];
        return;
      }

      if (sub.shipmentMethod) {
        result[sub.id] =
          sub.shipmentMethod === 'Seller' || sub.shipmentMethod === 'DirectShipment'
            ? DIRECT_SHIPMENT_METHOD
            : sub.shipmentMethod;
        return;
      }

      const snappPrice = sub.snappBoxShipmentPrice ?? sub.snappShipmentPrice ?? 0;
      const tipaxPrice = sub.tipaxShipmentPrice ?? 0;
      const directPrice = sub.sellerShipmentPrice ?? sub.directShipmentPrice ?? 0;

      if (snappPrice > 0) result[sub.id] = 'SnappBox';
      else if (tipaxPrice > 0) result[sub.id] = 'Tipax';
      else if (directPrice > 0) result[sub.id] = DIRECT_SHIPMENT_METHOD;
      else if (sub.isLocalShipmentAvailable) result[sub.id] = 'Local';
    });

    return result;
  }, [basket?.subBaskets, userSelectedMethods]);

  // مجموع هزینه ارسال
  const totalShipment = React.useMemo(() => {
    if (!basket?.subBaskets || !activeAddress) return 0;
    let total = 0;
    basket.subBaskets.forEach((sub: any) => {
      const method = selectedMethods[sub.id];
      const directPrice = sub.sellerShipmentPrice ?? sub.directShipmentPrice ?? 0;
      const snappPrice = sub.snappBoxShipmentPrice ?? sub.snappShipmentPrice ?? 0;
      const tipaxPrice = sub.tipaxShipmentPrice ?? 0;

      if (method === 'SnappBox') total += snappPrice;
      else if (method === 'Tipax') total += tipaxPrice;
      else if (method === DIRECT_SHIPMENT_METHOD) total += directPrice;
    });
    return total;
  }, [basket?.subBaskets, selectedMethods, activeAddress]);

  // قیمت نهایی کالاها
  const productsFinalPrice = React.useMemo(() => {
    if (!basket) return 0;

    const rootPrice =
      basket.totalFinalPrice ??
      basket.total?.finalPriceRaw ??
      basket.total?.finalPrice ??
      basket.finalPrice;

    if (rootPrice !== undefined && rootPrice !== null && extractPureNumber(rootPrice) > 0) {
      return extractPureNumber(rootPrice);
    }

    if (Array.isArray(basket.subBaskets) && basket.subBaskets.length > 0) {
      const subTotal = basket.subBaskets.reduce((sum: number, sub: any) => {
        const sPrice = sub.totalFinalPrice ?? sub.totalOriginalPrice ?? 0;
        if (extractPureNumber(sPrice) > 0) return sum + extractPureNumber(sPrice);

        const items = sub.subBasketItems || sub.items || [];
        return (
          sum +
          items.reduce((iSum: number, item: any) => {
            return iSum + extractPureNumber(item.finalTotalPrice ?? item.originalPrice ?? 0);
          }, 0)
        );
      }, 0);

      if (subTotal > 0) return subTotal;
    }

    return 0;
  }, [basket]);

  const finalPayablePrice = productsFinalPrice + totalShipment;

  if (isAuthLoading || isBasketLoading || isLocationsLoading) {
    return <PageLoading label="در حال بارگذاری اطلاعات تسویه حساب و آدرس‌ها..." />;
  }

  if (!isAuthenticated || !basket || !basket.subBaskets?.length) return null;

  // وضعیت لودینگ: فقط تا زمان اتمام درخواست استعلام
  const isLocationSyncing = setBasketLocation.isPending;
  const isShipmentLocked = !activeAddress || isLocationSyncing;

  const handleSelectShipment = (subBasketId: string, method: string) => {
    if (isShipmentLocked) return;
    setUserSelectedMethods((prev) => ({ ...prev, [subBasketId]: method }));
  };

  const handlePayment = async () => {
    if (!activeAddress) {
      showToast.error('لطفاً ابتدا آدرس تحویل سفارش خود را انتخاب کنید');
      setIsAddressModalOpen(true);
      return;
    }

    if (isShipmentLocked) {
      showToast.error('در حال استعلام و بروزرسانی هزینه‌های ارسال، لطفاً کمی صبر کنید');
      return;
    }

    const unselectedSubBasket = basket.subBaskets.find(
      (sub: any) => !selectedMethods[sub.id]
    );
    if (unselectedSubBasket) {
      showToast.error(
        `لطفاً شیوه ارسال مرسوله فروشگاه «${unselectedSubBasket.shop?.shopTitle || ''}» را مشخص کنید`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (basket.userLocationId !== activeAddress.id) {
        await setBasketLocation.mutateAsync(activeAddress.id);
      }

      const methodsPayload = basket.subBaskets.map((sub: any) => ({
        subBasketId: sub.id,
        shipmentMethod: selectedMethods[sub.id],
      }));
      await setBasketShipment.mutateAsync(methodsPayload);

      showToast.success('اطلاعات شیوه ارسال تایید شد');
      router.push('/basket-payment');
    } catch (err: any) {
      showToast.error(
        err.userMessage ||
          err?.response?.data?.message ||
          'خطا در ثبت نهایی شیوه ارسال'
      );
    } finally {
      setIsSubmitting(false);
    }
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

  const leftPriceContent = (
    <div className="flex flex-col text-right">
      <span className="mb-0.5 text-2xs text-muted-foreground">
        {isShipmentLocked ? 'در حال استعلام هزینه ارسال...' : 'مبلغ نهایی سفارش:'}
      </span>
      <span
        className={cn(
          'text-sm font-black',
          isShipmentLocked ? 'text-muted-foreground/60' : 'text-foreground'
        )}
        dir="rtl"
      >
        {isShipmentLocked ? '---' : formatRialToToman(finalPayablePrice)}
      </span>
    </div>
  );

  return (
    <div className="flex w-full select-none flex-col gap-6" dir="rtl">
      {/* مرحله‌بندی */}
      <div className="hidden lg:flex mx-auto w-full max-w-2xl items-center justify-between px-2 pb-2 sm:px-4">
        <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground sm:gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success sm:h-7 sm:w-7">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="whitespace-nowrap text-[0.625rem] font-semibold sm:text-xs">
            سبد خرید
          </span>
        </div>

        <div className="mx-1.5 h-[0.125rem] flex-1 bg-primary/40 sm:mx-3" />

        <div className="flex shrink-0 items-center gap-1.5 font-bold text-primary sm:gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs sm:h-7 sm:w-7">
            <Truck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </div>
          <span className="whitespace-nowrap text-[0.625rem] sm:text-xs">
            زمان و شیوه ارسال
          </span>
        </div>

        <div className="mx-1.5 h-[0.125rem] flex-1 bg-border/80 sm:mx-3" />

        <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground/60 sm:gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card sm:h-7 sm:w-7">
            <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </div>
          <span className="whitespace-nowrap text-[0.625rem] font-medium sm:text-xs">
            پرداخت نهایی
          </span>
        </div>
      </div>

      {/* بنر وضعیت استعلام */}
      {isShipmentLocked && (
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
          <Info className="h-5 w-5 shrink-0 text-warning" />
          <div className="flex flex-col">
            <span className="text-title-sm">
              {!activeAddress
                ? 'برای مشاهده شیوه‌های ارسال، ابتدا آدرس خود را انتخاب کنید'
                : 'در حال استعلام و محاسبه هزینه‌های ارسال بر اساس آدرس شما...'}
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
                    : 'bg-primary text-primary-foreground'
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

            {!activeAddress ? (
              <AddressRequiredPlaceholder
                onSelectAddress={() => setIsAddressModalOpen(true)}
              />
            ) : isLocationSyncing ? (
              <ShipmentSkeleton count={basket?.subBaskets?.length || 1} />
            ) : (
              <div className="flex flex-col gap-3">
                {basket.subBaskets.map((sub: any, index: number) => (
                  <CheckoutShipmentGroup
                    key={sub.id}
                    sub={sub}
                    index={index}
                    totalSubBaskets={basket.subBaskets.length}
                    selectedMethod={selectedMethods[sub.id] || null}
                    onSelectMethod={(method) => handleSelectShipment(sub.id, method)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <CheckoutInvoice
          basket={basket}
          productsPrice={productsFinalPrice}
          totalShipment={totalShipment}
          finalPayablePrice={finalPayablePrice}
          onSubmit={handlePayment}
          isLoading={isSubmitting || isShipmentLocked}
          isMethodSelected={
            Boolean(basket?.subBaskets?.length) &&
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
        hasBottomNav
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