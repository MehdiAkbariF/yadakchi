// src/components/features/Part/PartCategoryContent.tsx
'use client';

import * as React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useGetPartCategoryPage } from '@/domains/front/part/hooks/part.hooks';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchSidebar } from '@/components/features/ProductGrid/SearchSidebar';
import { MobileSearchHeader } from '@/components/features/ProductGrid/MobileSearchHeader';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { PageDescription } from '@/components/composites/PageDescription/PageDescription';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { PartCategoryHeaderCard } from '@/components/features/Part/components/PartCategoryHeaderCard';
import { Typography } from '@/components/primitives/Typography';
import { SortSelector } from '@/components/composites/SortSelector/SortSelector';
import { ShopProductAdBanner } from '@/components/features/ProductCard/ShopProductAdBanner';
import { ChangeCategoryModal } from './components/ChangeCategoryModal';
import { SelectPartModal } from './components/SelectPartModal';
import { getFullUrl } from '@/core/utils/formatters';

export interface PartCategoryContentProps {
  slug: string;
}

export function PartCategoryContent({ slug }: PartCategoryContentProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
  const [isChangeCatOpen, setIsChangeCatOpen] = React.useState(false);
  const [isSelectPartOpen, setIsSelectPartOpen] = React.useState(false);

  const { filters, setFilter, clearFilters } = useSearchFilters();
  const { data: categoryData } = useGetPartCategoryPage(slug);

  const currentFilters = React.useMemo(() => ({
    ...filters,
    partCategoryEnglishTitle: slug,
    partCategoryIds: categoryData?.category?.id ? [categoryData.category.id] : filters.partCategoryIds,
  }), [filters, slug, categoryData?.category?.id]);

  const { data: productsResponse, isLoading } = useSearchProducts(currentFilters);

  const products = productsResponse?.items || [];
  const totalCount = productsResponse?.totalCount || 0;
  const totalPages = productsResponse?.totalPages || 1;

  const aggregations = (productsResponse as any)?.aggregations || null;

  const breadcrumbItems = [
    { id: 'categories-root', title: 'دسته‌بندی‌ها', href: '/categories' },
    ...(categoryData?.breadCrumbs || []).map((b: any) => ({
      id: b.id,
      title: b.title,
      href: `/part-category/${b.englishTitle}`,
    })),
  ];

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-6" dir="rtl">
      {/* هدر ماژولار و مشترک موبایل با انیمیشن کشویی در اسکرول */}
      <MobileSearchHeader
        icon={
          categoryData?.category?.thumbnail ? (
            <img
              src={getFullUrl(categoryData.category.thumbnail)}
              className="h-full w-full object-contain filter dark:invert"
              alt=""
            />
          ) : null
        }
        subtitle="گروه قطعات"
        title={categoryData?.category?.name || 'قطعات یدکی'}
        actionElement={
          <>
            <button
              type="button"
              onClick={() => setIsChangeCatOpen(true)}
              className="rounded-md bg-accent px-2 py-1 text-3xs font-bold text-accent-foreground active:scale-95 transition-transform"
            >
              تغییر دسته
            </button>
            <button
              type="button"
              onClick={() => setIsSelectPartOpen(true)}
              className="rounded-md bg-secondary px-2 py-1 text-3xs font-bold text-secondary-foreground active:scale-95 transition-transform"
            >
              انتخاب قطعه
            </button>
          </>
        }
        totalCount={totalCount}
        sortValue={filters.orderType || 'Selected'}
        onSortChange={(val) => setFilter('sort', val)}
        onOpenFilters={() => setIsMobileFiltersOpen(true)}
      />

      <Breadcrumb items={breadcrumbItems} className="hidden px-4 md:flex md:px-0" />

      <div className="flex w-full items-start gap-6 md:gap-8">
        <SearchSidebar
          filters={currentFilters}
          aggregations={aggregations}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          partCategoryId={categoryData?.category?.id}
        />

        <div className="flex flex-1 min-w-0 flex-col items-stretch gap-5">
          <div className="hidden md:block">
            <PartCategoryHeaderCard
              slug={slug}
              categoryName={categoryData?.category?.name || 'گروه قطعات'}
              thumbnail={categoryData?.category?.thumbnail || null}
            />
          </div>

          <div className="block w-full lg:hidden">
            <ShopProductAdBanner partCategoryId={categoryData?.category?.id} />
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
            <div className="flex select-none flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card py-16 text-center shadow-xs">
              <ShoppingBag aria-hidden="true" className="mb-4 h-12 w-12 text-muted-foreground/40" />
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

      {categoryData?.category?.description ? (
        <PageDescription
          htmlContent={categoryData.category.description}
          title={`راهنمای خرید و شناخت قطعات ${categoryData.category.name}`}
        />
      ) : null}

      <ChangeCategoryModal isOpen={isChangeCatOpen} onClose={() => setIsChangeCatOpen(false)} />

      <SelectPartModal
        isOpen={isSelectPartOpen}
        onClose={() => setIsSelectPartOpen(false)}
        slug={slug}
        categoryName={categoryData?.category?.name || 'گروه قطعات'}
        categoryId={categoryData?.category?.id}
      />
    </div>
  );
}

export default PartCategoryContent;