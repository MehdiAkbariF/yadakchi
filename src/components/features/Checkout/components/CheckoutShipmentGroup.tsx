'use client';

import { Truck, Users, Calendar, Check, Package, Store } from 'lucide-react';
import { Card, CardBody } from '@/components/composites/Card';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';
import { formatRialToToman } from '@/core/utils/currency';

const DIRECT_SHIPMENT_METHOD = 'DirectShipment';

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
  const itemsInSubBasket = sub.subBasketItems || sub.items || [];
  const totalItemsCount = itemsInSubBasket.reduce(
    (sum: number, item: any) => sum + (item.quantity || 1),
    0
  );

  const isTipaxAvailable =
    typeof sub.tipaxShipmentPrice === 'number' && sub.tipaxShipmentPrice > 0;
  const directPrice = sub.sellerShipmentPrice ?? sub.directShipmentPrice;
  const isDirectAvailable = typeof directPrice === 'number' && directPrice > 0;
  const snappBoxPrice = sub.snappBoxShipmentPrice ?? sub.snappShipmentPrice;
  const isSnappBoxAvailable =
    typeof snappBoxPrice === 'number' && snappBoxPrice > 0;
  const isLocalAvailable = !!sub.isLocalShipmentAvailable;

  return (
    <div className="mb-6 flex w-full flex-col gap-2.5" dir="rtl">
      {/* هدر مرسوله و فروشگاه */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {toPersianDigits(index + 1)}
          </span>
          <span className="text-sm font-bold text-foreground">
            مرسوله {toPersianDigits(index + 1)} از {toPersianDigits(totalSubBaskets)}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-2xs font-semibold text-muted-foreground">
            {toPersianDigits(totalItemsCount)} کالا
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Store className="h-3.5 w-3.5" />
          <span>فروشگاه: <strong className="text-foreground">{sub.shop?.shopTitle || 'یدکچی'}</strong></span>
        </div>
      </div>

      <Card className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <CardBody className="flex flex-col gap-5 p-4 sm:p-5">
          {/* ========================================================================= */}
          {/* ۱. اقلام سفارش در این مرسوله (در بالای کارت) */}
          {/* ========================================================================= */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Package className="h-4 w-4 text-primary" />
              <span>اقلام موجود در این مرسوله:</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {itemsInSubBasket.map((item: any) => {
                const product = item.shopProduct?.product || item.product || {};
                const itemTotalPrice =
                  item.finalTotalPrice ?? item.price?.finalTotalPriceRaw ?? 0;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/20 p-2.5"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-card p-1">
                      <img
                        src={getFullUrl(product?.image)}
                        alt={product?.title || ''}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 text-right">
                      <h4 className="line-clamp-1 text-xs font-bold text-foreground" title={product?.title}>
                        {product?.title}
                      </h4>

                      <div className="flex items-center justify-between text-2xs text-muted-foreground">
                        <span>
                          تعداد: <strong className="text-foreground">{toPersianDigits(item.quantity)} عدد</strong>
                        </span>
                        <span className="font-bold text-foreground">
                          {formatRialToToman(itemTotalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-border/60" />

          {/* ========================================================================= */}
          {/* ۲. گزینه‌های انتخاب روش دریافت (فقط یک‌بار و بدون تکرار) */}
          {/* ========================================================================= */}
          <div className="flex flex-col gap-3">
            <div className="text-right text-xs font-bold text-foreground">
              شیوه دریافت مرسوله را انتخاب کنید:
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* گزینه اسنپ‌باکس */}
              {isSnappBoxAvailable && (
                <div
                  onClick={() => onSelectMethod('SnappBox')}
                  className={cn(
                    'relative flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition-all',
                    selectedMethod === 'SnappBox'
                      ? 'border-primary bg-primary/[0.06] ring-1 ring-primary shadow-xs'
                      : 'border-border bg-card hover:border-primary/40'
                  )}
                >
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-xs font-bold text-foreground">
                      اسنپ باکس (فوری)
                    </span>
                    <span className="text-3xs text-muted-foreground">
                      ارسال درون‌شهری اکسپرس
                    </span>
                    <span className="mt-0.5 text-xs font-bold text-primary">
                      {formatRialToToman(snappBoxPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck
                      className={cn(
                        'h-5 w-5',
                        selectedMethod === 'SnappBox' ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full border',
                        selectedMethod === 'SnappBox'
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30'
                      )}
                    >
                      {selectedMethod === 'SnappBox' && (
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* گزینه تیپاکس */}
              {isTipaxAvailable && (
                <div
                  onClick={() => onSelectMethod('Tipax')}
                  className={cn(
                    'relative flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition-all',
                    selectedMethod === 'Tipax'
                      ? 'border-primary bg-primary/[0.06] ring-1 ring-primary shadow-xs'
                      : 'border-border bg-card hover:border-primary/40'
                  )}
                >
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-xs font-bold text-foreground">
                      ارسال تیپاکس
                    </span>
                    <span className="text-3xs text-muted-foreground">
                      تحویل درب منزل با تیپاکس
                    </span>
                    <span className="mt-0.5 text-xs font-bold text-primary">
                      {formatRialToToman(sub.tipaxShipmentPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck
                      className={cn(
                        'h-5 w-5',
                        selectedMethod === 'Tipax' ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full border',
                        selectedMethod === 'Tipax'
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30'
                      )}
                    >
                      {selectedMethod === 'Tipax' && (
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* گزینه ارسال فروشنده */}
              {isDirectAvailable && (
                <div
                  onClick={() => onSelectMethod(DIRECT_SHIPMENT_METHOD)}
                  className={cn(
                    'relative flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition-all',
                    selectedMethod === DIRECT_SHIPMENT_METHOD
                      ? 'border-primary bg-primary/[0.06] ring-1 ring-primary shadow-xs'
                      : 'border-border bg-card hover:border-primary/40'
                  )}
                >
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-xs font-bold text-foreground">
                      ارسال فروشنده
                    </span>
                    <span className="text-3xs text-muted-foreground">
                      ارسال مستقیم توسط فروشنده
                    </span>
                    <span className="mt-0.5 text-xs font-bold text-primary">
                      {formatRialToToman(directPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users
                      className={cn(
                        'h-5 w-5',
                        selectedMethod === DIRECT_SHIPMENT_METHOD
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      )}
                    />
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full border',
                        selectedMethod === DIRECT_SHIPMENT_METHOD
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30'
                      )}
                    >
                      {selectedMethod === DIRECT_SHIPMENT_METHOD && (
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* گزینه دریافت حضوری */}
              {isLocalAvailable && (
                <div
                  onClick={() => onSelectMethod('Local')}
                  className={cn(
                    'relative flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition-all',
                    selectedMethod === 'Local'
                      ? 'border-primary bg-primary/[0.06] ring-1 ring-primary shadow-xs'
                      : 'border-border bg-card hover:border-primary/40'
                  )}
                >
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-xs font-bold text-foreground">
                      دریافت حضوری
                    </span>
                    <span className="text-3xs text-muted-foreground">
                      تحویل رایگان از محل فروشگاه
                    </span>
                    <span className="mt-0.5 text-xs font-bold text-success">
                      رایگان
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar
                      className={cn(
                        'h-5 w-5',
                        selectedMethod === 'Local' ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full border',
                        selectedMethod === 'Local'
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30'
                      )}
                    >
                      {selectedMethod === 'Local' && (
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}