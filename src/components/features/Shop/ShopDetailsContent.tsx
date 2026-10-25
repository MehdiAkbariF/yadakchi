'use client';

import * as React from 'react';
import {
  ShoppingBag,
  Check,
  Store,
  ShieldCheck,
  Truck,
  Award,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react';
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
import { BottomSheet } from '@/components/composites/BottomSheet/BottomSheet';
import { LottiePlayer } from '@/components/shared/Lottie/LottiePlayer';
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
    { id: 'shop-active', title: shopData?.shopTitle || 'فروشگاه انتخابی' },
  ];

  const delayedPercent = shopData?.shopPerformanceReport?.sellerSentDelayedPercentage ?? 0;
  const returnPercent = shopData?.shopPerformanceReport?.nonUserReturnPercentage ?? 0;
  const onTimePercent = shopData?.shopPerformanceReport?.sellerSentOnTimePercentage ?? 0;

  return (
    <div className="flex w-full flex-col gap-5 sm:gap-6" dir="rtl">
      
      {/* ================= 1. نوار چسبان موبایل: لبه تا لبه (Edge-to-Edge) در 56px ================= */}
      <div
        className="sticky top-[56px] z-30 -mx-4 flex w-[calc(100%+2rem)] select-none items-center justify-between gap-2.5 border-b border-border/80 bg-card/95 px-4 py-2.5 shadow-xs backdrop-blur-md md:hidden rounded-none"
      >
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex h-9 flex-1 select-none items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 text-xs font-bold text-foreground shadow-2xs active:scale-95 transition-transform"
        >
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-primary" />
          <span>فیلترها</span>
        </button>

        <button
          type="button"
          onClick={() => setIsMobileSortOpen(true)}
          className="flex h-9 flex-1 select-none items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 text-xs font-bold text-foreground shadow-2xs active:scale-95 transition-transform"
        >
          <span className="truncate">{activeSortLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </button>

        <span className="flex h-9 shrink-0 items-center justify-center rounded-xl bg-muted px-2.5 text-3xs font-bold text-muted-foreground">
          {toPersianDigits(totalCount)} کالا
        </span>
      </div>

      <Breadcrumb items={breadcrumbItems} className="hidden px-4 md:flex md:px-0" />

      {/* ================= 2. بنر و شناسنامه رسمی شرکتی فروشگاه (Corporate Header) ================= */}
      {isShopLoading ? (
        <div className="h-44 w-full animate-pulse rounded-2xl bg-muted/40" />
      ) : (
        <Card className="flex w-full flex-col justify-between gap-6 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/20 p-5 sm:p-6 shadow-xs lg:flex-row lg:items-center">
          
          {/* ستون راست: مشخصات و لوگوی فروشگاه */}
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-card p-1.5 shadow-2xs md:h-24 md:w-24">
              {shopData?.logo ? (
                <img
                  src={getFullUrl(shopData.logo)}
                  className="h-full w-full object-contain"
                  alt={shopData.shopTitle}
                />
              ) : (
                <Store className="h-10 w-10 text-muted-foreground/60" />
              )}
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-base sm:text-xl font-black text-foreground truncate">
                  {shopData?.shopTitle}
                </h1>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-3xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  فروشنده تایید شده یدک‌چی
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-2xs text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold">
                  <Store className="h-3.5 w-3.5 text-primary" />
                  {toPersianDigits(shopData?.shopProductCount || 0)} قطعه یدکی فعال
                </span>

                {shopData?.address && (
                  <>
                    <span className="text-border">|</span>
                    <span className="flex items-center gap-1 truncate max-w-[280px]">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {shopData.address}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ستون چپ: شاخص‌های کیفی و عملکرد شرکتی (KPIs) */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 border-t border-dashed border-border/70 pt-4 lg:border-t-0 lg:pt-0">
            
            {/* شاخص ۱: رضایت کلی */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/60 p-3 text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
                <Award className="h-4 w-4" />
              </div>
              <span className="text-3xs text-muted-foreground">عملکرد کلی</span>
              <span className="mt-0.5 text-xs font-black text-foreground">عالی</span>
            </div>

            {/* شاخص ۲: تحویل به موقع */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/60 p-3 text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mb-1">
                <Truck className="h-4 w-4" />
              </div>
              <span className="text-3xs text-muted-foreground">ارسال به‌موقع</span>
              <span className="mt-0.5 text-xs font-black text-foreground" dir="ltr">
                {toPersianDigits(100 - delayedPercent)}٪
              </span>
            </div>

            {/* شاخص ۳: سلامت کالا */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/60 p-3 text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-1">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-3xs text-muted-foreground">بدون مرجوعی</span>
              <span className="mt-0.5 text-xs font-black text-foreground" dir="ltr">
                {toPersianDigits(100 - returnPercent)}٪
              </span>
            </div>

            {/* شاخص ۴: پایبندی به تعهدات */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/60 p-3 text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-1">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-3xs text-muted-foreground">تعهد ارسال</span>
              <span className="mt-0.5 text-xs font-black text-foreground" dir="ltr">
                {toPersianDigits(onTimePercent)}٪
              </span>
            </div>

          </div>
        </Card>
      )}

      {/* ================= 3. بخش محصولات و سایدبار فیلتر (کاملاً هم‌عرض با بنر بالا) ================= */}
      <div className="flex w-full items-start gap-6 md:gap-8">
        
        {/* سایدبار فیلترهای جستجو */}
        <SearchSidebar
          filters={currentFilters}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
        />

        {/* کانتینر محصولات با min-w-0 تضمین‌کننده تراز و عدم بریدگی کارت‌ها */}
        <div className="flex flex-1 min-w-0 flex-col items-stretch gap-5">
          
          {/* مرتب‌سازی شرکتی مدرن در دسکتاپ */}
          <div className="hidden items-center justify-between border-b border-border/80 pb-3 md:flex select-none">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-muted-foreground">مرتب‌سازی بر اساس:</span>
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
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
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
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
            <div className="mx-2 flex select-none flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card py-16 text-center shadow-xs">
              <ShoppingBag aria-hidden="true" className="mb-4 h-12 w-12 text-muted-foreground/30" />
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
                  isActive ? 'text-primary' : 'text-foreground hover:bg-muted/30'
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