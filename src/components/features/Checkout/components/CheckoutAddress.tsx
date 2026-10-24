'use client';

import { ChevronLeft, MapPin, AlertCircle } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export interface CheckoutAddressProps {
  activeAddress: any;
  onOpenModal: () => void;
  isLocked?: boolean;
}

export function CheckoutAddress({ activeAddress, onOpenModal, isLocked }: CheckoutAddressProps) {
  const formatPersian = (val: any) => new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(val || 0);

  return (
    <div className={cn(
      "flex w-full flex-col gap-4 rounded-2xl border p-5 transition-all duration-300",
      isLocked
        ? "border-shop bg-shop/5 ring-2 ring-shop/30 shadow-md"
        : "border-shop/30 bg-shop/5"
    )}>
      {/* هدر */}
      <div className="flex items-center justify-between border-b border-shop/20 pb-3">
        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-shop text-shop-foreground text-2xs font-bold">
            ۱
          </div>
          <MapPin className="h-4 w-4 text-shop" />
          آدرس تحویل
          {isLocked && (
            <span className="mr-1 animate-pulse rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
              الزامی
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={onOpenModal}
          className="flex items-center gap-1 text-xs font-bold text-shop transition-colors hover:text-shop-hover"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{activeAddress ? 'تغییر آدرس' : 'انتخاب آدرس'}</span>
        </button>
      </div>

      {/* متن آدرس */}
      <div className="text-sm">
        {activeAddress ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-foreground">{activeAddress.receiverFullName}</span>
            <p className="text-xs font-medium leading-relaxed text-muted-foreground">
              {activeAddress.province}، شهر {activeAddress.city}، {activeAddress.address}
              {activeAddress.plaque && `، پلاک ${formatPersian(activeAddress.plaque)}`}
              {activeAddress.unit && `، طبقه/واحد ${formatPersian(activeAddress.unit)}`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4" />
              هنوز آدرسی انتخاب نکرده‌اید. برای ادامه، آدرس خود را انتخاب کنید.
            </span>
            <button
              onClick={onOpenModal}
              className="rounded-md bg-shop px-4 py-2 text-xs font-bold text-shop-foreground transition-colors hover:bg-shop-hover"
            >
              + افزودن / انتخاب آدرس
            </button>
          </div>
        )}
      </div>
    </div>
  );
}