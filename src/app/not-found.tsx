// c:\Users\Raven\final-projects\yadakchi-front\yadakchi\src\app\not-found.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Home, Search, ArrowRight, Clock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/primitives/Button/Button';
import { ProductSearchCard } from '@/components/features/ProductCard/ProductSearchCard';
import { ProductCardSkeleton } from '@/components/features/ProductCard/ProductCardSkeleton';
import { useGetVisitedProducts, useGetNominatedProducts } from '@/domains/front/product/hooks/product.hooks';

// =============================================================================
// کامپوننت پخش انیمیشن لوتی به صورت Standalone (بدون نیاز به نصب lottie-web)
// =============================================================================
function LottiePlayer({ animationPath }: { animationPath: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let animInstance: any = null;
    let isMounted = true;

    const startAnimation = () => {
      const lottie = (window as any).lottie;
      if (lottie && containerRef.current && isMounted) {
        animInstance = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: animationPath,
        });
        setIsReady(true);
      }
    };

    if ((window as any).lottie) {
      startAnimation();
    } else {
      const existingScript = document.getElementById('lottie-cdn-player');
      if (existingScript) {
        existingScript.addEventListener('load', startAnimation);
      } else {
        const script = document.createElement('script');
        script.id = 'lottie-cdn-player';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
        script.async = true;
        script.onload = () => {
          if (isMounted) startAnimation();
        };
        document.body.appendChild(script);
      }
    }

    return () => {
      isMounted = false;
      animInstance?.destroy?.();
    };
  }, [animationPath]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full max-w-[340px] max-h-[340px]" />
      {!isReady && (
        <span className="sr-only">404 Not Found</span>
      )}
    </div>
  );
}

// =============================================================================
// صفحه اصلی 404
// =============================================================================
export default function NotFoundPage() {
  // دریافت بازدیدهای اخیر یا فال‌بک محصولات منتخب از بک‌اند
  const { data: visitedData, isLoading: isVisitedLoading } = useGetVisitedProducts();
  const { data: nominatedData, isLoading: isNominatedLoading } = useGetNominatedProducts();

  // استخراج محصولات
  const visitedList = Array.isArray(visitedData) ? visitedData : visitedData?.items || [];
  const nominatedList = Array.isArray(nominatedData) ? nominatedData : nominatedData?.items || [];
  
  const displayProducts = visitedList.length > 0 ? visitedList : nominatedList;
  const isLoading = isVisitedLoading || (displayProducts.length === 0 && isNominatedLoading);

  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-start py-8 md:py-12 px-4 select-none" dir="rtl">
      
      {/* ۱. سکشن انیمیشن لوتی ارسالی و متون تیکت */}
      <div className="w-full max-w-2xl flex flex-col items-center text-center mx-auto">
        
        {/* انیمیشن 404 ارسالی در پوشه public */}
        <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center overflow-hidden">
          <LottiePlayer animationPath="/anumations/404.json" />
        </div>

        {/* متون دقیق QA */}
        <div className="space-y-3 mt-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground">
            صفحه‌ای که دنبالش بودید پیدا نشد!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
            چیز جدیدی جستجو کن یا به کالاهای زیر نگاهی بنداز یا برو به صفحه اصلی
          </p>
        </div>

        {/* اکشن‌های بازگشت */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <Link href="/">
            <Button
              variant="primary"
              className="rounded-xl font-bold text-xs sm:text-sm h-11 px-6 flex items-center gap-2 shadow-md shadow-primary/20"
            >
              <Home className="h-4 w-4" />
              <span>رفتن به صفحه اصلی</span>
            </Button>
          </Link>

          <Link href="/search">
            <Button
              variant="outline"
              className="rounded-xl font-bold text-xs sm:text-sm h-11 px-6 flex items-center gap-2 border-border hover:border-primary/40"
            >
              <Search className="h-4 w-4 text-primary" />
              <span>جستجوی قطعات</span>
            </Button>
          </Link>
        </div>

      </div>

      {/* ۲. سکشن کالاهای بازدید اخیر کاربر */}
      <div className="w-full max-w-7xl mt-16 sm:mt-20 border-t pt-10">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base sm:text-lg font-black text-foreground">
                بازدیدهای اخیر شما
              </h2>
              <span className="text-[11px] text-muted-foreground">
                کالاهایی که اخیراً در یدک‌چی بررسی کرده‌اید
              </span>
            </div>
          </div>

          <Link 
            href="/search" 
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>مشاهده همه کالاها</span>
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayProducts.slice(0, 10).map((product: any) => (
              <ProductSearchCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="w-full py-12 px-4 rounded-2xl border border-dashed bg-muted/20 flex flex-col items-center justify-center text-center gap-2">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/50 stroke-[1.5]" />
            <span className="text-xs font-bold text-muted-foreground">
              هنوز کالایی را مشاهده نکرده‌اید.
            </span>
            <Link href="/search" className="mt-2">
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9 px-4">
                شروع جستجو و بررسی قطعات
              </Button>
            </Link>
          </div>
        )}

      </div>

    </div>
  );
}