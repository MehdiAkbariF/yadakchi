// src/components/features/Bestsellers/BestsellersContent.tsx

'use client';

import { useState } from 'react';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchSidebar } from '@/components/features/ProductGrid/SearchSidebar';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { Typography } from '@/components/primitives/Typography';
import { useAppStore } from '@/shared/store/useAppStore';
import { Award, ShoppingBag, ListFilter, X, ArrowRight, Trophy } from 'lucide-react';

export function BestsellersContent() {
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { filters, setFilter, clearFilters } = useSearchFilters();
  
  // قفل کردن نوع مرتب‌سازی روی پرفروش‌ترین‌ها (BestSelling) برای این صفحه اختصاصی
  const currentFilters = { ...filters, orderType: 'BestSelling' as const };
  const { data: productsResponse, isLoading } = useSearchProducts(currentFilters);

  const products = productsResponse?.items || [];
  const totalCount = productsResponse?.totalCount || 0;
  const totalPages = productsResponse?.totalPages || 1;

  const breadcrumbItems = [
    { id: 'bestsellers-root', title: 'محبوب‌ترین و پرفروش‌ترین قطعات' }
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
        {/* ردیف اول: مینی هدر صفحه پرفروش‌ترین‌ها */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Trophy className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-muted-foreground font-black font-iran-yekan">محبوب‌ترین‌های بازار</span>
              <span className="text-xs font-black text-foreground font-iran-yekan mt-0.5">پرفروش‌ترین‌های یدک‌چی</span>
            </div>
          </div>
        </div>

        {/* ردیف دوم: فیلترها و آمار تعداد کالا */}
        <div className="flex items-center justify-between gap-3 w-full border-t border-dashed pt-2.5">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center justify-center gap-1.5 border rounded-xl py-2 px-3 bg-background hover:bg-muted text-xs font-bold font-iran-sans text-foreground flex-1 h-9 shadow-sm outline-none"
          >
            <span className="truncate">فیلترها</span>
          </button>

          <span className="text-[10px] font-bold font-iran-sans text-muted-foreground bg-muted px-2.5 py-2 rounded-xl shrink-0 h-9 flex items-center justify-center">
            {new Intl.NumberFormat('fa-IR').format(totalCount)} کالا
          </span>
        </div>
      </div>

      {/* بریدکرامب کلاسیک فقط در دسکتاپ */}
      <Breadcrumb items={breadcrumbItems} className="hidden md:flex px-4 md:px-0" />

      {/* بنر طلایی مینیاتوری، بسیار شکیل و مدرن بالای صفحه با آیکون کاپ طلایی */}
      <div className="w-full bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/10 rounded-2xl p-6 sm:p-8 flex items-center justify-between relative overflow-hidden select-none px-4 md:px-8">
        <div className="flex flex-col text-right gap-1.5 z-10">
          <div className="flex items-center gap-2 text-amber-500 font-black">
            <Trophy className="h-5 w-5 shrink-0" />
            <span className="text-xs sm:text-sm font-black font-iran-yekan tracking-wider">برترین و پرفروش‌ترین قطعات بازار</span>
          </div>
          <h2 className="text-base sm:text-2xl font-black text-foreground font-iran-yekan mt-1">لیست پرفروش‌ترین قطعات یدکی خودرو</h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-iran-yekan mt-0.5 max-w-md leading-relaxed">
            محبوب‌ترین، پرتقاضاترین و باکیفیت‌ترین قطعات خودرو که بیشترین رضایت و فروش را توسط خریداران در سراسر کشور ثبت کرده‌اند.
          </p>
        </div>
        <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-10 dark:opacity-20 shrink-0 pointer-events-none hidden sm:block">
          <Trophy className="h-28 w-28 text-amber-500" strokeWidth={1.5} />
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
              <Typography variant="h3" className="font-iran-yekan font-extrabold text-foreground">پرفروش‌ترین قطعات خودرو</Typography>
              <span className="text-xs font-bold font-iran-yekan text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                {new Intl.NumberFormat('fa-IR').format(totalCount)} کالای برتر
              </span>
            </div>
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
              <p className="text-xs text-muted-foreground mt-2 font-iran-sans">در حال حاضر کالایی در این لیست موجود نیست.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}