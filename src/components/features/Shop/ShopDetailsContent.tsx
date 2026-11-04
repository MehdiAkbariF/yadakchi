'use client';

import * as React from 'react';
import {
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  Award,
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2,
  MapPin,
  Package,
  Store,
} from 'lucide-react';
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
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';
import { useAppStore } from '@/shared/store/useAppStore';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';

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

  // بررسی وضعیت عبور کاربر از کارت اصلی فروشگاه
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

  // استفاده از IntersectionObserver برای تشخیص خروج کارت فروشگاه از دید
  React.useEffect(() => {
    const el = shopHeaderCardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // اگر کارت بالای کادر رفت، نوار چسبان مشخصات فروشگاه را نشان می‌دهد
        setIsShopCardScrolledOut(!entry.isIntersecting && entry.boundingClientRect.top < 150);
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

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === (filters.orderType || 'Selected'))?.label ||
    'منتخب';

  const breadcrumbItems = [
    { id: 'shops-root', title: 'فروشگاه‌ها', href: '/shops' },
    { id: 'shop-active', title: shopData?.shopTitle || 'فروشگاه انتخابی' },
  ];

  const delayedPercent =
    shopData?.shopPerformanceReport?.sellerSentDelayedPercentage ?? 0;
  const returnPercent =
    shopData?.shopPerformanceReport?.nonUserReturnPercentage ?? 0;
  const onTimePercent =
    shopData?.shopPerformanceReport?.sellerSentOnTimePercentage ?? 0;

  const onTimeScore = Math.max(0, Math.min(100, Math.round(100 - delayedPercent)));
  const noReturnScore = Math.max(0, Math.min(100, Math.round(100 - returnPercent)));
  const commitmentScore = Math.max(0, Math.min(100, Math.round(onTimePercent)));

  const shopInitial = shopData?.shopTitle
    ? shopData.shopTitle.trim().charAt(0).toUpperCase()
    : 'ی';

  return (
    <div className="flex w-full flex-col gap-3 sm:gap-6" dir="rtl">
    
      <div
        style={{ top: isHeaderMinimized ? '56px' : '105px' }}
        className="sticky z-20 -mx-4 flex w-[calc(100%+2rem)] shrink-0 select-none flex-col border-b border-border bg-card px-4 shadow-xs transition-all duration-300 md:hidden transform-gpu"
      >
        {/* این بخش فقط و فقط زمانی که کارت اصلی به بالا رفت با انیمیشن باز می‌شود */}
        <div
          className={cn(
            'flex w-full items-center justify-between overflow-hidden transition-all duration-300 ease-out',
            isShopCardScrolledOut
              ? 'max-h-12 opacity-100 pt-2.5 pb-2 border-b border-dashed border-border/70'
              : 'max-h-0 opacity-0 py-0 border-transparent pointer-events-none'
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted/40 p-0.5">
              {shopData?.logo ? (
                <img
                  src={getFullUrl(shopData.logo)}
                  className="h-full w-full object-contain"
                  alt=""
                />
              ) : (
                <Store className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-xs font-black text-foreground">
                {shopData?.shopTitle || 'فروشگاه یدکچی'}
              </span>
              <span className="inline-flex shrink-0 items-center text-success">
                <CheckCircle2 className="h-3 w-3" />
              </span>
            </div>
          </div>

          <span className="flex shrink-0 items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-3xs font-bold text-muted-foreground">
            <Package className="h-3 w-3 text-muted-foreground" />
            <span>{toPersianDigits(shopData?.shopProductCount || totalCount)} کالا</span>
          </span>
        </div>

        {/* ردیف دکمه‌های فیلتر و سورت */}
        <div className="flex w-full items-center justify-between gap-2 py-2.5">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex h-8 flex-1 select-none items-center justify-center gap-1 rounded-lg border border-border/80 bg-card px-2 text-2xs font-bold text-foreground active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-foreground/80" />
            <span>فیلترها</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMobileSortOpen(true)}
            className="flex h-8 flex-1 select-none items-center justify-center gap-1 rounded-lg border border-border/80 bg-card px-2 text-2xs font-bold text-foreground active:scale-95 transition-transform"
          >
            <span className="truncate">{activeSortLabel}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
          </button>

          {!isShopCardScrolledOut && (
            <span className="flex h-8 shrink-0 items-center justify-center rounded-lg bg-muted px-2.5 text-3xs font-bold text-muted-foreground">
              {toPersianDigits(totalCount)} کالا
            </span>
          )}
        </div>
      </div>

      <Breadcrumb items={breadcrumbItems} className="hidden px-4 md:flex md:px-0" />

      {/* ================= 2. کارت اصلی مشخصات فروشگاه (متصل به ref تشخیص اسکرول) ================= */}
      <div ref={shopHeaderCardRef} className="w-full">
        {isShopLoading ? (
          <div className="relative w-full overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs sm:rounded-3xl">
            <Skeleton className="hidden h-32 w-full rounded-none sm:block" />

            <div className="relative px-3 pb-3 pt-3 sm:px-7 sm:pb-7 sm:pt-0">
              <div className="flex items-center gap-2.5 sm:-mt-14 sm:items-end sm:gap-4">
                <Skeleton className="h-14 w-14 shrink-0 rounded-xl border-2 border-card sm:h-28 sm:w-28 sm:rounded-2xl sm:border-4" />
                <div className="space-y-1.5 pb-0.5 sm:space-y-2 sm:pb-2">
                  <Skeleton className="h-4 w-32 rounded-md sm:h-6 sm:w-48" />
                  <Skeleton className="h-3 w-24 rounded-md sm:h-4 sm:w-32" />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5 border-t border-border/50 pt-3 sm:mt-6 sm:gap-3 sm:pt-5">
                <Skeleton className="h-10 rounded-lg sm:h-16 sm:rounded-2xl" />
                <Skeleton className="h-10 rounded-lg sm:h-16 sm:rounded-2xl" />
                <Skeleton className="h-10 rounded-lg sm:h-16 sm:rounded-2xl" />
                <Skeleton className="h-10 rounded-lg sm:h-16 sm:rounded-2xl" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/30 shadow-xs transition-all sm:rounded-3xl">
            {/* بنر بالایی: فقط در دسکتاپ */}
            <div className="relative hidden h-15 w-full overflow-hidden border-b border-border/60 bg-gradient-to-l from-muted/60 via-muted/30 to-muted/10 p-4 sm:block">
              <div className="absolute end-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-foreground shadow-2xs backdrop-blur-md">
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full text-xs font-semibold text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  فروشنده رسمی
                </span>
              </div>
            </div>

            {/* بخش اطلاعات و آمار فروشگاه */}
            <div className="relative px-3 pb-3 pt-3 sm:px-7 sm:pb-7 sm:pt-0">
              <div className="flex flex-row items-center gap-2.5 sm:-mt-14 sm:items-end sm:gap-4.5">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-card bg-muted/20 p-0.5 shadow-sm sm:h-28 sm:w-28 sm:rounded-2xl sm:border-4 sm:p-1">
                  {shopData?.logo ? (
                    <img
                      src={getFullUrl(shopData.logo)}
                      className="h-full w-full rounded-lg object-contain sm:rounded-xl"
                      alt={shopData.shopTitle}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-base font-black text-foreground sm:rounded-xl sm:text-3xl">
                      {shopInitial}
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-col gap-0.5 pb-0.5 sm:gap-1.5 sm:pb-1">
                  <div className="flex items-center gap-1.5 sm:gap-2.5">
                    <h1 className="truncate text-sm font-bold text-foreground sm:text-2xl">
                      {shopData?.shopTitle}
                    </h1>
                    <span
                      className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-success/10 px-1.5 py-0.5 text-3xs font-semibold text-success sm:hidden"
                      title="فروشنده رسمی"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-3xs text-muted-foreground font-medium sm:gap-3 sm:text-2xs">
                    <span className="flex items-center gap-0.5 sm:gap-1">
                      <Package className="h-3 w-3 text-muted-foreground sm:h-3.5 sm:w-3.5" />
                      {toPersianDigits(shopData?.shopProductCount || 0)} قطعه
                    </span>

                    {shopData?.address && (
                      <>
                        <span className="text-border">|</span>
                        <span className="flex max-w-[160px] items-center gap-0.5 truncate sm:max-w-[320px] sm:gap-1">
                          <MapPin className="h-3 w-3 shrink-0 text-muted-foreground sm:h-3.5 sm:w-3.5" />
                          {shopData.address}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* کارت‌های عملکرد */}
              <div className="mt-3 grid grid-cols-4 gap-1.5 border-t border-border/70 pt-3 sm:mt-6 sm:gap-3 sm:pt-5">
                <div className="flex flex-col items-center gap-0.5 rounded-lg border border-border/70 bg-muted/30 p-1.5 text-center transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:gap-3 sm:rounded-2xl sm:p-3 sm:text-right">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground sm:h-10 sm:w-10 sm:rounded-xl">
                    <Award className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[9px] font-medium text-muted-foreground sm:text-3xs">
                      عملکرد
                    </span>
                    <span className="truncate text-[10px] font-bold text-foreground sm:text-sm">
                      عالی
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-0.5 rounded-lg border border-border/70 bg-muted/30 p-1.5 text-center transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:gap-3 sm:rounded-2xl sm:p-3 sm:text-right">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground sm:h-10 sm:w-10 sm:rounded-xl">
                    <Truck className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[9px] font-medium text-muted-foreground sm:text-3xs">
                      ارسال
                    </span>
                    <span
                      className="truncate text-[10px] font-bold text-foreground sm:text-sm"
                      dir="ltr"
                    >
                      {toPersianDigits(onTimeScore)}٪
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-0.5 rounded-lg border border-border/70 bg-muted/30 p-1.5 text-center transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:gap-3 sm:rounded-2xl sm:p-3 sm:text-right">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground sm:h-10 sm:w-10 sm:rounded-xl">
                    <ShieldCheck className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[9px] font-medium text-muted-foreground sm:text-3xs">
                      مرجوعی
                    </span>
                    <span
                      className="truncate text-[10px] font-bold text-foreground sm:text-sm"
                      dir="ltr"
                    >
                      {toPersianDigits(noReturnScore)}٪
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-0.5 rounded-lg border border-border/70 bg-muted/30 p-1.5 text-center transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:gap-3 sm:rounded-2xl sm:p-3 sm:text-right">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground sm:h-10 sm:w-10 sm:rounded-xl">
                    <Check className="h-3.5 w-3.5 stroke-[2.5] sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[9px] font-medium text-muted-foreground sm:text-3xs">
                      تعهد
                    </span>
                    <span
                      className="truncate text-[10px] font-bold text-foreground sm:text-sm"
                      dir="ltr"
                    >
                      {toPersianDigits(commitmentScore)}٪
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
          {/* مرتب‌سازی دسکتاپ */}
          <div className="hidden select-none items-center justify-between border-b border-border/80 pb-3 md:flex">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-muted-foreground">
                مرتب‌سازی بر اساس:
              </span>
              <div className="flex items-center gap-1.5">
                {SORT_OPTIONS.map((opt) => {
                  const isActive = (filters.orderType || 'Selected') === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFilter('sort', opt.value)}
                      className={cn(
                        'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-fast',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <span className="text-xs font-bold text-muted-foreground">
              {toPersianDigits(totalCount)} کالا
            </span>
          </div>

          {/* شبکه محصولات */}
          {isProductsLoading ? (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
              <p className="mt-2 text-xs text-muted-foreground">
                لطفاً فیلترهای خود را تغییر داده یا مجدداً امتحان کنید.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* باتم‌شیت مرتب‌سازی در موبایل */}
      <BottomSheet
        isOpen={isMobileSortOpen}
        onClose={() => setIsMobileSortOpen(false)}
        title="مرتب‌سازی محصولات بر اساس"
      >
        <div className="flex w-full flex-col divide-y divide-border/60" dir="rtl">
          {SORT_OPTIONS.map((opt) => {
            const isActive = (filters.orderType || 'Selected') === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleMobileSortSelect(opt.value)}
                className={cn(
                  'flex w-full items-center justify-between py-3.5 text-xs font-bold transition-colors outline-none',
                  isActive
                    ? 'text-primary'
                    : 'text-foreground hover:bg-muted/30',
                )}
              >
                <span>{opt.label}</span>
                {isActive && <Check className="h-4 w-4 text-primary stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}

export default ShopDetailsContent;