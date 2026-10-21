'use client';

import * as React from 'react';
import { Percent, ShoppingBag } from 'lucide-react';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchSidebar } from '@/components/features/ProductGrid/SearchSidebar';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { Typography } from '@/components/primitives/Typography';
import { SortSelector } from '@/components/composites/SortSelector/SortSelector';
import { useAppStore } from '@/shared/store/useAppStore';

export function OffersContent() {
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);

  const { filters, setFilter, clearFilters } = useSearchFilters();

  const currentFilters = { ...filters, hasDiscount: true };
  const { data: productsResponse, isLoading } = useSearchProducts(currentFilters);

  const products = productsResponse?.items || [];
  const totalCount = productsResponse?.totalCount || 0;
  const totalPages = productsResponse?.totalPages || 1;

  const breadcrumbItems = [{ id: 'offers-root', title: 'یدک‌چی آف (تخفیف‌ها)' }];

  return (
    <div className="flex w-full flex-col gap-6">
      {/* هدر موبایل */}
      <div
        style={{ top: isHeaderMinimized ? '56px' : '122px' }}
        className="sticky z-40 mt-1 flex w-full shrink-0 select-none flex-col gap-3 border-b border-border bg-card px-4 py-2.5 shadow-xs transition-colors md:hidden"
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-accent text-primary">
              <Percent aria-hidden="true" className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xs font-bold text-muted-foreground">جشنواره تخفیف‌ها</span>
              <span className="mt-0.5 text-xs font-bold text-foreground">یدک‌چی آف</span>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-3 border-t border-dashed border-border pt-2.5">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-input bg-card px-3 text-xs font-bold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="truncate">فیلترها</span>
          </button>

          <SortSelector
            value={filters.orderType || 'Selected'}
            onChange={(val) => setFilter('sort', val)}
            variant="trigger"
          />

          <span className="flex h-9 shrink-0 items-center justify-center rounded-md bg-muted px-2.5 text-2xs font-bold text-muted-foreground">
            {new Intl.NumberFormat('fa-IR').format(totalCount)} کالا
          </span>
        </div>
      </div>

      <Breadcrumb items={breadcrumbItems} className="hidden px-4 md:flex md:px-0" />

      <div className="relative flex w-full select-none items-center justify-between overflow-hidden rounded-lg border border-accent bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 px-4 md:px-8 sm:p-8">
        <div className="relative z-10 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Percent aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span className="text-sm font-bold tracking-wide">جشنواره تخفیف‌های طلایی</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-foreground">
            تخفیف‌های شگفت‌انگیز یدک‌چی آف
          </h2>
          <p className="mt-0.5 max-w-md text-xs leading-relaxed text-muted-foreground">
            فرصت استثنایی خرید لوازم یدکی و قطعات خودرو با بیشترین تخفیف‌ها از فروشگاه‌های معتبر سراسر کشور
          </p>
        </div>
        <div className="pointer-events-none absolute start-6 top-1/2 hidden shrink-0 -translate-y-1/2 opacity-10 sm:block">
          <Percent aria-hidden="true" className="h-28 w-28 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      <div className="flex w-full items-start gap-6 md:gap-8">
        <SearchSidebar
          filters={currentFilters}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
        />

        <div className="flex flex-1 flex-col items-stretch gap-6">
          <div className="hidden md:block">
            <div className="mb-2 flex w-full items-center justify-between border-b border-border pb-3">
              <Typography variant="h3" className="font-bold text-foreground">
                یدک‌چی آف
              </Typography>
              <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
                {new Intl.NumberFormat('fa-IR').format(totalCount)} کالا دارای تخفیف
              </span>
            </div>
            <SortSelector
              value={filters.orderType || 'Selected'}
              onChange={(val) => setFilter('sort', val)}
              className="mt-1"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
            <div className="mx-4 flex select-none flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16 text-center md:mx-0">
              <ShoppingBag aria-hidden="true" className="mb-4 h-12 w-12 text-muted-foreground/60" />
              <Typography variant="h4" className="font-bold text-foreground">
                کالایی یافت نشد
              </Typography>
              <p className="mt-2 text-xs text-muted-foreground">
                در حال حاضر هیچ کالای تخفیف‌داری در این دسته یافت نشد.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
