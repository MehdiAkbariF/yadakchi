'use client';

import { useRouter } from 'next/navigation';
import { Eye, ArrowRight, ShoppingBag } from 'lucide-react';
import { useGetRecentlyViewedProducts } from '@/domains/userpanel/hooks/userpanel.hooks';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Button } from '@/components/primitives/Button/Button';

export function RecentlyViewedList() {
  const router = useRouter();
  const { data: products = [], isLoading } = useGetRecentlyViewedProducts();

  if (isLoading) {
    return <PageLoading label="در حال دریافت آخرین کالاهای بازدید شده..." />;
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="mb-1 flex items-center justify-between border-b border-border pb-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/profile')}
            aria-label="بازگشت"
            className="-me-1 flex items-center justify-center rounded-full p-1 transition-colors hover:bg-muted"
          >
            <ArrowRight aria-hidden="true" className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-sm font-bold text-foreground">کالاهای دیده شده اخیر</span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 border-b border-border pb-5">
        <div className="flex items-center gap-2">
          <Eye aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
          <span className="text-xl font-bold text-foreground">کالاهای دیده شده اخیر</span>
        </div>
        <p className="text-xs text-muted-foreground">
          تاریخچه محصولاتی که اخیراً در فروشگاه یدک‌چی از آن‌ها بازدید کرده‌اید
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {products.map((product: any) => (
            <ProductSearchCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-3.5 rounded-lg border border-dashed border-border bg-card py-16 text-center">
          <Eye aria-hidden="true" className="h-12 w-12 text-muted-foreground/60" />
          <span className="text-xs font-bold text-muted-foreground">
            هنوز تاریخچه بازدیدی برای حساب شما ثبت نشده است.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/search')}
            className="mt-2 flex h-10 items-center justify-center gap-1.5 px-6 py-2 text-xs font-bold"
          >
            <ShoppingBag aria-hidden="true" className="h-4 w-4" />
            <span>مشاهده و خرید کالاها</span>
          </Button>
        </div>
      )}
    </div>
  );
}