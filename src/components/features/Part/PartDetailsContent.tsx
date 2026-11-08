// src/components/features/Part/PartDetailsContent.tsx
'use client';

import * as React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useGetPartPage } from '@/domains/front/part/hooks/part.hooks';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchSidebar } from '@/components/features/ProductGrid/SearchSidebar';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { PageDescription } from '@/components/composites/PageDescription/PageDescription';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { PartHeaderCard } from './components/PartHeaderCard';
import { Typography } from '@/components/primitives/Typography';
import { useAppStore } from '@/shared/store/useAppStore';
import { SortSelector } from '@/components/composites/SortSelector/SortSelector';
import { ShopProductAdBanner } from '@/components/features/ProductCard/ShopProductAdBanner';
import { SelectPartModal } from './components/SelectPartModal';
import { getFullUrl } from '@/core/utils/formatters';

export interface PartDetailsContentProps {
  categorySlug: string;
  partSlug: string;
  partId?: string;
  categoryId?: string | null;
}

export function PartDetailsContent({
  categorySlug,
  partSlug,
  partId,
  categoryId,
}: PartDetailsContentProps) {
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
  const [isSelectPartOpen, setIsSelectPartOpen] = React.useState(false);

  const { filters, setFilter, clearFilters } = useSearchFilters();
  const { data: partData } = useGetPartPage(partSlug);

  const resolvedPartId = partId || partData?.id;
  const resolvedCategoryId = categoryId || partData?.category?.id;

  const currentFilters = React.useMemo(() => {
    return {
      ...filters,
      partIds: resolvedPartId ? [resolvedPartId] : undefined,
      partCategoryIds: resolvedCategoryId ? [resolvedCategoryId] : undefined,
    };
  }, [filters, resolvedPartId, resolvedCategoryId]);

  const { data: productsResponse, isLoading } = useSearchProducts(currentFilters);

  const products = productsResponse?.items || [];
  const totalCount = productsResponse?.totalCount || 0;
  const totalPages = productsResponse?.totalPages || 1;

  // استخراج دیتای تجمیعی سرور برای سایدبار فیلترها
  const aggregations = (productsResponse as any)?.aggregations || null;

  // ساخت منوی نان‌ریزه (Breadcrumb)
  const breadcrumbItems = React.useMemo(() => {
    const rawBreadcrumbs = (partData as any)?.breadCrumbs || [];
    if (rawBreadcrumbs.length > 0) {
      return [
        { id: 'categories-root', title: 'دسته‌بندی‌ها', href: '/categories' },
        ...rawBreadcrumbs.map((b: any, idx: number) => {
          const isLast = idx === rawBreadcrumbs.length - 1;
          return {
            id: b.id,
            title: b.title,
            href: isLast ? undefined : `/part-category/${b.englishTitle}`,
          };
        }),
      ];
    }

    return [
      { id: 'categories-root', title: 'دسته‌بندی‌ها', href: '/categories' },
      ...(partData?.category?.name
        ? [
            {
              id: partData.category.id || 'cat-id',
              title: partData.category.name,
              href: `/part-category/${partData.category.englishTitle || categorySlug}`,
            },
          ]
        : []),
      ...(partData?.name
        ? [
            {
              id: partData.id || 'part-id',
              title: partData.name,
              href: undefined as any,
            },
          ]
        : []),
    ];
  }, [partData, categorySlug]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full" dir="rtl">
      {/* هدر چسبان موبایل با همان ابعاد و کلاس‌های دقیق مدنظر شما */}
      <div
        className="sticky top-14 z-30 -mx-4 -mt-2 flex w-[calc(100%+2rem)] shrink-0 select-none flex-col gap-1 border-b border-border/80 bg-card/95 px-3 py-2 shadow-xs backdrop-blur-md transition-all duration-normal md:hidden"
      >
        <div className="flex w-full items-center justify-between mt-2">
          <div className="flex min-w-0 items-center gap-2">
         
            <div className="flex min-w-0 flex-col">
              <span className="text-[0.625rem] font-bold text-muted-foreground leading-none">قطعه انتخابی</span>
              <span className="mt-0.5 truncate text-xs font-bold text-foreground">
                {partData?.name || 'قطعه یدکی'}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsSelectPartOpen(true)}
              className="rounded-md bg-accent px-2 py-1 text-3xs font-bold text-accent-foreground active:scale-95 transition-transform"
            >
              تغییر قطعه
            </button>
          </div>
        </div>

        {/* ردیف دوم: فیلترها و مرتب‌سازی کامپکت */}
        <div className="flex w-full items-center justify-between gap-2 border-t border-dashed border-border/60 pt-1.5">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-input bg-card px-2.5 text-2xs font-bold shadow-2xs active:scale-95 transition-transform"
          >
            <span>فیلترها</span>
          </button>

          <SortSelector
            value={filters.orderType || 'Selected'}
            onChange={(val) => setFilter('sort', val)}
            variant="trigger"
          />

          <span className="flex h-8 shrink-0 items-center justify-center rounded-lg bg-muted px-2 text-3xs font-bold text-muted-foreground">
            {new Intl.NumberFormat('fa-IR').format(totalCount)} کالا
          </span>
        </div>
      </div>

      <Breadcrumb items={breadcrumbItems} className="hidden px-4 md:flex md:px-0" />

      <div className="flex w-full items-start gap-6 md:gap-8">
        {/* ارسال کامل aggregations و شناسه به سایدبار */}
        <SearchSidebar
          filters={currentFilters as any}
          aggregations={aggregations}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          hidePartFilter
          partId={resolvedPartId}
          partCategoryId={resolvedCategoryId}
        />

        <div className="flex flex-1 min-w-0 flex-col items-stretch gap-5">
          <div className="hidden md:block">
            <PartHeaderCard
              partSlug={partSlug}
              categorySlug={categorySlug}
              partName={partData?.name || 'قطعه یدکی'}
            />
          </div>

          <div className="block w-full lg:hidden">
            <ShopProductAdBanner partId={resolvedPartId} />
          </div>

          <div className="hidden md:block">
            <SortSelector
              value={filters.orderType || 'Selected'}
              onChange={(val) => setFilter('sort', val)}
              className="mt-1"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
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
            <div className="mx-4 flex select-none flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center md:mx-0 shadow-xs">
              <ShoppingBag aria-hidden="true" className="mb-4 h-12 w-12 text-muted-foreground/60" />
              <Typography variant="h4" className="font-bold text-foreground">
                کالایی یافت نشد
              </Typography>
              <p className="mt-2 text-base text-muted-foreground">
                لطفاً فیلترهای خود را تغییر داده یا مجدداً امتحان کنید.
              </p>
            </div>
          )}
        </div>
      </div>

      {partData?.description ? (
        <PageDescription
          htmlContent={partData.description}
          title={`راهنمای خرید و شناخت ${partData.name}`}
        />
      ) : null}

      <SelectPartModal
        isOpen={isSelectPartOpen}
        onClose={() => setIsSelectPartOpen(false)}
        slug={partData?.category?.englishTitle || categorySlug}
        categoryName={partData?.category?.name || 'گروه قطعات'}
        categoryId={resolvedCategoryId}
      />
    </div>
  );
}

export default PartDetailsContent;