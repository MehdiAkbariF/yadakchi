'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Copy,
  Package,
  Truck,
  XCircle,
  RotateCcw,
  CheckCheck,
  Store,
  MapPin,
  Calendar,
  AlertCircle,
  Phone,
  User,
  CreditCard,
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

/**
 * تبدیل کاملاً امن هر نوع ورودی (رشته، آبجکت، Date، عدد) به تایم‌استمپ UTC
 * مانع از بروز خطای TypeError: dateStr.trim is not a function می‌شود
 */
function toUtcTimestamp(input?: unknown): number {
  if (!input) return 0;

  // ۱. اگر شیء Date است
  if (input instanceof Date) {
    return input.getTime();
  }

  // ۲. اگر عدد (تایم‌استمپ میلی‌ثانیه) است
  if (typeof input === 'number') {
    return input;
  }

  // ۳. اگر آبجکت است (مانند ریسپانس‌های { data: "..." } یا { time: "..." })
  if (typeof input === 'object') {
    const obj = input as Record<string, any>;
    const extracted =
      obj.data ??
      obj.time ??
      obj.currentTime ??
      obj.serverTime ??
      obj.dateTime ??
      obj.value;

    if (extracted && extracted !== input) {
      return toUtcTimestamp(extracted);
    }
  }

  // ۴. اگر رشته متنی است
  if (typeof input === 'string') {
    const clean = input.trim();
    if (!clean) return 0;

    // اگر عدد رشته‌ای باشد
    if (/^\d{10,}$/.test(clean)) {
      return Number(clean);
    }

    const hasTimezone = clean.endsWith('Z') || /[+-]\d{2}(:\d{2})?$/.test(clean);
    const iso = hasTimezone ? clean : `${clean}Z`;
    const time = new Date(iso).getTime();

    return isNaN(time) ? new Date(clean).getTime() || 0 : time;
  }

  return 0;
}

