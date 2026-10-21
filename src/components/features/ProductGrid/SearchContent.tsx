// c:\Users\Raven\final-projects\yadakchi-front\yadakchi\src\components\features\ProductGrid\SearchContent.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchHeader } from './SearchHeader';
import { SearchSidebar } from './SearchSidebar';
import { ProductSearchCard } from '../ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '../ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { BottomSheet } from '@/components/composites/BottomSheet/BottomSheet';
import { Typography } from '@/components/primitives/Typography';
import { Button } from '@/components/primitives/Button/Button';
import { Check, Loader2, AlertCircle, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

// کامپوننت رندر مستقیم و بدون خطای لاتی در کلاینت
function LottiePlayer({ path, className = "w-56 h-56", loop = true }: { path: string; className?: string; loop?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anim: any = null;
    let isMounted = true;

    const init = async () => {
      try {
        const altPath = path.includes('/anumations/') ? path.replace('/anumations/', '/animations/') : path.replace('/animations/', '/anumations/');
        let animationData: any = null;

        for (const p of [path, altPath]) {
          try {
            const res = await fetch(p);
            if (res.ok) {
              animationData = await res.json();
              break;
            }
          } catch {}
        }

        if (!animationData || !isMounted || !containerRef.current) return;

        const lottieModule = await import('lottie-web');
        const lottie = lottieModule.default || lottieModule;

        if (containerRef.current && isMounted) {
          anim = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay: true,
            animationData,
          });
        }
      } catch (e) {}
    };

    init();

    return () => {
      isMounted = false;
      anim?.destroy();
    };
  }, [path, loop]);

  return <div ref={containerRef} className={className} />;
}

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

  const { data, isLoading, isFetching, isError } = useSearchProducts(filters);

  // وضعیت در حال جستجو (لود اولیه یا تغییر فیلترها)
  const isSearching = isLoading || isFetching;

  const productItems = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  const handleMobileSortSelect = (value: string) => {
    setFilter('sort', value);
    setIsMobileSortOpen(false);
  };

  const searchedKeyword = filters.searchTitle?.trim() || '';

  return (
    <div className="w-full flex flex-col gap-6 relative">
      
      <SearchHeader
        totalCount={isSearching ? 0 : totalCount}
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
              totalCount={isSearching ? 0 : totalCount}
              currentSort={filters.orderType || 'Selected'}
              onSortChange={(sort) => setFilter('sort', sort)}
              filters={filters}
              searchTitle={filters.searchTitle}
              isMobileSticky={false}
            />
          </div>

          {/* نوار وضعیت دریافت نتایج جدید */}
          {isSearching && (
            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>در حال جستجو و دریافت نتایج جدید...</span>
            </div>
          )}

          {/* ۱. وضعیت در حال جستجو: نمایش اسکلتون */}
          {isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            /* ۲. وضعیت خطای ارتباط یا سرور */
            <div className="flex flex-col items-center justify-center py-16 text-center select-none bg-card rounded-2xl border border-destructive/20 border-dashed mx-4 md:mx-0 p-6">
              <AlertCircle className="h-12 w-12 text-amber-500 mb-4 stroke-[1.5]" />
              <Typography variant="h4" className=" font-extrabold text-foreground">
خطای ارتباط با سرور
              </Typography>
              <p className="text-xs text-muted-foreground mt-2 max-w-md">
                لطفا بعدا دوباره تلاش کنید یا اتصال اینترنت خود را بررسی نمایید.
              </p>
            </div>
          ) : productItems.length > 0 ? (
            /* ۳. نمایش لیست محصولات پیدا شده */
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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
            /* ۴. وضعیت چیزی پیدا نشد مطابق دقیق تسک QA با لوتی no-product.json */
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center select-none bg-card rounded-2xl border border-dashed border-border mx-2 md:mx-0">
              <div className="w-56 h-56 max-w-full flex items-center justify-center -mt-2 mb-2">
                <LottiePlayer path="/anumations/no-product.json" className="w-full h-full" />
              </div>

              <Typography variant="h3" className=" font-black text-foreground text-lg md:text-xl">
                چیزی پیدا نشد!
              </Typography>

              <p className="text-xs md:text-sm text-muted-foreground mt-2 leading-relaxed">
                {searchedKeyword ? (
                  <>برای «<span className="text-foreground font-bold">{searchedKeyword}</span>» نتیجه‌ای پیدا نکردیم.</>
                ) : (
                  <>برای فیلترهای انتخاب‌شده نتیجه‌ای پیدا نکردیم.</>
                )}
              </p>
              
              <p className="text-xs text-muted-foreground mt-1 ">
                عبارت را تغییر دهید یا جستجوی دقیق‌تری انجام دهید.
              </p>

              {/* باکس پیشنهادی هوشمند */}
              <div className="mt-6 p-4 rounded-xl bg-muted/40 border border-border max-w-md w-full flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground ">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>پیشنهاد می‌کنیم:</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  جستجو با نام قطعه + خودرو
                </p>
                <div className="flex items-center justify-between gap-2 mt-1 pt-2 border-t border-dashed border-border/80">
                  <span className="text-[11px] text-muted-foreground ">
                    مثال: «لنت ترمز پژو ۲۰۶»
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilter('searchTitle', 'لنت ترمز پژو ۲۰۶')}
                    className="text-[11px] font-bold text-primary hover:underline shrink-0 cursor-pointer"
                  >
                    جستجوی این نمونه
                  </button>
                </div>
              </div>

              {/* دکمه پاکسازی فیلترها و جستجوی مجدد */}
              <div className="flex items-center gap-2.5 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="rounded-xl text-xs h-10 px-5 font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>پاک کردن فیلترها</span>
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>

      <BottomSheet
        isOpen={isMobileSortOpen}
        onClose={() => setIsMobileSortOpen(false)}
        title="مرتب‌سازی بر اساس"
      >
        <div className="flex flex-col w-full divide-y dark:divide-zinc-800">
          {SORT_OPTIONS.map((opt) => {
            const isActive = (filters.orderType || 'Selected') === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleMobileSortSelect(opt.value)}
                className={cn(
                  "flex items-center justify-between w-full py-4 text-sm font-bold transition-colors outline-none",
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
