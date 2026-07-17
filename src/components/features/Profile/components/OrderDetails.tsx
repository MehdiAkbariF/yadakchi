'use client';

import { useGetOrderDetails } from '@/domains/userpanel/hooks/userpanel.hooks';
import { Card, CardBody } from '@/components/composites/Card';
import { PageLoading } from '@/components/composites/Loading/PageLoading';

import { cn } from '@/design-system/utils/cn';
import { CreditCard, Calendar, Truck, Clock, Store, ShieldCheck, Sparkles, Receipt } from 'lucide-react';

interface OrderDetailsProps {
  orderId: string;
}

export function OrderDetails({ orderId }: OrderDetailsProps) {
  const { data: order, isLoading } = useGetOrderDetails(orderId);

  if (isLoading || !order) {
    return <PageLoading message="در حال دریافت فاکتور رسمی سفارش..." />;
  }

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(value));
  };

  const statusLabels: Record<string, string> = {
    WaitingForPayment: 'در انتظار پرداخت',
    InProgress: 'جاری',
    Delivered: 'تحویل شده',
    ReturnRequest: 'مرجوع شده',
    Cancelled: 'لغو شده',
  };

  return (
   
      <div className="flex-1 flex flex-col gap-6 w-full">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex flex-col gap-1.5 text-right">
            <h3 className="text-sm md:text-base font-black text-foreground font-iran-yekan">کد سفارش: {order.orderNumber}</h3>
            <span className="text-[10px] md:text-xs text-muted-foreground font-iran-sans">
              تاریخ ثبت سفارش: {new Date(order.createDate).toLocaleDateString('fa-IR')}
            </span>
          </div>

          <span className={cn(
            "px-4 py-1.5 rounded-full text-xs font-black font-iran-sans self-start sm:self-auto",
            order.status === 'WaitingForPayment' && "bg-destructive/10 text-destructive",
            order.status === 'Cancelled' && "bg-muted text-muted-foreground"
          )}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
          
          <div className="flex flex-col gap-6 w-full">
            <div className="flex items-start gap-3 border rounded-xl p-4 bg-background">
              <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-foreground font-iran-sans block">تاریخچه تراکنش</span>
                <div className="flex items-center justify-between w-full mt-2 text-xs text-muted-foreground font-iran-sans">
                  <span>{statusLabels[order.status] || order.status}</span>
                  <span>{new Date(order.createDate).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {order.subOrders.map((sub, index) => (
                <Card key={sub.id} className="w-full border rounded-xl overflow-hidden bg-background">
                  <div className="bg-muted/15 px-4 py-3 border-b flex items-center justify-between text-xs font-bold font-iran-yekan">
                    <span>مرسوله {formatPrice(index + 1)}</span>
                    <span className="text-primary">{statusLabels[sub.status] || sub.status}</span>
                  </div>
                  <CardBody className="p-4 flex flex-col gap-4">
                    
                    <div className="flex items-center gap-3 border-b pb-3">
                      <div className="w-10 h-10 shrink-0 rounded-lg border overflow-hidden p-0.5 bg-background">
                        <img src={getFullUrl(sub.shop.logo)} className="w-full h-full object-contain" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs md:text-sm font-bold text-foreground block font-iran-sans">{sub.shop.shopTitle}</span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5 font-iran-sans">ارسال از {sub.shipmentMethod === 'Local' ? 'حضوری' : 'تیپاکس'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {sub.subOrderItems.map((item) => (
                        <div key={item.id} className="flex gap-4 items-center">
                          <div className="w-14 h-14 shrink-0 rounded-xl border bg-muted/10 flex items-center justify-center overflow-hidden p-0.5">
                            <img src={getFullUrl(item.shopProduct.product.image)} className="w-full h-full object-contain" alt="" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs md:text-sm font-bold text-foreground block truncate font-iran-sans">
                              {item.shopProduct.product.title}
                            </span>
                            <div className="flex flex-wrap gap-2.5 items-center mt-1.5 text-[10px] md:text-xs text-muted-foreground font-iran-sans">
                              <span>تعداد: {formatPrice(item.quantity)} عدد</span>
                              <span>|</span>
                              <span>{item.shopProduct.type === 'New' ? 'قطعه نو' : 'قطعه استوک'}</span>
                              <span>|</span>
                              <span className="font-bold text-foreground">{formatPrice(item.finalUnitPrice / 10)} تومان</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed pt-3 mt-1.5 flex flex-wrap gap-x-6 gap-y-1.5 text-[10px] md:text-xs text-muted-foreground font-iran-sans">
                      <span>هزینه ارسال: {sub.shipmentPrice === 0 ? 'رایگان' : `${formatPrice(sub.shipmentPrice / 10)} تومان`}</span>
                      <span>روش ارسال: {sub.shipmentMethod === 'Local' ? 'تحویل حضوری' : 'تیپاکس'}</span>
                    </div>

                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          <Card className="w-full border rounded-xl p-5 bg-background shadow-sm h-fit">
            <div className="flex items-center gap-2 border-b pb-3 mb-4">
              <Receipt className="h-5 w-5 text-primary" />
              <span className="text-xs md:text-sm font-bold font-iran-yekan text-foreground">صورتحساب سفارش</span>
            </div>

            <div className="space-y-4 border-b pb-4 mb-4 text-right">
              <div className="flex items-center justify-between text-xs md:text-sm font-medium font-iran-sans text-muted-foreground">
                <span>قیمت کل کالاها</span>
                <span>{formatPrice(order.totalOriginalPrice / 10)} تومان</span>
              </div>

              {order.totalDiscountValue > 0 && (
                <div className="flex items-center justify-between text-xs md:text-sm font-bold font-iran-sans text-destructive">
                  <span>تخفیف کل</span>
                  <span>{formatPrice(order.totalDiscountValue / 10)} تومان-</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs md:text-sm font-medium font-iran-sans text-muted-foreground">
                <span>هزینه ارسال کل</span>
                <span>{order.totalShipmentPrice === 0 ? 'رایگان' : `${formatPrice(order.totalShipmentPrice / 10)} تومان`}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-right">
              <span className="text-xs md:text-sm font-bold font-iran-sans text-muted-foreground">مبلغ نهایی پرداخت شده</span>
              <span className="text-base md:text-lg font-black text-foreground font-iran-sans text-foreground">{formatPrice(order.totalFinalPrice / 10)} تومان</span>
            </div>
          </Card>

        </div>
      </div>
  
  );
}