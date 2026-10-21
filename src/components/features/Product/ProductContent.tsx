'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, ChevronUp, ShoppingBag, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProductPageData } from '@/domains/front/product/hooks/product.hooks';
import { useAddToBasket as useGlobalAddToBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { ProductHeader } from './components/ProductHeader';
import { ConditionSelector } from './components/ConditionSelector';
import { SpecHighlights } from './components/SpecHighlights';
import { PickupAlert } from './components/PickupAlert';
import { SellersList } from './components/SellersList';
import { ProductSpecsTable } from './components/ProductSpecsTable';
import { ProductCommentsSection } from './components/ProductCommentsSection';
import { ProductInquiriesSection } from './components/ProductInquiriesSection';
import { ProductSideInvoice } from './components/ProductSideInvoice';
import { ProductPageSkeleton } from './components/ProductPageSkeleton';
import { ProductGallery } from './components/ProductGallery';
import { MobileBottomAction } from '@/components/composites/MobileBottomAction/MobileBottomAction';
import { Modal, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { getProductUrl, toPersianDigits } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';
import { showToast } from '@/core/utils/toast';

interface ProductContentProps {
  productCode: number;
  initialData?: any;
}

function LottiePlayer({
  path,
  className = 'w-48 h-48',
  loop = false,
}: {
  path: string;
  className?: string;
  loop?: boolean;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let anim: any = null;
    let isMounted = true;

    const init = async () => {
      try {
        const altPath = path.includes('/anumations/')
          ? path.replace('/anumations/', '/animations/')
          : path.replace('/animations/', '/anumations/');
        let animationData: any = null;

        for (const p of [path, altPath]) {
          try {
            const res = await fetch(p);
            if (res.ok) {
              animationData = await res.json();
              break;
            }
          } catch {}
        }

        if (!animationData || !isMounted || !containerRef.current) return;

        const lottieModule = await import('lottie-web');
        const lottie = lottieModule.default || lottieModule;

        if (containerRef.current && isMounted) {
          anim = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay: true,
            animationData,
          });
        }
      } catch {}
    };

    init();
    return () => {
      isMounted = false;
      anim?.destroy();
    };
  }, [path, loop]);

  return <div ref={containerRef} className={className} />;
}

