'use client';

import * as React from 'react';
import { ShoppingBag, Car as CarIcon, Settings, Search, X } from 'lucide-react';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useGetCarPage, useGetCarListFlat } from '@/domains/front/reference/car/hooks/car.hooks';
import { useGetPartCategoryPage } from '@/domains/front/part/hooks/part.hooks';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchSidebar } from '@/components/features/ProductGrid/SearchSidebar';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { Typography } from '@/components/primitives/Typography';
import { useAppStore } from '@/shared/store/useAppStore';
import { SortSelector } from '@/components/composites/SortSelector/SortSelector';
import { ShopProductAdBanner } from '@/components/features/ProductCard/ShopProductAdBanner';
import { Modal, ModalBody } from '@/components/composites/Modal/Modal';
import { ChangeCategoryModal } from '@/components/features/Part/components/ChangeCategoryModal';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { cn } from '@/design-system/utils/cn';
import { getCarUrl, getFullUrl } from '@/core/utils/formatters';
import { PageDescription } from '@/components/composites/PageDescription/PageDescription';

export interface CarPartsContentProps {
  partSlug: string;
  carSlug: string;
}

export function CarPartsContent({ partSlug, carSlug }: CarPartsContentProps) {
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
  const [isChangeCarOpen, setIsChangeCarOpen] = React.useState(false);
  const [isChangeCatOpen, setIsChangeCatOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const decodedCarModel = decodeURIComponent(carSlug).replace(/-/g, ' ');

  const { filters, setFilter, clearFilters } = useSearchFilters();
  const currentFilters = {
    ...filters,
    carModel: decodedCarModel,
    partCategoryEnglishTitle: partSlug,
  };

  const { data: carData } = useGetCarPage(decodedCarModel);
  const { data: categoryData } = useGetPartCategoryPage(partSlug);
  const { data: productsResponse, isLoading: isProductsLoading } = useSearchProducts(currentFilters);
  const { data: cars = [], isLoading: isCarsLoading } = useGetCarListFlat(1, 200);

  const products = productsResponse?.items || [];
  const totalCount = productsResponse?.totalCount || 0;
  const totalPages = productsResponse?.totalPages || 1;

  const breadcrumbItems = [
    { id: 'cars-root', title: 'خودروها', href: '/search' },
    { id: 'car-active', title: carData?.model || decodedCarModel, href: getCarUrl(carSlug) },
    { id: 'part-active', title: categoryData?.category?.name || partSlug },
  ];

  const filteredCars = cars.filter((car: any) =>
    car.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <div
        style={{ top: isHeaderMinimized ? '56px' : '122px' }}
        className="sticky z-40 mt-1 flex w-full shrink-0 select-none flex-col gap-3 border-b border-border bg-card px-4 py-2.5 shadow-xs transition-colors md:hidden"
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
              <img src={getFullUrl(carData?.cover)} className="h-full w-full object-contain" alt="" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-2xs font-bold leading-none text-muted-foreground">
                {categoryData?.category?.name || 'قطعات'}
              </span>
              <span className="mt-1 truncate text-xs font-bold leading-none text-foreground">
                {carData?.model || 'خودرو'}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsChangeCarOpen(true);
              }}
              className="rounded-md bg-accent px-2.5 py-1.5 text-2xs font-bold text-accent-foreground outline-none"
            >
              تغییر خودرو
            </button>
            <button
              type="button"
              onClick={() => setIsChangeCatOpen(true)}
              className="rounded-md bg-secondary px-2.5 py-1.5 text-2xs font-bold text-secondary-foreground outline-none"
            >
              تغییر قطعه
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

      <div className="hidden md:block">
        <Card className="flex w-full items-center justify-between gap-5 p-4 shadow-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                <img src={getFullUrl(carData?.cover)} className="h-full w-full object-contain" alt="" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-2xs font-bold text-muted-foreground">خودرو انتخابی:</span>
                <h2 className="text-sm font-bold text-foreground md:text-base">
                  {carData?.model || decodedCarModel}
                </h2>
              </div>
            </div>

            <div className="h-10 w-px bg-border" />

            <div className="flex items-center gap-3.5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted p-3">
                {categoryData?.category?.thumbnail ? (
                  <img
                    src={getFullUrl(categoryData.category.thumbnail)}
                    className="h-full w-full object-contain filter dark:invert"
                    alt=""
                  />
                ) : (
                  <Settings aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-2xs font-bold text-muted-foreground">دسته قطعات:</span>
                <h2 className="text-sm font-bold text-foreground md:text-base">
                  {categoryData?.category?.name || partSlug}
                </h2>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setIsChangeCarOpen(true);
              }}
              className="h-10 px-5 text-xs font-bold"
            >
              تغییر خودرو
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsChangeCatOpen(true)}
              className="h-10 px-5 text-xs font-bold shadow-xs"
            >
              تغییر قطعه
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex w-full items-start gap-6 md:gap-8">
        <SearchSidebar
          filters={currentFilters}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          carId={carData?.id}
          partCategoryId={categoryData?.category?.id}
        />

        <div className="flex flex-1 flex-col items-stretch gap-6">
          <div className="w-full">
            <ShopProductAdBanner carId={carData?.id} partCategoryId={categoryData?.category?.id} />
          </div>

          <div className="hidden md:block">
            <SortSelector
              value={filters.orderType || 'Selected'}
              onChange={(val) => setFilter('sort', val)}
              className="mt-1"
            />
          </div>

          {isProductsLoading ? (
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
                هنوز هیچ محصول فعال و موجودی برای این ترکیب خودرو و قطعه یافت نشد.
              </p>
            </div>
          )}
        </div>
      </div>

      {categoryData?.category?.description ? (
        <PageDescription
          htmlContent={categoryData.category.description}
          title={`راهنمای خرید و شناخت قطعات ${categoryData.category.name} مخصوص ${carData?.model || decodedCarModel}`}
        />
      ) : null}

      <Modal
        isOpen={isChangeCarOpen}
        onClose={() => setIsChangeCarOpen(false)}
        className="flex h-full max-h-full w-full max-w-none flex-col rounded-none bg-card p-0 md:relative md:h-[550px] md:max-h-[90vh] md:max-w-2xl md:rounded-lg md:overflow-hidden"
        overlayClassName="bg-foreground/40 backdrop-blur-md"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-4 py-4">
          <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <CarIcon aria-hidden="true" className="h-4 w-4 text-primary" />
            تغییر خودرو فعال
          </span>
          <button
            type="button"
            onClick={() => setIsChangeCarOpen(false)}
            aria-label="بستن"
            className="rounded-full p-1.5 transition-colors hover:bg-muted"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="shrink-0 border-b border-border bg-card p-4">
          <Input
            placeholder="جستجوی مدل خودرو (مثال: پراید، تارا...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search aria-hidden="true" className="h-4 w-4" />}
            className="w-full"
          />
        </div>

        <ModalBody className="h-full flex-1 overflow-y-auto bg-card p-6">
          {isCarsLoading ? (
            <PageLoading label="در حال دریافت لیست خودروها..." />
          ) : filteredCars.length > 0 ? (
            <div className="grid w-full grid-cols-2 gap-4 py-1 sm:grid-cols-3">
              {filteredCars.map((car: any) => (
                <div
                  key={car.id}
                  onClick={() => {
                    window.location.href = `/car-parts/${partSlug}/${car.englishTitle}`;
                    setIsChangeCarOpen(false);
                  }}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-3 rounded-md border border-border p-4 text-center transition-colors hover:border-primary/50 hover:bg-accent/50',
                    carSlug === car.englishTitle && 'border-primary bg-accent/50 ring-1 ring-primary'
                  )}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
                    <img src={getFullUrl(car.cover)} alt={car.model} className="h-full w-full object-contain" />
                  </div>
                  <span className="text-xs font-bold text-foreground sm:text-sm">{car.model}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full rounded-md border border-dashed border-border bg-card py-12 text-center">
              <span className="text-xs font-bold text-muted-foreground">خودرویی یافت نشد.</span>
            </div>
          )}
        </ModalBody>
      </Modal>

      <ChangeCategoryModal isOpen={isChangeCatOpen} onClose={() => setIsChangeCatOpen(false)} />
    </div>
  );
}
