'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useGetShopPage } from '@/domains/front/shop/hooks/shop.hooks';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchSidebar } from '@/components/features/ProductGrid/SearchSidebar';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { BottomSheet } from '@/components/composites/BottomSheet/BottomSheet';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { Card, CardBody } from '@/components/composites/Card';
import { Typography } from '@/components/primitives/Typography';
import { useAppStore } from '@/shared/store/useAppStore';
import { ShoppingBag, Check, Store, ShieldCheck, Truck, Award } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

interface ShopDetailsContentProps {
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
  const router = useRouter();
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);

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

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const activeSortLabel = SORT_OPTIONS.find(o => o.value === (filters.orderType || 'Selected'))?.label || 'منتخب';

  const breadcrumbItems = [
    { id: 'shops-root', title: 'فروشگاه‌ها', href: '/shops' },
    { id: 'shop-active', title: shopData?.shopTitle || 'فروشگاه انتخاب شده' }
  ];

  const delayedPercent = shopData?.shopPerformanceReport?.sellerSentDelayedPercentage ?? 0;
  const returnPercent = shopData?.shopPerformanceReport?.nonUserReturnPercentage ?? 0;
  const onTimePercent = shopData?.shopPerformanceReport?.sellerSentOnTimePercentage ?? 0;

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

      {isShopLoading ? (
        <div className="w-full h-40 rounded-2xl bg-muted/20 animate-pulse" />
      ) : (
        <Card className="w-full border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-card p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-md">
          <div className="flex items-center gap-5 text-right">
            <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-muted/10 flex items-center justify-center overflow-hidden shadow-sm">
              <img src={getFullUrl(shopData?.logo)} className="w-full h-full object-contain" alt="" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base md:text-lg lg:text-xl font-black text-foreground font-iran-yekan">{shopData?.shopTitle}</h2>
                <span className="text-[10px] md:text-xs font-bold text-success-500 bg-success-50 dark:bg-success-950/20 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm shrink-0 select-none">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  تایید شده یدک‌چی
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mt-1">
                <Store className="h-4.5 w-4.5" />
                <span>تعداد کالاهای فعال: {new Intl.NumberFormat('fa-IR').format(shopData?.shopProductCount || 0)} کالا</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 border-t lg:border-t-0 border-dashed pt-5 lg:pt-0">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-primary shrink-0" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] md:text-xs text-muted-foreground">عملکرد کلی</span>
                <span className="text-xs md:text-sm font-black text-foreground mt-0.5">عالی</span>
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-primary shrink-0" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] md:text-xs text-muted-foreground">تحویل کالا</span>
                <span className="text-xs md:text-sm font-black text-foreground mt-0.5">{new Intl.NumberFormat('fa-IR').format(100 - delayedPercent)}%</span>
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] md:text-xs text-muted-foreground">بدون مرجوعی</span>
                <span className="text-xs md:text-sm font-black text-foreground mt-0.5">{new Intl.NumberFormat('fa-IR').format(100 - returnPercent)}%</span>
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-3">
              <Check className="h-6 w-6 text-primary shrink-0" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] md:text-xs text-muted-foreground">تحویل به موقع</span>
                <span className="text-xs md:text-sm font-black text-foreground mt-0.5">{new Intl.NumberFormat('fa-IR').format(onTimePercent)}%</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="w-full flex items-start gap-6 md:gap-8">
        
        <SearchSidebar
          filters={currentFilters}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
        />

        <div className="flex-1 flex flex-col items-stretch gap-6">
          
          <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar py-1 border-b pb-3">
            <span className="text-xs font-bold font-iran-sans text-muted-foreground whitespace-nowrap ml-2">
              مرتب‌سازی محصولات فروشنده:
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
              <p className="text-xs text-muted-foreground mt-2 font-iran-sans">هنوز هیچ محصول فعالی برای این فروشگاه ثبت نشده است.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}