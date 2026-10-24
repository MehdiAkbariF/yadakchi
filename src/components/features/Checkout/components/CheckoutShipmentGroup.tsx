'use client';

import { Truck, Store, Check, Calendar, Users } from 'lucide-react';
import { Card, CardBody } from '@/components/composites/Card';
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

  // محاسبه قیمت روش انتخاب شده برای نمایش در پایین
  let selectedPrice = 0;
  let selectedTitle = '';
  if (selectedMethod === 'Tipax' && isTipaxAvailable) { selectedPrice = sub.tipaxShipmentPrice; selectedTitle = 'ارسال پستی'; }
  else if (selectedMethod === 'SnappBox' && isSnappBoxAvailable) { selectedPrice = snappBoxPrice; selectedTitle = 'ارسال فوری (اسنپ‌باکس)'; }
  else if (selectedMethod === 'DirectShipment' && isDirectAvailable) { selectedPrice = directPrice; selectedTitle = 'ارسال مستقیم فروشنده'; }
  else if (selectedMethod === 'Local' && isLocalAvailable) { selectedPrice = 0; selectedTitle = 'دریافت حضوری'; }

  return (
    <div className="mb-8 flex w-full flex-col gap-4">
      {/* هدر بالای کارت */}
      <div className="flex flex-col gap-1 text-right">
        <div className="text-sm font-bold text-foreground">
          کالاها و ارسال ( {new Intl.NumberFormat('fa-IR').format(totalSubBaskets)} عدد کالا / {new Intl.NumberFormat('fa-IR').format(totalSubBaskets)} مرسوله )
        </div>
        <div className="text-xs text-muted-foreground">
          کالاها در {new Intl.NumberFormat('fa-IR').format(totalSubBaskets)} ارسال (مرسوله) به دست شما خواهد رسید
        </div>
      </div>

      <Card className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-xs">
        <CardBody className="flex flex-col gap-6 p-4 sm:p-5">
          
          {/* عنوان انتخاب شیوه ارسال */}
          <div className="text-right text-sm font-bold text-primary">
            شیوه دریافت سفارش را انتخاب کنید
          </div>

          {/* کارت‌های انتخاب روش ارسال */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* گزینه تیپاکس */}
            {isTipaxAvailable ? (
              <div
                onClick={() => onSelectMethod('Tipax')}
                className={cn(
                  'relative flex cursor-pointer items-center justify-between rounded-md border p-4 transition-all duration-fast',
                  selectedMethod === 'Tipax'
                    ? 'border-primary bg-primary text-primary-foreground shadow-md'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                )}
              >
                <div className="flex flex-col text-right gap-1">
                  <span className="text-sm font-bold">ارسال پستی</span>
                  <span className={cn("text-2xs", selectedMethod === 'Tipax' ? 'text-primary-foreground/90' : 'text-muted-foreground')}>
                    در کمترین زمان برای شما ارسال میشود
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <Truck className={cn("h-6 w-6", selectedMethod === 'Tipax' ? 'text-primary-foreground' : 'text-muted-foreground')} />
                   <div className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border',
                    selectedMethod === 'Tipax' ? 'border-primary-foreground bg-primary-foreground text-primary' : 'border-muted-foreground/30'
                  )}>
                    {selectedMethod === 'Tipax' ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                  </div>
                </div>
              </div>
            ) : null}

            {/* گزینه ارسال مستقیم فروشنده */}
            {isDirectAvailable ? (
              <div
                onClick={() => onSelectMethod('DirectShipment')}
                className={cn(
                  'relative flex cursor-pointer items-center justify-between rounded-md border p-4 transition-all duration-fast',
                  selectedMethod === 'DirectShipment'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                <div className="flex flex-col text-right gap-1">
                  <span className="text-sm font-bold text-foreground">ارسال فروشنده</span>
                  <span className="text-2xs text-muted-foreground">از طریق فروشنده برای شما ارسال میشود</span>
                </div>
                <div className="flex items-center gap-2">
                   <Users className={cn("h-6 w-6", selectedMethod === 'DirectShipment' ? 'text-primary' : 'text-muted-foreground')} />
                   <div className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border',
                    selectedMethod === 'DirectShipment' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                  )}>
                    {selectedMethod === 'DirectShipment' ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                  </div>
                </div>
              </div>
            ) : null}

            {/* گزینه تحویل حضوری */}
            {isLocalAvailable ? (
              <div
                onClick={() => onSelectMethod('Local')}
                className={cn(
                  'relative flex cursor-pointer items-center justify-between rounded-md border p-4 transition-all duration-fast',
                  selectedMethod === 'Local'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                <div className="flex flex-col text-right gap-1">
                  <span className="text-sm font-bold text-foreground">دریافت حضوری</span>
                  <span className="text-2xs text-muted-foreground">به صورت حضوری و رایگان از فروشنده دریافت میکنم</span>
                </div>
                <div className="flex items-center gap-2">
                   <Calendar className={cn("h-6 w-6", selectedMethod === 'Local' ? 'text-primary' : 'text-muted-foreground')} />
                   <div className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border',
                    selectedMethod === 'Local' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                  )}>
                    {selectedMethod === 'Local' ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                  </div>
                </div>
              </div>
            ) : null}
            
            {/* گزینه اسنپ‌باکس */}
             {isSnappBoxAvailable ? (
              <div
                onClick={() => onSelectMethod('SnappBox')}
                className={cn(
                  'relative flex cursor-pointer items-center justify-between rounded-md border p-4 transition-all duration-fast',
                  selectedMethod === 'SnappBox'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                <div className="flex flex-col text-right gap-1">
                  <span className="text-sm font-bold text-foreground">ارسال فوری (اسنپ‌باکس)</span>
                  <span className="text-2xs text-muted-foreground">ارسال درون‌شهری اکسپرس</span>
                </div>
                <div className="flex items-center gap-2">
                   <Truck className={cn("h-6 w-6", selectedMethod === 'SnappBox' ? 'text-primary' : 'text-muted-foreground')} />
                   <div className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border',
                    selectedMethod === 'SnappBox' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                  )}>
                    {selectedMethod === 'SnappBox' ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                  </div>
                </div>
              </div>
            ) : null}

          </div>

          {/* بخش پایین: لیست قطعات و خلاصه هزینه */}
          <div className="mt-2 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            
            {/* لیست قطعات - حالا با تصویر بزرگ در سمت راست */}
            <div className="order-1 flex min-w-0 flex-1 flex-col gap-4 lg:order-2">
              {sub.subBasketItems?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 shadow-xs"
                >
                  {/* تصویر محصول - بزرگ و در سمت راست */}
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-card p-1.5">
                    <img
                      src={getFullUrl(item.shopProduct?.product?.image)}
                      alt={item.shopProduct?.product?.title || ''}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* اطلاعات مینیمال در کنار تصویر */}
                  <div className="flex flex-1 flex-col justify-between h-24 min-w-0 text-right">
                    <div>
                      <h4 className="truncate text-sm font-bold text-foreground">
                        {item.shopProduct?.product?.title}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Intl.NumberFormat('fa-IR').format(item.quantity)} عدد | قطعه نو
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="inline-flex items-center rounded-sm border border-border bg-secondary px-2 py-0.5 text-2xs font-medium text-secondary-foreground">
                        در ۱ ارسال
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {formatPrice(item.finalTotalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* خلاصه هزینه ارسال - سمت چپ */}
            <div className="order-2 flex flex-col items-end gap-2 pb-2 lg:order-1 lg:w-48 shrink-0">
               <div className="text-right w-full">
                 <span className="text-xs font-bold text-foreground block">{selectedTitle || 'ارسال عادی'}</span>
                 <div className="mt-0.5 text-2xs text-muted-foreground">
                   {selectedMethod === 'Tipax' ? 'ارسال فوری در تهران' : (selectedMethod === 'Local' ? 'تحویل حضوری' : 'ارسال از فروشنده')}
                 </div>
               </div>
               
               <div className="mt-2 flex items-center justify-between w-full border-t border-dashed border-border pt-2">
                  <span className="text-xs text-muted-foreground">هزینه ارسال:</span>
                  <strong className="text-sm font-bold text-primary">
                    {selectedPrice === 0 ? 'رایگان' : formatPrice(selectedPrice)}
                  </strong>
               </div>
            </div>

          </div>

        </CardBody>
      </Card>
    </div>
  );
}