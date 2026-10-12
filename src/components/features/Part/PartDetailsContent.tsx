// src/components/features/Part/PartDetailsContent.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useGetPartPage } from '@/domains/front/part/hooks/part.hooks';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchSidebar } from '@/components/features/ProductGrid/SearchSidebar';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { PageDescription } from '@/components/composites/PageDescription/PageDescription';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { PartHeaderCard } from './components/PartHeaderCard';
import { Typography } from '@/components/primitives/Typography';
import { useAppStore } from '@/shared/store/useAppStore';
import { SortSelector } from '@/components/composites/SortSelector/SortSelector';
import { ShopProductAdBanner } from '@/components/features/ProductCard/ShopProductAdBanner';
import { SelectPartModal } from './components/SelectPartModal';
import { ShoppingBag, Settings, ListFilter, X } from 'lucide-react';

import { getFullUrl } from '@/core/utils/formatters';
interface PartDetailsContentProps {
  categorySlug: string;
  partSlug: string;
}

export function PartDetailsContent({ categorySlug, partSlug }: PartDetailsContentProps) {
  const router = useRouter();
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isSelectPartOpen, setIsSelectPartOpen] = useState(false);

  const { filters, setFilter, clearFilters } = useSearchFilters();
  const currentFilters = { 
    ...filters, 
    partCategoryEnglishTitle: categorySlug, 
    partEnglishTitle: partSlug 
  };

  const { data: partData } = useGetPartPage(partSlug);
  const { data: productsResponse, isLoading } = useSearchProducts(currentFilters);

  const products = productsResponse?.items || [];
  const totalCount = productsResponse?.totalCount || 0;
  const totalPages = productsResponse?.totalPages || 1;

  const rawBreadcrumbs = (partData as any)?.breadCrumbs || [];
  const breadcrumbItems = [
    { id: 'categories-root', title: 'دسته‌بندی‌ها', href: '/categories' },
    ...rawBreadcrumbs.map((b: any, idx: number) => {
      const isLast = idx === rawBreadcrumbs.length - 1;
      return {
        id: b.id,
        title: b.title,
        href: isLast ? undefined : `/part-category/${b.englishTitle}`
      };
    })
  ];

  /*
    تابع کمکی و ایمن تبدیل آدرس عکس بک‌اند (سازگار با مقدار undefined و رفع خطای ts-2345):
  */
  return (
    <div className="w-full flex flex-col gap-6 text-right" dir="rtl">
      
      {/* 
        هدر تلفیقی میکرو چسبان مخصوص موبایل (Micro-Header Integration):
        بجای اشغال ۲۲۰ پیکسل، تمام بخش‌های بریدکرامب، مینی تایتل قطعه، دکمه تغییر و فیلترها را در یک باکس چسبان ۸۴ پیکسلی فشرده کرده‌ایم.
      */}
      <div 
        style={{
          top: isHeaderMinimized ? '56px' : '122px'
        }}
        className="md:hidden sticky z-40 bg-background border-b py-2.5 px-4 w-full flex flex-col gap-3 shadow-sm select-none transition-all duration-300 mt-1 shrink-0"
      >
        {/* ردیف اول: مینی آدرس و تغییر سریع قطعه منتخب */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-lg border bg-primary/5 flex items-center justify-center text-primary font-bold text-[10px] font-iran-yekan">
              یدک‌چی
            </div>
            <div className="flex flex-col min-w-0 text-right">
              <span className="text-[9px] text-muted-foreground font-bold leading-none">قطعه انتخابی</span>
              <span className="text-xs font-black text-foreground truncate mt-1 leading-none">{partData?.name || 'قطعه یدکی'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsSelectPartOpen(true)}
              className="text-[10px] font-black text-primary bg-primary/10 px-3.5 py-1.5 rounded-lg outline-none"
            >
              تغییر قطعه
            </button>
          </div>
        </div>

        {/* ردیف دوم: فیلترها و مرتب‌سازی در یک خط */}
        <div className="flex items-center justify-between gap-3 w-full border-t border-dashed pt-2.5">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center justify-center gap-1.5 border rounded-xl py-2 px-3 bg-background hover:bg-muted text-xs font-bold font-iran-sans text-foreground flex-1 h-9 shadow-sm outline-none"
          >
            <span className="truncate">فیلترها</span>
          </button>

          <SortSelector
            value={filters.orderType || 'Selected'}
            onChange={(val) => setFilter('sort', val)}
            variant="trigger"
          />

          <span className="text-[10px] font-bold font-iran-sans text-muted-foreground bg-muted px-2.5 py-2 rounded-xl shrink-0 h-9 flex items-center justify-center">
            {new Intl.NumberFormat('fa-IR').format(totalCount)} کالا
          </span>
        </div>
      </div>

      {/* بریدکرامب کلاسیک فقط در دسکتاپ نمایش داده می‌شود */}
      <Breadcrumb items={breadcrumbItems} className="hidden md:flex px-4 md:px-0" />

      <div className="w-full flex items-start gap-6 md:gap-8">
        
        <SearchSidebar
          filters={currentFilters}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          hidePartFilter={true}
          partId={partData?.id}
        />

        <div className="flex-1 flex flex-col items-stretch gap-6">
          
          {/* کارت بزرگ قطعه فقط در دسکتاپ رندر می‌شود */}
          <div className="hidden md:block">
            <PartHeaderCard 
              partSlug={partSlug}
              categorySlug={categorySlug}
              partName={partData?.name || 'پمپ بنزین با درجه باک'}
            />
          </div>

          <div className="block lg:hidden w-full">
            <ShopProductAdBanner partId={partData?.id} />
          </div>

          <div className="hidden md:block">
            <SortSelector
              value={filters.orderType || 'Selected'}
              onChange={(val) => setFilter('sort', val)}
              className="mt-1"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {products.map((prod) => (
                  <ProductSearchCard key={prod.id} product={prod} />
                ))}
              </div>

              <Pagination
                currentPage={filters.pageNumber || 1}
                totalPages={totalPages}
                onPageChange={(page) => setFilter('page', page)}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center select-none bg-background rounded-xl border border-dashed mx-4 md:mx-0">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/60 stroke-[1.5] mb-4 animate-bounce" />
              <Typography variant="h4" className="font-iran-yekan font-extrabold text-foreground">کالایی یافت نشد</Typography>
              <p className="text-xs text-muted-foreground mt-2 font-iran-sans">لطفاً فیلترهای خود را تغییر داده یا مجدداً امتحان کنید.</p>
            </div>
          )}
        </div>

      </div>

      {partData?.description && (
        <PageDescription 
          htmlContent={partData.description} 
          title={`راهنمای خرید و شناخت ${partData.name}`}
        />
      )}

      <SelectPartModal
        isOpen={isSelectPartOpen}
        onClose={() => setIsSelectPartOpen(false)}
        slug={categorySlug}
        categoryName={partData?.name || 'قطعه یدکی'}
      />

    </div>
  );
}