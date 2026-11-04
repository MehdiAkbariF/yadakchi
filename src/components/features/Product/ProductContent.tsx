'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, ChevronUp, ShoppingBag, Bell, LineChart, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProductPageData, useGetProductPriceChart, useSubmitProductReport } from '@/domains/front/product/hooks/product.hooks';
import {
  useGetBasket,
  useAddToBasket,
  useDeleteFromBasket,
} from '@/domains/front/basket/hooks/basket.hooks';
import { ThreeDotsLoader } from '@/components/composites/Loading/ThreeDotsLoader';
import { useGetReportSubjects } from '@/domains/front/shop/hooks/shop.hooks';
import { ProductHeader } from './components/ProductHeader';
import { ConditionSelector } from './components/ConditionSelector';
import { SpecHighlights } from './components/SpecHighlights';
import { SellersList } from './components/SellersList';
import { ProductSpecsTable } from './components/ProductSpecsTable';
import { ProductCommentsSection } from './components/ProductCommentsSection';
import { ProductInquiriesSection } from './components/ProductInquiriesSection';
import { ProductSideInvoice } from './components/ProductSideInvoice';
import { ProductGallery } from './components/ProductGallery';
import { ProductMinimalHeader } from './components/ProductMinimalHeader';
import { MobileBottomAction } from '@/components/composites/MobileBottomAction/MobileBottomAction';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Select } from '@/components/primitives/Select/Select';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { toPersianDigits, getProductUrl } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';
import { showToast } from '@/core/utils/toast';
import { getHttpClient } from '@/core/http/client';
import { LottiePlayer } from '@/components/shared/Lottie/LottiePlayer';

const TAB_LABELS: Record<string, string> = {
  intro: 'معرفی کالا',
  specs: 'مشخصات فنی',
  comments: 'امتیاز و نظرات',
  inquiries: 'پرسش و پاسخ',
};

interface ProductContentProps {
  productCode: number;
  initialData?: any;
}

