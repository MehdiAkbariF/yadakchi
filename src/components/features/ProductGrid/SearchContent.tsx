'use client';

import { useState } from 'react';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchHeader } from './SearchHeader';
import { SearchSidebar } from './SearchSidebar';
import { ProductSearchCard } from '../ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '../ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { BottomSheet } from '@/components/composites/BottomSheet/BottomSheet';
import { Typography } from '@/components/primitives/Typography';
import { ShoppingBag, Check } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

const SORT_OPTIONS = [
  { value: 'Selected', label: 'منتخب' },
  { value: 'MostVisited', label: 'پربازدیدترین' },
  { value: 'Newest', label: 'جدیدترین' },
  { value: 'BestSelling', label: 'پرفروش‌ترین' },
  { value: 'Cheapest', label: 'ارزان‌ترین' },
  { value: 'MostExpensive', label: 'گران‌ترین' },
];

export function SearchContent() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const { filters, setFilter, clearFilters } = useSearchFilters();
  const { data, isLoading } = useSearchProducts(filters);

  const productItems = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  const handleMobileSortSelect = (value: string) => {
    setFilter('sort', value);
    setIsMobileSortOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-6 relative">
      
      <SearchHeader
        totalCount={totalCount}
        currentSort={filters.orderType || 'Selected'}
        onSortChange={(sort) => setFilter('sort', sort)}
        filters={filters}
        onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
        onOpenMobileSort={() => setIsMobileSortOpen(true)}
        searchTitle={filters.searchTitle}
        isMobileSticky={true}
      />

      <div className="w-full flex items-start gap-6 md:gap-8">
        
        <SearchSidebar
          filters={filters}
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
              filters={filters}
              searchTitle={filters.searchTitle}
              isMobileSticky={false}
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(10)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : productItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {productItems.map((prod) => (
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
              <Typography variant="h4" className="font-iran-yekan font-extrabold text-foreground">قطعه‌ای یافت نشد</Typography>
              <p className="text-xs text-muted-foreground mt-2 font-iran-sans">لطفاً عبارات جستجو را تغییر داده یا از دکمه حذف فیلترها استفاده کنید.</p>
            </div>
          )}
        </div>

      </div>

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