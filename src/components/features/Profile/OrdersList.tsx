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
  ArrowRight,
  Clock,
  Package,
  ImageIcon,
} from 'lucide-react';
import { useGetOrders } from '@/domains/userpanel/hooks/userpanel.hooks';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl } from '@/core/utils/formatters';

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
  }, [payableUntil]);

  const expired = timeLeft === 'منقضی شده';

  return (
    <div className={cn('flex items-center gap-1 font-mono text-sm font-bold', expired ? 'text-muted-foreground' : 'text-destructive')} dir="ltr">
      <span>{timeLeft}</span>
      {!expired ? <Clock className="h-4 w-4 animate-spin" style={{ animationDuration: '4s' }} /> : null}
    </div>
  );
}

const STATUS_TABS = [
  { id: '', label: 'همه سفارش‌ها', icon: ShoppingBag },
  { id: 'WaitingForPayment', label: 'در انتظار پرداخت', icon: CreditCard },
  { id: 'InProgress', label: 'در حال پردازش', icon: Truck },
  { id: 'Delivered', label: 'تحویل شده', icon: CheckCircle2 },
  { id: 'ReturnRequest', label: 'مرجوعی', icon: RotateCcw },
  { id: 'Cancelled', label: 'لغو شده', icon: XCircle },
] as const;

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  WaitingForPayment: { label: 'در انتظار پرداخت', color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
  InProgress: { label: 'در حال پردازش و ارسال', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  Delivered: { label: 'تحویل داده شده', color: 'text-success', bg: 'bg-success/10 border-success/20' },
  ReturnRequest: { label: 'درخواست مرجوعی', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  Cancelled: { label: 'لغو شده', color: 'text-muted-foreground', bg: 'bg-secondary border-border/80' },
};

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

  // تابع هوشمند و ضد خطا برای نمایش صحیح قیمت بدون ناعدد
  const renderPrice = (val: any) => {
    if (val === null || val === undefined || val === '') return '۰ تومان';
    
    // اگر از قبل توسط مپر رشته و فرمت‌شده است
    if (typeof val === 'string') {
      if (val.includes('تومان')) return val;
      const num = Number(val);
      if (!isNaN(num)) {
        return new Intl.NumberFormat('fa-IR').format(Math.round(num / 10)) + ' تومان';
      }
      return val + ' تومان';
    }

    // اگر عدد خام ریال است
    if (typeof val === 'number') {
      if (isNaN(val)) return '۰ تومان';
      return new Intl.NumberFormat('fa-IR').format(Math.round(val / 10)) + ' تومان';
    }

    return String(val);
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-5">
      {/* هدر صفحه در حالت موبایل */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3 lg:hidden">
        <button
          type="button"
          onClick={() => router.push('/profile')}
          aria-label="بازگشت"
          className="rounded-lg p-2 transition-colors hover:bg-secondary"
        >
          <ArrowRight aria-hidden="true" className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-base font-bold text-foreground">سفارش‌های من</span>
      </div>

      {/* تب‌های افقی وضعیت */}
      <div className="flex w-full select-none items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = status === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              aria-pressed={isActive}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-fast shadow-2xs',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              <TabIcon className={cn('h-4 w-4', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <PageLoading label="در حال دریافت لیست سفارش‌ها..." />
      ) : orders.length > 0 ? (
        <div className="flex w-full flex-col gap-4">
          <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
       {orders.map((order: any) => {
  // ۱. تعیین وضعیت به صورت داینامیک
  let statusLabel = 'نامشخص';
  let statusColor = 'text-muted-foreground';

  switch (order.status) {
    case 'WaitingForPayment':
      statusLabel = 'در انتظار پرداخت';
      statusColor = 'text-red-500';
      break;
    case 'InProgress':
      statusLabel = 'در حال پردازش';
      statusColor = 'text-blue-500';
      break;
    case 'Delivered':
      statusLabel = 'تحویل شده';
      statusColor = 'text-emerald-500';
      break;
    case 'ReturnRequest':
      statusLabel = 'مرجوعی';
      statusColor = 'text-amber-500';
      break;
    case 'Cancelled':
      statusLabel = 'لغو شده';
      statusColor = 'text-muted-foreground';
      break;
    case 'SystemCancelled':
      statusLabel = 'لغو سیستمی';
      statusColor = 'text-muted-foreground';
      break;
    default:
      statusLabel = order.statusLabel || order.status;
  }

  const isWaiting = order.status === 'WaitingForPayment';

  return (
    <Card
      key={order.id}
      className="flex w-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-xs"
    >
      {/* ردیف بالا: وضعیت + جزئیات */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">وضعیت</span>
          <span className={cn('text-sm font-bold', statusColor)}>
            {statusLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/profile/orders/${order.id}`)}
          className="flex items-center gap-1 text-sm font-bold text-primary hover:opacity-80"
        >
          <span>جزئیات</span>
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* بخش وسط: اطلاعات و عکس‌ها */}
      <div className="flex flex-col sm:grid sm:grid-cols-4 gap-5 sm:gap-4 pt-1 items-center sm:items-end">
        
        {/* ردیف بالای موبایل: ۳ ستون (کد، تاریخ، مبلغ) */}
        <div className="grid grid-cols-3 gap-3 w-full sm:contents">
          {/* کد سفارش */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="text-xs text-muted-foreground">کد سفارش</span>
            <span className="text-sm font-bold text-foreground font-sans">
              {new Intl.NumberFormat('fa-IR').format(order.orderNumber)}
            </span>
          </div>

          {/* تاریخ */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="text-xs text-muted-foreground">تاریخ</span>
            <span className="text-sm font-bold text-foreground">
              {order.createDateFormatted ||
                new Date(order.createDate).toLocaleDateString('fa-IR')}
            </span>
          </div>

          {/* مبلغ */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="text-xs text-muted-foreground">مبلغ</span>
            <span className="text-sm font-bold text-foreground whitespace-nowrap">
              {renderPrice(order.totalFinalPrice)}
            </span>
          </div>
        </div>

        {/* ردیف پایین موبایل / ستون چهارم دسکتاپ: کالاها */}
        <div className="flex flex-col items-center gap-1.5 text-center w-full sm:w-auto mt-3 sm:mt-0">
          <span className="text-xs text-muted-foreground">
            کالاها {order.subOrderItemCount > 0 && `(${new Intl.NumberFormat('fa-IR').format(order.subOrderItemCount)})`}
          </span>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {order.shopProductImages && order.shopProductImages.length > 0 ? (
              order.shopProductImages.slice(0, 4).map((img: string, idx: number) => (
                <div
                  key={idx}
                  className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-card"
                >
                  <img
                    src={getFullUrl(img)}
                    className="h-full w-full object-contain p-1"
                    alt=""
                  />
                </div>
              ))
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/60 bg-secondary/50">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            {order.shopProductImages && order.shopProductImages.length > 4 && (
              <span className="flex h-14 items-center justify-center rounded-xl bg-secondary/60 px-2.5 text-xs font-bold text-muted-foreground">
                +{new Intl.NumberFormat('fa-IR').format(order.shopProductImages.length - 4)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* تایمر پرداخت */}
      {isWaiting && order.payableUntil ? (
        <div className="mt-4 flex items-center justify-end pt-3 border-t border-dashed border-border/60">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">مهلت پرداخت:</span>
            <PayableTimer payableUntil={order.payableUntil} />
          </div>
        </div>
      ) : null}
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
          <ShoppingBag className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-muted-foreground">
            هیچ سفارشی در این دسته‌بندی یافت نشد.
          </p>
        </div>
      )}
    </div>
  );
}