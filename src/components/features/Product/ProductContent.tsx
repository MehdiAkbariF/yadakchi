'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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
import { ChevronLeft, ChevronDown, ChevronUp, ShoppingBag, Bell } from 'lucide-react';
import { showToast } from '@/core/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductContentProps {
  productCode: number;
  initialData?: any;
}

// ✅ کامپوننت لاتی با قابلیت پلی یک‌باره
function LottiePlayer({
  path,
  className = 'w-48 h-48',
  loop = false,
}: {
  path: string;
  className?: string;
  loop?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      } catch (e) {}
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
  const router = useRouter();
  const pathname = usePathname();

  const { data: clientData, isLoading } = useGetProductPageData(productCode);
  const pageData = clientData || initialData;

  const defaultCondition = useMemo((): 'New' | 'Stock' | 'TakeOff' => {
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

  const [selectedCondition, setSelectedCondition] = useState<'New' | 'Stock' | 'TakeOff'>(defaultCondition);
  const [activeSellerId, setActiveSellerId] = useState<string | null>(null);
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('intro');
  const [isMobileSubmitting, setIsMobileSubmitting] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isNotifySuccessOpen, setIsNotifySuccessOpen] = useState(false);
  const [lottieKey, setLottieKey] = useState(0);
  const [metaIndex, setMetaIndex] = useState(0);

  const addToBasket = useGlobalAddToBasket();

  const introRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const inquiriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageData && defaultCondition) {
      setSelectedCondition(defaultCondition);
    }
  }, [defaultCondition]);

  useEffect(() => {
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

  useEffect(() => {
    if (!pageData) return;
    const interval = setInterval(() => {
      setMetaIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, [pageData]);

  if (!pageData && isLoading) {
    return <ProductPageSkeleton />;
  }

  if (!pageData) {
    return null;
  }

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

  const galleryImages = useMemo(() => {
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
      await addToBasket.mutateAsync({
        shopProductId: currentSelectedSeller.id,
        quantity: 1,
      });
      showToast.success('قطعه با موفقیت به سبد خرید شما افزوده شد');
    } catch (err: any) {
    } finally {
      setIsMobileSubmitting(false);
    }
  };

  const handleNotifyMe = async () => {
    if (isNotifying) return;
    setIsNotifying(true);
    try {
      // await notifyMeMutation.mutateAsync({ productId: product.id });
      await new Promise((r) => setTimeout(r, 600));
      setLottieKey((k) => k + 1);
      setIsNotifySuccessOpen(true);
    } finally {
      setIsNotifying(false);
    }
  };

  const originalPriceRaw = currentSelectedSeller?.retailPriceRaw || 0;
  const finalPriceRaw = currentSelectedSeller?.finalPriceRaw || 0;
  const calculatedPercent = originalPriceRaw > finalPriceRaw
    ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100)
    : 0;

  const discountPercentage = currentSelectedSeller?.discountPercentage || calculatedPercent || 0;
  const hasDiscount = !!(currentSelectedSeller?.hasDiscount && discountPercentage > 0);

  const discountExpiration = (currentSelectedSeller as any)?.discountUntil || null;
  const hasTimedDiscount = hasDiscount && !!discountExpiration;

  const metaItems = [
    `فروشگاه: ${currentSelectedSeller?.shop?.title || 'یدک‌چی'}`,
    `${toPersianDigits(product.views || 0)} بازدید اخیر`,
    `${toPersianDigits(product.salesCount || 0)} خرید موفق`
  ];

  const leftPriceContent = currentSelectedSeller ? (
    <div className="flex flex-col text-right h-10 justify-between select-none w-36 max-w-[150px]">
      <div className="h-4 overflow-hidden relative w-full">
        <AnimatePresence mode="wait">
          <motion.span
            key={metaIndex}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute text-[9px] font-bold text-muted-foreground font-iran-yekan truncate block w-full leading-none"
          >
            {metaItems[metaIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex flex-col">
        {currentSelectedSeller.hasDiscount && (
          <span className="text-[9px] text-zinc-400 line-through leading-none mb-0.5 font-iran-yekan">
            {currentSelectedSeller.retailPrice}
          </span>
        )}
        <span className="text-xs md:text-sm font-black text-foreground font-iran-yekan leading-none">
          {currentSelectedSeller.finalPrice}
        </span>
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="w-full flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground font-iran-yekan overflow-x-auto no-scrollbar py-1.5 select-none">
        <Link href="/" className="hover:text-primary transition-colors">
          خانه
        </Link>
        {product.breadCrumbs?.map((crumb: any, idx: number) => {
          const isLast = idx === product.breadCrumbs.length - 1;
          const url = isLast ? getProductUrl(product.code, product.title) : `/part-category/${crumb.englishTitle}`;

          return (
            <div key={crumb.id || idx} className="flex items-center gap-1.5">
              <ChevronLeft className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-700 shrink-0" />
              {isLast ? (
                <span className="text-foreground font-bold truncate max-w-[180px] md:max-w-none">
                  {crumb.title}
                </span>
              ) : (
                <Link href={url} className="hover:text-primary transition-colors whitespace-nowrap">
                  {crumb.title}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="w-full flex flex-col lg:flex-row items-start gap-8">
        <div className="flex-1 min-w-0 flex flex-col w-full gap-6">
          <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="w-full md:w-[45%] shrink-0">
              <ProductGallery
                images={galleryImages}
                title={product.title}
                hasDiscount={hasDiscount}
                discountPercent={discountPercentage}
                hasTimedDiscount={hasTimedDiscount}
                discountExpiration={discountExpiration}
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-5">
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

          {/* Tabs sticky */}
          <div className="sticky top-[64px] lg:top-[76px] z-30 bg-background border-b flex items-center gap-6 overflow-x-auto no-scrollbar py-2.5 w-full mt-6 shadow-sm transition-all duration-300 px-1 outline-none">
            <button
              onClick={() => handleScrollToSection(introRef, 'intro')}
              className={cn(
                'text-xs md:text-sm font-bold font-iran-yekan pb-2 border-b-2 shrink-0 transition-colors',
                activeSection === 'intro' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent'
              )}
            >
              معرفی کالا
            </button>
            <button
              onClick={() => handleScrollToSection(specsRef, 'specs')}
              className={cn(
                'text-xs md:text-sm font-bold font-iran-yekan pb-2 border-b-2 shrink-0 transition-colors',
                activeSection === 'specs' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent'
              )}
            >
              مشخصات فنی
            </button>
            <button
              onClick={() => handleScrollToSection(commentsRef, 'comments')}
              className={cn(
                'text-xs md:text-sm font-bold font-iran-yekan pb-2 border-b-2 shrink-0 transition-colors',
                activeSection === 'comments' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent'
              )}
            >
              امتیاز و نظرات کاربران
            </button>
            <button
              onClick={() => handleScrollToSection(inquiriesRef, 'inquiries')}
              className={cn(
                'text-xs md:text-sm font-bold font-iran-yekan pb-2 border-b-2 shrink-0 transition-colors',
                activeSection === 'inquiries' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent'
              )}
            >
              پرسش و پاسخ
            </button>
          </div>

          <div ref={introRef} className="pt-6 pb-6 border-b">
            <h3 className="text-sm md:text-base font-bold font-iran-yekan text-foreground mb-3">معرفی کالا</h3>
            <div className="relative">
              <div
                style={{
                  maxHeight: isIntroExpanded ? 'none' : '110px',
                  lineHeight: 2.15,
                }}
                className="text-xs md:text-sm text-muted-foreground text-justify font-iran-yekan overflow-hidden transition-all duration-300"
                dangerouslySetInnerHTML={{ __html: product.description || 'توضیحی برای این کالا ثبت نشده است.' }}
              />
              {!isIntroExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-background to-transparent pointer-events-none" />
              )}
            </div>
            <div className="flex justify-start mt-3">
              <button
                onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                className="flex items-center gap-0.5 text-xs font-bold text-shop hover:underline"
              >
                <span>{isIntroExpanded ? 'مشاهده کمتر' : 'مشاهده بیشتر'}</span>
                {isIntroExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div ref={specsRef} className="pt-8 pb-6 border-b">
            <ProductSpecsTable specGroups={product.specGroups} />
          </div>

          <div ref={commentsRef} className="pt-8 pb-6 border-b">
            <ProductCommentsSection productId={product.id} />
          </div>

          <div ref={inquiriesRef} className="pt-8">
            <ProductInquiriesSection productId={product.id} />
          </div>

          <div className="lg:hidden w-full mt-6">
            <ProductSideInvoice
              product={product}
              seller={currentSelectedSeller}
              sellersCount={allAvailableSellersList.length}
            />
          </div>
        </div>

        <div className="hidden lg:flex w-[320px] xl:w-[340px] shrink-0 lg:sticky lg:top-[132px] flex flex-col gap-6">
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
          if (currentSelectedSeller) {
            handleMobileAddToBasket();
          } else {
            handleNotifyMe();
          }
        }}
        disabled={false}
        isLoading={currentSelectedSeller ? isMobileSubmitting : isNotifying}
        icon={
          currentSelectedSeller
            ? <ShoppingBag className="h-4 w-4" />
            : <Bell className="h-5 w-5" />
        }
        forceShowKey={selectedCondition}
      />

      {/* ✅ مودال موفقیت «موجود شد خبرم کن» برای موبایل */}
      <Modal
        isOpen={isNotifySuccessOpen}
        onClose={() => setIsNotifySuccessOpen(false)}
        className="max-w-md w-full animate-none"
      >
        <ModalBody className="p-6 pt-4 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-56 h-56 max-w-full mx-auto -mt-2 mb-1">
            <LottiePlayer
              key={lottieKey}
              path="/anumations/notif-success.json"
              className="w-full h-full"
              loop={false}
            />
          </div>

          <h4 className="text-base font-black text-foreground font-iran-yekan leading-relaxed">
            درخواست شما با موفقیت ثبت شد!
          </h4>

          <p className="text-xs md:text-sm text-foreground font-iran-yekan leading-loose text-center">
            به‌محض موجود شدن این کالا، به شما اطلاع می‌دیم.
          </p>

          <p className="text-xs text-muted-foreground font-iran-yekan leading-relaxed text-center max-w-xs mx-auto">
            تا اون موقع، می‌تونید قطعات موردنیاز خودروتون رو در یدکچی جستجو و قیمت‌ها رو مقایسه کنید.
          </p>

          <div className="flex flex-col w-full gap-2 mt-3">
            <Button
              variant="primary"
              onClick={() => setIsNotifySuccessOpen(false)}
              className="w-full rounded-xl text-xs h-10 font-bold font-iran-yekan shadow-sm"
            >
              متوجه شدم
            </Button>

            <Link
              href="/search"
              className="text-xs font-bold text-shop hover:underline font-iran-yekan text-center py-1"
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