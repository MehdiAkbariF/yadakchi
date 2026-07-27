// src/components/features/Special/SpecialContent.tsx

'use client';

import { useState } from 'react';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { useGetCurrentTime } from '@/domains/front/static/hooks/static.hooks'; // دریافت زمان جهت سنکرون تایمرها
import { SearchSidebar } from '@/components/features/ProductGrid/SearchSidebar';
import { ProductDealCard } from '@/components/features/ProductCard/ProductDealCard'; // استفاده از کارت زمان‌دار بجای کارت معمولی
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { Typography } from '@/components/primitives/Typography';
import { useAppStore } from '@/shared/store/useAppStore';
import { SortSelector } from '@/components/composites/SortSelector/SortSelector';
import { Flame, ShoppingBag, ListFilter, X, ArrowRight, Hourglass } from 'lucide-react';

export function SpecialContent() {
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { filters, setFilter, clearFilters } = useSearchFilters();
  
  // قفل کردن فیلتر تخفیف زمان‌دار برای صفحه اختصاصی فروش ویژه
  const currentFilters = { ...filters, hasDiscountWithExpiration: true };
  const { data: productsResponse, isLoading } = useSearchProducts(currentFilters);
  const { data: serverTime } = useGetCurrentTime(); // دریافت تایم سنکرون‌شده سرور

  const products = productsResponse?.items || [];
  const totalCount = productsResponse?.totalCount || 0;
  const totalPages = productsResponse?.totalPages || 1;

  const breadcrumbItems = [
    { id: 'special-root', title: 'فروش ویژه (فرصت محدود)' }
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-right" dir="rtl">
      
      {/* هدر تلفیقی فوق فشرده و کارآمد مخصوص موبایل */}
      <div 
        style={{
          top: isHeaderMinimized ? '56px' : '122px'
        }}
        className="md:hidden sticky z-40 bg-background border-b py-2.5 px-4 w-full flex flex-col gap-3 shadow-sm select-none transition-all duration-300 mt-1 shrink-0"
      >
        {/* ردیف اول: مینی هدر صفحه فروش ویژه */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Flame className="h-4.5 w-4.5 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-muted-foreground font-black font-iran-yekan">فرصت طلایی خرید</span>
              <span className="text-xs font-black text-foreground font-iran-yekan mt-0.5">فروش ویژه یدک‌چی</span>
            </div>
          </div>
        </div>

        {/* ردیف دوم: فیلترها و مرتب‌سازی */}
        <div className="flex items-center justify-between gap-3 w-full border-t border-dashed pt-2.5">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center justify-center gap-1.5 border rounded-xl py-2 px-3 bg-background hover:bg-muted text-xs font-bold font-iran-sans text-foreground flex-1 h-9 shadow-sm outline-none"
          >
            <span className="truncate">فیلترها</span>
          </button>

          <SortSelector
            value={filters.orderType || 'Selected'}
            onChange={(val) => setFilter('sort', val)}
            variant="trigger"
          />

          <span className="text-[10px] font-bold font-iran-sans text-muted-foreground bg-muted px-2.5 py-2 rounded-xl shrink-0 h-9 flex items-center justify-center">
            {new Intl.NumberFormat('fa-IR').format(totalCount)} کالا
          </span>
        </div>
      </div>

      {/* بریدکرامب کلاسیک فقط در دسکتاپ */}
      <Breadcrumb items={breadcrumbItems} className="hidden md:flex px-4 md:px-0" />

      {/* بنر آتشین، داغ و فوق‌العاده مدرن بالای صفحه با آیکون شعله متحرک */}
      <div className="w-full bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/10 rounded-2xl p-6 sm:p-8 flex items-center justify-between relative overflow-hidden select-none px-4 md:px-8">
        <div className="flex flex-col text-right gap-1.5 z-10">
          <div className="flex items-center gap-2 text-red-500 font-black">
            <Flame className="h-5 w-5 shrink-0 animate-bounce" style={{ animationDuration: '2s' }} />
            <span className="text-xs sm:text-sm font-black font-iran-yekan tracking-wider">آفر‌های شگفت‌انگیز ثانیه‌شمار</span>
          </div>
          <h2 className="text-base sm:text-2xl font-black text-foreground font-iran-yekan mt-1">جشنواره فروش ویژه (فرصت بسیار محدود)</h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-iran-yekan mt-0.5 max-w-md leading-relaxed">
            قطعات یدکی خودرو با تخفیف‌های ویژه داغ و زمان‌دار. پس از به پایان رسیدن تایمر، قیمت‌ها به حالت عادی بازمی‌گردند!
          </p>
        </div>
        <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-10 dark:opacity-20 shrink-0 pointer-events-none hidden sm:block">
          <Flame className="h-28 w-28 text-red-500" strokeWidth={1.5} />
        </div>
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
            <div className="flex items-center justify-between border-b pb-3 mb-2 w-full">
              <Typography variant="h3" className="font-iran-yekan font-extrabold text-foreground">فروش ویژه</Typography>
              <span className="text-xs font-bold font-iran-yekan text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                {new Intl.NumberFormat('fa-IR').format(totalCount)} آفر شگفت‌انگیز فعال
              </span>
            </div>
            <SortSelector
              value={filters.orderType || 'Selected'}
              onChange={(val) => setFilter('sort', val)}
              className="mt-1"
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
              {/* رندر کارت‌ها با کامپوننت ProductDealCard جهت نمایش مستقیم شمارنده معکوس شگفت‌انگیز */}
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {products.map((prod) => (
                  <ProductDealCard 
                    key={prod.id} 
                    product={prod} 
                    serverTime={serverTime} 
                    showTimer={true} 
                  />
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
              <Typography variant="h4" className="font-iran-yekan font-extrabold text-foreground">آفر فعالی یافت نشد</Typography>
              <p className="text-xs text-muted-foreground mt-2 font-iran-sans">در حال حاضر هیچ آفر شگفت‌انگیز زمان‌داری یافت نشد.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}