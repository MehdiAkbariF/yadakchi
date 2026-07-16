'use client';

import { useState, useRef } from 'react';
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

interface ProductContentProps {
  productCode: number;
}

export function ProductContent({ productCode }: ProductContentProps) {
  const { data: pageData, isLoading } = useGetProductPageData(productCode);
  const [selectedCondition, setSelectedCondition] = useState<'New' | 'Stock' | 'TakeOff'>('New');
  const [activeSellerId, setActiveSellerId] = useState<string | null>(null);

  const introRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const inquiriesRef = useRef<HTMLDivElement>(null);

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

  const handleScrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  return (
    <div className="w-full flex flex-col gap-8 text-right select-none" dir="rtl">
      
      <div className="w-full flex flex-col lg:flex-row items-start gap-8">
        
        <div className="flex-1 flex flex-col gap-6 w-full lg:max-w-[70%]">
          
          <ProductHeader 
            product={product} 
            onScrollToComments={() => handleScrollToSection(commentsRef)}
            onScrollToInquiries={() => handleScrollToSection(inquiriesRef)}
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

          <SellersList 
            activeSellers={activeSellers}
            selectedSellerId={currentSelectedSeller?.id || null}
            onSelectSeller={(id) => setActiveSellerId(id)}
          />

          <div className="border-b flex items-center gap-6 overflow-x-auto no-scrollbar py-2 w-full mt-4">
            <button onClick={() => handleScrollToSection(introRef)} className="text-xs md:text-sm font-bold font-iran-sans text-muted-foreground hover:text-primary pb-2 border-b-2 border-transparent hover:border-primary shrink-0 transition-colors">معرفی کالا</button>
            <button onClick={() => handleScrollToSection(specsRef)} className="text-xs md:text-sm font-bold font-iran-sans text-muted-foreground hover:text-primary pb-2 border-b-2 border-transparent hover:border-primary shrink-0 transition-colors">مشخصات فنی</button>
            <button onClick={() => handleScrollToSection(commentsRef)} className="text-xs md:text-sm font-bold font-iran-sans text-muted-foreground hover:text-primary pb-2 border-b-2 border-transparent hover:border-primary shrink-0 transition-colors">امتیاز و نظرات کاربران</button>
            <button onClick={() => handleScrollToSection(inquiriesRef)} className="text-xs md:text-sm font-bold font-iran-sans text-muted-foreground hover:text-primary pb-2 border-b-2 border-transparent hover:border-primary shrink-0 transition-colors">پرسش و پاسخ</button>
          </div>

          <div ref={introRef} className="pt-6">
            <h3 className="text-sm md:text-base font-bold font-iran-yekan text-foreground mb-3">معرفی کالا</h3>
            <div 
              className="text-xs md:text-sm leading-relaxed text-muted-foreground text-justify"
              dangerouslySetInnerHTML={{ __html: product.description || 'توضیحی برای این کالا ثبت نشده است.' }}
            />
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

        <div className="w-full lg:w-[30%] shrink-0 lg:sticky lg:top-[132px] flex flex-col gap-6">
          <div className="w-full aspect-[4/3] rounded-2xl border p-4 bg-background flex items-center justify-center overflow-hidden shadow-sm">
            <img 
              src={getFullUrl(product.image)} 
              alt={product.imageAlt} 
              className="w-full h-full object-contain"
            />
          </div>

          {currentSelectedSeller && (
            <ProductSideInvoice 
              product={product}
              seller={currentSelectedSeller} 
            />
          )}
        </div>

      </div>

    </div>
  );
}