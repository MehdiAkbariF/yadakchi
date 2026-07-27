// src/components/features/Car/CarDetailsContent.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchFilters } from '@/shared/hooks/useSearchFilters';
import { useGetCarPage, useGetCarListFlat } from '@/domains/front/reference/car/hooks/car.hooks';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { SearchSidebar } from '@/components/features/ProductGrid/SearchSidebar';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { PageDescription } from '@/components/composites/PageDescription/PageDescription';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { CarHeaderCard } from './components/CarHeaderCard';
import { Typography } from '@/components/primitives/Typography';
import { useAppStore } from '@/shared/store/useAppStore';
import { SortSelector } from '@/components/composites/SortSelector/SortSelector';
import { ShopProductAdBanner } from '@/components/features/ProductCard/ShopProductAdBanner';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { SelectPartModal } from '@/components/features/Part/components/SelectPartModal';
import { Input } from '@/components/primitives/Input/Input';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { ShoppingBag, Car as CarIcon, Search, ChevronLeft, Settings, X } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { getCarUrl } from '@/core/utils/formatters';

interface CarDetailsContentProps {
  slug: string;
}

export function CarDetailsContent({ slug }: CarDetailsContentProps) {
  const router = useRouter();
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isChangeCarOpen, setIsChangeCarOpen] = useState(false);
  const [isSelectPartOpen, setIsSelectPartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    ...rawBreadcrumbs.map((b: any) => ({
      id: b.id,
      title: b.title,
      href: undefined
    }))
  ];

  /*
    اصلاح امضای تابع محلی جهت پذیرش امن تایپ undefined (رفع ارور ts-2345):
  */
  const getFullUrl = (path: string | null | undefined) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const filteredCars = cars.filter((car: any) =>
    car.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-6 text-right" dir="rtl">
      
      {/* هدر تلفیقی میکرو چسبان مخصوص موبایل */}
      <div 
        style={{
          top: isHeaderMinimized ? '56px' : '122px'
        }}
        className="md:hidden sticky z-40 bg-background border-b py-2.5 px-4 w-full flex flex-col gap-3 shadow-sm select-none transition-all duration-300 mt-1 shrink-0"
      >
        {/* ردیف اول: مینی آدرس و تغییر سریع خودرو */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-lg border bg-muted/10 flex items-center justify-center overflow-hidden">
              <img src={getFullUrl(carData?.cover)} className="w-full h-full object-contain" alt="" />
            </div>
            <div className="flex flex-col min-w-0 text-right">
              <span className="text-[9px] text-muted-foreground font-bold leading-none">خودرو انتخابی</span>
              <span className="text-xs font-black text-foreground truncate mt-1 leading-none">{carData?.model || 'خودرو'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => { setSearchQuery(''); setIsChangeCarOpen(true); }}
              className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg outline-none"
            >
              تغییر خودرو
            </button>
            <button
              onClick={() => setIsSelectPartOpen(true)}
              className="text-[10px] font-black text-foreground bg-secondary px-2.5 py-1.5 rounded-lg outline-none"
            >
              انتخاب قطعه
            </button>
          </div>
        </div>

        {/* ردیف دوم: فیلترها و دکمه مرتب‌سازی در یک خط */}
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

      <Breadcrumb items={breadcrumbItems} className="hidden md:flex px-4 md:px-0" />

      <div className="w-full flex items-start gap-6 md:gap-8">
        
        <SearchSidebar
          filters={currentFilters}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          hidePartFilter={true}
          carId={carData?.id}
        />

        <div className="flex-1 flex flex-col items-stretch gap-6">
          
          <div className="hidden md:block">
            <CarHeaderCard 
              slug={slug}
              carName={carData?.model || 'خودرو انتخاب شده'}
              carCover={carData?.cover || null}
            />
          </div>

          <div className="block lg:hidden w-full">
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
              <p className="text-xs text-muted-foreground mt-2 font-iran-sans">هنوز هیچ محصول فعالی برای این خودرو ثبت نشده است.</p>
            </div>
          )}
        </div>

      </div>

      {carData?.description && (
        <PageDescription 
          htmlContent={carData.description} 
          title={`راهنمای خرید و شناخت قطعات ${carData.model}`}
        />
      )}

      {/* مودال تغییر خودرو */}
      <Modal 
        isOpen={isChangeCarOpen} 
        onClose={() => setIsChangeCarOpen(false)} 
        className="w-full h-full max-h-full max-w-none p-0 rounded-none flex flex-col fixed inset-0 z-50 bg-background md:relative md:max-w-2xl md:h-[550px] md:max-h-[90vh] md:rounded-xl md:overflow-hidden"
        overlayClassName="bg-black/40 backdrop-blur-md"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b shrink-0 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-iran-yekan flex items-center gap-1.5 text-foreground">
              <CarIcon className="h-4 w-4 text-primary" />
              تغییر خودرو فعال
            </span>
          </div>
          <button 
            onClick={() => setIsChangeCarOpen(false)}
            className="p-1.5 hover:bg-muted rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 border-b bg-background shrink-0">
          <Input
            placeholder="جستجوی مدل خودرو (مثال: پراید، تارا...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            className="w-full font-iran-yekan"
          />
        </div>

        <ModalBody className="flex-1 overflow-y-auto p-6 bg-background h-full">
          {isCarsLoading ? (
            <PageLoading message="در حال دریافت لیست خودروها..." />
          ) : filteredCars.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full py-1">
              {filteredCars.map((car: any) => (
                <div
                  key={car.id}
                  onClick={() => {
                    window.location.href = getCarUrl(car.englishTitle);
                    setIsChangeCarOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-center group",
                    slug === car.englishTitle ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                  )}
                >
                  <div className="w-full aspect-[4/3] relative overflow-hidden rounded-lg">
                    <img
                      src={getFullUrl(car.cover)}
                      alt={car.model}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-bold font-iran-yekan text-foreground">{car.model}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full py-12 text-center border border-dashed rounded-xl bg-card">
              <span className="text-xs font-bold font-iran-yekan text-muted-foreground">خودرویی یافت نشد.</span>
            </div>
          )}
        </ModalBody>
      </Modal>

      <SelectPartModal
        isOpen={isSelectPartOpen}
        onClose={() => setIsSelectPartOpen(false)}
        slug="Fuel-System"
        categoryName={carData?.model || 'خودرو'}
      />

    </div>
  );
}