'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2,
  MapPin,
  Package,
  Store,
  ArrowRight,
  Truck,
  ShieldCheck,
  Award,
  Check,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '@/shared/store/useAppStore';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';
import { Typography } from '@/components/primitives/Typography';

export interface ShopHeaderSortOption {
  value: string;
  label: string;
}

export interface ShopHeaderProps {
  shopId: string;
  shopData: any | undefined;
  isLoading?: boolean;
  totalCount: number;
  isShopCardScrolledOut: boolean;
  activeSortLabel: string;
  onOpenFilters: () => void;
  onOpenSort: () => void;
  sortOptions: ShopHeaderSortOption[];
  activeSortValue: string;
  onSortChange: (value: string) => void;
}


export function ShopHeader({
  shopId,
  shopData,
  isLoading = false,
  totalCount,
  isShopCardScrolledOut,
  activeSortLabel,
  onOpenFilters,
  onOpenSort,
  sortOptions,
  activeSortValue,
  onSortChange,
}: ShopHeaderProps) {
  const isHeaderMinimized = useAppStore((state) => state.isHeaderMinimized);

  const stickyTopMobile = isHeaderMinimized ? 56 : 105;

  const shopTitle = shopData?.shopTitle || 'فروشگاه یدک‌چی';
  const productCount = shopData?.shopProductCount ?? totalCount ?? 0;
  const address = shopData?.address || '';
  const logo = shopData?.logo;

  return (
    <>
      {/* ============================================================
          نسخه موبایل (زیر lg)
          ============================================================ */}
      <div
        style={{ top: `${stickyTopMobile}px` }}
        className="sticky z-sticky -mx-4 flex w-[calc(100%+2rem)] shrink-0 select-none flex-col border-b border-border bg-card px-4 shadow-xs transition-[top] duration-200 lg:hidden transform-gpu"
      >
        {/* ردیف اطلاعات فروشگاه (جمع‌شونده با انیمیشن) */}
        <div
          className={cn(
            'flex w-full items-center justify-between overflow-hidden transition-all duration-300 ease-out',
            isShopCardScrolledOut
              ? 'max-h-12 border-b border-dashed border-border/70 pb-2 pt-2.5 opacity-100'
              : 'pointer-events-none max-h-0 border-transparent py-0 opacity-0'
          )}
        >
          {isLoading ? (
            <>
              <div className="flex min-w-0 items-center gap-2">
                <Skeleton className="h-7 w-7 shrink-0 rounded-lg" />
                <Skeleton className="h-3 w-32 rounded-md" />
              </div>
              <Skeleton className="h-5 w-16 rounded-md" />
            </>
          ) : (
            <>
              <Link
                href={`/shops/${shopId}`}
                className="flex min-w-0 items-center gap-2"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted/40 p-0.5">
                  {logo ? (
                    <img
                      src={getFullUrl(logo)}
                      className="h-full w-full rounded-md object-contain"
                      alt=""
                    />
                  ) : (
                    <Store className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-xs font-bold text-foreground">
                    {shopTitle}
                  </span>
                  <span className="inline-flex shrink-0 items-center text-success">
                    <CheckCircle2 className="h-3 w-3" />
                  </span>
                </div>
              </Link>

              <span className="flex shrink-0 items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-3xs font-bold text-muted-foreground">
                <Package className="h-3 w-3 text-muted-foreground" />
                <span>{toPersianDigits(productCount)} کالا</span>
              </span>
            </>
          )}
        </div>

        {/* ردیف دکمه‌های فیلتر و سورت */}
        <div className="flex w-full items-center justify-between gap-2 py-2.5">
          <button
            type="button"
            onClick={onOpenFilters}
            className="flex h-8 flex-1 select-none items-center justify-center gap-1 rounded-lg border border-border/80 bg-card px-2 text-2xs font-bold text-foreground transition-transform active:scale-95"
            aria-label="باز کردن فیلترها"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-foreground/80" />
            <span>فیلترها</span>
          </button>

          <button
            type="button"
            onClick={onOpenSort}
            className="flex h-8 flex-1 select-none items-center justify-center gap-1 rounded-lg border border-border/80 bg-card px-2 text-2xs font-bold text-foreground transition-transform active:scale-95"
            aria-label="باز کردن مرتب‌سازی"
          >
            <span className="truncate">{activeSortLabel}</span>
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          </button>

          {!isShopCardScrolledOut && (
            <span className="flex h-8 shrink-0 items-center justify-center rounded-lg bg-muted px-2.5 text-3xs font-bold text-muted-foreground">
              {toPersianDigits(totalCount)} کالا
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default ShopHeader;