'use client';

import * as React from 'react';
import { ShoppingBag, Check, Store, ShieldCheck, Truck, Award } from 'lucide-react';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useGetShopPage } from '@/domains/front/shop/hooks/shop.hooks';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchSidebar } from '@/components/features/ProductGrid/SearchSidebar';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { Card } from '@/components/composites/Card';
import { Typography } from '@/components/primitives/Typography';
import { useAppStore } from '@/shared/store/useAppStore';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl } from '@/core/utils/formatters';

export interface ShopDetailsContentProps {
  id: string;
}

const SORT_OPTIONS = [
  { value: 'Selected', label: 'منتخب' },
  { value: 'MostVisited', label: 'پربازدیدترین' },
  { value: 'Newest', label: 'جدیدترین' },
  { value: 'BestSelling', label: 'پرفروش‌ترین' },
  { value: 'Cheapest', label: 'ارزان‌ترین' },
  { value: 'MostExpensive', label: 'گران‌ترین' },
];

export function ShopDetailsContent({ id }: ShopDetailsContentProps) {
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = React.useState(false);

  const { filters, setFilter, clearFilters } = useSearchFilters();
  const currentFilters = { ...filters, shopId: id };

  const { data: shopData, isLoading: isShopLoading } = useGetShopPage(id);
  const { data: productsResponse, isLoading: isProductsLoading } = useSearchProducts(currentFilters);

  const products = productsResponse?.items || [];
  const totalCount = productsResponse?.totalCount || 0;
  const totalPages = productsResponse?.totalPages || 1;

  const handleMobileSortSelect = (value: string) => {
    setFilter('sort', value);
    setIsMobileSortOpen(false);
  };

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === (filters.orderType || 'Selected'))?.label || 'منتخب';

  const breadcrumbItems = [
    { id: 'shops-root', title: 'فروشگاه‌ها', href: '/shops' },
    { id: 'shop-active', title: shopData?.shopTitle || 'فروشگاه انتخاب شده' },
  ];

  const delayedPercent = shopData?.shopPerformanceReport?.sellerSentDelayedPercentage ?? 0;
  const returnPercent = shopData?.shopPerformanceReport?.nonUserReturnPercentage ?? 0;
  const onTimePercent = shopData?.shopPerformanceReport?.sellerSentOnTimePercentage ?? 0;

  return (
    <div className="flex w-full flex-col gap-6">
      <div
        style={{ top: isHeaderMinimized ? '56px' : '122px' }}
        className="sticky z-40 mt-1 flex w-full shrink-0 select-none items-center justify-between gap-3 border-b border-border bg-card px-4 py-2.5 shadow-xs md:hidden"
      >
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-input bg-card px-3 py-2 text-xs font-bold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="truncate">فیلترها</span>
        </button>
        <button
          type="button"
          onClick={() => setIsMobileSortOpen(true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-input bg-card px-3 py-2 text-xs font-bold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="truncate">{activeSortLabel}</span>
        </button>
        <span className="flex shrink-0 items-center justify-center rounded-md bg-muted px-2.5 py-2 text-2xs font-bold text-muted-foreground">
          {new Intl.NumberFormat('fa-IR').format(totalCount)} کالا
        </span>
      </div>

      <Breadcrumb items={breadcrumbItems} className="px-4 md:px-0" />

      {isShopLoading ? (
        <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
      ) : (
        <Card className="flex w-full flex-col justify-between gap-6 p-6 shadow-xs md:p-8 lg:flex-row lg:items-center">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted md:h-24 md:w-24">
              <img src={getFullUrl(shopData?.logo)} className="h-full w-full object-contain" alt="" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-foreground md:text-xl">{shopData?.shopTitle}</h2>
                <span className="flex shrink-0 select-none items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-2xs font-bold text-success md:text-xs">
                  <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
                  تایید شده یدک‌چی
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground md:text-sm">
                <Store aria-hidden="true" className="h-4 w-4" />
                <span>
                  تعداد کالاهای فعال: {new Intl.NumberFormat('fa-IR').format(shopData?.shopProductCount || 0)} کالا
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 border-t border-dashed border-border pt-5 lg:border-t-0 lg:pt-0">
            <div className="flex items-center gap-3">
              <Award aria-hidden="true" className="h-6 w-6 shrink-0 text-primary" />
              <div className="flex flex-col">
                <span className="text-2xs text-muted-foreground md:text-xs">عملکرد کلی</span>
                <span className="mt-0.5 text-xs font-bold text-foreground md:text-sm">عالی</span>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-border sm:block" />

            <div className="flex items-center gap-3">
              <Truck aria-hidden="true" className="h-6 w-6 shrink-0 text-primary" />
              <div className="flex flex-col">
                <span className="text-2xs text-muted-foreground md:text-xs">تحویل کالا</span>
                <span className="mt-0.5 text-xs font-bold text-foreground md:text-sm">
                  {new Intl.NumberFormat('fa-IR').format(100 - delayedPercent)}%
                </span>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-border sm:block" />

            <div className="flex items-center gap-3">
              <ShieldCheck aria-hidden="true" className="h-6 w-6 shrink-0 text-primary" />
              <div className="flex flex-col">
                <span className="text-2xs text-muted-foreground md:text-xs">بدون مرجوعی</span>
                <span className="mt-0.5 text-xs font-bold text-foreground md:text-sm">
                  {new Intl.NumberFormat('fa-IR').format(100 - returnPercent)}%
                </span>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-border sm:block" />

            <div className="flex items-center gap-3">
              <Check aria-hidden="true" className="h-6 w-6 shrink-0 text-primary" />
              <div className="flex flex-col">
                <span className="text-2xs text-muted-foreground md:text-xs">تحویل به موقع</span>
                <span className="mt-0.5 text-xs font-bold text-foreground md:text-sm">
                  {new Intl.NumberFormat('fa-IR').format(onTimePercent)}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex w-full items-start gap-6 md:gap-8">
        <SearchSidebar
          filters={currentFilters}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
        />

        <div className="flex flex-1 flex-col items-stretch gap-6">
          <div className="hidden items-center gap-2 overflow-x-auto border-b border-border py-1 pb-3 scrollbar-none md:flex">
            <span className="ms-2 whitespace-nowrap text-xs font-bold text-muted-foreground">
              مرتب‌سازی محصولات فروشنده:
            </span>
            <div className="flex items-center gap-2">
              {SORT_OPTIONS.map((opt) => {
                const isActive = (filters.orderType || 'Selected') === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFilter('sort', opt.value)}
                    className={cn(
                      'whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold outline-none transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {isProductsLoading ? (
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
                هنوز هیچ محصول فعالی برای این فروشگاه ثبت نشده است.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