export function ProductContent({ productCode, initialData }: ProductContentProps) {
  const { data: clientData, isLoading } = useGetProductPageData(productCode);
  const pageData = clientData || initialData;

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
  const [isNotifying, setIsNotifying] = React.useState(false);
  const [isNotifySuccessOpen, setIsNotifySuccessOpen] = React.useState(false);
  const [lottieKey, setLottieKey] = React.useState(0);
  const [metaIndex, setMetaIndex] = React.useState(0);

  const addToBasket = useGlobalAddToBasket();

  const introRef = React.useRef<HTMLDivElement>(null);
  const specsRef = React.useRef<HTMLDivElement>(null);
  const commentsRef = React.useRef<HTMLDivElement>(null);
  const inquiriesRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (pageData && defaultCondition) setSelectedCondition(defaultCondition);
  }, [defaultCondition, pageData]);

  React.useEffect(() => {
    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 200;
      const sections = [
        { id: 'intro', ref: introRef },
        { id: 'specs', ref: specsRef },
        { id: 'comments', ref: commentsRef },
        { id: 'inquiries', ref: inquiriesRef },
      ];
      for (const section of sections) {
        if (section.ref.current) {
          const top = section.ref.current.offsetTop;
          const height = section.ref.current.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  React.useEffect(() => {
    if (!pageData) return;
    const interval = setInterval(() => setMetaIndex((prev) => (prev + 1) % 3), 3000);
    return () => clearInterval(interval);
  }, [pageData]);

  if (!pageData && isLoading) return <ProductPageSkeleton />;
  if (!pageData) return null;

  const product = pageData.product;
  const sellersGroup = pageData.shopProducts || {};

  const getSellersForCondition = () => {
    if (selectedCondition === 'Stock') {
      return {
        nominated: sellersGroup.stockNominated || null,
        online: sellersGroup.stockOnline || [],
        local: sellersGroup.stockLocal || [],
      };
    }
    if (selectedCondition === 'TakeOff') {
      return {
        nominated: sellersGroup.takeOffNominated || null,
        online: sellersGroup.takeOffOnline || [],
        local: sellersGroup.takeOffLocal || [],
      };
    }
    return {
      nominated: sellersGroup.newNominated || null,
      online: sellersGroup.newOnline || [],
      local: sellersGroup.newLocal || [],
    };
  };

  const activeSellers = getSellersForCondition();
  const allAvailableSellersList = [...(activeSellers.online || []), ...(activeSellers.local || [])];

  const currentSelectedSeller =
    allAvailableSellersList.find((s) => s.id === activeSellerId) ||
    activeSellers.nominated ||
    allAvailableSellersList[0] ||
    null;

  const galleryImages = React.useMemo(() => {
    const all = [product.image, ...(product.gallery || [])].filter(Boolean) as string[];
    return Array.from(new Set(all));
  }, [product.image, product.gallery]);

  const handleScrollToSection = (ref: React.RefObject<HTMLDivElement | null>, sectionId: string) => {
    if (ref.current) {
      const offsetValue = window.innerWidth < 1024 ? 144 : 188;
      const topOffset = ref.current.getBoundingClientRect().top + window.scrollY - offsetValue;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const handleMobileAddToBasket = async () => {
    if (!currentSelectedSeller) return;
    setIsMobileSubmitting(true);
    try {
      await addToBasket.mutateAsync({ shopProductId: currentSelectedSeller.id, quantity: 1 });
      showToast.success('قطعه با موفقیت به سبد خرید شما افزوده شد');
    } catch {} finally {
      setIsMobileSubmitting(false);
    }
  };

  const handleNotifyMe = async () => {
    if (isNotifying) return;
    setIsNotifying(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setLottieKey((k) => k + 1);
      setIsNotifySuccessOpen(true);
    } finally {
      setIsNotifying(false);
    }
  };

  const originalPriceRaw = currentSelectedSeller?.retailPriceRaw || 0;
  const finalPriceRaw = currentSelectedSeller?.finalPriceRaw || 0;
  const calculatedPercent =
    originalPriceRaw > finalPriceRaw
      ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100)
      : 0;

  const discountPercentage = currentSelectedSeller?.discountPercentage || calculatedPercent || 0;
  const hasDiscount = !!(currentSelectedSeller?.hasDiscount && discountPercentage > 0);
  const discountExpiration = (currentSelectedSeller as any)?.discountUntil || null;
  const hasTimedDiscount = hasDiscount && !!discountExpiration;

  const metaItems = [
    `فروشگاه: ${currentSelectedSeller?.shop?.title || 'یدک‌چی'}`,
    `${toPersianDigits(product.views || 0)} بازدید اخیر`,
    `${toPersianDigits(product.salesCount || 0)} خرید موفق`,
  ];

  const leftPriceContent = currentSelectedSeller ? (
    <div className="flex h-10 w-36 max-w-[150px] select-none flex-col justify-between">
      <div className="relative h-4 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={metaIndex}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute block w-full truncate text-2xs font-bold leading-none text-muted-foreground"
          >
            {metaItems[metaIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex flex-col">
        {currentSelectedSeller.hasDiscount ? (
          <span className="mb-0.5 text-2xs leading-none text-muted-foreground line-through">
            {currentSelectedSeller.retailPrice}
          </span>
        ) : null}
        <span className="text-xs font-bold leading-none text-foreground md:text-sm">
          {currentSelectedSeller.finalPrice}
        </span>
      </div>
    </div>
  ) : null;

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex w-full select-none items-center gap-1.5 overflow-x-auto py-1.5 text-2xs text-muted-foreground scrollbar-none md:text-xs">
        <Link href="/" className="transition-colors hover:text-primary">
          خانه
        </Link>
        {product.breadCrumbs?.map((crumb: any, idx: number) => {
          const isLast = idx === product.breadCrumbs.length - 1;
          const url = isLast
            ? getProductUrl(product.code, product.title)
            : `/part-category/${crumb.englishTitle}`;
          return (
            <div key={crumb.id || idx} className="flex items-center gap-1.5">
              <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {isLast ? (
                <span className="max-w-[180px] truncate font-bold text-foreground md:max-w-none">
                  {crumb.title}
                </span>
              ) : (
                <Link href={url} className="whitespace-nowrap transition-colors hover:text-primary">
                  {crumb.title}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex w-full flex-col items-start gap-8 lg:flex-row">
        <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
          <div className="flex w-full flex-col gap-6 md:flex-row md:gap-8">
            <div className="w-full shrink-0 md:w-[45%]">
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
                onScrollToComments={() => handleScrollToSection(commentsRef, 'comments')}
                onScrollToInquiries={() => handleScrollToSection(inquiriesRef, 'inquiries')}
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
                onSeeAll={() => handleScrollToSection(specsRef, 'specs')}
              />

              <PickupAlert />
            </div>
          </div>

          <SellersList
            activeSellers={activeSellers}
            selectedSellerId={currentSelectedSeller?.id || null}
            onSelectSeller={(id) => setActiveSellerId(id)}
            productTitle={product.title}
          />

          <div className="sticky top-[64px] z-30 mt-6 flex w-full items-center gap-6 overflow-x-auto border-b border-border bg-card px-1 py-2.5 shadow-xs scrollbar-none transition-colors duration-normal lg:top-[76px]">
            {[
              { id: 'intro', label: 'معرفی کالا', ref: introRef },
              { id: 'specs', label: 'مشخصات فنی', ref: specsRef },
              { id: 'comments', label: 'امتیاز و نظرات کاربران', ref: commentsRef },
              { id: 'inquiries', label: 'پرسش و پاسخ', ref: inquiriesRef },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleScrollToSection(tab.ref, tab.id)}
                className={cn(
                  'shrink-0 border-b-2 pb-2 text-xs font-bold transition-colors md:text-sm',
                  activeSection === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div ref={introRef} className="border-b border-border pb-6 pt-6">
            <h3 className="mb-3 text-sm font-bold text-foreground md:text-base">معرفی کالا</h3>
            <div className="relative">
              <div
                style={{ maxHeight: isIntroExpanded ? 'none' : '110px' }}
                className="overflow-hidden text-justify text-xs leading-reading text-muted-foreground transition-all duration-normal md:text-sm"
                dangerouslySetInnerHTML={{
                  __html: product.description || 'توضیحی برای این کالا ثبت نشده است.',
                }}
              />
              {!isIntroExpanded ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background to-transparent" />
              ) : null}
            </div>
            <div className="mt-3 flex justify-start">
              <button
                type="button"
                onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                className="flex items-center gap-0.5 text-xs font-bold text-shop hover:underline"
              >
                <span>{isIntroExpanded ? 'مشاهده کمتر' : 'مشاهده بیشتر'}</span>
                {isIntroExpanded ? (
                  <ChevronUp aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <ChevronDown aria-hidden="true" className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div ref={specsRef} className="border-b border-border pb-6 pt-8">
            <ProductSpecsTable specGroups={product.specGroups} />
          </div>

          <div ref={commentsRef} className="border-b border-border pb-6 pt-8">
            <ProductCommentsSection productId={product.id} />
          </div>

          <div ref={inquiriesRef} className="pt-8">
            <ProductInquiriesSection productId={product.id} />
          </div>

          <div className="mt-6 w-full lg:hidden">
            <ProductSideInvoice
              product={product}
              seller={currentSelectedSeller}
              sellersCount={allAvailableSellersList.length}
            />
          </div>
        </div>

        <div className="hidden w-[320px] shrink-0 flex-col gap-6 lg:sticky lg:top-[132px] lg:flex xl:w-[340px]">
          <ProductSideInvoice
            product={product}
            seller={currentSelectedSeller}
            sellersCount={allAvailableSellersList.length}
          />
        </div>
      </div>

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
      />

      <Modal
        isOpen={isNotifySuccessOpen}
        onClose={() => setIsNotifySuccessOpen(false)}
        className="w-full max-w-md"
      >
        <ModalBody className="flex flex-col items-center justify-center gap-3 p-6 pt-4 text-center">
          <div className="mx-auto -mt-2 mb-1 h-56 w-56 max-w-full">
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
              className="h-10 w-full text-xs font-bold"
            >
              متوجه شدم
            </Button>

            <Link
              href="/search"
              className="py-1 text-center text-xs font-bold text-shop hover:underline"
              onClick={() => setIsNotifySuccessOpen(false)}
            >
              جستجوی قطعات در یدک‌چی
            </Link>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
