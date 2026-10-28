'use client';

import { Truck, Users, Calendar, Check } from 'lucide-react';
import { Card, CardBody } from '@/components/composites/Card';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl } from '@/core/utils/formatters';

/**
 * ✅ مقدار enum ارسالی به سرور برای ارسال مستقیم = 'DirectShipment'
 * مقدار 'Seller' فقط alias legacy است و نباید به سرور ارسال شود.
 */
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
  const formatPrice = (value: number) =>
    new Intl.NumberFormat('fa-IR').format(Math.round(value / 10)) + ' تومان';

  // محاسبه واقعی مجموع تعداد کالاها در این ساب‌باکت
  const itemsInSubBasket = sub.subBasketItems || [];
  const totalItemsCount = itemsInSubBasket.reduce(
    (sum: number, item: any) => sum + (item.quantity || 1),
    0,
  );

  // بررسی وضعیت گزینه‌های در دسترس با توجه به مقادیر واقعی ریسپانس
  const isTipaxAvailable =
    typeof sub.tipaxShipmentPrice === 'number' && sub.tipaxShipmentPrice > 0;
  const directPrice = sub.directShipmentPrice ?? sub.sellerShipmentPrice;
  const isDirectAvailable = typeof directPrice === 'number' && directPrice > 0;
  const snappBoxPrice = sub.snappBoxShipmentPrice ?? sub.snappShipmentPrice;
  const isSnappBoxAvailable =
    typeof snappBoxPrice === 'number' && snappBoxPrice > 0;
  const isLocalAvailable = !!sub.isLocalShipmentAvailable;

  // محاسبه دقیق مشخصات متد انتخاب شده
  let selectedPrice = 0;
  let selectedTitle = '';
  let selectedSubtitle = '';

  if (selectedMethod === 'SnappBox' && isSnappBoxAvailable) {
    selectedPrice = snappBoxPrice;
    selectedTitle = 'اسنپ باکس(فوری)';
    selectedSubtitle = 'ارسال درون‌شهری اکسپرس';
  } else if (selectedMethod === 'Tipax' && isTipaxAvailable) {
    selectedPrice = sub.tipaxShipmentPrice;
    selectedTitle = 'ارسال تیپاکس';
    selectedSubtitle = 'تحویل درب منزل با تیپاکس';
  } else if (selectedMethod === DIRECT_SHIPMENT_METHOD && isDirectAvailable) {
    selectedPrice = directPrice;
    selectedTitle = 'ارسال مستقیم فروشنده';
    selectedSubtitle = 'ارسال توسط فروشنده';
  } else if (selectedMethod === 'Local' && isLocalAvailable) {
    selectedPrice = 0;
    selectedTitle = 'دریافت حضوری';
    selectedSubtitle = 'تحویل رایگان از محل فروشگاه';
  }

  return (
    <div className="mb-8 flex w-full flex-col gap-4">
      {/* هدر بالای کارت */}
      <div className="flex flex-col gap-1 text-right">
        <div className="text-sm font-bold text-foreground">
          مرسوله {new Intl.NumberFormat('fa-IR').format(index + 1)} از{' '}
          {new Intl.NumberFormat('fa-IR').format(totalSubBaskets)} ({' '}
          {new Intl.NumberFormat('fa-IR').format(totalItemsCount)} کالا )
        </div>
        <div className="text-xs text-muted-foreground">
          فروشگاه: {sub.shop?.shopTitle || 'یدکچی'}
        </div>
      </div>

      <Card className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-xs">
        <CardBody className="flex flex-col gap-6 p-4 sm:p-5">
          <div className="text-right text-sm font-bold text-primary">
            شیوه دریافت سفارش را انتخاب کنید
          </div>

          {/* کارت‌های انتخاب روش ارسال با استایل یکدست */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* گزینه اسنپ‌باکس */}
            {isSnappBoxAvailable && (
              <div
                onClick={() => onSelectMethod('SnappBox')}
                className={cn(
                  'relative flex cursor-pointer items-center justify-between rounded-md border p-4 transition-all duration-fast',
                  selectedMethod === 'SnappBox'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                    : 'border-border bg-card hover:border-primary/50',
                )}
              >
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-sm font-bold text-foreground">
                    اسنپ باکس(فوری)
                  </span>
                  <span className="text-2xs text-muted-foreground">
                    ارسال درون‌شهری اکسپرس
                  </span>
                  <span className="text-2xs font-bold text-primary">
                    {formatPrice(snappBoxPrice)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck
                    className={cn(
                      'h-6 w-6',
                      selectedMethod === 'SnappBox'
                        ? 'text-primary'
                        : 'text-muted-foreground',
                    )}
                  />
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border',
                      selectedMethod === 'SnappBox'
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30',
                    )}
                  >
                    {selectedMethod === 'SnappBox' && (
                      <Check className="h-3 w-3 stroke-[3]" />
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
                  'relative flex cursor-pointer items-center justify-between rounded-md border p-4 transition-all duration-fast',
                  selectedMethod === 'Tipax'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                    : 'border-border bg-card hover:border-primary/50',
                )}
              >
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-sm font-bold text-foreground">
                    ارسال تیپاکس
                  </span>
                  <span className="text-2xs text-muted-foreground">
                    تحویل درب منزل با تیپاکس
                  </span>
                  <span className="text-2xs font-bold text-primary">
                    {formatPrice(sub.tipaxShipmentPrice)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck
                    className={cn(
                      'h-6 w-6',
                      selectedMethod === 'Tipax'
                        ? 'text-primary'
                        : 'text-muted-foreground',
                    )}
                  />
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border',
                      selectedMethod === 'Tipax'
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30',
                    )}
                  >
                    {selectedMethod === 'Tipax' && (
                      <Check className="h-3 w-3 stroke-[3]" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* گزینه ارسال مستقیم فروشنده — مقدار ارسالی به سرور: DirectShipment */}
            {isDirectAvailable && (
              <div
                onClick={() => onSelectMethod(DIRECT_SHIPMENT_METHOD)}
                className={cn(
                  'relative flex cursor-pointer items-center justify-between rounded-md border p-4 transition-all duration-fast',
                  selectedMethod === DIRECT_SHIPMENT_METHOD
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                    : 'border-border bg-card hover:border-primary/50',
                )}
              >
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-sm font-bold text-foreground">
                    ارسال فروشنده
                  </span>
                  <span className="text-2xs text-muted-foreground">
                    ارسال مستقیم توسط فروشنده
                  </span>
                  <span className="text-2xs font-bold text-primary">
                    {formatPrice(directPrice)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users
                    className={cn(
                      'h-6 w-6',
                      selectedMethod === DIRECT_SHIPMENT_METHOD
                        ? 'text-primary'
                        : 'text-muted-foreground',
                    )}
                  />
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border',
                      selectedMethod === DIRECT_SHIPMENT_METHOD
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30',
                    )}
                  >
                    {selectedMethod === DIRECT_SHIPMENT_METHOD && (
                      <Check className="h-3 w-3 stroke-[3]" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* گزینه تحویل حضوری */}
            {isLocalAvailable && (
              <div
                onClick={() => onSelectMethod('Local')}
                className={cn(
                  'relative flex cursor-pointer items-center justify-between rounded-md border p-4 transition-all duration-fast',
                  selectedMethod === 'Local'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                    : 'border-border bg-card hover:border-primary/50',
                )}
              >
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-sm font-bold text-foreground">
                    دریافت حضوری
                  </span>
                  <span className="text-2xs text-muted-foreground">
                    تحویل رایگان از محل فروشگاه
                  </span>
                  <span className="text-2xs font-bold text-success">رایگان</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar
                    className={cn(
                      'h-6 w-6',
                      selectedMethod === 'Local'
                        ? 'text-primary'
                        : 'text-muted-foreground',
                    )}
                  />
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border',
                      selectedMethod === 'Local'
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30',
                    )}
                  >
                    {selectedMethod === 'Local' && (
                      <Check className="h-3 w-3 stroke-[3]" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* بخش پایین: لیست قطعات و خلاصه هزینه */}
          <div className="mt-2 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="order-1 flex min-w-0 flex-1 flex-col gap-4 lg:order-2">
              {itemsInSubBasket.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 shadow-xs"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-card p-1.5">
                    <img
                      src={getFullUrl(item.shopProduct?.product?.image)}
                      alt={item.shopProduct?.product?.title || ''}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="flex h-24 min-w-0 flex-1 flex-col justify-between text-right">
                    <div>
                      <h4 className="truncate text-sm font-bold text-foreground">
                        {item.shopProduct?.product?.title}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Intl.NumberFormat('fa-IR').format(item.quantity)}{' '}
                        عدد | قطعه نو
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-sm border border-border bg-secondary px-2 py-0.5 text-2xs font-medium text-secondary-foreground">
                        در ۱ مرسوله
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {formatPrice(item.finalTotalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-2 flex shrink-0 flex-col items-end gap-2 pb-2 lg:order-1 lg:w-52">
              <div className="w-full text-right">
                <span className="block text-xs font-bold text-foreground">
                  {selectedTitle || 'شیوه ارسال انتخاب نشده'}
                </span>
                <div className="mt-0.5 text-2xs text-muted-foreground">
                  {selectedSubtitle || 'لطفاً یک روش را انتخاب کنید'}
                </div>
              </div>

              <div className="mt-2 flex w-full items-center justify-between border-t border-dashed border-border pt-2">
                <span className="text-xs text-muted-foreground">
                  هزینه ارسال:
                </span>
                <strong className="text-sm font-bold text-primary">
                  {selectedMethod === 'Local'
                    ? 'رایگان'
                    : selectedPrice > 0
                      ? formatPrice(selectedPrice)
                      : '---'}
                </strong>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}