// ─── تایمر معکوس دقیق و همگام با ساعت سرور ─────────────────────────────
function PayableTimer({
  payableUntil,
  onExpire,
}: {
  payableUntil: string;
  onExpire?: () => void;
}) {
  const [timeLeft, setTimeLeft] = React.useState<string | null>(null);
  const [isExpired, setIsExpired] = React.useState(false);
  const { data: serverTimeData, isLoading: isServerTimeLoading } = useGetCurrentTime();
  const timeOffsetRef = React.useRef<number>(0);

  // محاسبه اختلاف ساعت کلاینت با ساعت سرور
  React.useEffect(() => {
    if (serverTimeData) {
      const serverMs = toUtcTimestamp(serverTimeData);
      if (serverMs > 0) {
        const clientMs = Date.now();
        timeOffsetRef.current = serverMs - clientMs;
      }
    }
  }, [serverTimeData]);

  React.useEffect(() => {
    if (!payableUntil) return;

    const targetMs = toUtcTimestamp(payableUntil);
    if (targetMs <= 0) return;

    const calculateTime = () => {
      // ساعت کنونی هماهنگ‌شده با سرور
      const currentServerMs = Date.now() + timeOffsetRef.current;
      const diff = targetMs - currentServerMs;

      if (diff > 0) {
        const mins = Math.floor(diff / 1000 / 60);
        const secs = Math.floor((diff / 1000) % 60);
        const formattedMins = String(mins).padStart(2, '0');
        const formattedSecs = String(secs).padStart(2, '0');
        setTimeLeft(
          `${toPersianDigits(formattedMins)}:${toPersianDigits(formattedSecs)}`
        );
        setIsExpired(false);
      } else {
        setTimeLeft('منقضی شده');
        setIsExpired(true);
        onExpire?.();
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [payableUntil, serverTimeData, onExpire]);

  if (isServerTimeLoading && !timeLeft) {
    return (
      <span className="text-2xs text-muted-foreground animate-pulse">
        در حال بررسی زمان...
      </span>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs font-black tracking-wider',
        isExpired ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'
      )}
      dir="ltr"
    >
      <span>{timeLeft || '...'}</span>
      {!isExpired ? (
        <Clock className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} />
      ) : null}
    </div>
  );
}

// ─── توابع کمکی وضعیت‌ها ─────────────────────────────
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered':
    case 'Complete':
    case 'SellerConfirmed':
    case 'Success':
    case 'Received':
      return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';

    case 'SellerCancelled':
    case 'UserCancelled':
    case 'SystemCancelled':
    case 'Cancelled':
      return 'text-destructive bg-destructive/10 border-destructive/20';

    case 'UserNotDelivered':
    case 'FullReturnRequested':
    case 'PartialReturnRequested':
    case 'PartiallyReturned':
    case 'FullyReturned':
      return 'text-rose-500 bg-rose-500/10 border-rose-500/20';

    case 'WaitingForPayment':
    case 'WaitingForSellerConfirm':
    case 'WaitingTipaxConfirm':
    case 'WaitingMahexConfirm':
    case 'Pending':
      return 'text-amber-500 bg-amber-500/10 border-amber-500/20';

    case 'Sent':
    case 'Processing':
      return 'text-primary bg-primary/10 border-primary/20';

    default:
      return 'text-muted-foreground bg-muted border-border';
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    WaitingForPayment: 'در انتظار پرداخت',
    Pending: 'در حال بررسی',
    WaitingForSellerConfirm: 'در انتظار تایید فروشنده',
    SellerConfirmed: 'تایید شده توسط فروشنده',
    WaitingTipaxConfirm: 'در انتظار تایید تیپاکس',
    WaitingMahexConfirm: 'در انتظار تایید ماهکس',
    Processing: 'در حال پردازش',
    Sent: 'ارسال شده',
    Delivered: 'تحویل شده',
    UserNotDelivered: 'عدم تحویل به کاربر',
    FullReturnRequested: 'درخواست مرجوعی کامل',
    PartialReturnRequested: 'درخواست مرجوعی جزئی',
    PartiallyReturned: 'مرجوعی جزئی انجام شده',
    FullyReturned: 'مرجوعی کامل انجام شده',
    Complete: 'تکمیل شده',
    Success: 'موفق',
    Received: 'دریافت شده',
    SellerCancelled: 'لغو توسط فروشنده',
    UserCancelled: 'لغو توسط شما',
    SystemCancelled: 'لغو توسط سیستم',
    Cancelled: 'لغو شده',
  };
  return labels[status] || status;
};

const getShipmentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    SnappBox: 'اسنپ‌باکس',
    Tipax: 'پست تیپاکس (پس‌کرایه)',
    DirectShipment: 'ارسال مستقیم فروشگاه',
    Seller: 'ارسال مستقیم فروشگاه',
    Local: 'تحویل حضوری',
  };
  return labels[method] || method;
};

const buildAddress = (loc: any) => {
  if (!loc) return '';
  const parts: string[] = [];
  if (loc.province) parts.push(loc.province);
  if (loc.city) parts.push(loc.city);
  if (loc.address) parts.push(loc.address);
  if (loc.plaque) parts.push(`پلاک ${toPersianDigits(loc.plaque)}`);
  if (loc.unit) parts.push(`واحد ${toPersianDigits(loc.unit)}`);
  return parts.join('، ');
};

