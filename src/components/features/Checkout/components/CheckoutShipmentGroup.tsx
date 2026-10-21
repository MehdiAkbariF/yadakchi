'use client';

import { Truck, Store, Zap, Check, PackageCheck } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/composites/Card';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl } from '@/core/utils/formatters';

export interface CheckoutShipmentGroupProps {
  sub: any;
  index: number;
  totalSubBaskets: number;
  selectedMethod: string | null;
  onSelectMethod: (method: string) => void;
}

export function CheckoutShipmentGroup({
  sub,
  index,
  totalSubBaskets,
  selectedMethod,
  onSelectMethod,
}: CheckoutShipmentGroupProps) {
  const formatPrice = (value: number) =>
    new Intl.NumberFormat('fa-IR').format(value / 10) + ' تومان';

  const isTipaxAvailable = typeof sub.tipaxShipmentPrice === 'number' && sub.tipaxShipmentPrice > 0;
  const directPrice = sub.directShipmentPrice ?? sub.sellerShipmentPrice;
  const isDirectAvailable = typeof directPrice === 'number' && directPrice > 0;
  const snappBoxPrice = sub.snappBoxShipmentPrice ?? sub.snappShipmentPrice;
  const isSnappBoxAvailable = typeof snappBoxPrice === 'number' && snappBoxPrice > 0;
  const isLocalAvailable = !!sub.isLocalShipmentAvailable;

  return (
    <Card className="w-full overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
      {/* هدر تمیز و شفاف مرسوله */}
      <CardHeader className="flex items-center justify-between border-b border-border/60 bg-card px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-primary font-bold text-xs">
            {new Intl.NumberFormat('fa-IR').format(index + 1)}
          </div>
          <span className="text-xs font-bold text-foreground">
            مرسوله {new Intl.NumberFormat('fa-IR').format(index + 1)} از{' '}
            {new Intl.NumberFormat('fa-IR').format(totalSubBaskets)}
          </span>
        </div>

        <span className="rounded-full bg-secondary/60 px-3 py-1 text-2xs font-semibold text-foreground/80">
          فروشگاه: <strong className="text-primary">{sub.shop?.shopTitle || 'یدک‌چی'}</strong>
        </span>
      </CardHeader>

      <CardBody className="flex flex-col gap-5 p-5">
        {/* انتخاب روش ارسال به صورت کارت‌های مدرن و تعاملی */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold text-foreground">
            انتخاب شیوه ارسال برای این مرسوله:
          </span>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {/* گزینه تیپاکس */}
            {isTipaxAvailable ? (
              <div
                onClick={() => onSelectMethod('Tipax')}
                className={cn(
                  'relative flex cursor-pointer items-start justify-between rounded-xl border p-3.5 transition-all duration-fast',
                  selectedMethod === 'Tipax'
                    ? 'border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-xs'
                    : 'border-border/70 bg-card hover:border-primary/40'
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                    selectedMethod === 'Tipax' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  )}>
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-foreground">ارسال با تیپاکس</span>
                    <span className="text-2xs text-muted-foreground">تحویل ۲۴ تا ۷۲ ساعته</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full border',
                    selectedMethod === 'Tipax' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                  )}>
                    {selectedMethod === 'Tipax' ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                  </div>
                  <span className="text-xs font-bold text-primary">
                    {formatPrice(sub.tipaxShipmentPrice)}
                  </span>
                </div>
              </div>
            ) : null}

            {/* گزینه اسنپ‌باکس (فوری) */}
            {isSnappBoxAvailable ? (
              <div
                onClick={() => onSelectMethod('SnappBox')}
                className={cn(
                  'relative flex cursor-pointer items-start justify-between rounded-xl border p-3.5 transition-all duration-fast',
                  selectedMethod === 'SnappBox'
                    ? 'border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-xs'
                    : 'border-border/70 bg-card hover:border-primary/40'
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                    selectedMethod === 'SnappBox' ? 'bg-warning text-warning-foreground' : 'bg-secondary text-muted-foreground'
                  )}>
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-foreground">اسنپ‌باکس (فوری)</span>
                    <span className="text-2xs text-muted-foreground">ارسال درون‌شهری اکسپرس</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full border',
                    selectedMethod === 'SnappBox' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                  )}>
                    {selectedMethod === 'SnappBox' ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                  </div>
                  <span className="text-xs font-bold text-primary">
                    {formatPrice(snappBoxPrice)}
                  </span>
                </div>
              </div>
            ) : null}

            {/* گزینه ارسال مستقیم فروشنده */}
            {isDirectAvailable ? (
              <div
                onClick={() => onSelectMethod('DirectShipment')}
                className={cn(
                  'relative flex cursor-pointer items-start justify-between rounded-xl border p-3.5 transition-all duration-fast',
                  selectedMethod === 'DirectShipment'
                    ? 'border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-xs'
                    : 'border-border/70 bg-card hover:border-primary/40'
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                    selectedMethod === 'DirectShipment' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  )}>
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-foreground">پیک اختصاصی فروشنده</span>
                    <span className="text-2xs text-muted-foreground">طبق هماهنگی تلفنی</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full border',
                    selectedMethod === 'DirectShipment' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                  )}>
                    {selectedMethod === 'DirectShipment' ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                  </div>
                  <span className="text-xs font-bold text-primary">
                    {formatPrice(directPrice)}
                  </span>
                </div>
              </div>
            ) : null}

            {/* گزینه تحویل حضوری */}
            {isLocalAvailable ? (
              <div
                onClick={() => onSelectMethod('Local')}
                className={cn(
                  'relative flex cursor-pointer items-start justify-between rounded-xl border p-3.5 transition-all duration-fast',
                  selectedMethod === 'Local'
                    ? 'border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-xs'
                    : 'border-border/70 bg-card hover:border-primary/40'
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                    selectedMethod === 'Local' ? 'bg-success text-success-foreground' : 'bg-secondary text-muted-foreground'
                  )}>
                    <Store className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-foreground">تحویل حضوری از فروشگاه</span>
                    <span className="text-2xs text-muted-foreground">بدون هزینه ارسال</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full border',
                    selectedMethod === 'Local' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                  )}>
                    {selectedMethod === 'Local' ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                  </div>
                  <span className="text-xs font-bold text-success">رایگان</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* لیست افقی و خلاصه قطعات موجود در این مرسوله */}
        <div className="border-t border-dashed border-border/70 pt-3">
          <div className="mb-3 flex items-center gap-1.5 text-2xs font-bold text-muted-foreground">
            <PackageCheck className="h-3.5 w-3.5" />
            <span>اقلام این مرسوله:</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {sub.subBasketItems?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-secondary/30 p-2.5"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border/60 bg-card p-1">
                  <img
                    src={getFullUrl(item.shopProduct?.product?.image)}
                    alt={item.shopProduct?.product?.title || ''}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-xs font-semibold text-foreground">
                    {item.shopProduct?.product?.title}
                  </h4>
                  <div className="mt-1 flex items-center justify-between text-2xs text-muted-foreground">
                    <span>تعداد: {new Intl.NumberFormat('fa-IR').format(item.quantity)} عدد</span>
                    <span className="font-bold text-foreground/80">
                      {formatPrice(item.finalTotalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}