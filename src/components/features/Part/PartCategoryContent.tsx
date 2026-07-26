'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ShopProductAdBanner } from '@/components/features/ProductCard/ShopProductAdBanner'; // وارد کردن بنر تبلیغات
import { ShoppingBag } from 'lucide-react';

interface PartCategoryContentProps {
  slug: string;
}

export function PartCategoryContent({ slug }: PartCategoryContentProps) {
  const router = useRouter();
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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
      href: `/part-category/${b.englishTitle}`
    }))
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-right" dir="rtl">
      
      {/* هدر چسبان موبایل */}
      <div 
        style={{
          top: isHeaderMinimized ? '56px' : '122px'
        }}
        className="md:hidden sticky z-40 bg-background border-b py-2.5 px-4 w-full flex items-center justify-between shadow-sm select-none gap-3 transition-all duration-300 mt-1 shrink-0"
      >
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

      <Breadcrumb items={breadcrumbItems} className="px-4 md:px-0" />

      <div className="w-full flex items-start gap-6 md:gap-8">
        
        {/* سایدبار فیلترها دسکتاپ: با ارسال خودکار شناسه دسته‌بندی به سایدبار جهت رندر بنر در بالای کارت */}
        <SearchSidebar
          filters={currentFilters}
          onFilterChange={(name, val) => setFilter(name, val)}
          onClearAll={clearFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          partCategoryId={categoryData?.category?.id}
        />

        <div className="flex-1 flex flex-col items-stretch gap-6">
          
          <PartCategoryHeaderCard 
            slug={slug}
            categoryName={categoryData?.category?.name || 'سیستم سوخت'}
            thumbnail={categoryData?.category?.thumbnail || null}
          />

          {/* رندر بنر تبلیغاتی منتخب کالا به صورت افقی و شیک فقط در موبایل (در بالای لیست محصولات) */}
          <div className="block lg:hidden w-full">
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
              <p className="text-xs text-muted-foreground mt-2 font-iran-sans">لطفاً فیلترهای خود را تغییر داده یا مجدداً امتحان کنید.</p>
            </div>
          )}
        </div>

      </div>

      {categoryData?.category?.description && (
        <PageDescription 
          htmlContent={categoryData.category.description} 
          title={`راهنمای خرید و شناخت قطعات ${categoryData.category.name}`}
        />
      )}

    </div>
  );
}