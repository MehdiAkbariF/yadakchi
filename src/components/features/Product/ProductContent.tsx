'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
import { getProductUrl, toPersianDigits } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';
import { ChevronLeft, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { showToast } from '@/core/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ProductContentProps {
  productCode: number;
}

export function ProductContent({ productCode }: ProductContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: pageData, isLoading } = useGetProductPageData(productCode);
  const [selectedCondition, setSelectedCondition] = useState<'New' | 'Stock' | 'TakeOff'>('New');
  const [activeSellerId, setActiveSellerId] = useState<string | null>(null);
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('intro');
  const [isMobileSubmitting, setIsMobileSubmitting] = useState(false);
  const [metaIndex, setMetaIndex] = useState(0);

  const addToBasket = useGlobalAddToBasket();

  const introRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const inquiriesRef = useRef<HTMLDivElement>(null);

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

  if (isLoading || !pageData) {
    return <ProductPageSkeleton />;
  }

  const product = pageData.product;
  const sellersGroup = pageData.shopProducts;

  const getSellersForCondition = () => {
    if (selectedCondition === 'Stock') {
      return {
        nominated: sellersGroup.stockNominated,
        online: sellersGroup.stockOnline,
        local: sellersGroup.stockLocal,
      };
    }
    if (selectedCondition === 'TakeOff') {
      return {
        nominated: sellersGroup.takeOffNominated,
        online: sellersGroup.takeOffOnline,
        local: sellersGroup.takeOffLocal,
      };
    }
    return {
      nominated: sellersGroup.newNominated,
      online: sellersGroup.newOnline,
      local: sellersGroup.newLocal,
    };
  };

  const activeSellers = getSellersForCondition();
  const allAvailableSellersList = [...activeSellers.online, ...activeSellers.local];

  const currentSelectedSeller =
    allAvailableSellersList.find((s) => s.id === activeSellerId) ||
    activeSellers.nominated ||
    allAvailableSellersList[0] ||
    null;

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

  const galleryImages = product.gallery.length > 0 ? product.gallery : [product.image];

  const originalPriceRaw = currentSelectedSeller?.retailPriceRaw || 0;
  const finalPriceRaw = currentSelectedSeller?.finalPriceRaw || 0;
  const calculatedPercent = originalPriceRaw > finalPriceRaw
    ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100)
    : 0;

  const discountPercentage = currentSelectedSeller?.discountPercentage || calculatedPercent || 0;
  const hasDiscount = !!(currentSelectedSeller?.hasDiscount && discountPercentage > 0);

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
  ) : (
    <span className="text-destructive font-bold text-xs font-iran-yekan">ناموجود</span>
  );

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="w-full flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground font-iran-yekan overflow-x-auto no-scrollbar py-1.5 select-none">
        <Link href="/" className="hover:text-primary transition-colors">
          خانه
        </Link>
        {product.breadCrumbs.map((crumb, idx) => {
          const isLast = idx === product.breadCrumbs.length - 1;
          const url = isLast ? getProductUrl(product.code, product.title) : `/part-category/${crumb.englishTitle}`;

          return (
            <div key={crumb.id} className="flex items-center gap-1.5">
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

              <SpecHighlights specGroups={product.specGroups} />

              <PickupAlert />
            </div>
          </div>

          <SellersList
            activeSellers={activeSellers}
            selectedSellerId={currentSelectedSeller?.id || null}
            onSelectSeller={(id) => setActiveSellerId(id)}
            productTitle={product.title}
          />

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

          <div ref={introRef} className="pt-6">
            <h3 className="text-sm md:text-base font-bold font-iran-yekan text-foreground mb-3">معرفی کالا</h3>
            <div className="relative">
              <div 
                style={{ maxHeight: isIntroExpanded ? 'none' : '110px' }}
                className="text-xs md:text-sm leading-relaxed text-muted-foreground text-justify font-iran-yekan overflow-hidden transition-all duration-300"
                dangerouslySetInnerHTML={{ __html: product.description || 'توضیحی برای این کالا ثبت نشده است.' }}
              />
              {!isIntroExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-background to-transparent pointer-events-none" />
              )}
            </div>
            <div className="flex justify-center mt-3">
              <button
                onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                className="flex items-center gap-0.5 text-xs font-bold text-primary hover:underline"
              >
                <span>{isIntroExpanded ? 'نمایش کمتر' : 'نمایش بیشتر'}</span>
                {isIntroExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div ref={specsRef} className="pt-8">
            <ProductSpecsTable specGroups={product.specGroups} />
          </div>

          <div ref={commentsRef} className="pt-8">
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
        label={currentSelectedSeller ? 'افزودن به سبد خرید' : 'ناموجود'}
        leftContent={leftPriceContent}
        onClick={() => {
          if (currentSelectedSeller) {
            handleMobileAddToBasket();
          }
        }}
        disabled={!currentSelectedSeller}
        isLoading={isMobileSubmitting}
        icon={currentSelectedSeller ? <ShoppingBag className="h-4 w-4" /> : null}
        forceShowKey={selectedCondition}
      />
    </div>
  );
}