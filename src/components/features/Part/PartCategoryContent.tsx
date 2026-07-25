'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useGetPartCategoryPage } from '@/domains/front/part/hooks/part.hooks';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchHeader } from '@/components/features/ProductGrid/SearchHeader';
import { SearchSidebar } from '@/components/features/ProductGrid/SearchSidebar';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { BottomSheet } from '@/components/composites/BottomSheet/BottomSheet';
import { PageDescription } from '@/components/composites/PageDescription/PageDescription';
import { Typography } from '@/components/primitives/Typography';
import { ShoppingBag, Check, ChevronLeft } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import Link from 'next/link';

interface PartCategoryContentProps {
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

export function PartCategoryContent({ slug }: PartCategoryContentProps) {
  const router = useRouter();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);

  const { filters, setFilter, clearFilters } = useSearchFilters();
  const currentFilters = { ...filters, partCategoryEnglishTitle: slug };

  const { data: categoryData } = useGetPartCategoryPage(slug);
  const { data: productsResponse, isLoading } = useSearchProducts(currentFilters);

  const products = productsResponse?.items || [];
  const totalCount = productsResponse?.totalCount || 0;
  const totalPages = productsResponse?.totalPages || 1;

  const handleMobileSortSelect = (value: string) => {
    setFilter('sort', value);
    setIsMobileSortOpen(false);
  };

  const activeSortLabel = SORT_OPTIONS.find(o => o.value === (filters.orderType || 'Selected'))?.label || 'منتخب';

  return (
    <div className="w-full flex flex-col gap-6 text-right" dir="rtl">
      
      <div className="w-full flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground font-iran-sans overflow-x-auto no-scrollbar py-1 select-none">
        <Link href="/" className="hover:text-primary transition-colors">خانه</Link>
        {categoryData?.breadCrumbs?.map((crumb: any, idx: number) => {
          const isLast = idx === categoryData.breadCrumbs.length - 1;
          return (
            <div key={crumb.id} className="flex items-center gap-1.5 shrink-0">
              <ChevronLeft className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
              {isLast ? (
                <span className="text-foreground font-bold">{crumb.title}</span>
              ) : (
                <Link href={`/part-category/${crumb.englishTitle}`} className="hover:text-primary transition-colors">
                  {crumb.title}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="md:hidden w-full bg-background border-b py-2.5 px-4 flex items-center justify-between shadow-sm select-none gap-3 mt-1 shrink-0">
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

      <div className="w-full flex items-start gap-6 md:gap-8">
        
        <SearchSidebar
          filters={currentFilters}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
        />

        <div className="flex-1 flex flex-col items-stretch gap-6">
          
          <div className="hidden md:block">
            <SearchHeader
              totalCount={totalCount}
              currentSort={filters.orderType || 'Selected'}
              onSortChange={(sort) => setFilter('sort', sort)}
              filters={currentFilters}
              searchTitle={categoryData?.category?.name}
              isMobileSticky={false}
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

      {categoryData?.category?.description && (
        <PageDescription 
          htmlContent={categoryData.category.description} 
          title={`راهنمای خرید و شناخت قطعات ${categoryData.category.name}`}
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