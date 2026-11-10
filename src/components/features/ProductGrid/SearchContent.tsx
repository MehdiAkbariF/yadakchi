// src/components/features/ProductGrid/SearchContent.tsx
'use client';

import * as React from 'react';
import { Search, Loader2, AlertCircle, Sparkles, X } from 'lucide-react';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchHeader } from './SearchHeader';
import { SearchSidebar } from './SearchSidebar';
import { MobileSearchHeader } from './MobileSearchHeader';
import { ProductSearchCard } from '../ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '../ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { Typography } from '@/components/primitives/Typography';
import { LottiePlayer } from '@/components/shared/Lottie/LottiePlayer';

export function SearchContent() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
  const { filters, setFilter, removeFilter, clearFilters } = useSearchFilters();

  const { data, isLoading, isFetching, isError } = useSearchProducts(filters);
  const isSearching = isLoading || isFetching;

  const productItems = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;
  const aggregations = (data as any)?.aggregations || null;

  const searchedKeyword = filters.searchTitle?.trim() || '';

  return (
    <div className="relative flex w-full flex-col gap-4 sm:gap-6" dir="rtl">

      <MobileSearchHeader
        icon={<Search aria-hidden="true" className="h-4 w-4 text-primary" />}
        subtitle={searchedKeyword ? 'نتایج جستجو برای:' : 'جستجوی قطعات'}
        title={searchedKeyword || 'همه کالاها'}
        actionElement={
          searchedKeyword ? (
            <button
              type="button"
              onClick={() => removeFilter('q')} // تغییر از searchTitle به q
              className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-3xs font-bold text-muted-foreground hover:text-foreground active:scale-95 transition-all"
            >
              <span>حذف جستجو</span>
              <X className="h-3 w-3" />
            </button>
          ) : null
        }
        totalCount={totalCount}
        sortValue={filters.orderType || 'Selected'}
        onSortChange={(val) => setFilter('sort', val)}
        onOpenFilters={() => setIsMobileFiltersOpen(true)}
      />

      <div className="flex w-full items-start gap-6 lg:gap-7">
        {/* سایدبار فیلترها (دسکتاپ و دراور موبایل) */}
        <SearchSidebar
          filters={filters}
          aggregations={aggregations}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
        />

        {/* بخش اصلی نمایش نتایج */}
        <div className="flex flex-1 min-w-0 flex-col items-stretch gap-5">
          {/* هدر پیشرفته مخصوص دسکتاپ با چیپ‌های فیلتر و تب‌های مرتب‌سازی */}
          <div className="hidden md:block">
            <SearchHeader
              totalCount={isSearching ? 0 : totalCount}
              currentSort={filters.orderType || 'Selected'}
              onSortChange={(sort) => setFilter('sort', sort)}
              filters={filters}
              onRemoveFilter={removeFilter}
              onClearAll={clearFilters}
              searchTitle={filters.searchTitle}
              isMobileSticky={false}
            />
          </div>

          {/* نشانگر در حال دریافت نتایج */}
          {isSearching && (
            <div className="flex animate-pulse items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>در حال جستجو و دریافت نتایج جدید...</span>
            </div>
          )}

          {/* ۱. لودینگ اسکلتون */}
          {isSearching ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            /* ۲. حالت خطای سرور */
            <div className="mx-4 flex select-none flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/30 bg-card p-8 text-center md:mx-0">
              <AlertCircle className="mb-4 h-12 w-12 text-destructive stroke-[1.5]" />
              <Typography variant="h4" className="font-bold text-foreground">
                خطای ارتباط با سرور
              </Typography>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                لطفاً بعداً دوباره تلاش کنید یا اتصال اینترنت خود را بررسی نمایید.
              </p>
            </div>
          ) : productItems.length > 0 ? (
            /* ۳. نمایش نتایج کالاها */
            <>
              <div className="grid grid-cols-1 sm:gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
                {productItems.map((prod) => (
                  <ProductSearchCard key={prod.id} product={prod} />
                ))}
              </div>

              <div className="pt-4">
                <Pagination
                  currentPage={filters.pageNumber || 1}
                  totalPages={totalPages}
                  onPageChange={(page) => setFilter('page', page)}
                />
              </div>
            </>
          ) : (
            /* ۴. حالت نتیجه‌ای یافت نشد */
            <div className="mx-2 flex select-none flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card px-4 py-12 text-center md:mx-0 shadow-xs">
              <div className="-mt-2 mb-2 flex h-52 w-52 max-w-full items-center justify-center">
                <LottiePlayer path="/animations/no-product.json" className="h-full w-full" />
              </div>

              <Typography variant="h3" className="text-base font-bold text-foreground md:text-xl">
                چیزی پیدا نشد!
              </Typography>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {searchedKeyword ? (
                  <>برای «<span className="font-bold text-foreground">{searchedKeyword}</span>» نتیجه‌ای پیدا نکردیم.</>
                ) : (
                  <>برای فیلترهای انتخاب‌شده نتیجه‌ای پیدا نکردیم.</>
                )}
              </p>

              <div className="mt-6 flex w-full max-w-md flex-col gap-2 rounded-2xl border border-border/70 bg-muted/40 p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-warning shrink-0" />
                  <span>پیشنهاد می‌کنیم:</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  جستجو با نام قطعه + مدل خودرو
                </p>
                <div className="mt-1 flex items-center justify-between gap-2 border-t border-dashed border-border/60 pt-2">
                  <span className="text-2xs text-muted-foreground">
                    مثال: «لنت ترمز پژو ۲۰۶»
                  </span>
              <button
  type="button"
  onClick={() => setFilter('q', 'لنت ترمز پژو ۲۰۶')} // تغییر searchTitle به q
  className="cursor-pointer text-2xs font-bold text-primary transition-colors hover:underline shrink-0"
>
  جستجوی این نمونه
</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}