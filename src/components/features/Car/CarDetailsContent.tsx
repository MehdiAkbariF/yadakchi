'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Car as CarIcon, Search, X } from 'lucide-react';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useGetCarPage, useGetCarListFlat } from '@/domains/front/reference/car/hooks/car.hooks';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchSidebar } from '@/components/features/ProductGrid/SearchSidebar';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { PageDescription } from '@/components/composites/PageDescription/PageDescription';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';CarHeaderCard
import { CarHeaderCard } from './components/CarHeaderCard';
import { Typography } from '@/components/primitives/Typography';
import { useAppStore } from '@/shared/store/useAppStore';
import { SortSelector } from '@/components/composites/SortSelector/SortSelector';
import { ShopProductAdBanner } from '@/components/features/ProductCard/ShopProductAdBanner';
import { Modal, ModalBody } from '@/components/composites/Modal/Modal';
import { SelectPartModal } from '@/components/features/Part/components/SelectPartModal';
import { Input } from '@/components/primitives/Input/Input';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { cn } from '@/design-system/utils/cn';
import { getCarUrl, getFullUrl } from '@/core/utils/formatters';

export interface CarDetailsContentProps {
  slug: string;
}

export function CarDetailsContent({ slug }: CarDetailsContentProps) {
  const router = useRouter();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
  const [isChangeCarOpen, setIsChangeCarOpen] = React.useState(false);
  const [isSelectPartOpen, setIsSelectPartOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const decodedCarModel = decodeURIComponent(slug).replace(/-/g, ' ');

  const { filters, setFilter, clearFilters } = useSearchFilters();
  const currentFilters = { ...filters, carModel: decodedCarModel };

  const { data: carData } = useGetCarPage(decodedCarModel);
  const { data: productsResponse, isLoading: isProductsLoading } = useSearchProducts(currentFilters);
  const { data: cars = [], isLoading: isCarsLoading } = useGetCarListFlat(1, 200);

  const products = productsResponse?.items || [];
  const totalCount = productsResponse?.totalCount || 0;
  const totalPages = productsResponse?.totalPages || 1;

  const rawBreadcrumbs = (carData as any)?.breadCrumbs || [];
  const breadcrumbItems = [
    { id: 'cars-root', title: 'خودروها', href: '/search' },
    ...rawBreadcrumbs.map((b: any) => ({ id: b.id, title: b.title, href: undefined })),
  ];

  const filteredCars = cars.filter((car: any) =>
    car.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex w-full flex-col gap-6" dir="rtl">
      
 
      <div
        className="sticky top-[56px] z-30 -mx-4 flex w-[calc(100%+2rem)] shrink-0 select-none flex-col gap-3 border-b border-border/80 
        bg-card/95 px-4 py-3 shadow-xs backdrop-blur-md transition-all duration-normal md:hidden rounded-none"
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-muted/30 p-1">
              <img src={getFullUrl(carData?.cover)} className="h-full w-full object-contain" alt="" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-3xs font-bold text-muted-foreground">خودرو انتخابی</span>
              <span className="mt-0.5 truncate text-xs font-black text-foreground">
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
              className="rounded-lg bg-accent px-2.5 py-1.5 text-2xs font-bold text-accent-foreground active:scale-95 transition-transform"
            >
              تغییر خودرو
            </button>
            <button
              type="button"
              onClick={() => setIsSelectPartOpen(true)}
              className="rounded-lg bg-secondary px-2.5 py-1.5 text-2xs font-bold text-secondary-foreground active:scale-95 transition-transform"
            >
              انتخاب قطعه
            </button>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-2.5 border-t border-dashed border-border/60 pt-2.5">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-input bg-card px-3 text-xs font-bold text-foreground shadow-2xs active:scale-95 transition-transform"
          >
            <span>فیلترها</span>
          </button>

          <SortSelector
            value={filters.orderType || 'Selected'}
            onChange={(val) => setFilter('sort', val)}
            variant="trigger"
          />

          <span className="flex h-9 shrink-0 items-center justify-center rounded-xl bg-muted px-2.5 text-3xs font-bold text-muted-foreground">
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
          hidePartFilter
          carId={carData?.id}
        />

        {/* کانتینر محصولات با min-w-0 جهت تضمین عدم بریدگی کارت‌ها در موبایل */}
        <div className="flex flex-1 min-w-0 flex-col items-stretch gap-6">
          <div className="hidden md:block">
            <CarHeaderCard
              slug={slug}
              carName={carData?.model || 'خودرو انتخاب شده'}
              carCover={carData?.cover || null}
            />
          </div>

          <div className="block w-full lg:hidden">
            <ShopProductAdBanner carId={carData?.id} />
          </div>

          <div className="hidden md:block">
            <SortSelector
              value={filters.orderType || 'Selected'}
              onChange={(val) => setFilter('sort', val)}
              className="mt-1"
            />
          </div>

          {isProductsLoading ? (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
            <div className="mx-4 flex select-none flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card py-16 text-center md:mx-0 shadow-xs">
              <ShoppingBag aria-hidden="true" className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <Typography variant="h4" className="font-bold text-foreground">
                کالایی یافت نشد
              </Typography>
              <p className="mt-2 text-xs text-muted-foreground">
                هنوز هیچ محصول فعالی برای این خودرو ثبت نشده است.
              </p>
            </div>
          )}
        </div>
      </div>

      {carData?.description ? (
        <PageDescription
          htmlContent={carData.description}
          title={`راهنمای خرید و شناخت قطعات ${carData.model}`}
        />
      ) : null}

      {/* مودال انتخاب خودرو */}
      <Modal
        isOpen={isChangeCarOpen}
        onClose={() => setIsChangeCarOpen(false)}
        className="flex h-full max-h-full w-full max-w-none flex-col rounded-none bg-card p-0 md:relative md:h-[550px] md:max-h-[90vh] md:max-w-2xl md:rounded-2xl md:overflow-hidden"
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

        <ModalBody className="h-full flex-1 overflow-y-auto bg-card p-4 sm:p-6">
          {isCarsLoading ? (
            <PageLoading label="در حال دریافت لیست خودروها..." />
          ) : filteredCars.length > 0 ? (
            <div className="grid w-full grid-cols-2 gap-3 py-1 sm:grid-cols-3">
              {filteredCars.map((car: any) => (
                <div
                  key={car.id}
                  onClick={() => {
                    router.push(getCarUrl(car.englishTitle));
                    setIsChangeCarOpen(false);
                  }}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-2.5 rounded-2xl border border-border/80 p-3 text-center transition-all hover:border-primary/50 hover:bg-accent/40 active:scale-95',
                    slug === car.englishTitle && 'border-primary bg-primary/5 ring-1 ring-primary'
                  )}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted/20">
                    <img src={getFullUrl(car.cover)} alt={car.model} className="h-full w-full object-contain p-1" />
                  </div>
                  <span className="text-xs font-bold text-foreground truncate w-full">{car.model}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full rounded-2xl border border-dashed border-border bg-card py-12 text-center">
              <span className="text-xs font-bold text-muted-foreground">خودرویی یافت نشد.</span>
            </div>
          )}
        </ModalBody>
      </Modal>

      <SelectPartModal
        isOpen={isSelectPartOpen}
        onClose={() => setIsSelectPartOpen(false)}
        slug="Fuel-System"
        categoryName={carData?.model || 'خودرو'}
        carSlug={slug}
      />
    </div>
  );
}