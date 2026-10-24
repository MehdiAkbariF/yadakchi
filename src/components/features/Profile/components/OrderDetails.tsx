'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Clock,
  Copy,
  Package,
  CheckCircle2,
  Truck,
  XCircle,
  RotateCcw,
  CheckCheck,
  Store,
  UserCheck,
} from 'lucide-react';
import {
  useGetOrderDetails,
  useRetryOrderPayment,
  useMarkSubOrderReceived,
  useMarkSubOrderNotReceived,
} from '@/domains/userpanel/hooks/userpanel.hooks';
import { useGetCurrentTime } from '@/domains/front/static/hooks/static.hooks'; // ✅ ایمپورت هوک
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';
import { CancelOrderModal } from '@/components/features/Profile/components/CancelOrderModal';
import { ReturnRequestModal } from '@/components/features/Profile/components/ReturnRequestModal';

// ─── تایمر معکوس (هماهنگ با زمان سرور) ─────────────────────────────
function PayableTimer({ payableUntil }: { payableUntil: string }) {
  const [timeLeft, setTimeLeft] = React.useState('');
  const { data: serverTimeString } = useGetCurrentTime();
  const timeOffsetRef = React.useRef<number>(0);

  // محاسبه اختلاف زمان سرور و کلاینت
  React.useEffect(() => {
    if (serverTimeString) {
      const serverMs = new Date(serverTimeString).getTime();
      const clientMs = Date.now();
      timeOffsetRef.current = serverMs - clientMs;
    }
  }, [serverTimeString]);

  React.useEffect(() => {
    if (!serverTimeString) return;

    const calculateTime = () => {
      const adjustedNow = Date.now() + timeOffsetRef.current;
      const diff = new Date(payableUntil).getTime() - adjustedNow;

      if (diff > 0) {
        const mins = Math.floor(diff / 1000 / 60);
        const secs = Math.floor((diff / 1000) % 60);
        const formattedMins = new Intl.NumberFormat('fa-IR', { useGrouping: false })
          .format(mins)
          .padStart(2, '۰');
        const formattedSecs = new Intl.NumberFormat('fa-IR', { useGrouping: false })
          .format(secs)
          .padStart(2, '۰');
        setTimeLeft(`${formattedMins}:${formattedSecs}`);
      } else {
        setTimeLeft('منقضی شده');
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [payableUntil, serverTimeString]);

  const expired = timeLeft === 'منقضی شده' || !timeLeft;

  return (
    <div className={cn('flex items-center gap-1 font-mono text-sm font-bold', expired ? 'text-muted-foreground' : 'text-destructive')}>
      <span>{timeLeft || '...'}</span>
      {!expired && timeLeft ? <Clock className="h-4 w-4 animate-spin" style={{ animationDuration: '4s' }} /> : null}
    </div>
  );
}

// ─── توابع کمکی ─────────────────────────────────────────────
const formatPrice = (val: number) =>
  new Intl.NumberFormat('fa-IR').format(Math.round((val || 0) / 10));

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered':
    case 'Success':
      return 'text-success bg-success/10 border-success/20';
    case 'SellerCancelled':
    case 'UserCancelled':
    case 'Cancelled':
      return 'text-destructive bg-destructive/10 border-destructive/20';
    case 'WaitingForPayment':
    case 'Pending':
      return 'text-warning bg-warning/10 border-warning/20';
    case 'Processing':
    case 'Sent':
      return 'text-shop bg-shop/10 border-shop/20';
    default:
      return 'text-muted-foreground bg-muted border-border';
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'Delivered': 'تحویل شده',
    'SellerCancelled': 'لغو شده توسط فروشنده',
    'UserCancelled': 'لغو شده توسط کاربر',
    'Cancelled': 'لغو شده',
    'WaitingForPayment': 'در انتظار پرداخت',
    'Pending': 'در حال بررسی',
    'Processing': 'در حال پردازش',
    'Sent': 'ارسال شده',
    'Received': 'دریافت شده',
  };
  return labels[status] || status;
};

const getShipmentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    'SnappBox': 'اسنپ‌باکس',
    'Tipax': 'پست تیپاکس (پس‌کرایه)',
    'DirectShipment': 'ارسال مستقیم فروشنده',
    'Local': 'تحویل حضوری',
  };
  return labels[method] || method;
};

