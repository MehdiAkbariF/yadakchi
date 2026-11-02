'use client';

import * as React from 'react';
import {
  Store,
  MapPin,
  AlertTriangle,
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
  const [reportShop, setReportShop] = React.useState<any | null>(null);
  const [loadingSellerId, setLoadingSellerId] = React.useState<string | null>(null);
  const [isAllSellersModalOpen, setIsAllSellersModalOpen] = React.useState(false);

  const [selectedSubjectId, setSelectedSubjectId] = React.useState('');
  const [reportDescription, setReportDescription] = React.useState('');

  const addToBasket = useAddToBasket();
  const { data: reportSubjects = [] } = useGetReportSubjects('ShopProductReport');
  const submitReport = useSubmitShopReport();

  const onlineList = activeSellers.online || [];

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
    } catch {
    } finally {
      setLoadingSellerId(null);
    }
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
      showToast.success('گزارش با موفقیت ثبت شد و بررسی خواهد گردید');
      setReportShop(null);
      setSelectedSubjectId('');
      setReportDescription('');
    } catch (error: any) {
      showToast.error(error?.userMessage || 'خطا در ثبت گزارش');
    }
  };

  const renderSellerCard = (seller: any) => {
    const isSelected = selectedSellerId === seller.id;

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
        onClick={() => onSelectSeller(seller.id)}
        className={cn(
          'relative flex w-full cursor-pointer flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4 rounded-2xl bg-card p-4 border shadow-xs transition-all duration-200',
          isSelected
            ? 'border-foreground/30 bg-muted/40 ring-1 ring-foreground/10'
            : 'border-border/80 hover:border-border hover:bg-muted/10'
        )}
      >
        {hasDiscount && (
          <div className="flex lg:hidden items-center justify-between rounded-xl bg-destructive/10 px-3 py-1 text-2xs font-bold text-destructive">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 fill-destructive text-destructive" />
              <span>پیشنهاد ویژه</span>
            </div>
            <span className="font-bold">تخفیف {toPersianDigits(discountPercent)}٪</span>
          </div>
        )}

        <div className="flex items-center justify-between lg:justify-start gap-3 min-w-0 lg:w-[230px] xl:w-[270px] shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-muted/30 p-1">
              {seller.shop?.logo ? (
                <img src={getFullUrl(seller.shop.logo)} className="h-full w-full object-contain" alt="" />
              ) : (
                <Store className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[140px] sm:max-w-[180px]">
                  {seller.shop?.title}
                </span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-3xs font-bold text-muted-foreground shrink-0">
                  {seller.typeLabel}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-2 text-3xs text-muted-foreground">
                <span className="flex items-center gap-1 font-bold text-foreground">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  {toPersianDigits(seller.shop?.rate || '۴.۸')}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="truncate max-w-[90px]">
                    {(seller.shop as any)?.cityName || seller.shop?.address?.split('،')[0] || 'تهران'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            title="گزارش خطای اطلاعات"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setReportShop(seller);
            }}
            className="flex lg:hidden items-center gap-1 rounded-lg bg-muted px-2 py-1 text-3xs font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
          >
            <AlertTriangle className="h-3 w-3" />
            <span>گزارش</span>
          </button>
        </div>

        <div className="flex flex-col gap-1.5 text-2xs text-muted-foreground lg:border-s lg:border-border/60 lg:ps-4 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground">ارسال:</span>
            <span className="font-bold text-foreground truncate">{seller.dayOfDeliveryLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate">
              {seller.warrantyTitle || 'ضمانت اصالت و سلامت فیزیکی'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-3 sm:gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-dashed border-border/60 shrink-0 lg:ms-auto">
          <div className="flex flex-col items-start lg:items-end min-w-[90px] sm:min-w-[100px]">
            {hasDiscount && (
              <div className="flex items-center gap-1">
                <span className="text-3xs text-muted-foreground line-through">
                  {seller.retailPrice}
                </span>
                <span className="hidden sm:inline-flex rounded-full bg-destructive/10 text-destructive px-1.5 py-0.5 text-3xs font-bold">
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

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={(e) => handleAddOnlineToBasket(e, seller)}
              disabled={loadingSellerId === seller.id}
              className="h-9 gap-1.5 rounded-xl px-3 sm:px-4 text-xs font-bold shadow-xs whitespace-nowrap"
            >
              {loadingSellerId === seller.id ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShoppingBag aria-hidden="true" className="h-4 w-4" />
                  <span>افزودن به سبد</span>
                </>
              )}
            </Button>

            <button
              type="button"
              title="گزارش خطای اطلاعات"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setReportShop(seller);
              }}
              className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
            >
              <AlertTriangle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative mt-2 flex w-full select-none flex-col gap-4" dir="rtl">
      {/* تایتل ساده به‌جای تب */}
      <div className="flex w-full items-center gap-2 border-b border-border pb-3">
        <Store className="h-5 w-5 text-primary shrink-0" />
        <h3 className="text-sm font-bold text-foreground md:text-base">
          فروشندگان اینترنتی این قطعه
        </h3>
        <span className="rounded-md bg-muted px-2 py-0.5 text-3xs font-bold text-muted-foreground">
          {toPersianDigits(onlineList.length)} فروشگاه
        </span>
      </div>

      {/* محتوای لیست فروشندگان */}
      <div className="flex flex-col gap-3">
        {onlineList.length > 0 ? (
          <>
            <div className="flex flex-col gap-3">
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
        )}
      </div>

      <Modal
        isOpen={isAllSellersModalOpen}
        onClose={() => setIsAllSellersModalOpen(false)}
        className="w-full max-w-4xl overflow-hidden rounded-2xl"
      >
        <ModalHeader onClose={() => setIsAllSellersModalOpen(false)}>
          <ModalTitle className="flex items-center gap-2 text-sm font-black text-foreground">
            <Store className="h-5 w-5 text-primary" />
            <span>لیست کامل فروشندگان این قطعه ({toPersianDigits(onlineList.length)} فروشگاه)</span>
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="p-4 md:p-5 max-h-[80dvh] overflow-y-auto no-scrollbar flex flex-col gap-3" dir="rtl">
          {onlineList.map((s: any) => renderSellerCard(s))}
        </ModalBody>
      </Modal>

      <Modal isOpen={!!reportShop} onClose={() => setReportShop(null)} className="w-full max-w-md overflow-hidden rounded-2xl">
        <ModalHeader onClose={() => setReportShop(null)}>
          <ModalTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
            <AlertTriangle aria-hidden="true" className="h-5 w-5 text-destructive" />
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
            label="توضیحات تکمیلی"
            placeholder="جزئیات خطا را بنویسید..."
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            className="h-24 text-xs"
          />
          <div className="mt-2 flex w-full gap-3 border-t border-border/60 pt-4">
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
    </div>
  );
}