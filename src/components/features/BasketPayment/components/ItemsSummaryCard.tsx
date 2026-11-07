'use client';

import { Info, ChevronLeft, Package, Truck } from 'lucide-react';
import { Card, CardBody } from '@/components/composites/Card';
import { useGetBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';
import { formatRialToToman } from '@/core/utils/currency';
import { cn } from '@/design-system/utils';

export interface ItemsSummaryCardProps {
  onOpenTracking: () => void;
}

export function ItemsSummaryCard({ onOpenTracking }: ItemsSummaryCardProps) {
  const { data: basketData } = useGetBasket();
  const basket = (basketData as any)?.basket || (basketData as any)?.data || basketData;

  const subBaskets = basket?.subBaskets || [];
  const parcelCount = subBaskets.length || 1;

  // محاسبه مجموع تعداد اقلام از subBasketItems
  const totalItems = subBaskets.reduce((acc: number, sub: any) => {
    const items = sub.subBasketItems || sub.items || [];
    return acc + items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
  }, 0);

  const getMethodTitle = (method: string) => {
    switch (method) {
      case 'SnappBox':
        return 'ارسال فوری با اسنپ‌باکس';
      case 'Tipax':
        return 'ارسال با تیپاکس';
      case 'DirectShipment':
      case 'Seller':
        return 'ارسال مستقیم توسط فروشنده';
      case 'Local':
        return 'دریافت حضوری از فروشگاه';
      default:
        return 'ارسال استاندارد یدکچی';
    }
  };

  return (
    <Card className="w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs" dir="rtl">
      <CardBody className="flex flex-col gap-6 p-4 sm:p-6">
        {/* هدر بالای کارت */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex flex-col items-start text-right gap-1.5">
            <span className="text-title-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary"></span>
              کالاها و زمان‌بندی ارسال
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {toPersianDigits(totalItems)} کالا در {toPersianDigits(parcelCount)} مرسوله
              </span>
            </span>
            <span className="text-2xs text-muted-foreground">
              سفارش شما در قالب {toPersianDigits(parcelCount)} مرسوله جداگانه تحویل داده خواهد شد.
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenTracking}
            className="group flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Info className="h-4 w-4" />
            <span>اطلاع از روند ارسال</span>
            <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>

        {/* لیست مرسوله‌ها */}
        <div className="flex flex-col gap-8 divide-y divide-border/60">
          {subBaskets.map((sub: any, index: number) => {
            const items = sub.subBasketItems || sub.items || [];
            const deliveryTitle = getMethodTitle(sub.shipmentMethod);

            return (
              <div key={sub.id || index} className={cn('flex flex-col gap-4', index > 0 && 'pt-6')}>
                {/* هدر مرسوله */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-label">
                      مرسوله {toPersianDigits(index + 1)}: {deliveryTitle}
                    </span>
                  </div>
                  <span className="text-2xs font-semibold text-muted-foreground">
                    فروشگاه: <strong className="text-foreground">{sub.shop?.shopTitle || 'یدکچی'}</strong>
                  </span>
                </div>

                {/* اقلام مرسوله */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {items.map((item: any) => {
                    const product = item.shopProduct?.product || item.product || {};
                    const price = item.finalTotalPrice ?? item.price?.finalTotalPriceRaw ?? 0;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/15 p-2.5"
                      >
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-card p-1">
                          <img
                            src={getFullUrl(product?.image)}
                            alt={product?.title || ''}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 text-right">
                          <h4 className="line-clamp-1 text-label" title={product?.title}>
                            {product?.title}
                          </h4>

                          <div className="flex items-center justify-between text-2xs text-muted-foreground">
                            <span>
                              {toPersianDigits(item.quantity)} عدد
                            </span>
                            <span className="font-bold text-foreground">
                              {formatRialToToman(price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}