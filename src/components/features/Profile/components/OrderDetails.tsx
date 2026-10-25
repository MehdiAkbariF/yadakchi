'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
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
  MapPin,
  Calendar,
  AlertCircle,
  Hash,
  Phone,
  User,
} from 'lucide-react';
import {
  useGetOrderDetails,
  useRetryOrderPayment,
  useMarkSubOrderReceived,
  useMarkSubOrderNotReceived,
} from '@/domains/userpanel/hooks/userpanel.hooks';
import { useGetCurrentTime } from '@/domains/front/static/hooks/static.hooks';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';
import { formatToman } from '@/core/utils/currency';
import { CancelOrderModal } from '@/components/features/Profile/components/CancelOrderModal';
import { ReturnRequestModal } from '@/components/features/Profile/components/ReturnRequestModal';

// ─── تایمر معکوس (هماهنگ با زمان سرور) ─────────────────────────────
function PayableTimer({ payableUntil }: { payableUntil: string }) {
  const [timeLeft, setTimeLeft] = React.useState('');
  const { data: serverTimeString } = useGetCurrentTime();
  const timeOffsetRef = React.useRef<number>(0);

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
        const formattedMins = String(mins).padStart(2, '0');
        const formattedSecs = String(secs).padStart(2, '0');
        setTimeLeft(`${toPersianDigits(formattedMins)}:${toPersianDigits(formattedSecs)}`);
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
    <div
      className={cn(
        'flex items-center gap-1.5  text-xs font-bold',
        expired ? 'text-muted-foreground' : 'text-destructive'
      )}
      dir="ltr"
    >
      <span>{timeLeft || '...'}</span>
      {!expired && timeLeft ? <Clock className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} /> : null}
    </div>
  );
}

// ─── توابع کمکی وضعیت و روش ارسال ─────────────────────────────
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered':
    case 'Success':
      return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'SellerCancelled':
    case 'UserCancelled':
    case 'Cancelled':
      return 'text-destructive bg-destructive/10 border-destructive/20';
    case 'WaitingForPayment':
    case 'Pending':
      return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'Processing':
    case 'Sent':
      return 'text-primary bg-primary/10 border-primary/20';
    default:
      return 'text-muted-foreground bg-muted border-border';
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    Delivered: 'تحویل شده',
    SellerCancelled: 'لغو توسط فروشنده',
    UserCancelled: 'لغو توسط شما',
    Cancelled: 'لغو شده',
    WaitingForPayment: 'در انتظار پرداخت',
    Pending: 'در حال بررسی',
    Processing: 'در حال پردازش',
    Sent: 'ارسال شده',
    Received: 'دریافت شده',
  };
  return labels[status] || status;
};

const getShipmentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    SnappBox: 'اسنپ‌باکس',
    Tipax: 'پست تیپاکس (پس‌کرایه)',
    DirectShipment: 'ارسال مستقیم فروشگاه',
    Local: 'تحویل حضوری',
  };
  return labels[method] || method;
};

