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
    <div className={cn('flex items-center gap-1 font-mono text-xs font-bold', expired ? 'text-muted-foreground' : 'text-destructive')} dir="ltr">
      <span>{timeLeft}</span>
      {!expired ? <Clock className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} /> : null}
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
        <span className="text-sm font-bold text-foreground">سفارش‌های من</span>
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
                'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all duration-fast shadow-2xs',
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
              const statusCfg = STATUS_MAP[order.status] || {
                label: order.statusLabel || order.status,
                color: 'text-foreground',
                bg: 'bg-secondary',
              };

              return (
                <Card
                  key={order.id}
                  className="flex w-full flex-col justify-between rounded-xl border border-border/70 bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  {/* ردیف اول: شماره سفارش و وضعیت */}
                  <div className="flex w-full items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">شماره سفارش:</span>
                      <span className="font-mono text-xs font-bold text-foreground">{order.orderNumber}</span>
                    </div>

                    <span className={cn('rounded-full border px-3 py-1 text-2xs font-bold', statusCfg.bg, statusCfg.color)}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* ردیف دوم: تاریخ ثبت، مهلت پرداخت و قیمت کل */}
                  <div className="flex w-full items-center justify-between py-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-2xs text-muted-foreground">
                        ثبت: {order.createDateFormatted || new Date(order.createDate).toLocaleDateString('fa-IR')}
                      </span>
                      {order.status === 'WaitingForPayment' && order.payableUntil ? (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-2xs text-muted-foreground">مهلت پرداخت:</span>
                          <PayableTimer payableUntil={order.payableUntil} />
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-2xs text-muted-foreground">مبلغ نهایی:</span>
                      <span className="text-sm font-bold text-primary">
                        {renderPrice(order.totalFinalPrice ?? order.totalFinalPriceRaw)}
                      </span>
                    </div>
                  </div>

                  {/* ردیف سوم: عکس اقلام کالا و دکمه مشاهده جزییات */}
                  <div className="flex w-full items-center justify-between border-t border-dashed border-border/70 pt-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {order.shopProductImages && order.shopProductImages.length > 0 ? (
                        order.shopProductImages.slice(0, 4).map((img: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-card p-1 shadow-2xs"
                          >
                            <img src={getFullUrl(img)} className="h-full w-full object-contain" alt="" />
                          </div>
                        ))
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/60 bg-secondary/50 text-muted-foreground">
                          <Package className="h-5 w-5" />
                        </div>
                      )}

                      {order.shopProductImages && order.shopProductImages.length > 4 ? (
                        <span className="flex h-11 items-center justify-center rounded-lg bg-secondary/60 px-2 text-2xs font-bold text-muted-foreground">
                          +{order.shopProductImages.length - 4}
                        </span>
                      ) : null}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/profile/orders/${order.id}`)}
                      className="flex h-9 items-center gap-1 rounded-lg border-border/80 px-4 text-xs font-bold transition-colors hover:border-primary hover:text-primary"
                    >
                      <span>مشاهده فاکتور</span>
                      <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                    </Button>
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
          <ShoppingBag className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <p className="text-xs font-semibold text-muted-foreground">
            هیچ سفارشی در این دسته‌بندی یافت نشد.
          </p>
        </div>
      )}
    </div>
  );
}