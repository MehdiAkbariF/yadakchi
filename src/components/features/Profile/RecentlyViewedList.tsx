'use client';

import { useRouter } from 'next/navigation';
import { useGetRecentlyViewedProducts } from '@/domains/userpanel/hooks/userpanel.hooks';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Button } from '@/components/primitives/Button/Button';
import { Eye, ArrowRight, ShoppingBag } from 'lucide-react';

export function RecentlyViewedList() {
  const router = useRouter();
  const { data: products = [], isLoading, isError, error } = useGetRecentlyViewedProducts();

  console.log('[RecentlyViewed Debug] Products:', products);
  console.log('[RecentlyViewed Debug] Loading:', isLoading);

  if (isError) {
    console.error('[RecentlyViewed Debug] Query Error:', error);
  }

  if (isLoading) {
    return <PageLoading message="در حال دریافت آخرین کالاهای بازدید شده..." />;
  }

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
          <span className="text-sm font-bold font-iran-yekan text-foreground">کالاهای دیده‌شده اخیر</span>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2 border-b pb-5">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary shrink-0" />
          <span className="text-lg md:text-xl font-black text-foreground font-iran-yekan">کالاهای دیده‌شده اخیر</span>
        </div>
        <p className="text-xs text-muted-foreground font-iran-sans">
          تاریخچه محصولاتی که اخیراً در فروشگاه یدک‌چی از آن‌ها بازدید کرده‌اید
        </p>
      </div>

      {products.length > 0 ? (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
            {products.map((product) => (
              <ProductSearchCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full py-16 text-center border border-dashed rounded-2xl bg-card flex flex-col items-center justify-center gap-3.5">
          <Eye className="h-12 w-12 text-muted-foreground/60 stroke-[1.5] animate-pulse" />
          <span className="text-xs font-bold font-iran-sans text-muted-foreground">هنوز تاریخچه بازدیدی برای حساب شما ثبت نشده است.</span>
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