'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ShoppingBag, Truck, CreditCard } from 'lucide-react';
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

  // ثبت آدرس به محض شناسایی برای بروزرسانی هزینه‌های حمل
  React.useEffect(() => {
    if (activeAddress?.id && basket && basket.userLocationId !== activeAddress.id) {
      setBasketLocation.mutate(activeAddress.id);
    }
  }, [activeAddress?.id, basket?.userLocationId]);

  // مقداردهی اولیه به شیوه‌های ارسال بر اساس اولویت موجودی
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

  const handleSelectShipment = (subBasketId: string, method: string) => {
    setSelectedMethods((prev) => ({ ...prev, [subBasketId]: method }));
  };

  const handlePayment = async () => {
    if (!activeAddress) {
      showToast.error('لطفاً ابتدا آدرس تحویل سفارش خود را انتخاب کنید');
      setIsAddressModalOpen(true);
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
      if (basket.userLocationId !== activeAddress.id) {
        await setBasketLocation.mutateAsync(activeAddress.id);
      }

      const methodsPayload = basket.subBaskets.map((sub: any) => ({
        subBasketId: sub.id,
        shipmentMethod: selectedMethods[sub.id] || 'Tipax',
      }));

      await setBasketShipment.mutateAsync(methodsPayload);

      showToast.success('اطلاعات نحوه ارسال تایید شد');
      router.push('/basket-payment');
    } catch (err: any) {
      showToast.error(err.userMessage || 'خطا در ثبت نهایی شیوه ارسال');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateShipmentTotals = () => {
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
      <span className="mb-0.5 text-2xs text-muted-foreground">مبلغ نهایی سفارش:</span>
      <span className="text-sm font-bold text-foreground">
        {new Intl.NumberFormat('fa-IR').format(finalPayablePrice / 10)} تومان
      </span>
    </div>
  );

  return (
    <div className="flex w-full select-none flex-col gap-6 py-2">
      {/* مرحله‌بندی پیشرفت خرید (Checkout Stepper) */}
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 pb-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold">سبد خرید</span>
        </div>

        <div className="h-[2px] flex-1 bg-primary/40 mx-3" />

        <div className="flex items-center gap-2 text-primary font-bold">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
            <Truck className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs">زمان و شیوه ارسال</span>
        </div>

        <div className="h-[2px] flex-1 bg-border/80 mx-3" />

        <div className="flex items-center gap-2 text-muted-foreground/60">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card">
            <CreditCard className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-medium">پرداخت نهایی</span>
        </div>
      </div>

      {/* بخش اصلی محتوا و صورتحساب */}
      <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
        <div className="flex w-full flex-1 flex-col gap-6">
          <CheckoutAddress
            activeAddress={activeAddress}
            onOpenModal={() => setIsAddressModalOpen(true)}
          />

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

        <CheckoutInvoice
          basket={basket}
          totalShipment={totalShipment}
          finalPayablePrice={finalPayablePrice}
          onSubmit={handlePayment}
          isLoading={isSubmitting}
        />
      </div>

      {/* اکشن بار پایین مخصوص موبایل */}
      <MobileBottomAction
        label="تایید و رفتن به پرداخت"
        leftContent={leftPriceContent}
        onClick={handlePayment}
        isLoading={isSubmitting}
        icon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />}
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