// ─── کامپوننت اصلی ─────────────────────────────
export function OrderDetails({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { data: order, isLoading } = useGetOrderDetails(orderId);
  const retryPayment = useRetryOrderPayment();
  const markReceived = useMarkSubOrderReceived();
  const markNotReceived = useMarkSubOrderNotReceived();

  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [selectedItemForReturn, setSelectedItemForReturn] = React.useState<{
    subOrder: any;
    item: any;
  } | null>(null);

  const computedShipmentPrice = React.useMemo(() => {
    if (!order) return 0;
    if (order.totalShipmentPrice && order.totalShipmentPrice > 0) {
      return order.totalShipmentPrice;
    }
    return (order.subOrders || []).reduce(
      (sum: number, sub: any) => sum + (sub.shipmentPrice || 0),
      0
    );
  }, [order]);

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
      showToast.error(
        error?.userMessage || 'خطا در برقراری ارتباط با درگاه پرداخت'
      );
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
      showToast.success(
        'عدم دریافت سفارش ثبت شد و جهت بررسی به واحد پشتیبانی ارجاع گردید'
      );
    } catch {
      showToast.error('خطا در ثبت عدم دریافت');
    }
  };

  const isWaitingForPayment = order.status === 'WaitingForPayment';
  const canCancelOrder = order.status === 'WaitingForPayment';

  return (
    <div className="flex w-full flex-col gap-5 pb-16" dir="rtl">
      {/* ================= بنر ویژه وضعیت در انتظار پرداخت ================= */}
      {isWaitingForPayment && (
        <div className="flex w-full flex-col gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/[0.08] p-4 text-xs shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-black text-foreground">
                این سفارش در انتظار پرداخت است
              </span>
              <p className="text-2xs text-muted-foreground leading-relaxed sm:text-xs">
                قطعات این فاکتور به مدت <strong>۳۰ دقیقه</strong> از زمان ثبت برای شما رزرو شده‌اند. لطفاً قبل از اتمام زمان، پرداخت را نهایی کنید.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-500/20 pt-3 sm:border-t-0 sm:pt-0 sm:justify-end">
            {order.payableUntil ? (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-card px-3 py-1.5 shadow-2xs">
                <span className="text-3xs font-semibold text-muted-foreground">فرصت باقی‌مانده:</span>
                <PayableTimer payableUntil={order.payableUntil} />
              </div>
            ) : null}

            <Button
              variant="primary"
              size="sm"
              onClick={handleRetryPayment}
              isLoading={retryPayment.isPending}
              className="h-9 px-5 text-xs font-bold shadow-xs active:scale-95"
            >
              <CreditCard className="h-4 w-4 me-1.5" />
              پرداخت آنلاین سفارش
            </Button>
          </div>
        </div>
      )}

      {/* ================= 1. مشخصات سفارش ================= */}
      <Card className="rounded-2xl border border-border/80 bg-card p-4.5 shadow-xs sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">وضعیت سفارش:</span>
            <span
              className={cn(
                'rounded-lg border px-2.5 py-1 text-xs font-bold',
                getStatusColor(order.status)
              )}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">کد پیگیری سفارش:</span>
            <span className="font-bold text-foreground" dir="ltr">
              #{toPersianDigits(order.orderNumber)}
            </span>
          </div>
        </div>

        <div className="mt-3.5 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/30 p-2.5">
            <span className="flex items-center gap-1.5 text-right text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              تاریخ ثبت:
            </span>
            <span className="text-right font-bold text-foreground">
              {new Date(order.createDate).toLocaleDateString('fa-IR')}
            </span>
          </div>

          {order.userLocation?.receiverFullName && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/30 p-2.5">
              <span className="flex items-center gap-1.5 text-right text-muted-foreground">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                تحویل‌گیرنده:
              </span>
              <span className="truncate text-right font-bold text-foreground">
                {order.userLocation.receiverFullName}
              </span>
            </div>
          )}

          {order.userLocation?.receiverMobile && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/30 p-2.5">
              <span className="flex items-center gap-1.5 text-right text-muted-foreground">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                شماره تماس:
              </span>
              <span className="font-bold text-foreground" dir="ltr">
                {toPersianDigits(order.userLocation.receiverMobile)}
              </span>
            </div>
          )}

          {order.userLocation && (
            <div className="flex flex-col gap-1 rounded-xl border border-border/40 bg-muted/30 p-2.5 sm:col-span-2 sm:flex-row sm:items-start sm:gap-2.5 lg:col-span-3">
              <span className="flex shrink-0 items-center gap-1.5 text-right text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                نشانی تحویل:
              </span>
              <span className="text-right font-bold leading-relaxed text-foreground">
                {buildAddress(order.userLocation)}
              </span>
            </div>
          )}
        </div>

        {canCancelOrder && (
          <div className="mt-4 flex items-center justify-end border-t border-border/60 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
              className="h-8 text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              انصراف و لغو این سفارش
            </Button>
          </div>
        )}
      </Card>

      {/* ================= 2. لیست مرسوله‌ها ================= */}
      <div className="flex flex-col gap-4">
        {order.subOrders?.map((subOrder: any) => {
          const canReturn = subOrder.status === 'Delivered';
          const canConfirmReceipt = subOrder.status === 'Sent';

          return (
            <Card
              key={subOrder.id}
              className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs"
            >
              {/* هدر مرسوله */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/20 p-4">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    فروشگاه: {subOrder.shop?.shopTitle}
                  </span>
                  <span
                    className={cn(
                      'rounded-md border px-2 py-0.5 text-3xs font-bold',
                      getStatusColor(subOrder.status)
                    )}
                  >
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
                      className="flex items-center gap-1 font-bold text-primary hover:underline"
                    >
                      <Copy className="h-3 w-3" />
                      کد رهگیری: {toPersianDigits(subOrder.traceNumber)}
                    </button>
                  )}
                </div>
              </div>

              <CardBody className="flex flex-col gap-4 p-4.5">
                {subOrder.subOrderItems?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 border-b border-border/40 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
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

                      <div className="flex min-w-0 flex-col gap-1 text-right">
                        <span className="line-clamp-1 text-right text-xs font-bold text-foreground">
                          {item.shopProduct?.product?.title}
                        </span>
                        <div className="flex items-center gap-3 text-3xs text-muted-foreground">
                          <span>تعداد: {toPersianDigits(item.quantity)} عدد</span>
                          <span>
                            نوع قطعه:{' '}
                            {item.shopProduct?.type === 'New' ? 'نو' : 'کارکرده'}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
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

                    {canReturn && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedItemForReturn({ subOrder, item })}
                        className="h-8 gap-1.5 self-end rounded-lg text-3xs font-bold text-rose-500 hover:bg-rose-500/5 sm:self-center"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        درخواست مرجوعی این کالا
                      </Button>
                    )}
                  </div>
                ))}

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

      {/* ================= 3. خلاصه مالی صورت‌حساب ================= */}
      <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
        <h2 className="mb-3 text-right text-xs font-bold text-foreground">
          خلاصه مالی صورت‌حساب
        </h2>

        <div className="flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-right">مجموع مبلغ کالاها</span>
            <span className="text-left font-bold text-foreground" dir="ltr">
              {formatToman(order.totalOriginalPrice)}
            </span>
          </div>

          {order.totalDiscountValue > 0 && (
            <div className="flex items-center justify-between text-destructive">
              <span className="text-right">تخفیف فروشندگان</span>
              <span className="text-left font-bold" dir="ltr">
                - {formatToman(order.totalDiscountValue)}
              </span>
            </div>
          )}

          {order.totalYadakchiDiscountValue > 0 && (
            <div className="flex items-center justify-between text-destructive">
              <span className="text-right">تخفیف ویژه یدکچی</span>
              <span className="text-left font-bold" dir="ltr">
                - {formatToman(order.totalYadakchiDiscountValue)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-right">هزینه بسته‌بندی و ارسال</span>
            <span className="text-left font-bold text-foreground" dir="ltr">
              {computedShipmentPrice > 0 ? formatToman(computedShipmentPrice) : 'رایگان'}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-border/80 pt-3 text-sm font-black">
            <span className="text-right text-foreground">مبلغ پرداختی نهایی</span>
            <span className="text-left text-base font-black text-primary" dir="ltr">
              {formatToman(order.totalFinalPrice)}
            </span>
          </div>
        </div>
      </Card>

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