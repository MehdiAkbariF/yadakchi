'use client';

import * as React from 'react';
import { Store, ShieldCheck, MapPin, Truck, AlertTriangle, Phone, Plus, Loader2, ChevronDown } from 'lucide-react';
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

const MAX_VISIBLE_SELLERS = 4;

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
  const [showAllOnline, setShowAllOnline] = React.useState(false);

  const [selectedSubjectId, setSelectedSubjectId] = React.useState('');
  const [reportDescription, setReportDescription] = React.useState('');

  const addToBasket = useAddToBasket();
  const { data: reportSubjects = [] } = useGetReportSubjects('ShopProductReport');
  const submitReport = useSubmitShopReport();

  const onlineList = activeSellers.online || [];
  const localList = activeSellers.local || [];
  const formatPrice = (value: number) => new Intl.NumberFormat('fa-IR').format(value);

  const visibleOnline = React.useMemo(() => {
    if (onlineList.length <= MAX_VISIBLE_SELLERS || showAllOnline) return onlineList;
    return onlineList.slice(0, MAX_VISIBLE_SELLERS);
  }, [onlineList, showAllOnline]);

  const hasMoreOnline = onlineList.length > MAX_VISIBLE_SELLERS && !showAllOnline;

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

  const renderSellerRow = (seller: any) => {
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
          'flex w-full items-start justify-between gap-4 rounded-lg border border-border p-4 transition-colors md:p-5',
          isSelected ? 'border-shop/40 bg-shop/5' : 'bg-card',
          isOnline ? 'cursor-pointer hover:border-shop/40' : 'cursor-default'
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
            {seller.shop.logo ? (
              <img src={getFullUrl(seller.shop.logo)} className="h-full w-full object-contain" alt="" />
            ) : (
              <Store aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-bold text-shop md:text-base">
                {seller.shop.title}
              </span>
              <span className="rounded-sm bg-muted px-2 py-0.5 text-2xs font-bold text-muted-foreground">
                {seller.typeLabel}
              </span>
              {seller.isAdvertised ? (
                <span className="rounded-sm bg-accent px-2 py-0.5 text-2xs font-bold text-accent-foreground">
                  آگهی
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-2xs text-muted-foreground md:text-xs">
              <span className="font-bold text-success">عملکرد عالی</span>
              <span className="text-muted-foreground">|</span>
              <span className="flex items-center gap-1">
                <Truck aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
                {seller.dayOfDeliveryLabel}
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="flex items-center gap-1 text-success">
                <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
                {seller.warrantyTitle || 'ضمانت اصالت کالا'}
              </span>
            </div>

            {!isOnline ? (
              <div className="mt-1.5 flex items-center gap-1 text-2xs text-muted-foreground">
                <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">
                  {(seller.shop as any).cityName || seller.shop.address?.split('،')[0] || ''}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-start gap-3">
          {isOnline ? (
            <Button
              variant={isSelected ? 'primary' : 'outline'}
              size="sm"
              onClick={(e) => handleAddOnlineToBasket(e, seller)}
              disabled={loadingSellerId === seller.id}
              className="flex h-10 w-auto min-w-[110px] shrink-0 items-center justify-center gap-1.5 px-5 text-xs font-bold shadow-xs md:min-w-[130px]"
            >
              {loadingSellerId === seller.id ? (
                <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>افزودن به سبد</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handleOpenMapWithSeller(e, seller)}
              className="flex h-10 w-auto min-w-[110px] shrink-0 items-center justify-center gap-1.5 px-5 text-xs font-bold shadow-xs md:min-w-[130px]"
            >
              <Phone aria-hidden="true" className="h-3.5 w-3.5" />
              <span>اطلاعات تماس</span>
            </Button>
          )}

          <div className="mt-1 flex flex-col items-end">
            {hasDiscount ? (
              <div className="mb-1 flex select-none items-center gap-1.5">
                <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-2xs font-bold leading-none text-destructive md:text-xs">
                  ٪{toPersianDigits(discountPercent)}
                </span>
                <span className="text-2xs leading-none text-muted-foreground line-through md:text-xs">
                  {seller.retailPrice}
                </span>
              </div>
            ) : null}

            <span className="text-base font-bold leading-none text-foreground md:text-lg">
              {seller.finalPrice}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setReportShop(seller);
              }}
              className="mt-2 flex items-center gap-0.5 rounded-md p-1 text-2xs font-bold text-muted-foreground outline-none transition-colors hover:text-destructive md:text-xs"
            >
              <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
              <span>گزارش خطای قیمت</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative mt-4 flex w-full select-none flex-col gap-4">
      <div className="sticky top-[64px] z-20 flex w-full items-center gap-6 border-b border-border bg-card px-1 pb-2 shadow-xs transition-colors duration-normal lg:top-[76px]">
        <button
          type="button"
          onClick={() => setActiveTab('online')}
          className={cn(
            'border-b-2 pb-2 text-xs font-bold outline-none transition-colors md:text-sm',
            activeTab === 'online' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          )}
        >
          خرید اینترنتی ({onlineList.length} فروشگاه)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('local')}
          className={cn(
            'border-b-2 pb-2 text-xs font-bold outline-none transition-colors md:text-sm',
            activeTab === 'local' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          )}
        >
          خرید حضوری ({localList.length} فروشگاه)
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {activeTab === 'online' ? (
          onlineList.length > 0 ? (
            <>
              {visibleOnline.map((s: any) => renderSellerRow(s))}

              {hasMoreOnline ? (
                <div className="flex w-full justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAllOnline(true)}
                    className="flex items-center gap-1 text-xs font-bold text-shop outline-none hover:underline"
                  >
                    <span>
                      مشاهده بیشتر ({toPersianDigits(onlineList.length - MAX_VISIBLE_SELLERS)} فروشنده دیگر)
                    </span>
                    <ChevronDown aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <span className="py-4 text-xs text-muted-foreground">
              فروشگاه اینترنتی فعالی برای این قطعه موجود نیست.
            </span>
          )
        ) : (
          <>
            {localList.length > 0 ? (
              localList.map((s: any) => renderSellerRow(s))
            ) : (
              <span className="py-4 text-xs text-muted-foreground">
                فروشگاه حضوری فعالی برای این قطعه ثبت نشده است.
              </span>
            )}
            {localList.length > 0 ? (
              <div
                onClick={handleOpenGeneralMap}
                className="group mt-2 flex h-36 w-full cursor-pointer select-none flex-col items-center justify-center gap-3 overflow-hidden rounded-lg border border-border bg-muted/40 p-6 shadow-xs transition-colors hover:border-shop/40"
              >
                <div className="z-10 shrink-0 rounded-full border border-shop/40 bg-accent p-3 text-shop">
                  <MapPin aria-hidden="true" className="h-6 w-6" />
                </div>
                <span className="z-10 text-xs font-bold text-foreground md:text-sm">
                  مشاهده تمام فروشگاه‌های حضوری روی نقشه
                </span>
                <button
                  type="button"
                  className="z-10 border-b border-shop pb-0.5 text-2xs font-bold text-shop outline-none transition-opacity hover:opacity-80"
                >
                  مشاهده نقشه
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      <Modal isOpen={!!reportShop} onClose={() => setReportShop(null)} className="w-full max-w-md">
        <ModalHeader onClose={() => setReportShop(null)}>
          <ModalTitle className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <AlertTriangle aria-hidden="true" className="h-4 w-4 text-destructive" />
            گزارش خطا در قیمت فروشگاه {reportShop?.shop.title}
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-4 p-0 pt-4">
          <Select
            label="دلیل گزارش *"
            placeholder="دلیل گزارش را انتخاب کنید..."
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            options={reportSubjects.map((sub: any) => ({ value: sub.id, label: sub.title }))}
          />

          <TextArea
            label="توضیحات (اختیاری)"
            placeholder="توضیحات خود را اینجا بنویسید..."
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            className="h-24"
          />

          <div className="mt-4 flex w-full gap-2.5">
            <Button
              variant="outline"
              onClick={() => {
                setReportShop(null);
                setSelectedSubjectId('');
                setReportDescription('');
              }}
              className="h-10 flex-1 text-xs font-bold"
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={handleReportSubmit}
              isLoading={submitReport.isPending}
              className="h-10 flex-1 text-xs font-bold"
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