// ─── کامپوننت اصلی جزئیات سفارش ─────────────────────────────
export function OrderDetails({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { data: order, isLoading } = useGetOrderDetails(orderId);
  const retryPayment = useRetryOrderPayment();
  const markReceived = useMarkSubOrderReceived();
  const markNotReceived = useMarkSubOrderNotReceived();

  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [selectedItemForReturn, setSelectedItemForReturn] = React.useState<{ subOrder: any; item: any } | null>(null);

  if (isLoading || !order) {
    return <PageLoading label="در حال بارگذاری فاکتور و جزئیات سفارش..." />;
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
        showToast.error('خطا در دریافت لینک درگاه بانکی');
      }
    } catch (error: any) {
      showToast.error(error?.userMessage || 'خطا در برقراری ارتباط با درگاه پرداخت');
    }
  };

  const handleMarkReceived = async (subOrderId: string) => {
    try {
      await markReceived.mutateAsync(subOrderId);
      showToast.success('دریافت سفارش با موفقیت تایید شد');
    } catch {
      showToast.error('خطا در تایید دریافت سفارش');
    }
  };

  const handleMarkNotReceived = async (subOrderId: string) => {
    try {
      await markNotReceived.mutateAsync(subOrderId);
      showToast.success('عدم دریافت سفارش ثبت شد و جهت بررسی به واحد پشتیبانی ارجاع گردید');
    } catch {
      showToast.error('خطا در ثبت عدم دریافت');
    }
  };

  const isWaitingForPayment = order.status === 'WaitingForPayment';
  const canCancelOrder = order.status === 'WaitingForPayment';

  return (
    <div className="flex w-full flex-col gap-5 pb-16" dir="rtl">
      
      {/* ================= 1. کارت جامع شناسه و مشخصات سفارش ================= */}
      <Card className="rounded-2xl border border-border/80 bg-card p-4.5 sm:p-5 shadow-xs">
        
        {/* ردیف بالا: وضعیت و کد سفارش */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">وضعیت سفارش:</span>
            <span className={cn('rounded-lg border px-2.5 py-1 text-xs font-bold', getStatusColor(order.status))}>
              {getStatusLabel(order.status)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">کد پیگیری سفارش:</span>
            <span className=" font-bold text-foreground" dir="ltr">
              #{toPersianDigits(order.orderNumber)}
            </span>
          </div>
        </div>

        {/* اطلاعات کلید / مقدار به صورت کامپکت و منظم در راست‌چین */}
        <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          <div className="flex items-center justify-between sm:justify-start sm:gap-3 rounded-xl bg-muted/30 p-2.5 border border-border/40">
            <span className="text-muted-foreground flex items-center gap-1.5 text-right">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              تاریخ ثبت:
            </span>
            <span className="font-bold text-foreground text-right">
              {new Date(order.createDate).toLocaleDateString('fa-IR')}
            </span>
          </div>

          {order.userLocation?.receiverFullName && (
            <div className="flex items-center justify-between sm:justify-start sm:gap-3 rounded-xl bg-muted/30 p-2.5 border border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5 text-right">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                تحویل‌گیرنده:
              </span>
              <span className="font-bold text-foreground text-right truncate">
                {order.userLocation.receiverFullName}
              </span>
            </div>
          )}

          {order.userLocation?.receiverMobile && (
            <div className="flex items-center justify-between sm:justify-start sm:gap-3 rounded-xl bg-muted/30 p-2.5 border border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5 text-right">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                شماره تماس:
              </span>
              <span className=" font-bold text-foreground" dir="ltr">
                {toPersianDigits(order.userLocation.receiverMobile)}
              </span>
            </div>
          )}

          {order.userLocation?.address && (
            <div className="sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2.5 rounded-xl bg-muted/30 p-2.5 border border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 text-right">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                نشانی تحویل:
              </span>
              <span className="font-bold text-foreground text-right leading-relaxed">
                {order.userLocation.province}، {order.userLocation.city}، {order.userLocation.address}، پلاک {toPersianDigits(order.userLocation.plaque)}، واحد {toPersianDigits(order.userLocation.unit)}
              </span>
            </div>
          )}
        </div>

        {/* دکمه‌های عملیاتی پرداخت / لغو در سفارش‌های در انتظار */}
        {isWaitingForPayment && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3.5">
            {order.payableUntil ? (
              <div className="flex items-center gap-2 text-xs font-bold text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>مهلت پرداخت:</span>
                <PayableTimer payableUntil={order.payableUntil} />
              </div>
            ) : <div />}

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleRetryPayment}
                isLoading={retryPayment.isPending}
                className="h-9 px-4 text-xs font-bold"
              >
                پرداخت آنلاین فاکتور
              </Button>
              {canCancelOrder && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="h-9 text-xs font-bold text-destructive hover:bg-destructive/10"
                >
                  لغو سفارش
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* ================= 2. لیست مرسوله‌ها و اقلام کالا ================= */}
      <div className="flex flex-col gap-4">
        {order.subOrders?.map((subOrder: any) => {
          const canConfirmReceipt = subOrder.status === 'Sent';
          const canReturn = subOrder.status === 'Delivered' || subOrder.status === 'Received';

          return (
            <Card key={subOrder.id} className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
              
              {/* هدر مرسوله: نام فروشگاه و کد رهگیری */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/20 p-4">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    فروشگاه: {subOrder.shop?.shopTitle}
                  </span>
                  <span className={cn('rounded-md border px-2 py-0.5 text-3xs font-bold', getStatusColor(subOrder.status))}>
                    {getStatusLabel(subOrder.status)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-2xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                    {getShipmentMethodLabel(subOrder.shipmentMethod)}
                  </span>
                  {subOrder.traceNumber && (
                    <button
                      type="button"
                      onClick={() => handleCopyTrace(subOrder.traceNumber)}
                      className="flex items-center gap-1  font-bold text-primary hover:underline"
                    >
                      <Copy className="h-3 w-3" />
                      کد رهگیری: {toPersianDigits(subOrder.traceNumber)}
                    </button>
                  )}
                </div>
              </div>

              {/* ردیف اقلام خریداری شده از این مرسوله */}
              <CardBody className="flex flex-col gap-4 p-4.5">
                {subOrder.subOrderItems?.map((item: any) => (
                  <div key={item.id} className="flex flex-col gap-3 border-b border-border/40 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-card p-1">
                        {item.shopProduct?.product?.image ? (
                          <img
                            src={getFullUrl(item.shopProduct.product.image)}
                            className="h-full w-full object-contain"
                            alt=""
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex flex-col gap-1 min-w-0 text-right">
                        <span className="text-xs font-bold text-foreground line-clamp-1 text-right">
                          {item.shopProduct?.product?.title}
                        </span>
                        <div className="flex items-center gap-3 text-3xs text-muted-foreground">
                          <span>تعداد: {toPersianDigits(item.quantity)} عدد</span>
                          <span>نوع قطعه: {item.shopProduct?.type === 'New' ? 'نو' : 'کارکرده'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.discountAmount > 0 && (
                            <span className="text-2xs text-muted-foreground line-through">
                              {formatToman(item.originalPrice)}
                            </span>
                          )}
                          <span className="text-xs font-black text-foreground">
                            {formatToman(item.finalTotalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* دکمه مرجوعی کالا در صورت تحویل شدن */}
                    {canReturn && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedItemForReturn({ subOrder, item })}
                        className="h-8 gap-1.5 rounded-lg text-3xs font-bold text-rose-500 hover:bg-rose-500/5 self-end sm:self-center"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        درخواست مرجوعی این کالا
                      </Button>
                    )}
                  </div>
                ))}

                {/* دکمه‌های تایید یا اعلام عدم دریافت مرسوله */}
                {canConfirmReceipt && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleMarkReceived(subOrder.id)}
                      isLoading={markReceived.isPending}
                      className="h-8.5 gap-1.5 rounded-lg text-xs font-bold"
                    >
                      <CheckCheck className="h-4 w-4" />
                      تایید دریافت مرسوله
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkNotReceived(subOrder.id)}
                      isLoading={markNotReceived.isPending}
                      className="h-8.5 gap-1.5 rounded-lg text-xs font-bold text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4" />
                      عدم دریافت کالا
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* ================= 3. خلاصه صورتحساب مالی سفارش ================= */}
      <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
        <h2 className="mb-3 text-xs font-bold text-foreground text-right">خلاصه مالی صورت‌حساب</h2>
        
        <div className="flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-right">مجموع مبلغ کالاها</span>
            <span className="font-bold text-foreground text-left" dir="ltr">
              {formatToman(order.totalOriginalPrice)}
            </span>
          </div>

          {order.totalDiscountValue > 0 && (
            <div className="flex justify-between items-center text-destructive">
              <span className="text-right">تخفیف فروشندگان</span>
              <span className="font-bold text-left" dir="ltr">
                - {formatToman(order.totalDiscountValue)}
              </span>
            </div>
          )}

          {order.totalYadakchiDiscountValue > 0 && (
            <div className="flex justify-between items-center text-destructive">
              <span className="text-right">تخفیف ویژه یدک‌چی</span>
              <span className="font-bold text-left" dir="ltr">
                - {formatToman(order.totalYadakchiDiscountValue)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-right">هزینه بسته‌بندی و ارسال</span>
            <span className="font-bold text-foreground text-left" dir="ltr">
              {formatToman(order.totalShipmentPrice)}
            </span>
          </div>

          <div className="mt-2 flex justify-between items-center border-t border-border/80 pt-3 text-sm font-black">
            <span className="text-foreground text-right">مبلغ پرداختی نهایی</span>
            <span className="text-primary text-base text-left font-black" dir="ltr">
              {formatToman(order.totalFinalPrice)}
            </span>
          </div>
        </div>
      </Card>

      {/* مودال‌های لغو و مرجوعی */}
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