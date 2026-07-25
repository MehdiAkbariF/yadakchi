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
import { BottomSheet } from '@/components/composites/BottomSheet/BottomSheet';
import { PageDescription } from '@/components/composites/PageDescription/PageDescription';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { CarHeaderCard } from './components/CarHeaderCard';
import { Typography } from '@/components/primitives/Typography';
import { useAppStore } from '@/shared/store/useAppStore';
import { Check, ShoppingBag } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

interface CarDetailsContentProps {
  slug: string;
}

const SORT_OPTIONS = [
  { value: 'Selected', label: 'منتخب' },
  { value: 'MostVisited', label: 'پربازدیدترین' },
  { value: 'Newest', label: 'جدیدترین' },
  { value: 'BestSelling', label: 'پرفروش‌ترین' },
  { value: 'Cheapest', label: 'ارزان‌ترین' },
  { value: 'MostExpensive', label: 'گران‌ترین' },
];

export function CarDetailsContent({ slug }: CarDetailsContentProps) {
  const router = useRouter();
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);

  const { filters, setFilter, clearFilters } = useSearchFilters();
  const currentFilters = { ...filters, carModel: slug };

  const { data: carData } = useGetCarPage(slug);
  const { data: productsResponse, isLoading: isProductsLoading } = useSearchProducts(currentFilters);

  const products = productsResponse?.items || [];
  const totalCount = productsResponse?.totalCount || 0;
  const totalPages = productsResponse?.totalPages || 1;

  const handleMobileSortSelect = (value: string) => {
    setFilter('sort', value);
    setIsMobileSortOpen(false);
  };

  const activeSortLabel = SORT_OPTIONS.find(o => o.value === (filters.orderType || 'Selected'))?.label || 'منتخب';

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
      
      <div 
        style={{
          top: isHeaderMinimized ? '56px' : '122px'
        }}
        className="md:hidden sticky z-40 bg-background border-b py-2.5 px-4 w-full flex items-center justify-between shadow-sm select-none gap-3 mt-1 shrink-0"
      >
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center justify-center gap-1.5 border rounded-xl py-2 px-3 bg-background hover:bg-muted text-xs font-bold font-iran-sans text-foreground flex-1 shadow-sm outline-none"
        >
          <span className="truncate">فیلترها</span>
        </button>
        <button
          onClick={() => setIsMobileSortOpen(true)}
          className="flex items-center justify-center gap-1.5 border rounded-xl py-2 px-3 bg-background hover:bg-muted text-xs font-bold font-iran-sans text-foreground flex-1 shadow-sm outline-none"
        >
          <span className="truncate">{activeSortLabel}</span>
        </button>
        <span className="text-[10px] font-bold font-iran-sans text-muted-foreground bg-muted px-2.5 py-2 rounded-xl shrink-0">
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

          <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar py-1 border-b pb-3">
            <span className="text-xs font-bold font-iran-sans text-muted-foreground whitespace-nowrap ml-2">
              مرتب‌سازی محصولات خودرو:
            </span>
            <div className="flex items-center gap-2">
              {SORT_OPTIONS.map((opt) => {
                const isActive = (filters.orderType || 'Selected') === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFilter('sort', opt.value)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-bold font-iran-sans transition-all whitespace-nowrap outline-none",
                      isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
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

      <BottomSheet
        isOpen={isMobileSortOpen}
        onClose={() => setIsMobileSortOpen(false)}
        title="مرتب‌سازی بر اساس"
      >
        <div className="flex flex-col w-full text-right divide-y dark:divide-zinc-800">
          {SORT_OPTIONS.map((opt) => {
            const isActive = (filters.orderType || 'Selected') === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleMobileSortSelect(opt.value)}
                className={cn(
                  "flex items-center justify-between w-full py-4 text-sm font-bold font-iran-sans transition-colors outline-none",
                  isActive ? "text-primary" : "text-foreground"
                )}
              >
                <span>{opt.label}</span>
                {isActive && <Check className="h-4.5 w-4.5 text-primary stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </BottomSheet>

    </div>
  );
}