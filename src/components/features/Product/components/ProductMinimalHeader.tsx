'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  X,
  MoreVertical,
  ShoppingCart,
  Scale,
  AlertTriangle,
  LineChart,
  Share2,
} from 'lucide-react';
import { useGetBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { toPersianDigits } from '@/core/utils/formatters';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

export interface ProductMinimalHeaderProps {
  productTitle: string;
  productCode?: number;
  isAttached?: boolean;
  isCartBouncing?: boolean;
  onOpenReportModal: () => void;
  onOpenPriceChart: () => void;
}

export function ProductMinimalHeader({
  productTitle,
  productCode,
  isAttached = false,
  isCartBouncing = false,
  onOpenReportModal,
  onOpenPriceChart,
}: ProductMinimalHeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuContainerRef = React.useRef<HTMLDivElement>(null);

  const { data: basketData } = useGetBasket();
  const totalBasketCount = basketData?.summary?.itemCount || 0;

  React.useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  const handleShare = () => {
    setIsMenuOpen(false);
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: productTitle, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast.success('لینک کالا کپی شد');
    }
  };

  const handleGoToCompare = () => {
    setIsMenuOpen(false);
    if (productCode) {
      router.push(`/compare?products=${productCode}`);
    } else {
      router.push('/compare');
    }
  };

  return (
    <header
      className={`lg:hidden fixed top-0 inset-x-0 z-50 flex h-14 w-full items-center justify-between px-4 transition-all duration-300 select-none transform-gpu ${
        isAttached
          ? 'bg-card/95 border-b border-border shadow-xs backdrop-blur-xl'
          : 'bg-background/40 backdrop-blur-md border-b border-transparent'
      }`}
      dir="rtl"
    >
      {/* دکمه بازگشت */}
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="بازگشت"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card/85 text-foreground backdrop-blur-md shadow-xs transition-transform active:scale-90 hover:bg-muted"
      >
        <X className="h-4 w-4" />
      </button>

      {/* عنوان کالا در مرکز */}
      <div
        className={`flex-1 min-w-0 px-3 text-center transition-opacity duration-300 ${
          isAttached ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <span className="block truncate text-label sm:text-sm">
          {productTitle}
        </span>
      </div>

      {/* کلیدهای سمت چپ */}
      <div className="flex shrink-0 items-center gap-2" dir="ltr">
        <div ref={menuContainerRef} className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            aria-label="عملیات بیشتر"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card/85 text-foreground backdrop-blur-md shadow-xs transition-transform active:scale-90 hover:bg-muted"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* دراپ‌داون اصلاح‌شده: رو به داخل صفحه باز می‌شود و هرگز بیرون نمی‌زند */}
          {isMenuOpen && (
            <div
              dir="rtl"
              className="absolute left-0 top-11 z-popover w-48 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 origin-top-left"
            >
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenPriceChart();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-label hover:bg-muted transition-colors text-right"
              >
                <LineChart className="h-4 w-4 text-shop shrink-0" />
                <span>نمودار تغییرات قیمت</span>
              </button>

              <button
                type="button"
                onClick={handleGoToCompare}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-label hover:bg-muted transition-colors text-right"
              >
                <Scale className="h-4 w-4 text-primary shrink-0" />
                <span>مقایسه این کالا</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-label hover:bg-muted transition-colors text-right"
              >
                <Share2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>اشتراک‌گذاری</span>
              </button>

              <div className="my-1 border-t border-border/60" />

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenReportModal();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors text-right"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>گزارش خطای کالا</span>
              </button>
            </div>
          )}
        </div>

        {/* سبد خرید با افکت ارتعاش و نئون */}
        <Link
          href="/basket"
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 backdrop-blur-md shadow-xs active:scale-90',
            isCartBouncing
              ? 'border-primary bg-primary/20 text-primary scale-110 shadow-focus-primary animate-bounce'
              : 'border-border/80 bg-card/85 text-foreground hover:bg-muted'
          )}
          aria-label="سبد خرید"
        >
          <ShoppingCart className={cn('h-4 w-4 transition-transform', isCartBouncing && 'scale-110')} />
          {totalBasketCount > 0 && (
            <span
              className={cn(
                'absolute -top-1 -end-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-black text-primary-foreground shadow-xs transition-transform',
                isCartBouncing && 'scale-125 ring-2 ring-card'
              )}
            >
              {toPersianDigits(totalBasketCount)}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

export default ProductMinimalHeader;