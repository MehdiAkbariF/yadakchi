'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowRight, ShoppingBag } from 'lucide-react';
import { useGetFavoriteProducts } from '@/domains/userpanel/hooks/userpanel.hooks';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { Select } from '@/components/primitives/Select/Select';
import { Button } from '@/components/primitives/Button/Button';

function LottiePlayer({ path, className = 'w-48 h-48', loop = true }: { path: string; className?: string; loop?: boolean }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let anim: any = null;
    let isMounted = true;

    const init = async () => {
      try {
        const altPath = path.includes('/anumations/')
          ? path.replace('/anumations/', '/animations/')
          : path.replace('/animations/', '/anumations/');
        let animationData: any = null;
        for (const p of [path, altPath]) {
          try {
            const res = await fetch(p);
            if (res.ok) {
              animationData = await res.json();
              break;
            }
          } catch {}
        }
        if (!animationData || !isMounted || !containerRef.current) return;
        const lottieModule = await import('lottie-web');
        const lottie = lottieModule.default || lottieModule;
        if (containerRef.current && isMounted) {
          anim = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay: true,
            animationData,
          });
        }
      } catch {}
    };

    init();
    return () => {
      isMounted = false;
      anim?.destroy();
    };
  }, [path, loop]);

  return <div ref={containerRef} className={className} />;
}

const ORDER_OPTIONS = [
  { value: 'Latest', label: 'جدیدترین‌ها' },
  { value: 'Oldest', label: 'قدیمی‌ترین‌ها' },
  { value: 'HighestRate', label: 'بیشترین امتیاز' },
  { value: 'LowestRate', label: 'کمترین امتیاز' },
  { value: 'HighestPrice', label: 'بیشترین قیمت' },
  { value: 'LowestPrice', label: 'کمترین قیمت' },
] as const;

export function FavoritesList() {
  const router = useRouter();
  const [order, setOrder] = React.useState('Latest');
  const [page, setPage] = React.useState(1);

  const { data: favoritesResponse, isLoading } = useGetFavoriteProducts(page, order);
  const favorites = favoritesResponse?.items || [];
  const totalPages = favoritesResponse?.totalPages || 1;

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
          <span className="text-sm font-bold text-foreground">کالاهای محبوب من</span>
        </div>
      </div>

      <div className="flex w-full flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Heart aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-xl font-bold text-foreground">کالاهای محبوب</span>
          </div>
          <p className="text-xs text-muted-foreground">
            لیست کالاهایی که با قلبی کردن در صفحات محصول، برای دسترسی سریع ذخیره کرده‌اید
          </p>
        </div>

        <div className="w-full shrink-0 select-none sm:max-w-xs">
          <Select
            placeholder="مرتب‌سازی بر اساس"
            value={order}
            onChange={(e) => {
              setOrder(e.target.value);
              setPage(1);
            }}
            options={[...ORDER_OPTIONS]}
          />
        </div>
      </div>

      {isLoading ? (
        <PageLoading label="در حال دریافت کالاهای محبوب شما..." />
      ) : favorites.length > 0 ? (
        <div className="flex w-full flex-col gap-6">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {favorites.map((product: any) => (
              <ProductSearchCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-4 py-12 text-center">
          <LottiePlayer path="/anumations/Like.json" className="mx-auto h-48 w-48 max-w-full" />
          <span className="text-sm font-bold text-muted-foreground">
            هنوز هیچ کالایی را به لیست محبوب‌های خود اضافه نکرده‌اید.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/search')}
            className="mt-2 flex h-10 items-center justify-center gap-1.5 px-6 py-2 text-xs font-bold shadow-xs"
          >
            <ShoppingBag aria-hidden="true" className="h-4 w-4" />
            <span>مشاهده و خرید کالاها</span>
          </Button>
        </div>
      )}
    </div>
  );
}