// ─── کامپوننت اصلی ───────────────────────────────────────────
export function OrderDetails({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { data: order, isLoading } = useGetOrderDetails(orderId);
  const retryPayment = useRetryOrderPayment();
  const markReceived = useMarkSubOrderReceived();
  const markNotReceived = useMarkSubOrderNotReceived();

  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [selectedItemForReturn, setSelectedItemForReturn] = React.useState<{ subOrder: any; item: any } | null>(null);

  if (isLoading || !order) {
    return <PageLoading  />;
  }

  const handleCopyTrace = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast.success('کد رهگیری کپی شد');
  };

  const handleRetryPayment = async () => {
    try {
      const response: any = await retryPayment.mutateAsync(orderId);
      const gatewayUrl =
        response?.link ||
        response?.paymentUrl ||
        response?.data?.link ||
        response?.data?.paymentUrl;
      if (gatewayUrl) {
        showToast.success('در حال انتقال به درگاه بانکی...');
        window.location.href = gatewayUrl;
      } else {
        showToast.error('خطا در دریافت درگاه بانکی');
      }
    } catch (error: any) {
      showToast.error(error.userMessage || 'خطا در برقراری ارتباط با بانک');
    }
  };

  const handleMarkReceived = async (subOrderId: string) => {
    try {
      await markReceived.mutateAsync(subOrderId);
      showToast.success('دریافت سفارش با موفقیت تایید شد');
    } catch {
      showToast.error('خطا در تایید دریافت');
    }
  };

  const handleMarkNotReceived = async (subOrderId: string) => {
    try {
      await markNotReceived.mutateAsync(subOrderId);
      showToast.success('عدم دریافت سفارش ثبت شد و جهت بررسی ارسال گردید');
    } catch {
      showToast.error('خطا در ثبت عدم دریافت');
    }
  };

  const isWaitingForPayment = order.status === 'WaitingForPayment';
  const canCancelOrder = order.status === 'WaitingForPayment';

  return (
    <div className="flex w-full flex-1 flex-col gap-6 pb-24">
      
      {/* هدر صفحه */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/profile/orders')}
            className="rounded-lg p-1 transition-colors hover:bg-secondary"
          >
            <ArrowRight aria-hidden="true" className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-base font-bold text-foreground sm:text-lg">
            جزئیات سفارش
          </h1>
        </div>
        <div className={cn("rounded-md border px-3 py-1 text-xs font-bold", getStatusColor(order.status))}>
          {getStatusLabel(order.status)}
        </div>
      </div>

      {/* وضعیت و شماره سفارش */}
      <div className="flex flex-col gap-3 px-1">
        {isWaitingForPayment && order.payableUntil && (
          <div className="flex items-center gap-2 text-destructive font-bold text-sm">
            <span>در صورت عدم پرداخت، سفارش به صورت خودکار لغو می‌شود</span>
            <PayableTimer payableUntil={order.payableUntil} />
          </div>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
          <span>کد سفارش</span>
          <span className="font-bold text-foreground font-sans">
            {toPersianDigits(order.orderNumber)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>تاریخ ثبت سفارش</span>
          <span className="font-bold text-foreground">
            {new Date(order.createDate).toLocaleDateString('fa-IR')}
          </span>
        </div>

        {/* دکمه‌های عملیاتی (پرداخت مجدد + لغو سفارش) */}
        {isWaitingForPayment && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="primary" onClick={handleRetryPayment} isLoading={retryPayment.isPending}>
              پرداخت مجدد
            </Button>
            {canCancelOrder && (
              <Button variant="outline" onClick={() => setIsCancelModalOpen(true)} className="text-destructive hover:bg-destructive/10">
                لغو سفارش
              </Button>
            )}
          </div>
        )}
      </div>

      {/* اطلاعات گیرنده */}
      {order.userLocation && (
        <div className="flex flex-col gap-3 px-1 border-t border-border/50 pt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>تحویل گیرنده</span>
            <span className="font-bold text-foreground">{order.userLocation.receiverFullName}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>موبایل</span>
            <span className="font-bold text-foreground font-sans">
              {toPersianDigits(order.userLocation.receiverMobile)}
            </span>
          </div>
          <div className="flex items-start justify-between text-sm text-muted-foreground">
            <span className="shrink-0">آدرس</span>
            <span className="font-bold text-foreground text-left max-w-[70%] leading-relaxed">
              {order.userLocation.address}، پلاک {toPersianDigits(order.userLocation.plaque)}، واحد {toPersianDigits(order.userLocation.unit)}
            </span>
          </div>
        </div>
      )}

      {/* مرسوله‌ها */}
      <div className="flex flex-col gap-4 mt-2">
        {order.subOrders?.map((subOrder: any, index: number) => {
          const canConfirmReceipt = subOrder.status === 'Sent';
          const canReturn = subOrder.status === 'Delivered' || subOrder.status === 'Received';

          return (
            <Card key={subOrder.id} className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
              
              {/* هدر مرسوله */}
              <div className="flex flex-col gap-2 border-b border-border/50 bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Store className="h-4 w-4 text-shop" />
                    {subOrder.shop?.shopTitle}
                  </span>
                  <div className={cn("rounded-md border px-2 py-0.5 text-2xs font-bold", getStatusColor(subOrder.status))}>
                    {getStatusLabel(subOrder.status)}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" />
                    {getShipmentMethodLabel(subOrder.shipmentMethod)}
                  </span>
                  {subOrder.traceNumber && (
                    <button
                      onClick={() => handleCopyTrace(subOrder.traceNumber)}
                      className="flex items-center gap-1 text-shop hover:underline"
                    >
                      <Copy className="h-3 w-3" />
                      کد رهگیری: {toPersianDigits(subOrder.traceNumber)}
                    </button>
                  )}
                </div>
                {subOrder.driverFullName && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card p-2 rounded-md border border-border/50">
                    <UserCheck className="h-3.5 w-3.5 text-shop" />
                    <span>راننده: {subOrder.driverFullName}</span>
                    {subOrder.driverMobile && <span className="font-sans">({toPersianDigits(subOrder.driverMobile)})</span>}
                  </div>
                )}
              </div>

              <CardBody className="flex flex-col gap-5 p-4">
                {subOrder.subOrderItems?.map((item: any) => (
                  <div key={item.id} className="flex flex-col gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                    <div className="flex gap-4">
                      {/* عکس محصول */}
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-card p-1.5">
                        {item.shopProduct?.product?.image ? (
                          <img
                            src={getFullUrl(item.shopProduct.product.image)}
                            className="h-full w-full object-contain"
                            alt=""
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* جزئیات محصول */}
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-3">
                          <span className="text-sm font-bold text-foreground leading-relaxed line-clamp-2">
                            {item.shopProduct?.product?.title}
                          </span>
                          <span className="flex h-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-secondary/50 px-2.5 text-xs font-bold text-muted-foreground">
                            {toPersianDigits(item.quantity)} عدد
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>نوع قطعه: {item.shopProduct?.type === 'New' ? 'نو' : 'کارکرده'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 text-sm">
                          <span className="text-muted-foreground">مبلغ کالا</span>
                          <div className="flex items-center gap-2.5">
                            {item.discountAmount > 0 && (
                              <span className="text-muted-foreground line-through text-xs">
                                {formatPrice(item.originalPrice)} تومان
                              </span>
                            )}
                            <span className="font-bold text-foreground">
                              {formatPrice(item.finalTotalPrice)} تومان
                            </span>
                          </div>
                        </div>
                        {item.discountAmount > 0 && (
                          <div className="flex items-center justify-between text-sm text-destructive font-bold">
                            <span>تخفیف</span>
                            <span>{formatPrice(item.discountAmount)} تومان</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-1 text-sm text-muted-foreground">
                          <span>هزینه ارسال</span>
                          <span>{subOrder.shipmentMethod === 'Tipax' ? 'پس‌کرایه' : formatPrice(subOrder.shipmentPrice) + ' تومان'}</span>
                        </div>
                      </div>
                    </div>

                    {/* دکمه درخواست مرجوعی برای هر آیتم */}
                    {canReturn && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedItemForReturn({ subOrder, item })} 
                        className="text-xs gap-1.5 self-start"
                      >
                        <RotateCcw className="h-4 w-4" />
                        درخواست مرجوعی این کالا
                      </Button>
                    )}
                  </div>
                ))}

                {/* دکمه‌های تایید/عدم دریافت */}
                {canConfirmReceipt && (
                  <div className="flex flex-wrap gap-2 border-t border-border/50 pt-3">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleMarkReceived(subOrder.id)} 
                      isLoading={markReceived.isPending} 
                      className="text-xs gap-1.5"
                    >
                      <CheckCheck className="h-4 w-4" />
                      تایید دریافت
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleMarkNotReceived(subOrder.id)} 
                      isLoading={markNotReceived.isPending} 
                      className="text-xs text-destructive gap-1.5"
                    >
                      <XCircle className="h-4 w-4" />
                      عدم دریافت
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* خلاصه مالی */}
      <Card className="rounded-2xl border border-border/70 bg-card shadow-xs">
        <CardBody className="p-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>مبلغ کالاها</span>
            <span className="font-bold text-foreground">{formatPrice(order.totalOriginalPrice)} تومان</span>
          </div>
          {order.totalDiscountValue > 0 && (
            <div className="flex justify-between text-destructive">
              <span>تخفیف کالاها</span>
              <span className="font-bold">- {formatPrice(order.totalDiscountValue)} تومان</span>
            </div>
          )}
          {order.totalYadakchiDiscountValue > 0 && (
            <div className="flex justify-between text-destructive">
              <span>تخفیف یدک‌چی</span>
              <span className="font-bold">- {formatPrice(order.totalYadakchiDiscountValue)} تومان</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>هزینه ارسال</span>
            <span className="font-bold text-foreground">{formatPrice(order.totalShipmentPrice)} تومان</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-black">
            <span className="text-foreground">مبلغ نهایی</span>
            <span className="text-primary">{formatPrice(order.totalFinalPrice)} تومان</span>
          </div>
        </CardBody>
      </Card>

      {/* دکمه پرداخت مجدد (در حالت ثابت) */}
      {isWaitingForPayment && (
        <div className="fixed bottom-16 left-0 right-0 z-40 flex justify-center px-4 lg:static lg:mt-4 lg:px-0">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleRetryPayment}
            isLoading={retryPayment.isPending}
            className="flex h-12 max-w-md items-center justify-center gap-2 rounded-xl text-sm font-bold shadow-md"
          >
            پرداخت مجدد
          </Button>
        </div>
      )}

      {/* مودال‌ها */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        orderId={orderId}
      />

      {selectedItemForReturn && (
        <ReturnRequestModal
          isOpen={!!selectedItemForReturn}
          onClose={() => setSelectedItemForReturn(null)}
          subOrder={selectedItemForReturn.subOrder}
          item={selectedItemForReturn.item}
        />
      )}
    </div>
  );
}