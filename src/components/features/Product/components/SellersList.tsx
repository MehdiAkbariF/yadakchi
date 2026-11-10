// src/components/features/Product/components/SellersList.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Store,
  MapPin,
  AlertTriangle,
  Star,
  ChevronLeft,
  ShieldCheck,
  Truck,
  Award,
  Timer,
  Zap,
} from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Button } from '@/components/primitives/Button/Button';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { useGetReportSubjects, useSubmitShopReport } from '@/domains/front/shop/hooks/shop.hooks';
import { Select } from '@/components/primitives/Select/Select';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { showToast } from '@/core/utils/toast';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';
import { useGetBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { useDiscountCountdown } from '@/shared/hooks/useDiscountCountdown';
import { SellerBasketControl } from './SellerBasketControl';

export interface SellersListProps {
  activeSellers: any;
  selectedSellerId: string | null;
  onSelectSeller: (id: string) => void;
  onSellerAddedToBasket?: (id: string) => void;
  productTitle?: string;
}

const DESKTOP_MAX_VISIBLE = 1;

function getShopHref(seller: any): string {
  const shop = seller.shop || {};
  const shopId = shop.id || seller.shopId;
  return `/shops/${shopId}`;
}

function getUniqueKey(seller: any): string {
  return seller?.shop?.id || seller?.shopId || seller?.id || '';
}

/** ساب‌کامپوننت اختصاصی کارت فروشنده با تایمر زنده همگام با سرور */
interface SellerCardItemProps {
  seller: any;
  isFeatured?: boolean;
  isSelected?: boolean;
  mode?: 'list' | 'modal';
  onSelect: () => void;
  onOpenReport: (seller: any) => void;
  onSellerAddedToBasket?: (id: string) => void;
  onCloseModal?: () => void;
}

function SellerCardItem({
  seller,
  isFeatured = false,
  isSelected = false,
  mode = 'list',
  onSelect,
  onOpenReport,
  onSellerAddedToBasket,
  onCloseModal,
}: SellerCardItemProps) {
  const shopHref = getShopHref(seller);

  const originalPriceRaw = seller.retailPriceRaw || 0;
  const finalPriceRaw = seller.finalPriceRaw || 0;
  const calculatedPercent =
    originalPriceRaw > finalPriceRaw && originalPriceRaw > 0
      ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100)
      : 0;

  const discountPercent = seller.discountPercentage || calculatedPercent || 0;
  const hasDiscount = !!(
    (seller.hasDiscount ||
      (originalPriceRaw > 0 && finalPriceRaw > 0 && originalPriceRaw > finalPriceRaw)) &&
    discountPercent > 0
  );

  // استخراج تاریخ انقضای تخفیف فروشنده
  const expirationStr = seller.discountUntil || seller.discountExpiration || null;
  const { isExpired, formattedPersian } = useDiscountCountdown(expirationStr);
  const isTimerActive = Boolean(hasDiscount && expirationStr && !isExpired);

  const cardClassName = cn(
    'relative flex w-full cursor-pointer flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4 rounded-2xl bg-card p-4 border shadow-xs transition-all duration-200 no-underline text-inherit',
    isSelected
      ? 'border-foreground/30 bg-muted/40 ring-1 ring-foreground/10'
      : 'border-border/80 hover:border-border hover:bg-muted/10',
    isFeatured && !isSelected && 'ring-1 ring-warning/50 dark:ring-warning/30'
  );

  const cardContent = (
    <>
      {isFeatured && (
        <div className="absolute -top-2 right-3 z-10 inline-flex items-center gap-1 rounded-full border border-warning/60 bg-gradient-to-l from-amber-50 to-warning/10 px-2 py-0.5 text-[0.625rem] font-bold text-warning/80 shadow-sm dark:border-warning/30 dark:from-warning/10 dark:to-warning/5 dark:text-warning/90">
          <Award className="h-3 w-3" aria-hidden="true" />
          <span>منتخب</span>
        </div>
      )}

      {/* بج تخفیف یا تایمر زمان‌دار در موبایل */}
      {isTimerActive ? (
        <div className="flex lg:hidden items-center justify-between rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-1 text-2xs font-bold text-destructive">
          <div className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 fill-destructive" />
            <span>تخفیف شگفت‌انگیز {toPersianDigits(discountPercent)}٪</span>
          </div>
          <div className="flex items-center gap-1 font-bold tabular-nums" dir="ltr">
            <Timer className="h-3.5 w-3.5 shrink-0" />
            <span>
              {formattedPersian.hours}:{formattedPersian.minutes}:{formattedPersian.seconds}
            </span>
          </div>
        </div>
      ) : hasDiscount ? (
        <div className="flex lg:hidden items-center justify-between rounded-xl bg-destructive/10 px-3 py-1 text-2xs font-bold text-destructive">
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4 fill-destructive text-destructive" />
            <span>پیشنهاد ویژه</span>
          </div>
          <span className="font-bold">تخفیف {toPersianDigits(discountPercent)}٪</span>
        </div>
      ) : null}

      <div className="flex items-center justify-between lg:justify-start gap-3 min-w-0 lg:w-[14.375rem] xl:w-[16.875rem] shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-muted/30 p-1">
            {seller.shop?.logo ? (
              <img
                src={getFullUrl(seller.shop.logo)}
                className="h-full w-full object-contain"
                alt=""
              />
            ) : (
              <Store className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-title-sm truncate max-w-[8.75rem] sm:max-w-[11.25rem]">
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
                <span className="truncate max-w-[5.625rem]">
                  {(seller.shop as any)?.cityName ||
                    seller.shop?.address?.split('،')[0] ||
                    'تهران'}
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
            onOpenReport(seller);
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
          <span className="font-bold text-foreground truncate">
            {seller.dayOfDeliveryLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-success/90 dark:text-success/80 shrink-0" />
          <span className="font-bold text-success/90 dark:text-success/80 truncate">
            {seller.warrantyTitle || 'ضمانت اصالت و سلامت فیزیکی'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-end gap-3 sm:gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-dashed border-border/60 shrink-0 lg:ms-auto">
        <div className="flex flex-col items-start lg:items-end min-w-[5.625rem] sm:min-w-[7.25rem]">
          {hasDiscount && (
            <div className="flex items-center gap-1.5">
              <span className="text-3xs text-muted-foreground line-through">
                {seller.retailPrice}
              </span>
              <span className="hidden sm:inline-flex rounded-full bg-destructive/10 text-destructive px-1.5 py-0.5 text-3xs font-bold">
                {toPersianDigits(discountPercent)}٪
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-1">
            <span className="text-sm sm:text-base font-bold text-foreground" dir="ltr">
              {seller.finalPrice}
            </span>
            <span className="text-3xs text-muted-foreground">تومان</span>
          </div>

          {/* تایمر زمان‌دار مینیمال در دسکتاپ زیر قیمت */}
          {isTimerActive && (
            <div className="hidden lg:flex items-center gap-1 mt-1 text-destructive font-bold text-3xs tabular-nums" dir="ltr">
              <Timer className="h-3 w-3 shrink-0" />
              <span>
                {formattedPersian.hours}:{formattedPersian.minutes}:{formattedPersian.seconds}
              </span>
            </div>
          )}
        </div>

        <div
          className="flex items-center gap-2 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <SellerBasketControl
            seller={seller}
            onAddedToBasket={() => {
              onSellerAddedToBasket?.(seller.id);
              if (mode === 'modal') {
                onCloseModal?.();
              }
            }}
          />

          <button
            type="button"
            title="گزارش خطای اطلاعات"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenReport(seller);
            }}
            className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
          >
            <AlertTriangle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  if (mode === 'modal') {
    return (
      <Link
        key={getUniqueKey(seller) || seller.id}
        href={shopHref}
        onClick={onCloseModal}
        className={cardClassName}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div
      key={getUniqueKey(seller) || seller.id}
      onClick={onSelect}
      className={cardClassName}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {cardContent}
    </div>
  );
}

export function SellersList({
  activeSellers,
  selectedSellerId,
  onSelectSeller,
  onSellerAddedToBasket,
  productTitle = 'قطعه یدکی',
}: SellersListProps) {
  const [reportShop, setReportShop] = React.useState<any | null>(null);
  const [isAllSellersModalOpen, setIsAllSellersModalOpen] = React.useState(false);

  const [selectedSubjectId, setSelectedSubjectId] = React.useState('');
  const [reportDescription, setReportDescription] = React.useState('');

  const { data: reportSubjects = [] } = useGetReportSubjects('ShopProductReport');
  const submitReport = useSubmitShopReport();

  const { data: basketData } = useGetBasket();

  const basketMap = React.useMemo(() => {
    const map = new Map<string, number>();
    if (!basketData) return map;

    const items: any[] =
      (Array.isArray(basketData.items) && basketData.items) ||
      (Array.isArray((basketData as any).subBaskets) &&
        (basketData as any).subBaskets.flatMap(
          (sb: any) => sb.items || sb.subBasketItems || []
        )) ||
      [];

    items.forEach((it: any) => {
      const spid =
        it.shopProductId ??
        it.shopProduct?.id ??
        it.product?.shopProductId ??
        it.shopProduct?.shopProductId;
      const qty = Number(it.quantity ?? 0);
      if (spid && qty > 0) map.set(spid, qty);
    });

    return map;
  }, [basketData]);

  const allSellersList = React.useMemo(() => {
    const merged = [
      ...(activeSellers.online || []),
      ...(activeSellers.local || []),
    ];
    const seen = new Set<string>();
    return merged.filter((s: any) => {
      const key = getUniqueKey(s);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [activeSellers.online, activeSellers.local]);

  const hasMoreOnline = allSellersList.length > DESKTOP_MAX_VISIBLE;

  const visibleOnline = React.useMemo(() => {
    const priority: any[] = [];
    const seen = new Set<string>();

    const push = (s: any) => {
      if (!s) return;
      const key = getUniqueKey(s);
      if (!key || seen.has(key)) return;
      seen.add(key);
      priority.push(s);
    };

    if (selectedSellerId) {
      push(allSellersList.find((s: any) => s.id === selectedSellerId));
    }
    basketMap.forEach((qty, id) => {
      if (qty > 0) push(allSellersList.find((s: any) => s.id === id));
    });
    push(allSellersList[0]);
    for (const s of allSellersList) {
      if (priority.length >= DESKTOP_MAX_VISIBLE) break;
      push(s);
    }

    return priority;
  }, [allSellersList, selectedSellerId, basketMap]);

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

  return (
    <div className="relative mt-2 flex w-full select-none flex-col gap-4" dir="rtl">
      <div className="flex w-full items-center gap-2 border-b border-border pb-3">
        <Store className="h-5 w-5 text-primary shrink-0" />
        <h3 className="text-title-sm md:text-base font-bold">
          فروشندگان اینترنتی این قطعه
        </h3>
        <span className="rounded-md bg-muted px-2 py-0.5 text-3xs font-bold text-muted-foreground">
          {toPersianDigits(allSellersList.length)} فروشگاه
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {allSellersList.length > 0 ? (
          <>
            <div className="flex flex-col gap-3">
              {visibleOnline.map((s: any) => {
                const originalIndex = allSellersList.findIndex((x: any) => x.id === s.id);
                return (
                  <SellerCardItem
                    key={getUniqueKey(s) || s.id}
                    seller={s}
                    isFeatured={originalIndex === 0}
                    isSelected={selectedSellerId === s.id}
                    mode="list"
                    onSelect={() => onSelectSeller(s.id)}
                    onOpenReport={(seller) => setReportShop(seller)}
                    onSellerAddedToBasket={onSellerAddedToBasket}
                  />
                );
              })}
            </div>

            {hasMoreOnline && (
              <div className="flex w-full justify-start pt-1">
                <button
                  type="button"
                  onClick={() => setIsAllSellersModalOpen(true)}
                  className="group inline-flex items-center gap-1 rounded-lg px-1 py-0.5 text-xs font-bold text-info/90 transition-colors hover:text-info/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-info/40 dark:text-info/90 dark:hover:text-info/80"
                >
                  <span>مشاهده همه فروشندگان</span>
                  <ChevronLeft
                    className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
                    aria-hidden="true"
                  />
                </button>
              </div>
            )}
          </>
        ) : (
          <span className="py-8 text-center text-xs text-muted-foreground">
            فروشگاه اینترنتی فعالی برای این قطعه موجود نیست.
          </span>
        )}
      </div>

      {/* مودال تمام‌صفحه و منظم فروشندگان در موبایل */}
      <Modal
        isOpen={isAllSellersModalOpen}
        onClose={() => setIsAllSellersModalOpen(false)}
        size="xl"
      >
        <ModalHeader onClose={() => setIsAllSellersModalOpen(false)}>
          <ModalTitle className="flex items-center gap-2 text-sm font-black text-foreground">
            <Store className="h-5 w-5 text-primary" />
            <span>
              لیست کامل فروشندگان این قطعه ({toPersianDigits(allSellersList.length)} فروشگاه)
            </span>
          </ModalTitle>
        </ModalHeader>

        <ModalBody
          className="flex-1 w-full p-4 md:p-6 overflow-y-auto no-scrollbar flex flex-col gap-3"
          dir="rtl"
        >
          {allSellersList.map((s: any, index: number) => (
            <SellerCardItem
              key={getUniqueKey(s) || s.id}
              seller={s}
              isFeatured={index === 0}
              isSelected={selectedSellerId === s.id}
              mode="modal"
              onSelect={() => onSelectSeller(s.id)}
              onOpenReport={(seller) => setReportShop(seller)}
              onSellerAddedToBasket={onSellerAddedToBasket}
              onCloseModal={() => setIsAllSellersModalOpen(false)}
            />
          ))}
        </ModalBody>
      </Modal>

      {/* مودال گزارش خطا */}
      <Modal isOpen={!!reportShop} onClose={() => setReportShop(null)} size="sm">
        <ModalHeader onClose={() => setReportShop(null)}>
          <ModalTitle className="flex items-center gap-2 text-title-sm">
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
            options={reportSubjects.map((sub: any) => ({
              value: sub.id,
              label: sub.title,
            }))}
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