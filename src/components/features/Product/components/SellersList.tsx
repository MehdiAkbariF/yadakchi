'use client';

import * as React from 'react';
import {
  Store,
  MapPin,
  AlertTriangle,
  Phone,
  Loader2,
  Star,
  Zap,
  ShoppingBag,
  Maximize2,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Button } from '@/components/primitives/Button/Button';
import { useAddToBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { InPersonSellersMapModal } from './InPersonSellersMapModal';
import { useGetReportSubjects, useSubmitShopReport } from '@/domains/front/shop/hooks/shop.hooks';
import { Select } from '@/components/primitives/Select/Select';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { showToast } from '@/core/utils/toast';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';

export interface SellersListProps {
  activeSellers: any;
  selectedSellerId: string | null;
  onSelectSeller: (id: string) => void;
  productTitle?: string;
}

const DESKTOP_MAX_VISIBLE = 4;

export function SellersList({
  activeSellers,
  selectedSellerId,
  onSelectSeller,
  productTitle = 'قطعه یدکی',
}: SellersListProps) {
  const [activeTab, setActiveTab] = React.useState<'online' | 'local'>('online');
  const [reportShop, setReportShop] = React.useState<any | null>(null);
  const [loadingSellerId, setLoadingSellerId] = React.useState<string | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = React.useState(false);
  const [mapInitialSellerId, setMapInitialSellerId] = React.useState<string | null>(null);
  const [isAllSellersModalOpen, setIsAllSellersModalOpen] = React.useState(false);

  const [selectedSubjectId, setSelectedSubjectId] = React.useState('');
  const [reportDescription, setReportDescription] = React.useState('');

  const addToBasket = useAddToBasket();
  const { data: reportSubjects = [] } = useGetReportSubjects('ShopProductReport');
  const submitReport = useSubmitShopReport();

  const onlineList = activeSellers.online || [];
  const localList = activeSellers.local || [];

  const visibleOnline = React.useMemo(() => {
    return onlineList.slice(0, DESKTOP_MAX_VISIBLE);
  }, [onlineList]);

  const hasMoreOnline = onlineList.length > DESKTOP_MAX_VISIBLE;

  const handleAddOnlineToBasket = async (e: React.MouseEvent, seller: any) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingSellerId(seller.id);
    try {
      await addToBasket.mutateAsync({ shopProductId: seller.id, quantity: 1 });
      showToast.success('قطعه با موفقیت به سبد خرید افزوده شد');
    } catch {} finally {
      setLoadingSellerId(null);
    }
  };

  const handleOpenMapWithSeller = (e: React.MouseEvent, seller: any) => {
    e.preventDefault();
    e.stopPropagation();
    setMapInitialSellerId(seller.id);
    setIsMapModalOpen(true);
  };

  const handleOpenGeneralMap = () => {
    setMapInitialSellerId(null);
    setIsMapModalOpen(true);
  };

  const handleReportSubmit = async () => {
    if (!selectedSubjectId) {
      showToast.error('لطفاً دلیل گزارش را انتخاب کنید');
      return;
    }
    try {
      await submitReport.mutateAsync({
        shopId: reportShop.shop.id,
        shopProductId: reportShop.id,
        reportSubjectId: selectedSubjectId,
        description: reportDescription,
      });
      showToast.success('گزارش خطای قیمت با موفقیت ثبت شد و توسط پشتیبانی بررسی خواهد گردید');
      setReportShop(null);
      setSelectedSubjectId('');
      setReportDescription('');
    } catch (error: any) {
      showToast.error(error.userMessage || 'خطا در ثبت گزارش');
    }
  };

  const renderSellerCard = (seller: any) => {
    const isOnline = activeTab === 'online';
    const isSelected = isOnline && selectedSellerId === seller.id;

    const originalPriceRaw = seller.retailPriceRaw || 0;
    const finalPriceRaw = seller.finalPriceRaw || 0;
    const calculatedPercent =
      originalPriceRaw > finalPriceRaw && originalPriceRaw > 0
        ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100)
        : 0;

    const discountPercent = seller.discountPercentage || calculatedPercent || 0;
    const hasDiscount = !!(
      (seller.hasDiscount || (originalPriceRaw > 0 && finalPriceRaw > 0 && originalPriceRaw > finalPriceRaw)) &&
      discountPercent > 0
    );

    return (
      <div
        key={seller.id}
        onClick={() => isOnline && onSelectSeller(seller.id)}
        className={cn(
          'relative flex w-full flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-5 rounded-2xl bg-card p-4 md:py-3.5 md:px-5 border shadow-xs transition-all duration-200',
          isSelected
            ? 'border-foreground/40 bg-muted/40 ring-1 ring-foreground/10'
            : 'border-border/80 hover:border-foreground/20 hover:bg-muted/10',
          isOnline ? 'cursor-pointer' : 'cursor-default'
        )}
      >
        {/* ۱. بنر تخفیف در موبایل (در بالای کارت) */}
        {hasDiscount && (
          <div className="flex md:hidden items-center justify-between rounded-xl bg-destructive/10 px-3 py-1.5 text-3xs font-bold text-destructive">
            <div className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 fill-destructive text-destructive" />
              <span>پیشنهاد ویژه</span>
            </div>
            <span className="font-bold">تخفیف {toPersianDigits(discountPercent)}٪</span>
          </div>
        )}

        {/* ۲. بخش فروشگاه: لوگو، نام و دکمه گزارش بالا سمت چپ در موبایل */}
        <div className="flex items-center justify-between md:justify-start gap-3 min-w-0 md:w-[240px] lg:w-[280px] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-muted/30 p-1">
              {seller.shop?.logo ? (
                <img src={getFullUrl(seller.shop.logo)} className="h-full w-full object-contain" alt="" />
              ) : (
                <Store className="h-4.5 w-4.5 text-muted-foreground" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                  {seller.shop?.title}
                </span>
                <span className="rounded-md bg-muted px-1.5 py-0.2 text-3xs font-bold text-muted-foreground shrink-0">
                  {seller.typeLabel}
                </span>
              </div>

              <div className="mt-0.5 flex items-center gap-2 text-3xs text-muted-foreground">
                <span className="flex items-center gap-1 font-bold text-foreground">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  {toPersianDigits(seller.shop?.rate || '۴.۸')}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                  {(seller.shop as any)?.cityName || seller.shop?.address?.split('،')[0] || 'تهران'}
                </span>
              </div>
            </div>
          </div>

          {/* ✅ دکمه گزارش در موبایل: بالا سمت چپ */}
          <button
            type="button"
            title="گزارش خطای قیمت یا اطلاعات"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setReportShop(seller);
            }}
            className="flex md:hidden items-center gap-1 rounded-lg bg-muted/60 px-2.5 py-1 text-3xs font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
          >
            <AlertTriangle className="h-3 w-3" />
            <span>گزارش</span>
          </button>
        </div>

        {/* ۳. مشخصات ارسال و ضمانت (ستون میانی در دسکتاپ) */}
        <div className="flex flex-col gap-1 text-3xs sm:text-2xs text-muted-foreground md:border-s md:border-border/60 md:ps-4 md:w-[240px] lg:w-[270px] shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <Truck className="h-3.5 w-3.5 text-primary shrink-0 hidden md:block" />
            <span className="text-muted-foreground hidden md:inline">ارسال:</span>
            <span className="font-bold text-foreground truncate">{seller.dayOfDeliveryLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 hidden md:block" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate">
              {seller.warrantyTitle || 'ضمانت اصالت و سلامت فیزیکی'}
            </span>
          </div>
        </div>

        {/* ۴. قیمت و دکمه‌های اکشن (سمت چپ در دسکتاپ) */}
        <div className="flex items-center justify-between md:justify-end gap-3 md:gap-5 pt-2 md:pt-0 border-t md:border-t-0 border-dashed border-border/50 md:ms-auto shrink-0">
          {/* قیمت */}
          <div className="flex flex-col items-start md:items-end min-w-[100px]">
            {hasDiscount && (
              <div className="flex items-center gap-1.5">
                <span className="text-3xs text-muted-foreground line-through">
                  {seller.retailPrice}
                </span>
                <span className="hidden md:inline-flex rounded-full bg-destructive/10 text-destructive px-1.5 py-0.2 text-[9px] font-bold">
                  {toPersianDigits(discountPercent)}٪
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black text-foreground" dir="ltr">
                {seller.finalPrice}
              </span>
              <span className="text-3xs text-muted-foreground">تومان</span>
            </div>
          </div>

          {/* دکمه اکشن (خرید یا تماس) */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={(e) => handleAddOnlineToBasket(e, seller)}
                disabled={loadingSellerId === seller.id}
                className="h-9 gap-1.5 rounded-xl px-4 text-xs font-bold shadow-xs shrink-0"
              >
                {loadingSellerId === seller.id ? (
                  <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <ShoppingBag aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>افزودن به سبد</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleOpenMapWithSeller(e, seller)}
                className="h-9 gap-1.5 rounded-xl px-4 text-xs font-bold shadow-xs shrink-0"
              >
                <Phone aria-hidden="true" className="h-3.5 w-3.5" />
                <span>اطلاعات تماس</span>
              </Button>
            )}

            {/* دکمه گزارش خطا مختص دسکتاپ (در انتهای ردیف) */}
            <button
              type="button"
              title="گزارش خطای قیمت یا اطلاعات"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setReportShop(seller);
              }}
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative mt-4 flex w-full select-none flex-col gap-4" dir="rtl">
      
      {/* تب‌های دوگانه خرید اینترنتی / حضوری */}
      <div className="sticky top-[56px] lg:top-[68px] z-20 -mx-4 flex w-[calc(100%+2rem)] items-center border-b border-border bg-card px-4 shadow-xs backdrop-blur-md transition-all duration-normal md:mx-0 md:w-full md:px-0 rounded-none">
        <button
          type="button"
          onClick={() => setActiveTab('online')}
          className={cn(
            'flex-1 border-b-2 py-3 text-center text-xs font-bold outline-none transition-all duration-fast sm:flex-none sm:px-6 md:text-sm',
            activeTab === 'online'
              ? 'border-primary text-primary font-black'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          خرید اینترنتی ({toPersianDigits(onlineList.length)} فروشگاه)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('local')}
          className={cn(
            'flex-1 border-b-2 py-3 text-center text-xs font-bold outline-none transition-all duration-fast sm:flex-none sm:px-6 md:text-sm',
            activeTab === 'local'
              ? 'border-primary text-primary font-black'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          خرید حضوری ({toPersianDigits(localList.length)} فروشگاه)
        </button>
      </div>

      {/* لیست ردیفی و باریک فروشندگان */}
      <div className="flex flex-col gap-2.5">
        {activeTab === 'online' ? (
          onlineList.length > 0 ? (
            <>
              <div className="flex flex-col gap-2.5">
                {visibleOnline.map((s: any) => renderSellerCard(s))}
              </div>

              {hasMoreOnline && (
                <div className="flex w-full justify-center pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAllSellersModalOpen(true)}
                    className="h-10 gap-2 rounded-2xl px-6 text-xs font-bold border-primary/40 text-primary hover:bg-primary/5 shadow-2xs"
                  >
                    <Maximize2 className="h-4 w-4" />
                    <span>مشاهده همه فروشندگان ({toPersianDigits(onlineList.length)} فروشگاه)</span>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <span className="py-8 text-center text-xs text-muted-foreground">
              فروشگاه اینترنتی فعالی برای این قطعه موجود نیست.
            </span>
          )
        ) : (
          <>
            {localList.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {localList.map((s: any) => renderSellerCard(s))}
              </div>
            ) : (
              <span className="py-8 text-center text-xs text-muted-foreground">
                فروشگاه حضوری فعالی برای این قطعه ثبت نشده است.
              </span>
            )}
            {localList.length > 0 && (
              <div
                onClick={handleOpenGeneralMap}
                className="group mt-2 flex h-24 w-full cursor-pointer select-none items-center justify-center gap-3 overflow-hidden rounded-2xl border border-border/80 bg-muted/20 p-4 text-center shadow-2xs transition-all hover:border-primary/40"
              >
                <div className="shrink-0 rounded-xl border border-primary/30 bg-primary/10 p-2 text-primary">
                  <MapPin aria-hidden="true" className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-foreground">
                  مشاهده تمام فروشگاه‌های حضوری روی نقشه شهر
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* مودال مشاهده همه فروشندگان */}
      <Modal
        isOpen={isAllSellersModalOpen}
        onClose={() => setIsAllSellersModalOpen(false)}
        className="w-full max-w-4xl overflow-hidden rounded-2xl"
      >
        <ModalHeader onClose={() => setIsAllSellersModalOpen(false)}>
          <ModalTitle className="flex items-center gap-2 text-sm font-black text-foreground">
            <Store className="h-4.5 w-4.5 text-primary" />
            <span>لیست کامل فروشندگان این قطعه ({toPersianDigits(onlineList.length)} فروشگاه)</span>
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="p-4 md:p-5 max-h-[80dvh] overflow-y-auto no-scrollbar flex flex-col gap-2.5" dir="rtl">
          {onlineList.map((s: any) => renderSellerCard(s))}
        </ModalBody>
      </Modal>

      {/* مودال گزارش خطای قیمت */}
      <Modal isOpen={!!reportShop} onClose={() => setReportShop(null)} className="w-full max-w-md overflow-hidden rounded-2xl">
        <ModalHeader onClose={() => setReportShop(null)}>
          <ModalTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
            <AlertTriangle aria-hidden="true" className="h-4.5 w-4.5 text-destructive" />
            <span>گزارش خطا در قیمت فروشگاه {reportShop?.shop?.title}</span>
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-4 p-5 pt-3" dir="rtl">
          <Select
            label="دلیل گزارش *"
            placeholder="دلیل گزارش را انتخاب کنید..."
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            options={reportSubjects.map((sub: any) => ({ value: sub.id, label: sub.title }))}
          />

          <TextArea
            label="توضیحات تکمیلی (اختیاری)"
            placeholder="جزئیات خطا را بنویسید..."
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            className="h-24 text-xs"
          />

          <div className="mt-2 flex w-full gap-2.5 border-t border-border/60 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setReportShop(null);
                setSelectedSubjectId('');
                setReportDescription('');
              }}
              className="h-10 flex-1 rounded-xl text-xs font-bold"
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={handleReportSubmit}
              isLoading={submitReport.isPending}
              className="h-10 flex-1 rounded-xl text-xs font-bold shadow-xs"
            >
              ثبت گزارش خطا
            </Button>
          </div>
        </ModalBody>
      </Modal>

      <InPersonSellersMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        sellers={localList}
        productTitle={productTitle}
        initialActiveSellerId={mapInitialSellerId}
      />
    </div>
  );
}