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
} from 'lucide-react';
import { useGetOrders } from '@/domains/userpanel/hooks/userpanel.hooks';
import { Card } from '@/components/composites/Card';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';

interface PayableTimerProps {
  payableUntil: string;
}

function PayableTimer({ payableUntil }: PayableTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState('');

  React.useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(payableUntil).getTime() - Date.now();
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
  }, [payableUntil]);

  const expired = timeLeft === 'منقضی شده';

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs font-bold',
        expired ? 'text-muted-foreground' : 'text-destructive'
      )}
      dir="ltr"
    >
      <span>{timeLeft}</span>
      {!expired ? <Clock className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} /> : null}
    </div>
  );
}

// تابع امن و دقیق فرمت قیمت بدون تقسیم اضافی
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
        return { label: 'در انتظار پرداخت', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      case 'InProgress':
        return { label: 'در حال پردازش و ارسال', color: 'text-primary bg-primary/10 border-primary/20' };
      case 'Delivered':
        return { label: 'تحویل داده شده', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
      case 'ReturnRequest':
        return { label: 'درخواست مرجوعی', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
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
        <h1 className="text-base font-black text-foreground sm:text-lg">سفارش‌های من</h1>
        <p className="text-xs text-muted-foreground">
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
                  className="flex w-full flex-col justify-between rounded-2xl border border-border/80 bg-card p-4.5 sm:p-5 shadow-xs transition-colors hover:border-primary/30"
                >
                  {/* ردیف بالا: وضعیت، کد رهگیری، تاریخ و دکمه جزئیات */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={cn('rounded-lg border px-2.5 py-1 text-2xs font-bold', statusMeta.color)}>
                        {statusMeta.label}
                      </span>
                      
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>کد سفارش:</span>
                        <strong className="text-foreground" dir="ltr">
                          #{toPersianDigits(order.orderNumber)}
                        </strong>
                      </div>

                      <span className="hidden sm:inline-block text-border">|</span>

                      <span className="hidden sm:inline-flex items-center gap-1.5 text-2xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>ثبت:</span>
                        <span className="text-foreground font-medium">
                          {order.createDateFormatted || new Date(order.createDate).toLocaleDateString('fa-IR')}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {isWaiting && order.payableUntil && (
                        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-1">
                          <span className="text-3xs font-bold text-destructive">مهلت پرداخت:</span>
                          <PayableTimer payableUntil={order.payableUntil} />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => router.push(`/profile/orders/${order.id}`)}
                        className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        <span>مشاهده فاکتور و جزئیات</span>
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* بدنه تمام‌عرض: عکس اقلام در راست و مبلغ نهایی در چپ */}
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
                      <span className="text-base font-black text-foreground" dir="ltr">
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
        <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card py-16 text-center shadow-xs">
          <ShoppingBag className="mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="text-xs font-bold text-muted-foreground">
            هیچ سفارشی در این دسته‌بندی یافت نشد.
          </p>
        </div>
      )}
    </div>
  );
}