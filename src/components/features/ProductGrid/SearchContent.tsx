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

// کامپوننت رندر مستقیم و بهینه لاتی در کلاینت
function LottiePlayer({ path, className = "w-56 h-56", loop = true }: { path: string; className?: string; loop?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anim: any = null;
    let isMounted = true;

    const init = async () => {
      try {
        const altPath = path.includes('/anumations/')
          ? path.replace('/anumations/', '/animations/')
          : path.replace('/animations/', '/anumations/');
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
    <div className="relative flex w-full flex-col gap-6" dir="rtl">
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

      <div className="flex w-full items-start gap-6 md:gap-8">
        <SearchSidebar
          filters={filters}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
        />

        <div className="flex flex-1 flex-col items-stretch gap-6">
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
            <div className="flex animate-pulse items-center justify-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>در حال جستجو و دریافت نتایج جدید...</span>
            </div>
          )}

          {/* ۱. وضعیت در حال جستجو: نمایش اسکلتون */}
          {isSearching ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {[...Array(10)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            /* ۲. وضعیت خطای ارتباط یا سرور */
            <div className="mx-4 flex select-none flex-col items-center justify-center rounded-xl border border-dashed border-destructive/30 bg-card p-8 text-center md:mx-0">
              <AlertCircle className="mb-4 h-12 w-12 text-destructive stroke-[1.5]" />
              <Typography variant="h4" className="font-extrabold text-foreground">
                خطای ارتباط با سرور
              </Typography>
              <p className="mt-2 max-w-md text-xs text-muted-foreground">
                لطفا بعدا دوباره تلاش کنید یا اتصال اینترنت خود را بررسی نمایید.
              </p>
            </div>
          ) : productItems.length > 0 ? (
            /* ۳. نمایش لیست محصولات پیدا شده */
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
            /* ۴. وضعیت پیدا نشدن محصول مطابق استاندارد دیزاین سیستم */
            <div className="mx-2 flex select-none flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-4 py-12 text-center md:mx-0">
              <div className="-mt-2 mb-2 flex h-56 w-56 max-w-full items-center justify-center">
                <LottiePlayer path="/anumations/no-product.json" className="h-full w-full" />
              </div>

              <Typography variant="h3" className="text-lg font-black text-foreground md:text-xl">
                چیزی پیدا نشد!
              </Typography>

              <p className="mt-2 text-xs leading-relaxed text-muted-foreground md:text-sm">
                {searchedKeyword ? (
                  <>برای «<span className="font-bold text-foreground">{searchedKeyword}</span>» نتیجه‌ای پیدا نکردیم.</>
                ) : (
                  <>برای فیلترهای انتخاب‌شده نتیجه‌ای پیدا نکردیم.</>
                )}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                عبارت را تغییر دهید یا جستجوی دقیق‌تری انجام دهید.
              </p>

              {/* باکس پیشنهادی هوشمند */}
              <div className="mt-6 flex w-full max-w-md flex-col gap-2 rounded-lg border border-border bg-muted/40 p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-warning shrink-0" />
                  <span>پیشنهاد می‌کنیم:</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  جستجو با نام قطعه + خودرو
                </p>
                <div className="mt-1 flex items-center justify-between gap-2 border-t border-dashed border-border pt-2">
                  <span className="text-2xs text-muted-foreground">
                    مثال: «لنت ترمز پژو ۲۰۶»
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilter('searchTitle', 'لنت ترمز پژو ۲۰۶')}
                    className="cursor-pointer text-2xs font-bold text-primary transition-colors hover:underline shrink-0"
                  >
                    جستجوی این نمونه
                  </button>
                </div>
              </div>

              {/* دکمه پاکسازی فیلترها و جستجوی مجدد */}
              <div className="mt-6 flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex h-10 items-center gap-1.5 rounded-md px-5 text-xs font-bold shadow-xs border-border"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
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
        <div className="flex w-full flex-col divide-y divide-border" dir="rtl">
          {SORT_OPTIONS.map((opt) => {
            const isActive = (filters.orderType || 'Selected') === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleMobileSortSelect(opt.value)}
                className={cn(
                  'flex w-full items-center justify-between py-3.5 text-sm font-medium transition-colors outline-none',
                  isActive ? 'font-bold text-primary' : 'text-foreground hover:bg-muted/30'
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