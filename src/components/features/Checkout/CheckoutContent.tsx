// src/components/features/Checkout/CheckoutContent.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  useGetCheckoutBasket, 
  useGetUserLocations, 
  useSetBasketShipment,
  useSetBasketLocationAndPrice 
} from '@/domains/front/basket/hooks/basket.hooks';
import { CheckoutAddress } from './components/CheckoutAddress';
import { CheckoutShipmentGroup } from './components/CheckoutShipmentGroup';
import { CheckoutInvoice } from './components/CheckoutInvoice';
import { AddressModal } from './components/AddressModal';
import { AddressMapModal } from '@/components/composites/AddressMapModal/AddressMapModal';
import { MobileBottomAction } from '@/components/composites/MobileBottomAction/MobileBottomAction';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { ArrowLeft } from 'lucide-react';
import { showToast } from '@/core/utils/toast';

export function CheckoutContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { data: rawBasket, isLoading: isBasketLoading } = useGetCheckoutBasket();
  const { data: locations = [], isLoading: isLocationsLoading } = useGetUserLocations();
  
  const setBasketLocation = useSetBasketLocationAndPrice();
  const setBasketShipment = useSetBasketShipment();

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isNewAddressOpen, setIsNewAddressOpen] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mapAddressData, setMapAddressData] = useState<{
    address: string;
    latitude: number;
    longitude: number;
    cityId: string;
    cityName: string;
    provinceName: string;
  } | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      showToast.error('لطفاً ابتدا وارد حساب کاربری خود شوید');
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isAuthLoading, router, pathname]);

  const basket = rawBasket as any;

  // مقداردهی اولیه شیوه‌های ارسال
  useEffect(() => {
    if (basket?.subBaskets) {
      const initial: Record<string, string> = {};
      basket.subBaskets.forEach((sub: any) => {
        if (sub.shipmentMethod) {
          initial[sub.id] = sub.shipmentMethod;
        } else if (sub.tipaxShipmentPrice > 0) {
          initial[sub.id] = 'Tipax';
        } else if (sub.sellerShipmentPrice > 0) {
          initial[sub.id] = 'Seller';
        } else if (sub.isLocalShipmentAvailable) {
          initial[sub.id] = 'Local';
        }
      });
      setSelectedMethods(initial);
    }
  }, [basket]);

  if (isAuthLoading || isBasketLoading || isLocationsLoading) {
    return <PageLoading message="در حال بارگذاری اطلاعات فاکتور و آدرس‌ها..." />;
  }

  if (!isAuthenticated || !basket || !basket.subBaskets?.length) {
    return null;
  }

  // پیدا کردن آدرس فعال
  const activeAddress = 
    locations.find((l: any) => l.id === basket.userLocationId) || 
    locations.find((l: any) => l.isDefault) || 
    locations[0];

  const handleSelectShipment = (subBasketId: string, method: string) => {
    setSelectedMethods(prev => ({
      ...prev,
      [subBasketId]: method
    }));
  };

  const handlePayment = async () => {
    if (!activeAddress) {
      showToast.error('لطفاً ابتدا آدرس تحویل سفارش خود را انتخاب کنید');
      setIsAddressModalOpen(true);
      return;
    }

    const unselectedSubBasket = basket.subBaskets.find((sub: any) => !selectedMethods[sub.id]);
    if (unselectedSubBasket) {
      showToast.error(`لطفاً شیوه ارسال مرسوله فروشگاه «${unselectedSubBasket.shop?.shopTitle || ''}» را انتخاب کنید`);
      return;
    }

    setIsSubmitting(true);
    try {
      // ۱. ارسال لوکیشن برای استعلام و ذخیره در دیتابیس سرور
      try {
        await setBasketLocation.mutateAsync(activeAddress.id);
      } catch (locErr: any) {
        console.warn('[Checkout] Shipment price query warning:', locErr);
      }

      // ۲. آماده‌سازی بدنه روش‌های ارسال
      const methodsPayload = basket.subBaskets.map((sub: any) => ({
        subBasketId: sub.id,
        shipmentMethod: selectedMethods[sub.id] || 'Tipax',
      }));

      // ۳. ثبت نهایی روش‌های ارسال در سرور
      await setBasketShipment.mutateAsync({
        locationId: activeAddress.id,
        methods: methodsPayload,
      });

      showToast.success('اطلاعات نحوه ارسال با موفقیت تایید شد');
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
      if (method === 'Tipax') {
        total += sub.tipaxShipmentPrice || 0;
      } else if (method === 'Seller') {
        total += sub.sellerShipmentPrice || 0;
      }
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
    <div className="flex flex-col text-right">
      <span className="text-[10px] text-muted-foreground font-iran-yekan mb-0.5">مبلغ کل قابل پرداخت:</span>
      <span className="text-sm font-black text-foreground font-iran-yekan">
        {new Intl.NumberFormat('fa-IR').format(finalPayablePrice / 10)} تومان
      </span>
    </div>
  );

  return (
    <div className="w-full flex flex-col lg:flex-row items-start gap-6 md:gap-8 select-none text-right" dir="rtl">
      <div className="flex-1 flex flex-col gap-6 w-full">
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

      <MobileBottomAction
        label="تایید و ادامه خرید"
        leftContent={leftPriceContent}
        onClick={handlePayment}
        isLoading={isSubmitting}
        icon={<ArrowLeft className="h-4 w-4" />}
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