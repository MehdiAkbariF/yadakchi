'use client';

import * as React from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useGetShopPage } from '@/domains/front/shop/hooks/shop.hooks';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchSidebar } from '@/components/features/ProductGrid/SearchSidebar';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { Typography } from '@/components/primitives/Typography';
import { BottomSheet } from '@/components/composites/BottomSheet/BottomSheet';
import { cn } from '@/design-system/utils/cn';
import { toPersianDigits } from '@/core/utils/formatters';
import { ShopHeader } from './ShopHeader';
import { ShopMainCard } from './ShopMainCard';

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
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = React.useState(false);

  const [isShopCardScrolledOut, setIsShopCardScrolledOut] = React.useState(false);
  const shopHeaderCardRef = React.useRef<HTMLDivElement>(null);

  const { filters, setFilter, clearFilters } = useSearchFilters();
  const currentFilters = { ...filters, shopId: id };

  const { data: shopData, isLoading: isShopLoading } = useGetShopPage(id);
  const { data: productsResponse, isLoading: isProductsLoading } =
    useSearchProducts(currentFilters);

  const products = productsResponse?.items || [];
  const totalCount = productsResponse?.totalCount || 0;
  const totalPages = productsResponse?.totalPages || 1;

  React.useEffect(() => {
    const el = shopHeaderCardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsShopCardScrolledOut(
          !entry.isIntersecting && entry.boundingClientRect.top < 150
        );
      },
      {
        rootMargin: '-100px 0px 0px 0px',
        threshold: 0.1,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shopData]);

  const handleMobileSortSelect = (value: string) => {
    setFilter('sort', value);
    setIsMobileSortOpen(false);
  };

  const handleSortChange = (value: string) => {
    setFilter('sort', value);
  };

  const activeSortValue = filters.orderType || 'Selected';
  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === activeSortValue)?.label || 'منتخب';

  const breadcrumbItems = [
    { id: 'shops-root', title: 'فروشگاه‌ها', href: '/shops' },
    { id: 'shop-active', title: shopData?.shopTitle || 'فروشگاه انتخابی' },
  ];

  return (
    <div className="flex w-full flex-col gap-3 sm:gap-6" dir="rtl">
      {/* ================= 1. هدر اختصاصی فروشگاه ================= */}
      <ShopHeader
        shopId={id}
        shopData={shopData}
        isLoading={isShopLoading}
        totalCount={totalCount}
        isShopCardScrolledOut={isShopCardScrolledOut}
        activeSortLabel={activeSortLabel}
        activeSortValue={activeSortValue}
        sortOptions={SORT_OPTIONS}
        onOpenFilters={() => setIsMobileFiltersOpen(true)}
        onOpenSort={() => setIsMobileSortOpen(true)}
        onSortChange={handleSortChange}
      />

      <Breadcrumb items={breadcrumbItems} className="hidden px-4 md:flex md:px-0" />

      {/* ================= 2. کارت اصلی مشخصات فروشگاه ================= */}
      <ShopMainCard
        shopData={shopData}
        isLoading={isShopLoading}
        cardRef={shopHeaderCardRef}
      />

      {/* ================= 3. بخش محصولات و سایدبار فیلتر ================= */}
      <div className="flex w-full items-start gap-6 md:gap-8">
        <SearchSidebar
          filters={currentFilters}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col items-stretch gap-5">
          <div className="hidden select-none items-center justify-between border-b border-border/80 pb-3 lg:flex">
            <div className="flex items-center gap-2.5">
              <span className="text-label-muted">مرتب‌سازی بر اساس:</span>
              <div className="flex items-center gap-1.5">
                {SORT_OPTIONS.map((opt) => {
                  const isActive = activeSortValue === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFilter('sort', opt.value)}
                      className={cn(
                        'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-fast',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <span className="text-label-muted">
              {toPersianDigits(totalCount)} کالا
            </span>
          </div>

          {isProductsLoading ? (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-4">
                {products.map((prod) => (
                  <ProductSearchCard key={prod.id} product={prod} />
                ))}
              </div>
              <div className="pt-2">
                <Pagination
                  currentPage={filters.pageNumber || 1}
                  totalPages={totalPages}
                  onPageChange={(page) => setFilter('page', page)}
                />
              </div>
            </>
          ) : (
            <div className="mx-2 flex select-none flex-col items-center justify-center rounded-3xl py-16 text-center shadow-xs">
              <ShoppingBag
                aria-hidden="true"
                className="mb-4 h-12 w-12 text-muted-foreground/30"
              />
              <Typography variant="h4" className="font-black text-foreground">
                کالایی در این فروشگاه یافت نشد
              </Typography>
              <p className="mt-2 text-base text-muted-foreground">
                لطفاً فیلترهای خود را تغییر داده یا مجدداً امتحان کنید.
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomSheet
        isOpen={isMobileSortOpen}
        onClose={() => setIsMobileSortOpen(false)}
        title="مرتب‌سازی محصولات بر اساس"
      >
        <div className="flex w-full flex-col divide-y divide-border/60" dir="rtl">
          {SORT_OPTIONS.map((opt) => {
            const isActive = activeSortValue === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleMobileSortSelect(opt.value)}
                className={cn(
                  'flex w-full items-center justify-between py-3.5 text-xs font-bold outline-none transition-colors',
                  isActive ? 'text-primary' : 'text-foreground hover:bg-muted/30'
                )}
              >
                <span>{opt.label}</span>
                {isActive && <Check className="h-4 w-4 stroke-[2.5] text-primary" />}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}

export default ShopDetailsContent;