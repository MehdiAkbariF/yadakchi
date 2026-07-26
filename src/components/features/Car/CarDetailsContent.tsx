'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useGetCarPage } from '@/domains/front/reference/car/hooks/car.hooks';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchSidebar } from '@/components/features/ProductGrid/SearchSidebar';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { PageDescription } from '@/components/composites/PageDescription/PageDescription';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { CarHeaderCard } from './components/CarHeaderCard';
import { Typography } from '@/components/primitives/Typography';
import { useAppStore } from '@/shared/store/useAppStore';
import { SortSelector } from '@/components/composites/SortSelector/SortSelector';
import { ShoppingBag } from 'lucide-react';

interface CarDetailsContentProps {
  slug: string;
}

export function CarDetailsContent({ slug }: CarDetailsContentProps) {
  const router = useRouter();
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // تبدیل خط تیره‌ها به فاصله معمولی جهت ارسال مقدار صحیح به درخواست‌های API
  const decodedCarModel = decodeURIComponent(slug).replace(/-/g, ' ');

  const { filters, setFilter, clearFilters } = useSearchFilters();
  const currentFilters = { ...filters, carModel: decodedCarModel };

  const { data: carData } = useGetCarPage(decodedCarModel);
  const { data: productsResponse, isLoading: isProductsLoading } = useSearchProducts(currentFilters);

  const products = productsResponse?.items || [];
  const totalCount = productsResponse?.totalCount || 0;
  const totalPages = productsResponse?.totalPages || 1;

  const rawBreadcrumbs = (carData as any)?.breadCrumbs || [];
  const breadcrumbItems = [
    { id: 'cars-root', title: 'خودروها', href: '/search' },
    ...rawBreadcrumbs.map((b: any) => ({
      id: b.id,
      title: b.title,
      href: undefined
    }))
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-right" dir="rtl">
      
      {/* هدر چسبان موبایل مجهز به دکمه‌های قرینه فیلتر و مرتب‌سازی در کنار هم */}
      <div 
        style={{
          top: isHeaderMinimized ? '56px' : '122px'
        }}
        className="md:hidden sticky z-40 bg-background border-b py-2.5 px-4 w-full flex 
        items-center justify-between  select-none gap-3 mt-1 shrink-0 transition-all duration-300"
      >
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center justify-center gap-1.5 border rounded-xl py-2 px-3 bg-background hover:bg-muted text-xs font-bold font-iran-sans text-foreground flex-1 h-9 shadow-sm outline-none"
        >
          <span className="truncate">فیلترها</span>
        </button>

        {/* دکمه تریگر مرتب‌سازی پنهان که با دکمه فیلتر در هدر چسبان کاملاً هماهنگ است */}
        <SortSelector
          value={filters.orderType || 'Selected'}
          onChange={(val) => setFilter('sort', val)}
          variant="trigger"
        />

        <span className="text-[10px] font-bold font-iran-sans text-muted-foreground bg-muted px-2.5 py-2 rounded-xl shrink-0 h-9 flex items-center justify-center">
          {new Intl.NumberFormat('fa-IR').format(totalCount)} کالا
        </span>
      </div>

      <Breadcrumb items={breadcrumbItems} className="px-4 md:px-0" />

      <div className="w-full flex items-start gap-6 md:gap-8">
        
        <SearchSidebar
          filters={currentFilters}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          hidePartFilter={true}
        />

        <div className="flex-1 flex flex-col items-stretch gap-6">
          
          <CarHeaderCard 
            slug={slug}
            carName={carData?.model || 'خودرو انتخاب شده'}
            carCover={carData?.cover || null}
          />

          {/* نمایش کپسول‌های مرتب‌سازی افقی به صورت اختصاصی فقط در دسکتاپ */}
          <div className="hidden md:block">
            <SortSelector
              value={filters.orderType || 'Selected'}
              onChange={(val) => setFilter('sort', val)}
              className="mt-1"
            />
          </div>

          {isProductsLoading ? (
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
              <p className="text-xs text-muted-foreground mt-2 font-iran-sans">هنوز هیچ محصول فعالی برای این خودرو ثبت نشده است.</p>
            </div>
          )}
        </div>

      </div>

      {carData?.description && (
        <PageDescription 
          htmlContent={carData.description} 
          title={`راهنمای خرید و شناخت قطعات ${carData.model}`}
        />
      )}

    </div>
  );
}