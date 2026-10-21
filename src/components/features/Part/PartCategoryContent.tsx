'use client';

import * as React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useGetPartCategoryPage } from '@/domains/front/part/hooks/part.hooks';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchSidebar } from '@/components/features/ProductGrid/SearchSidebar';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { PageDescription } from '@/components/composites/PageDescription/PageDescription';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { PartCategoryHeaderCard } from '@/components/features/Part/components/PartCategoryHeaderCard';
import { Typography } from '@/components/primitives/Typography';
import { useAppStore } from '@/shared/store/useAppStore';
import { SortSelector } from '@/components/composites/SortSelector/SortSelector';
import { ShopProductAdBanner } from '@/components/features/ProductCard/ShopProductAdBanner';
import { ChangeCategoryModal } from './components/ChangeCategoryModal';
import { SelectPartModal } from './components/SelectPartModal';
import { getFullUrl } from '@/core/utils/formatters';

export interface PartCategoryContentProps {
  slug: string;
}

export function PartCategoryContent({ slug }: PartCategoryContentProps) {
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
  const [isChangeCatOpen, setIsChangeCatOpen] = React.useState(false);
  const [isSelectPartOpen, setIsSelectPartOpen] = React.useState(false);

  const { filters, setFilter, clearFilters } = useSearchFilters();
  const currentFilters = { ...filters, partCategoryEnglishTitle: slug };

  const { data: categoryData } = useGetPartCategoryPage(slug);
  const { data: productsResponse, isLoading } = useSearchProducts(currentFilters);

  const products = productsResponse?.items || [];
  const totalCount = productsResponse?.totalCount || 0;
  const totalPages = productsResponse?.totalPages || 1;

  const breadcrumbItems = [
    { id: 'categories-root', title: 'دسته‌بندی‌ها', href: '/categories' },
    ...(categoryData?.breadCrumbs || []).map((b: any) => ({
      id: b.id,
      title: b.title,
      href: `/part-category/${b.englishTitle}`,
    })),
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      <div
        style={{ top: isHeaderMinimized ? '56px' : '122px' }}
        className="sticky z-40 mt-1 flex w-full shrink-0 select-none flex-col gap-3 border-b border-border bg-card px-4 py-2.5 shadow-xs transition-colors md:hidden"
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
              <img
                src={getFullUrl(categoryData?.category?.thumbnail)}
                className="h-full w-full object-contain filter dark:invert"
                alt=""
              />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-2xs font-bold leading-none text-muted-foreground">گروه قطعات</span>
              <span className="mt-1 truncate text-xs font-bold leading-none text-foreground">
                {categoryData?.category?.name || 'قطعات یدکی'}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsChangeCatOpen(true)}
              className="rounded-md bg-accent px-2.5 py-1.5 text-2xs font-bold text-accent-foreground outline-none"
            >
              تغییر دسته
            </button>
            <button
              type="button"
              onClick={() => setIsSelectPartOpen(true)}
              className="rounded-md bg-secondary px-2.5 py-1.5 text-2xs font-bold text-secondary-foreground outline-none"
            >
              انتخاب قطعه
            </button>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-3 border-t border-dashed border-border pt-2.5">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-input bg-card px-3 text-xs font-bold text-foreground shadow-xs outline-none transition-colors hover:bg-muted"
          >
            <span className="truncate">فیلترها</span>
          </button>

          <SortSelector
            value={filters.orderType || 'Selected'}
            onChange={(val) => setFilter('sort', val)}
            variant="trigger"
          />

          <span className="flex h-9 shrink-0 items-center justify-center rounded-md bg-muted px-2.5 text-2xs font-bold text-muted-foreground">
            {new Intl.NumberFormat('fa-IR').format(totalCount)} کالا
          </span>
        </div>
      </div>

      <Breadcrumb items={breadcrumbItems} className="hidden px-4 md:flex md:px-0" />

      <div className="flex w-full items-start gap-6 md:gap-8">
        <SearchSidebar
          filters={currentFilters}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          partCategoryId={categoryData?.category?.id}
        />

        <div className="flex flex-1 flex-col items-stretch gap-6">
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
            <div className="mx-4 flex select-none flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16 text-center md:mx-0">
              <ShoppingBag aria-hidden="true" className="mb-4 h-12 w-12 text-muted-foreground/60" />
              <Typography variant="h4" className="font-bold text-foreground">
                کالایی یافت نشد
              </Typography>
              <p className="mt-2 text-xs text-muted-foreground">
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
      />
    </div>
  );
}
