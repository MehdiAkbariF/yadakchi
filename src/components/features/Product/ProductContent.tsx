'use client';

import { useState, useRef, useEffect } from 'react';
import { useGetProductPageData } from '@/domains/front/product/hooks/product.hooks';
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
import { getProductUrl } from '@/core/utils/formatters';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/design-system/utils';

interface ProductContentProps {
  productCode: number;
}

export function ProductContent({ productCode }: ProductContentProps) {
  const { data: pageData, isLoading } = useGetProductPageData(productCode);
  const [selectedCondition, setSelectedCondition] = useState<'New' | 'Stock' | 'TakeOff'>('New');
  const [activeSellerId, setActiveSellerId] = useState<string | null>(null);
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('intro');

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
  
  const currentSelectedSeller = allAvailableSellersList.find(s => s.id === activeSellerId) 
    || activeSellers.nominated 
    || allAvailableSellersList[0] 
    || null;

  const handleScrollToSection = (ref: React.RefObject<HTMLDivElement>, sectionId: string) => {
    if (ref.current) {
      const offsetValue = window.innerWidth < 1024 ? 144 : 188;
      const topOffset = ref.current.getBoundingClientRect().top + window.scrollY - offsetValue;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const galleryImages = product.gallery.length > 0 ? product.gallery : [product.image];

  return (
    <div className="w-full flex flex-col gap-5 text-right select-none" dir="rtl">
      
      <div className="w-full flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground font-iran-sans overflow-x-auto no-scrollbar py-1.5 select-none">
        <Link href="/" className="hover:text-primary transition-colors">خانه</Link>
        {product.breadCrumbs.map((crumb, idx) => {
          const isLast = idx === product.breadCrumbs.length - 1;
          const url = isLast ? getProductUrl(product.code, product.title) : `/categories/${crumb.englishTitle}`;
          
          return (
            <div key={crumb.id} className="flex items-center gap-1.5">
              <ChevronLeft className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-700 shrink-0" />
              {isLast ? (
                <span className="text-foreground font-bold truncate max-w-[180px] md:max-w-none">{crumb.title}</span>
              ) : (
                <Link href={url} className="hover:text-primary transition-colors whitespace-nowrap">{crumb.title}</Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="w-full flex flex-col lg:flex-row items-start gap-8">
        
        <div className="flex-1 flex flex-col w-full lg:max-w-[70%] gap-6">
          
          <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8">
            
            <div className="w-full md:w-[45%] shrink-0">
              <ProductGallery 
                images={galleryImages} 
                title={product.title} 
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
          />

        </div>

        <div className="w-full lg:w-[30%] shrink-0 lg:sticky lg:top-[132px] flex flex-col gap-6">
          {currentSelectedSeller && (
            <ProductSideInvoice 
              product={product}
              seller={currentSelectedSeller} 
            />
          )}
        </div>

      </div>

      <div className="sticky top-[64px] lg:top-[76px] z-30 bg-background border-b flex items-center gap-6 overflow-x-auto no-scrollbar py-2.5 w-full mt-6 shadow-sm transition-all duration-300 px-1 animate-none outline-none">
        <button onClick={() => handleScrollToSection(introRef, 'intro')} className={cn(
          "text-xs md:text-sm font-bold font-iran-sans pb-2 border-b-2 shrink-0 transition-colors animate-none outline-none",
          activeSection === 'intro' ? "text-primary border-primary" : "text-muted-foreground border-transparent"
        )}>معرفی کالا</button>
        <button onClick={() => handleScrollToSection(specsRef, 'specs')} className={cn(
          "text-xs md:text-sm font-bold font-iran-sans pb-2 border-b-2 shrink-0 transition-colors animate-none outline-none",
          activeSection === 'specs' ? "text-primary border-primary" : "text-muted-foreground border-transparent"
        )}>مشخصات فنی</button>
        <button onClick={() => handleScrollToSection(commentsRef, 'comments')} className={cn(
          "text-xs md:text-sm font-bold font-iran-sans pb-2 border-b-2 shrink-0 transition-colors animate-none outline-none",
          activeSection === 'comments' ? "text-primary border-primary" : "text-muted-foreground border-transparent"
        )}>امتیاز و نظرات کاربران</button>
        <button onClick={() => handleScrollToSection(inquiriesRef, 'inquiries')} className={cn(
          "text-xs md:text-sm font-bold font-iran-sans pb-2 border-b-2 shrink-0 transition-colors animate-none outline-none",
          activeSection === 'inquiries' ? "text-primary border-primary" : "text-muted-foreground border-transparent"
        )}>پرسش و پاسخ</button>
      </div>

      <div ref={introRef} className="pt-6 relative">
        <h3 className="text-sm md:text-base font-bold font-iran-yekan text-foreground mb-3">معرفی کالا</h3>
        <div 
          style={{ maxHeight: isIntroExpanded ? 'none' : '110px' }}
          className="text-xs md:text-sm leading-relaxed text-muted-foreground text-justify font-iran-sans overflow-hidden transition-all duration-300 relative"
          dangerouslySetInnerHTML={{ __html: product.description || 'توضیحی برای این کالا ثبت نشده است.' }}
        />
        {!isIntroExpanded && (
          <div className="absolute bottom-10 left-0 right-0 h-14 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
        <div className="flex justify-center mt-3">
          <button
            onClick={() => setIsIntroExpanded(!isIntroExpanded)}
            className="flex items-center gap-0.5 text-xs font-bold text-primary hover:underline outline-none"
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

    </div>
  );
}