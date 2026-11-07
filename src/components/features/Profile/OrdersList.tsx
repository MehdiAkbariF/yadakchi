'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle2,
  RotateCcw,
  XCircle,
  ChevronLeft,
  Clock,
  ImageIcon,
  Calendar,
  Plus,
} from 'lucide-react';
import { useGetOrders } from '@/domains/userpanel/hooks/userpanel.hooks';
import { useGetCurrentTime } from '@/domains/front/static/hooks/static.hooks';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { LottiePlayer } from '@/components/shared/Lottie/LottiePlayer';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';

/**
 * تبدیل ایمن تاریخ به تایم‌استمپ UTC (جلوگیری از خطای تایم‌زون بدون Z)
 */
function toUtcTimestamp(input?: unknown): number {
  if (!input) return 0;

  if (input instanceof Date) {
    return input.getTime();
  }

  if (typeof input === 'number') {
    return input;
  }

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

  if (typeof input === 'string') {
    const clean = input.trim();
    if (!clean) return 0;

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

interface PayableTimerProps {
  payableUntil: string;
}

// ─── تایمر معکوس دقیق و همگام با ساعت سرور ─────────────────────────────
function PayableTimer({ payableUntil }: PayableTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState<string | null>(null);
  const [isExpired, setIsExpired] = React.useState(false);
  const { data: serverTimeData, isLoading: isServerTimeLoading } = useGetCurrentTime();
  const timeOffsetRef = React.useRef<number>(0);

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
      const currentServerMs = Date.now() + timeOffsetRef.current;
      const diff = targetMs - currentServerMs;

      if (diff > 0) {
        const mins = Math.floor(diff / 1000 / 60);
        const secs = Math.floor((diff / 1000) % 60);
        const formattedMins = String(mins).padStart(2, '0');
        const formattedSecs = String(secs).padStart(2, '0');
        setTimeLeft(`${toPersianDigits(formattedMins)}:${toPersianDigits(formattedSecs)}`);
        setIsExpired(false);
      } else {
        setTimeLeft('منقضی شده');
        setIsExpired(true);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [payableUntil, serverTimeData]);

  if (isServerTimeLoading && !timeLeft) {
    return <span className="text-3xs text-muted-foreground animate-pulse">در حال بررسی...</span>;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-2xs font-bold tracking-wide',
        isExpired ? 'text-destructive' : 'text-warning/80 dark:text-warning/90'
      )}
      dir="ltr"
    >
      <span>{timeLeft || '...'}</span>
      {!isExpired ? (
        <Clock className="h-3 w-3 animate-spin" style={{ animationDuration: '6s' }} />
      ) : null}
    </div>
  );
}

// تابع فرمت امن قیمت
const formatOrderPrice = (val: number) => {
  if (val === null || val === undefined || isNaN(val)) return '۰ تومان';
  return new Intl.NumberFormat('fa-IR').format(val) + ' تومان';
};

const STATUS_TABS = [
  { id: '', label: 'همه سفارش‌ها', icon: ShoppingBag },
  { id: 'WaitingForPayment', label: 'در انتظار پرداخت', icon: CreditCard },
  { id: 'InProgress', label: 'در حال پردازش', icon: Truck },
  { id: 'Delivered', label: 'تحویل شده', icon: CheckCircle2 },
  { id: 'ReturnRequest', label: 'مرجوعی', icon: RotateCcw },
  { id: 'Cancelled', label: 'لغو شده', icon: XCircle },
] as const;

export interface OrdersListProps {
  initialStatus: string;
  initialPage: number;
}