export function ProductContent({ productCode, initialData }: ProductContentProps) {
  const { data: clientData, isLoading } = useGetProductPageData(productCode);
  const pageData = clientData || initialData;

  const { data: basketData } = useGetBasket();
  const addToBasket = useAddToBasket();
  const deleteFromBasket = useDeleteFromBasket();

  const defaultCondition = React.useMemo((): 'New' | 'Stock' | 'TakeOff' => {
    if (!pageData?.shopProducts) return 'New';
    const sp = pageData.shopProducts;
    const hasNew = (sp.newOnline?.length || 0) + (sp.newLocal?.length || 0) > 0 || !!sp.newNominated;
    if (hasNew) return 'New';
    const hasStock = (sp.stockOnline?.length || 0) + (sp.stockLocal?.length || 0) > 0 || !!sp.stockNominated;
    if (hasStock) return 'Stock';
    const hasTakeOff = (sp.takeOffOnline?.length || 0) + (sp.takeOffLocal?.length || 0) > 0 || !!sp.takeOffNominated;
    if (hasTakeOff) return 'TakeOff';
    return 'New';
  }, [pageData]);

  const [selectedCondition, setSelectedCondition] = React.useState<'New' | 'Stock' | 'TakeOff'>(defaultCondition);
  const [activeSellerId, setActiveSellerId] = React.useState<string | null>(null);
  const [isIntroExpanded, setIsIntroExpanded] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('intro');
  const [isMobileSubmitting, setIsMobileSubmitting] = React.useState(false);
  const [isBasketUpdating, setIsBasketUpdating] = React.useState(false);
  const [isNotifying, setIsNotifying] = React.useState(false);
  const [isNotifySuccessOpen, setIsNotifySuccessOpen] = React.useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [isPriceChartOpen, setIsPriceChartOpen] = React.useState(false);
  const [metaIndex, setMetaIndex] = React.useState(0);
  const [isSheetAttached, setIsSheetAttached] = React.useState(false);
  const [lottieKey, setLottieKey] = React.useState(0);

  // استیت‌های کانتینر ترغیب به پرداخت موبایل و افکت سبد خرید هدر
  const [showCartBanner, setShowCartBanner] = React.useState(false);
  const [isCartBouncing, setIsCartBouncing] = React.useState(false);
  const bannerTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedSubjectId, setSelectedSubjectId] = React.useState('');
  const [reportDescription, setReportDescription] = React.useState('');
  const submitProductReport = useSubmitProductReport();
  const { data: reportSubjects = [] } = useGetReportSubjects('ProductReport');

  const mobileViewportRef = React.useRef<HTMLDivElement>(null);
  const sheetRef = React.useRef<HTMLDivElement>(null);

  const dIntroRef = React.useRef<HTMLDivElement>(null);
  const dSpecsRef = React.useRef<HTMLDivElement>(null);
  const dCommentsRef = React.useRef<HTMLDivElement>(null);
  const dInquiriesRef = React.useRef<HTMLDivElement>(null);

  const mIntroRef = React.useRef<HTMLDivElement>(null);
  const mSpecsRef = React.useRef<HTMLDivElement>(null);
  const mCommentsRef = React.useRef<HTMLDivElement>(null);
  const mInquiriesRef = React.useRef<HTMLDivElement>(null);

  const lockRef = React.useRef(false);
  const lockTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRafRef = React.useRef<number | null>(null);

  const lock = (ms = 800) => {
    lockRef.current = true;
    if (lockTimer.current) clearTimeout(lockTimer.current);
    lockTimer.current = setTimeout(() => { lockRef.current = false; }, ms);
  };

  React.useEffect(() => {
    return () => {
      if (lockTimer.current) clearTimeout(lockTimer.current);
      if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (pageData && defaultCondition) setSelectedCondition(defaultCondition);
  }, [defaultCondition, pageData]);

  React.useEffect(() => {
    if (!pageData) return;

    const isDesktop = window.innerWidth >= 1024;
    const root = isDesktop ? null : mobileViewportRef.current;
    if (!isDesktop && !root) return;

    const desktopRefs = [
      { id: 'intro', ref: dIntroRef },
      { id: 'specs', ref: dSpecsRef },
      { id: 'comments', ref: dCommentsRef },
      { id: 'inquiries', ref: dInquiriesRef },
    ];
    const mobileRefs = [
      { id: 'intro', ref: mIntroRef },
      { id: 'specs', ref: mSpecsRef },
      { id: 'comments', ref: mCommentsRef },
      { id: 'inquiries', ref: mInquiriesRef },
    ];

    const activeRefs = isDesktop ? desktopRefs : mobileRefs;
    const elements = activeRefs
      .map((x) => ({ id: x.id, el: x.ref.current }))
      .filter((x) => !!x.el) as { id: string; el: HTMLDivElement }[];

    if (elements.length === 0) return;

    const visibleMap = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return;

        entries.forEach((entry) => {
          const id = elements.find((x) => x.el === entry.target)?.id;
          if (!id) return;
          visibleMap.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        let best: { id: string; ratio: number } | null = null;
        visibleMap.forEach((ratio, id) => {
          if (ratio > 0 && (!best || ratio > best.ratio)) best = { id, ratio };
        });

        if (best) setActiveSection((best as { id: string }).id);
      },
      {
        root,
        rootMargin: '-88px 0px -55% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    elements.forEach(({ el }) => observer.observe(el));
    return () => observer.disconnect();
  }, [pageData]);

  const handleMobileViewportScroll = () => {
    const c = mobileViewportRef.current;
    if (!c) return;
    if (scrollRafRef.current !== null) return;

    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const attached = c.scrollTop >= 370;
      setIsSheetAttached((prev) => (prev === attached ? prev : attached));
    });
  };

  React.useEffect(() => {
    if (!pageData) return;
    const interval = setInterval(() => setMetaIndex((prev) => (prev + 1) % 3), 3000);
    return () => clearInterval(interval);
  }, [pageData]);

  if (!pageData && isLoading) {
    return (
      <div className="flex w-full min-h-[calc(100vh-160px)] items-center justify-center">
        <ThreeDotsLoader size="md" />
      </div>
    );
  }
  if (!pageData) return null;

  const product = pageData.product;
  const sellersGroup = pageData.shopProducts || {};

  const getSellersForCondition = () => {
    if (selectedCondition === 'Stock') {
      return { nominated: sellersGroup.stockNominated || null, online: sellersGroup.stockOnline || [], local: sellersGroup.stockLocal || [] };
    }
    if (selectedCondition === 'TakeOff') {
      return { nominated: sellersGroup.takeOffNominated || null, online: sellersGroup.takeOffOnline || [], local: sellersGroup.takeOffLocal || [] };
    }
    return { nominated: sellersGroup.newNominated || null, online: sellersGroup.newOnline || [], local: sellersGroup.newLocal || [] };
  };

  const activeSellers = getSellersForCondition();
  const allAvailableSellersList = [...(activeSellers.online || []), ...(activeSellers.local || [])];

  const currentSelectedSeller =
    allAvailableSellersList.find((s) => s.id === activeSellerId) ||
    activeSellers.nominated ||
    allAvailableSellersList[0] ||
    null;

  const basketItems: any[] = React.useMemo(() => {
    if (!basketData) return [];
    if (Array.isArray(basketData.items)) return basketData.items;
    if (Array.isArray((basketData as any).subBaskets)) {
      return (basketData as any).subBaskets.flatMap((sb: any) => sb.items || sb.subBasketItems || []);
    }
    return [];
  }, [basketData]);

  const currentBasketItem = React.useMemo(() => {
    if (!currentSelectedSeller || basketItems.length === 0) return null;
    return basketItems.find((it: any) => (it.shopProductId || it.shopProduct?.id) === currentSelectedSeller.id) || null;
  }, [currentSelectedSeller, basketItems]);

  const isInBasket = !!currentBasketItem && currentBasketItem.quantity > 0;
  const basketQuantity = currentBasketItem?.quantity || 0;

  const maxAllowedQuantity = React.useMemo(() => {
    const stockQuantity = Number(currentSelectedSeller?.quantity);
    if (!isNaN(stockQuantity) && stockQuantity > 0) return stockQuantity;
    return Number(
      currentBasketItem?.inventory?.maxQuantity ||
      currentBasketItem?.maxQuantity ||
      currentSelectedSeller?.maxQuantityPerOrder ||
      10
    );
  }, [currentSelectedSeller, currentBasketItem]);

  const galleryImages = React.useMemo(() => {
    const all = [product.image, ...(product.gallery || [])].filter(Boolean) as string[];
    return Array.from(new Set(all));
  }, [product.image, product.gallery]);

  const handleScrollToSection = (sectionId: string) => {
    const isDesktop = window.innerWidth >= 1024;
    const refMap = isDesktop
      ? { intro: dIntroRef, specs: dSpecsRef, comments: dCommentsRef, inquiries: dInquiriesRef }
      : { intro: mIntroRef, specs: mSpecsRef, comments: mCommentsRef, inquiries: mInquiriesRef };

    const el = refMap[sectionId as keyof typeof refMap]?.current;
    if (!el) return;

    lock(900);
    setActiveSection(sectionId);

    if (isDesktop) {
      const y = el.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    } else {
      const c = mobileViewportRef.current;
      if (!c) return;
      const containerRect = c.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const y = c.scrollTop + (elRect.top - containerRect.top) - 56;
      c.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  // فعال‌سازی پاپ‌آپ رفتن به سبد و تریگر افکت هدر
  const triggerCartSequence = () => {
    setShowCartBanner(true);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);

    bannerTimerRef.current = setTimeout(() => {
      setShowCartBanner(false);
      // انیمیشن سبد خرید در هدر به مدت ۲ ثانیه فعال می‌شود
      setIsCartBouncing(true);
      setTimeout(() => setIsCartBouncing(false), 2200);
    }, 4500);
  };

  const handleMobileAddToBasket = async () => {
    if (!currentSelectedSeller) return;
    setIsMobileSubmitting(true);
    try {
      await addToBasket.mutateAsync({ shopProductId: currentSelectedSeller.id, quantity: 1 });
      showToast.success('قطعه با موفقیت به سبد خرید شما افزوده شد');
      triggerCartSequence();
    } catch (err: any) {
      showToast.error(err?.userMessage || 'خطا در افزودن به سبد خرید');
    } finally {
      setIsMobileSubmitting(false);
    }
  };

  const handleIncreaseBasket = async () => {
    if (!currentSelectedSeller || isBasketUpdating) return;
    if (basketQuantity >= maxAllowedQuantity) {
      showToast.error(`حداکثر موجودی قابل سفارش ${toPersianDigits(maxAllowedQuantity)} عدد است`);
      return;
    }
    setIsBasketUpdating(true);
    try {
      await addToBasket.mutateAsync({ shopProductId: currentSelectedSeller.id, quantity: 1 });
      showToast.success('تعداد کالا افزایش یافت');
      triggerCartSequence();
    } catch (err: any) {
      showToast.error(err?.userMessage || 'خطا در افزایش تعداد');
    } finally {
      setIsBasketUpdating(false);
    }
  };

  const handleDecreaseBasket = async () => {
    if (!currentSelectedSeller || isBasketUpdating || basketQuantity <= 0) return;
    setIsBasketUpdating(true);
    try {
      await deleteFromBasket.mutateAsync({ shopProductId: currentSelectedSeller.id, quantity: 1 });
      showToast.success(basketQuantity === 1 ? 'کالا از سبد خرید حذف شد' : 'تعداد کالا کاهش یافت');
    } catch (err: any) {
      showToast.error(err?.userMessage || 'خطا در کاهش تعداد');
    } finally {
      setIsBasketUpdating(false);
    }
  };

  const handleNotifyMe = async () => {
    if (isNotifying || !product?.id) return;
    setIsNotifying(true);
    try {
      const client = getHttpClient();
      await client.post('/api/Front/ProductInStockNotificationRequest', null, {
        params: { ProductId: product.id },
      });
      setLottieKey((k) => k + 1);
      setIsNotifySuccessOpen(true);
      showToast.success('درخواست اطلاع‌رسانی با موفقیت ثبت شد');
    } catch (error: any) {
      showToast.error(error?.userMessage || 'خطا در ثبت درخواست اطلاع‌رسانی موجودی');
    } finally {
      setIsNotifying(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!selectedSubjectId) {
      showToast.error('لطفاً دلیل گزارش کالا را انتخاب کنید');
      return;
    }
    try {
      await submitProductReport.mutateAsync({
        productId: product.id,
        reportSubjectId: selectedSubjectId,
        description: reportDescription,
      });
      showToast.success('گزارش خطای کالا با موفقیت ثبت شد');
      setIsReportModalOpen(false);
      setSelectedSubjectId('');
      setReportDescription('');
    } catch (error: any) {
      showToast.error(error?.userMessage || 'خطا در ثبت گزارش');
    }
  };

  const handleSellerAddedToBasket = (sellerId: string) => {
    const inCurrentList = allAvailableSellersList.some((s) => s.id === sellerId);

    if (!inCurrentList) {
      const inNew =
        (sellersGroup.newOnline || []).some((s: any) => s.id === sellerId) ||
        (sellersGroup.newLocal || []).some((s: any) => s.id === sellerId);
      const inStock =
        (sellersGroup.stockOnline || []).some((s: any) => s.id === sellerId) ||
        (sellersGroup.stockLocal || []).some((s: any) => s.id === sellerId);
      const inTakeOff =
        (sellersGroup.takeOffOnline || []).some((s: any) => s.id === sellerId) ||
        (sellersGroup.takeOffLocal || []).some((s: any) => s.id === sellerId);

      if (inNew) setSelectedCondition('New');
      else if (inStock) setSelectedCondition('Stock');
      else if (inTakeOff) setSelectedCondition('TakeOff');
    }

    setActiveSellerId(sellerId);
    triggerCartSequence();
  };

  const originalPriceRaw = currentSelectedSeller?.retailPriceRaw || 0;
  const finalPriceRaw = currentSelectedSeller?.finalPriceRaw || 0;
  const calculatedPercent = originalPriceRaw > finalPriceRaw
    ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100) : 0;

  const discountPercentage = currentSelectedSeller?.discountPercentage || calculatedPercent || 0;
  const hasDiscount = !!(currentSelectedSeller?.hasDiscount && discountPercentage > 0);
  const discountExpiration = (currentSelectedSeller as any)?.discountUntil || null;
  const hasTimedDiscount = hasDiscount && !!discountExpiration;

  const metaItems = [
    `فروشگاه: ${currentSelectedSeller?.shop?.title || 'یدکچی'}`,
    `${toPersianDigits(product.views || 0)} بازدید اخیر`,
    `${toPersianDigits(product.salesCount || 0)} خرید موفق`,
  ];

  const leftPriceContent = currentSelectedSeller ? (
    <div className="flex h-10 w-36 max-w-[150px] select-none flex-col justify-between">
      <div className="relative h-4 w-full overflow-hidden">
        <span className="absolute block w-full truncate text-2xs font-bold leading-none text-muted-foreground">
          {metaItems[metaIndex]}
        </span>
      </div>

      <div className="flex flex-col">
        {currentSelectedSeller.hasDiscount ? (
          <span className="mb-1 text-2xs leading-none text-muted-foreground line-through">
            {currentSelectedSeller.retailPrice}
          </span>
        ) : null}
        <span className="text-xs font-bold leading-none text-foreground md:text-sm">
          {currentSelectedSeller.finalPrice}
        </span>
      </div>
    </div>
  ) : null;

  const renderBreadcrumb = () => (
    <div className="flex w-full select-none items-center gap-2 overflow-x-auto py-2 text-2xs text-muted-foreground scrollbar-none md:text-xs">
      <Link href="/" className="transition-colors hover:text-primary whitespace-nowrap shrink-0">
        خانه
      </Link>
      {product.breadCrumbs?.map((crumb: any, idx: number) => {
        const isLast = idx === product.breadCrumbs.length - 1;
        const url = isLast ? getProductUrl(product.code, product.title) : `/part-category/${crumb.englishTitle}`;
        return (
          <div key={crumb.id || idx} className="flex items-center gap-2 shrink-0">
            <ChevronLeft aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
            {isLast ? (
              <span className="max-w-[170px] truncate font-bold text-foreground sm:max-w-none">{crumb.title}</span>
            ) : (
              <Link href={url} className="whitespace-nowrap transition-colors hover:text-primary">{crumb.title}</Link>
            )}
          </div>
        );
      })}
    </div>
  );

  const tabs = ['intro', 'specs', 'comments', 'inquiries'] as const;

  return (
    <>
      {/* ==================== دسکتاپ ==================== */}
      <div className="hidden lg:flex w-full flex-col gap-1 mt-3" dir="rtl">
        {renderBreadcrumb()}

        <div className="flex w-full items-start gap-8">
          <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
            <div className="flex w-full gap-8">
              <div className="w-[45%] shrink-0">
                <ProductGallery
                  images={galleryImages}
                  title={product.title}
                  hasDiscount={hasDiscount}
                  discountPercent={discountPercentage}
                  hasTimedDiscount={hasTimedDiscount}
                  discountExpiration={discountExpiration}
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-5">
                <ProductHeader
                  product={product}
                  onScrollToComments={() => handleScrollToSection('comments')}
                  onScrollToInquiries={() => handleScrollToSection('inquiries')}
                />
                <ConditionSelector
                  selectedCondition={selectedCondition}
                  onChangeCondition={(cond) => {
                    setSelectedCondition(cond);
                    setActiveSellerId(null);
                  }}
                  sellersGroup={sellersGroup}
                />
                <SpecHighlights
                  specGroups={product.specGroups}
                  productDescription={product.description}
                  onSeeAll={() => handleScrollToSection('specs')}
                />
              </div>
            </div>

            <SellersList
              activeSellers={activeSellers}
              selectedSellerId={currentSelectedSeller?.id || null}
              onSelectSeller={(id) => setActiveSellerId(id)}
              onSellerAddedToBasket={handleSellerAddedToBasket}
              productTitle={product.title}
            />

            <div className="sticky top-[68px] z-30 flex h-12 w-full items-center gap-6 overflow-x-auto border-b border-border bg-card/95 backdrop-blur-md scrollbar-none">
              {tabs.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleScrollToSection(id)}
                  className={cn(
                    'h-full shrink-0 border-b-2 px-1 text-xs font-bold transition-colors flex items-center md:text-sm',
                    activeSection === id
                      ? 'border-primary text-primary font-black'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {TAB_LABELS[id]}
                </button>
              ))}
            </div>

            <div ref={dIntroRef} className="border-b border-border pb-6 pt-6">
              <h3 className="mb-3 text-sm font-bold text-foreground md:text-base">معرفی کالا</h3>
              <div className="relative">
                <div
                  style={{ maxHeight: isIntroExpanded ? 'none' : '110px' }}
                  className="overflow-hidden text-justify text-xs leading-reading text-muted-foreground md:text-sm"
                  dangerouslySetInnerHTML={{ __html: product.description || 'توضیحی برای این کالا ثبت نشده است.' }}
                />
                {!isIntroExpanded && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-card to-transparent" />
                )}
              </div>
              <div className="mt-3 flex justify-start">
                <button
                  type="button"
                  onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                  className="flex items-center gap-1 text-xs font-bold text-shop hover:underline"
                >
                  <span>{isIntroExpanded ? 'مشاهده کمتر' : 'مشاهده بیشتر'}</span>
                  {isIntroExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div ref={dSpecsRef} className="border-b border-border pb-6 pt-8">
              <ProductSpecsTable specGroups={product.specGroups} />
            </div>

            <div ref={dCommentsRef} className="border-b border-border pb-6 pt-8">
              <ProductCommentsSection productId={product.id} productTitle={product.title} productImage={product.image} />
            </div>

            <div ref={dInquiriesRef} className="pt-8">
              <ProductInquiriesSection productId={product.id} productTitle={product.title} productImage={product.image} />
            </div>
          </div>

          <div className="w-[320px] shrink-0 sticky top-[132px] flex flex-col gap-6 xl:w-[340px]">
            <ProductSideInvoice product={product} seller={currentSelectedSeller} sellersCount={allAvailableSellersList.length} />
          </div>
        </div>
      </div>

      {/* ==================== موبایل ==================== */}
      <div className="lg:hidden relative h-[100dvh] w-full overflow-hidden bg-background" dir="rtl">
        <ProductMinimalHeader
          productTitle={product.title}
          isAttached={isSheetAttached}
          isCartBouncing={isCartBouncing}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenPriceChart={() => setIsPriceChartOpen(true)}
        />

        <div className="fixed top-14 inset-x-0 z-30 flex flex-col items-center bg-card select-none pointer-events-none">
          <div className="w-full px-4 border-b border-border/40 bg-card/60 pointer-events-auto">
            {renderBreadcrumb()}
          </div>
          <div className="w-full max-w-2xl px-2 pointer-events-auto">
            <ProductGallery
              images={galleryImages}
              title={product.title}
              hasDiscount={hasDiscount}
              discountPercent={discountPercentage}
              hasTimedDiscount={hasTimedDiscount}
              discountExpiration={discountExpiration}
              onDragVertical={(deltaY) => {
                if (mobileViewportRef.current) mobileViewportRef.current.scrollTop -= deltaY;
              }}
            />
          </div>
        </div>

        <div
          ref={mobileViewportRef}
          onScroll={handleMobileViewportScroll}
          className="relative h-full w-full overflow-y-auto overflow-x-hidden scrollbar-none overscroll-y-contain pt-[420px] sm:pt-[470px]"
          style={{ touchAction: 'pan-y' }}
        >
          <div
            ref={sheetRef}
            className={cn(
              'relative z-40 w-full min-h-screen bg-card border-t',
              isSheetAttached
                ? 'rounded-t-none border-border shadow-none'
                : 'rounded-t-[32px] border-border/80 shadow-[0_-16px_40px_rgba(0,0,0,0.16)] dark:shadow-[0_-16px_40px_rgba(0,0,0,0.5)]'
            )}
          >
            <div
              onClick={() => {
                if (mobileViewportRef.current) {
                  mobileViewportRef.current.scrollTo({ top: isSheetAttached ? 0 : 400, behavior: 'smooth' });
                }
              }}
              className="flex h-7 w-full cursor-pointer items-center justify-center pt-2 select-none"
            >
              <div
                className={cn(
                  'h-1.5 w-12 rounded-full transition-opacity duration-300',
                  isSheetAttached ? 'opacity-0' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
              />
            </div>

            <div className="flex w-full flex-col gap-6 px-4 pb-32 pt-1">
              <ProductHeader
                product={product}
                onScrollToComments={() => handleScrollToSection('comments')}
                onScrollToInquiries={() => handleScrollToSection('inquiries')}
              />
              <ConditionSelector
                selectedCondition={selectedCondition}
                onChangeCondition={(cond) => {
                  setSelectedCondition(cond);
                  setActiveSellerId(null);
                }}
                sellersGroup={sellersGroup}
              />
              <SpecHighlights
                specGroups={product.specGroups}
                productDescription={product.description}
                onSeeAll={() => handleScrollToSection('specs')}
              />
              <SellersList
                activeSellers={activeSellers}
                selectedSellerId={currentSelectedSeller?.id || null}
                onSelectSeller={(id) => setActiveSellerId(id)}
                onSellerAddedToBasket={handleSellerAddedToBasket}
                productTitle={product.title}
              />

              <div className="sticky top-[-372px] z-30 flex h-12 w-full items-center gap-6 overflow-x-auto border-b border-border bg-card/95 backdrop-blur-md scrollbar-none">
                {tabs.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleScrollToSection(id)}
                    className={cn(
                      'h-full shrink-0 border-b-2 px-1 text-xs font-bold transition-colors flex items-center',
                      activeSection === id
                        ? 'border-primary text-primary font-black'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {TAB_LABELS[id]}
                  </button>
                ))}
              </div>

              <div ref={mIntroRef} className="border-b border-border pb-6 pt-4">
                <h3 className="mb-3 text-xs font-bold text-foreground sm:text-sm">معرفی کالا</h3>
                <div className="relative">
                  <div
                    style={{ maxHeight: isIntroExpanded ? 'none' : '90px' }}
                    className="overflow-hidden text-justify text-xs leading-reading text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: product.description || 'توضیحی برای این کالا ثبت نشده است.' }}
                  />
                  {!isIntroExpanded && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent" />
                  )}
                </div>
                <div className="mt-2 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                    className="flex items-center gap-1 text-2xs font-bold text-shop hover:underline"
                  >
                    <span>{isIntroExpanded ? 'مشاهده کمتر' : 'مشاهده بیشتر'}</span>
                    {isIntroExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div ref={mSpecsRef} className="border-b border-border pb-6 pt-4">
                <ProductSpecsTable specGroups={product.specGroups} />
              </div>

              <div ref={mCommentsRef} className="border-b border-border pb-6 pt-4">
                <ProductCommentsSection productId={product.id} productTitle={product.title} productImage={product.image} />
              </div>

              <div ref={mInquiriesRef} className="pt-4">
                <ProductInquiriesSection productId={product.id} productTitle={product.title} productImage={product.image} />
              </div>
            </div>
          </div>
        </div>

        {/* ================= کانتینر ترغیب به رفتن به سبد خرید (روی موبایل) ================= */}
        <AnimatePresence>
          {showCartBanner && (
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 80, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="fixed bottom-[74px] inset-x-3 z-50 select-none transform-gpu"
              dir="rtl"
            >
              <Link
                href="/basket"
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-700/80 text-white shadow-2xl backdrop-blur-xl active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-success/20 text-success border border-success/30">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">کالا به سبد اضافه شد</span>
                    <span className="text-3xs text-neutral-300">برای نهایی‌سازی سفارش ضربه بزنید</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shrink-0 shadow-sm">
                  <span>مشاهده سبد</span>
                  <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* دکمه چسبان پایین موبایل */}
        <MobileBottomAction
          variant={currentSelectedSeller ? 'default' : 'notify'}
          label={currentSelectedSeller ? 'افزودن به سبد خرید' : 'موجود شد خبرم کن'}
          leftContent={leftPriceContent}
          onClick={() => {
            if (currentSelectedSeller) handleMobileAddToBasket();
            else handleNotifyMe();
          }}
          disabled={false}
          isLoading={currentSelectedSeller ? isMobileSubmitting : isNotifying}
          icon={
            currentSelectedSeller ? (
              <ShoppingBag aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Bell aria-hidden="true" className="h-5 w-5" />
            )
          }
          forceShowKey={selectedCondition}
          isInBasket={isInBasket}
          basketQuantity={basketQuantity}
          maxStock={maxAllowedQuantity}
          onIncrease={handleIncreaseBasket}
          onDecrease={handleDecreaseBasket}
          isUpdatingQuantity={isBasketUpdating}
          className="!fixed !bottom-0 !z-50"
        />
      </div>

      {/* ==================== مودال‌ها ==================== */}
      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsReportModalOpen(false)}>
          <ModalTitle className="text-sm font-bold text-foreground">گزارش خطای کالا</ModalTitle>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-4 p-5 pt-4">
          <Select
            label="دلیل گزارش *"
            placeholder="انتخاب دلیل..."
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            options={reportSubjects.map((sub: any) => ({ value: sub.id, label: sub.title }))}
          />
          <TextArea
            label="توضیحات تکمیلی"
            placeholder="توضیح دهید..."
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            className="h-24 text-xs"
          />
        </ModalBody>
        <ModalFooter className="gap-3 p-5 pt-4">
          <Button variant="outline" onClick={() => setIsReportModalOpen(false)} className="h-10 flex-1 text-xs font-bold">
            انصراف
          </Button>
          <Button
            variant="destructive"
            onClick={handleReportSubmit}
            isLoading={submitProductReport.isPending}
            className="h-10 flex-1 text-xs font-bold"
          >
            ثبت گزارش
          </Button>
        </ModalFooter>
      </Modal>

      <PriceChartModal
        isOpen={isPriceChartOpen}
        onClose={() => setIsPriceChartOpen(false)}
        productId={product.id}
        conditionType={currentSelectedSeller ? currentSelectedSeller.type : 'New'}
      />

      <Modal isOpen={isNotifySuccessOpen} onClose={() => setIsNotifySuccessOpen(false)} className="w-full max-w-md overflow-hidden rounded-2xl">
        <ModalBody className="flex flex-col items-center justify-center gap-3 p-6 pt-4 text-center" dir="rtl">
          <div className="mx-auto -mt-2 mb-1 h-52 w-52 max-w-full">
            <LottiePlayer key={lottieKey} path="/anumations/notif-success.json" className="h-full w-full" loop={false} />
          </div>

          <h4 className="text-base font-bold leading-relaxed text-foreground">
            درخواست شما با موفقیت ثبت شد!
          </h4>

          <p className="text-center text-sm leading-reading text-foreground">
            به‌محض موجود شدن این کالا، به شما اطلاع می‌دیم.
          </p>

          <p className="mx-auto max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
            تا اون موقع، می‌تونید قطعات موردنیاز خودروتون رو در یدکچی جستجو و قیمت‌ها رو مقایسه کنید.
          </p>

          <div className="mt-3 flex w-full flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => setIsNotifySuccessOpen(false)}
              className="h-10 w-full rounded-xl text-xs font-bold"
            >
              متوجه شدم
            </Button>

            <Link
              href="/search"
              className="py-1 text-center text-xs font-bold text-shop hover:underline"
              onClick={() => setIsNotifySuccessOpen(false)}
            >
              جستجوی قطعات در یدکچی
            </Link>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}

function PriceChartModal({
  isOpen,
  onClose,
  productId,
  conditionType,
}: {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  conditionType: string;
}) {
  const { data: chartData, isLoading } = useGetProductPriceChart(productId, conditionType);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md overflow-hidden rounded-2xl">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
          <LineChart className="h-4 w-4 text-shop" />
          <span>نمودار تغییرات قیمت فروش</span>
        </ModalTitle>
      </ModalHeader>
      <ModalBody className="p-5 pt-3 text-center" dir="rtl">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <ThreeDotsLoader size="sm" />
          </div>
        ) : chartData?.prices?.length > 0 ? (
          <div className="w-full py-4 text-xs font-bold text-foreground">
            میانگین قیمت: {toPersianDigits(chartData.averagePrice || 0)} تومان
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-muted-foreground">
            اطلاعات تغییرات قیمتی برای این کالا ثبت نشده است.
          </div>
        )}
        <Button variant="outline" fullWidth onClick={onClose} className="mt-4 h-10 text-xs font-bold">
          متوجه شدم
        </Button>
      </ModalBody>
    </Modal>
  );
}

export default ProductContent;