'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetFavoriteProducts } from '@/domains/userpanel/hooks/userpanel.hooks';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { Select } from '@/components/primitives/Select/Select';
import { Button } from '@/components/primitives/Button/Button';
import { Heart, ArrowRight, ShoppingBag } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export function FavoritesList() {
  const router = useRouter();
  const [order, setOrder] = useState('Latest');
  const [page, setPage] = useState(1);

  const { data: favoritesResponse, isLoading } = useGetFavoriteProducts(page, order);

  const favorites = favoritesResponse?.items || [];
  const totalPages = favoritesResponse?.totalPages || 1;

  const orderOptions = [
    { value: 'Latest', label: 'جدیدترین‌ها' },
    { value: 'Oldest', label: 'قدیمی‌ترین‌ها' },
    { value: 'HighestRate', label: 'بیشترین امتیاز' },
    { value: 'LowestRate', label: 'کمترین امتیاز' },
    { value: 'HighestPrice', label: 'بیشترین قیمت' },
    { value: 'LowestPrice', label: 'کمترین قیمت' }
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 w-full text-right" dir="rtl">
      
      <div className="lg:hidden flex items-center justify-between border-b pb-3 mb-1 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/profile')}
            className="p-1 -mr-1 hover:bg-muted rounded-full flex items-center justify-center transition-colors"
            aria-label="Back"
          >
            <ArrowRight className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-sm font-bold font-iran-yekan text-foreground">کالاهای محبوب من</span>
        </div>
      </div>

      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary shrink-0" />
            <span className="text-lg md:text-xl font-black text-foreground font-iran-yekan">کالاهای محبوب</span>
          </div>
          <p className="text-xs text-muted-foreground font-iran-sans">
            لیست کالاهایی که با قلبی کردن در صفحات محصول، برای دسترسی سریع ذخیره کرده‌اید
          </p>
        </div>

        <div className="w-full sm:max-w-xs shrink-0 select-none">
          <Select
            placeholder="مرتب‌سازی بر اساس"
            value={order}
            onChange={(e) => {
              setOrder(e.target.value);
              setPage(1);
            }}
            options={orderOptions}
          />
        </div>
      </div>

      {isLoading ? (
        <PageLoading message="در حال دریافت کالاهای محبوب شما..." />
      ) : favorites.length > 0 ? (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
            {favorites.map((product) => (
              <ProductSearchCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      ) : (
        <div className="w-full py-16 text-center border border-dashed rounded-2xl bg-card flex flex-col items-center justify-center gap-3.5">
          <Heart className="h-12 w-12 text-muted-foreground/60 stroke-[1.5] animate-pulse" />
          <span className="text-xs font-bold font-iran-sans text-muted-foreground">هنوز هیچ کالایی را به لیست محبوب‌های خود اضافه نکرده‌اید.</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/search')}
            className="rounded-xl mt-2 text-xs font-bold font-iran-sans h-10 px-6 py-2 flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>مشاهده و خرید کالاها</span>
          </Button>
        </div>
      )}

    </div>
  );
}