export function OrdersList({ initialStatus, initialPage }: OrdersListProps) {
  const router = useRouter();
  const [status, setStatus] = React.useState(initialStatus);
  const [page, setPage] = React.useState(initialPage);

  const { data: ordersResponse, isLoading } = useGetOrders(status, '', '', page);
  const orders = ordersResponse?.items || [];
  const totalPages = ordersResponse?.totalPages || 1;

  const handleTabChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
    router.push(`/profile/orders?status=${newStatus}`);
  };

  const getOrderStatusMeta = (orderStatus: string) => {
    switch (orderStatus) {
      case 'WaitingForPayment':
        return { label: 'در انتظار پرداخت', color: 'text-warning/90 dark:text-warning/90 bg-warning/10 border-warning/20' };
      case 'InProgress':
        return { label: 'در حال پردازش و ارسال', color: 'text-primary bg-primary/10 border-primary/20' };
      case 'Delivered':
        return { label: 'تحویل داده شده', color: 'text-success bg-success/10 border-success/20' };
      case 'ReturnRequest':
        return { label: 'درخواست مرجوعی', color: 'text-destructive bg-destructive/10 border-destructive/20' };
      case 'Cancelled':
      case 'SystemCancelled':
        return { label: 'لغو شده', color: 'text-muted-foreground bg-muted border-border' };
      default:
        return { label: orderStatus, color: 'text-muted-foreground bg-muted border-border' };
    }
  };

  return (
    <div className="flex w-full flex-col gap-5" dir="rtl">
      
      {/* هدر بخش سفارش‌ها در دسکتاپ */}
      <div className="hidden lg:flex flex-col gap-1 border-b border-border/70 pb-4">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">سفارش‌های من</h1>
        <p className="text-base text-muted-foreground">
          پیگیری وضعیت سفارشات، پرداخت آنلاین فاکتورها و مشاهده تاریخچه مرسولات
        </p>
      </div>

      {/* تب‌های افقی وضعیت سفارش‌ها */}
      <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
        {STATUS_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = status === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-fast',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border/80 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              <TabIcon className={cn('h-4 w-4', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* لیست سفارش‌ها */}
      {isLoading ? (
        <PageLoading label="در حال دریافت لیست سفارش‌ها..." />
      ) : orders.length > 0 ? (
        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col gap-4">
            {orders.map((order: any) => {
              const statusMeta = getOrderStatusMeta(order.status);
              const isWaiting = order.status === 'WaitingForPayment';

              return (
                <Card
                  key={order.id}
                  className="flex w-full flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs transition-colors hover:border-primary/30"
                >
                  {/* ================= هدر استاندارد و بازطراحی‌شده ریسپانسیو ================= */}
                  <div className="flex flex-col gap-2.5 border-b border-border/60 pb-3">
                    
                    {/* ردیف اول: وضعیت + کد سفارش در راست | دکمه مشاهده جزئیات در چپ */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={cn('rounded-lg border px-2.5 py-1 text-2xs font-bold leading-none', statusMeta.color)}>
                          {statusMeta.label}
                        </span>

                        <span className="text-label-2xs sm:text-xs" dir="ltr">
                          #{toPersianDigits(order.orderNumber)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => router.push(`/profile/orders/${order.id}`)}
                        className="flex items-center gap-0.5 text-2xs font-bold text-primary hover:underline sm:text-xs shrink-0 active:scale-95 transition-transform"
                      >
                        <span>مشاهده جزئیات</span>
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* ردیف دوم: تاریخ ثبت در راست | مهلت پرداخت در چپ */}
                    <div className="flex items-center justify-between gap-2 text-2xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span className="text-3xs sm:text-2xs">ثبت شده در:</span>
                        <span className="font-semibold text-foreground">
                          {order.createDateFormatted || new Date(order.createDate).toLocaleDateString('fa-IR')}
                        </span>
                      </div>

                      {isWaiting && order.payableUntil ? (
                        <div className="flex items-center gap-1.5 rounded-lg border border-warning/20 bg-warning/10 px-2 py-0.5">
                          <span className="text-3xs font-bold text-warning/80 dark:text-warning/90">مهلت:</span>
                          <PayableTimer payableUntil={order.payableUntil} />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* بدنه کارت: عکس اقلام در راست و مبلغ نهایی در چپ */}
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      <span className="text-3xs font-bold text-muted-foreground">
                        اقلام سفارش ({toPersianDigits(order.subOrderItemCount || 1)} کالا):
                      </span>

                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {order.shopProductImages && order.shopProductImages.length > 0 ? (
                          order.shopProductImages.map((img: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-card p-1 shadow-2xs"
                            >
                              <img
                                src={getFullUrl(img)}
                                className="h-full w-full object-contain"
                                alt=""
                              />
                            </div>
                          ))
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/60 bg-muted">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1.5 shrink-0 pt-3 sm:pt-0 border-t border-dashed border-border/50 sm:border-0">
                      <span className="text-2xs text-muted-foreground">مبلغ نهایی سفارش:</span>
                      <span className="text-base font-bold text-foreground" dir="ltr">
                        {order.totalFinalPrice}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              setPage(p);
              router.push(`/profile/orders?status=${status}&page=${p}`);
            }}
          />
        </div>
      ) : (
        /* استیت خالی با انیمیشن */
        <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card py-12 text-center shadow-xs">
          <div className="mx-auto flex h-48 w-48 max-w-full items-center justify-center -mb-2">
            <LottiePlayer path="/animations/packaging-for-delivery.json" className="h-full w-full" loop={true} />
          </div>
          <p className="text-title-sm mt-5">
            سفارشی در این بخش وجود ندارد
          </p>
          <p className="mt-1 text-base text-muted-foreground">
            شما هیچ سفارشی با وضعیت «{STATUS_TABS.find(t => t.id === status)?.label}» ندارید.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/search')}
            className="mt-4 h-9 gap-1.5 rounded-xl px-5 text-xs font-bold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>ثبت سفارش جدید</span>
          </Button>
        </div>
      )}
    </div>
  );
}