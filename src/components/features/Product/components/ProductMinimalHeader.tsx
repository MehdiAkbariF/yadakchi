'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPortal } from 'react-dom';
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

export interface ProductMinimalHeaderProps {
  productTitle: string;
  isAttached?: boolean;
  onOpenReportModal: () => void;
  onOpenPriceChart: () => void;
}

export function ProductMinimalHeader({
  productTitle,
  isAttached = false,
  onOpenReportModal,
  onOpenPriceChart,
}: ProductMinimalHeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [menuCoords, setMenuCoords] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [mounted, setMounted] = React.useState(false);

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const { data: basketData } = useGetBasket();
  const totalBasketCount = basketData?.summary?.itemCount || 0;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuCoords({
        top: rect.bottom + 6,
        left: rect.left,
      });
    }
    setIsMenuOpen((prev) => !prev);
  };

  React.useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', () => setIsMenuOpen(false));
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('resize', () => setIsMenuOpen(false));
    };
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

  return (
    <header
      className={`lg:hidden fixed top-0 inset-x-0 z-50 flex h-14 w-full items-center justify-between px-4 transition-all duration-300 select-none ${
        isAttached
          ? 'bg-card/95 border-b border-border shadow-xs backdrop-blur-xl'
          : 'bg-background/40 backdrop-blur-md border-b border-transparent'
      }`}
      dir="rtl"
    >
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="بستن صفحه"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card/85 text-foreground backdrop-blur-md shadow-xs transition-transform active:scale-90 hover:bg-muted"
      >
        <X className="h-4 w-4" />
      </button>

      <div
        className={`flex-1 min-w-0 px-3 text-center transition-opacity duration-300 ${
          isAttached ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <span className="block truncate text-xs font-bold text-foreground sm:text-sm">
          {productTitle}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2" dir="ltr">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleMenu}
          aria-label="گزینه‌های بیشتر"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card/85 text-foreground backdrop-blur-md shadow-xs transition-transform active:scale-90 hover:bg-muted"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {mounted &&
          isMenuOpen &&
          createPortal(
            <div
              ref={menuRef}
              dir="rtl"
              style={{
                position: 'fixed',
                top: `${menuCoords.top}px`,
                left: `${menuCoords.left}px`,
              }}
              className="z-[99999] w-48 rounded-2xl border border-border bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95"
            >
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenPriceChart();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors text-right"
              >
                <LineChart className="h-4 w-4 text-shop shrink-0" />
                <span>نمودار تغییرات قیمت</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  showToast.info('کالا به لیست مقایسه افزوده شد');
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors text-right"
              >
                <Scale className="h-4 w-4 text-primary shrink-0" />
                <span>مقایسه کالا</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors text-right"
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
            </div>,
            document.body
          )}

        <Link
          href="/basket"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card/85 text-foreground backdrop-blur-md shadow-xs transition-transform active:scale-90 hover:bg-muted"
          aria-label="سبد خرید"
        >
          <ShoppingCart className="h-4 w-4" />
          {totalBasketCount > 0 && (
            <span className="absolute -top-1 -end-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground shadow-xs">
              {toPersianDigits(totalBasketCount)}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}