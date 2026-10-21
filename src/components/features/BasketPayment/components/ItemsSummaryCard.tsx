'use client';

import { Package, ChevronLeft, Truck } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/composites/Card';
import { useGetBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { getFullUrl } from '@/core/utils/formatters';

export interface ItemsSummaryCardProps {
  onOpenTracking: () => void;
}

export function ItemsSummaryCard({ onOpenTracking }: ItemsSummaryCardProps) {
  const { data: basketData } = useGetBasket();
  const basket = basketData as any;

  const allItems = basket?.subBaskets?.flatMap((s: any) => s.items) || [];
  const parcelCount = basket?.subBaskets?.length || 1;

  return (
    <Card className="w-full overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
      <CardHeader className="flex items-center justify-between border-b border-border/60 bg-card px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package aria-hidden="true" className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-foreground">مرور اقلام سفارش</span>
        </div>

        <span className="rounded-full bg-secondary/60 px-3 py-1 text-2xs font-bold text-foreground/80">
          {new Intl.NumberFormat('fa-IR').format(allItems.length)} کالا در {new Intl.NumberFormat('fa-IR').format(parcelCount)} مرسوله
        </span>
      </CardHeader>

      <CardBody className="flex flex-col gap-4 p-5">
        {/* نوار راهنما و قوانین پیگیری */}
        <div
          onClick={onOpenTracking}
          className="group flex cursor-pointer items-center justify-between rounded-xl border border-border/60 bg-secondary/20 p-3 transition-colors hover:border-primary/40"
        >
          <div className="flex items-center gap-2.5">
            <Truck className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              اطلاع از روند جمع‌آوری و بسته‌بندی ایمن قطعات
            </span>
          </div>

          <span className="flex items-center gap-1 text-2xs font-bold text-primary">
            <span>جزئیات</span>
            <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          </span>
        </div>

        {/* لیست تصاویر و خلاصه‌ی کالاها */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {allItems.slice(0, 6).map((item: any) => (
            <div
              key={item.id}
              className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-card p-1.5 shadow-2xs"
              title={item.product?.title}
            >
              <img
                src={getFullUrl(item.product?.image)}
                alt={item.product?.title || ''}
                className="h-full w-full object-contain"
              />
              <span className="absolute bottom-1 end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground/80 px-1 text-[10px] font-bold text-background">
                {new Intl.NumberFormat('fa-IR').format(item.quantity)}
              </span>
            </div>
          ))}

          {allItems.length > 6 ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-border/80 bg-secondary/30 text-xs font-bold text-muted-foreground">
              +{new Intl.NumberFormat('fa-IR').format(allItems.length - 6)}
            </div>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}