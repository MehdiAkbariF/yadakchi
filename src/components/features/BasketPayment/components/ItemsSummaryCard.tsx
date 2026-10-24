'use client';

import { Info, ChevronLeft } from 'lucide-react';
import { Card, CardBody } from '@/components/composites/Card';
import { useGetBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { getFullUrl } from '@/core/utils/formatters';

export interface ItemsSummaryCardProps {
  onOpenTracking: () => void;
}

export function ItemsSummaryCard({ onOpenTracking }: ItemsSummaryCardProps) {
  const { data: basketData } = useGetBasket();
  const basket = basketData as any;

  const subBaskets = basket?.subBaskets || [];
  const parcelCount = subBaskets.length || 1;
  
  // محاسبه تعداد کل اقلام
  const totalItems = subBaskets.reduce((acc: number, sub: any) => {
    return acc + (sub.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0);
  }, 0);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('fa-IR').format(value / 10) + ' تومان';

  return (
    <Card className="w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
      <CardBody className="flex flex-col gap-8 p-5 sm:p-6">
        
        {/* هدر بالای کارت */}
        {/* در حالت RTL، آیتم اول سمت راست و آیتم دوم سمت چپ قرار می‌گیرد */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* متن‌های سمت راست */}
          <div className="flex flex-col items-start text-right gap-1.5">
            <span className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary/80"></span>
              کالاها و ارسال 
              <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {new Intl.NumberFormat('fa-IR').format(totalItems)} کالا در {new Intl.NumberFormat('fa-IR').format(parcelCount)} مرسوله
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              کالاها در {new Intl.NumberFormat('fa-IR').format(parcelCount)} ارسال (مرسوله) به دست شما خواهد رسید
            </span>
          </div>

          {/* دکمه اطلاع‌رسانی (سمت چپ) */}
          <button
            onClick={onOpenTracking}
            className="group flex w-fit items-center gap-2.5 rounded-lg border border-border/70 bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-all duration-fast hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Info className="h-4 w-4 transition-colors group-hover:text-primary" />
            <span>اطلاع از روند ارسال و پرداختش</span>
            <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          </button>

        </div>

        {/* بدنه: نمایش کالاها بر اساس مرسوله */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 pt-2">
          
          {/* خط جداکننده عمودی در دسکتاپ */}
          <div className="hidden md:block absolute inset-y-4 right-1/2 w-px bg-gradient-to-b from-transparent via-border/80 to-transparent" />

          {subBaskets.map((sub: any, index: number) => {
            const isPost = sub.shipmentMethod === 'Tipax' || sub.shipmentMethod === 'Post';
            const deliveryTitle = isPost ? 'ارسال با پست' : 'ارسال با پیک موتوری';
            const deliveryTime = 'ارسال تا ۲۴ ساعت آینده';

            return (
              <div key={sub.id} className="flex flex-col gap-6">
                
                {/* عنوان شیوه ارسال و زمان */}
                <div className="flex flex-col items-center text-center gap-1.5">
                  <span className="text-sm font-bold text-foreground">{deliveryTitle}</span>
                  <span className="text-xs text-muted-foreground">{deliveryTime}</span>
                </div>

                {/* لیست اقلام این مرسوله */}
                 <div className="flex flex-col gap-6">
                  {sub.items?.map((item: any) => (
                    <div key={item.id} className="group flex flex-col items-center gap-3">
                      
                      {/* تصویر بزرگ محصول */}
                      {/* bg-white اضافه شد تا در دارک مود تصویر سیاه نشود و پس زمینه سفید محصول محو شود */}
                      <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-sm">
                        <img
                          src={getFullUrl(item.product?.image)}
                          alt={item.product?.title || ''}
                          className="h-full w-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* مشخصات کالا */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <span>{new Intl.NumberFormat('fa-IR').format(item.quantity)} عدد</span>
                        <span className="h-3 w-px bg-border"></span>
                        <span>{item.type || 'قطعه نو'}</span>
                      </div>

                      {/* قیمت */}
                      <span className="text-sm font-bold text-foreground tracking-tight">
                        {formatPrice(item.price?.finalTotalPriceRaw || item.finalTotalPrice || 0)}
                      </span>

                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}