'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetOrders } from '@/domains/userpanel/hooks/userpanel.hooks';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { cn } from '@/design-system/utils/cn';
import { ShoppingBag, CreditCard, Truck, CheckCircle2, RotateCcw, XCircle, ChevronLeft, ArrowRight, Hourglass } from 'lucide-react';

interface PayableTimerProps {
  payableUntil: string;
}

function PayableTimer({ payableUntil }: PayableTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const deadline = new Date(payableUntil);
      const diff = deadline.getTime() - now.getTime();

      if (diff > 0) {
        const mins = Math.floor(diff / 1000 / 60);
        const secs = Math.floor((diff / 1000) % 60);
        const formattedMins = new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(mins).padStart(2, '۰');
        const formattedSecs = new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(secs).padStart(2, '۰');
        setTimeLeft(`${formattedMins}:${formattedSecs}`);
      } else {
        setTimeLeft('پایان یافته');
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [payableUntil]);

  return (
    <div className="flex items-center gap-1 text-destructive font-bold font-iran-sans" dir="ltr">
      <span>{timeLeft}</span>
      {timeLeft !== 'پایان یافته' && (
        <Hourglass className="h-3.5 w-3.5 animate-spin shrink-0" style={{ animationDuration: '4s' }} />
      )}
    </div>
  );
}

interface OrdersListProps {
  initialStatus: string;
  initialPage: number;
}

export function OrdersList({ initialStatus, initialPage }: OrdersListProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(initialPage);

  const { data: ordersResponse, isLoading } = useGetOrders(status, '', '', page);
  const orders = ordersResponse?.items || [];
  const totalPages = ordersResponse?.totalPages || 1;

  const handleTabChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
    router.push(`/profile/orders?status=${newStatus}`);
  };

  const statusTabs = [
    { id: '', label: 'همه سفارش‌ها', icon: ShoppingBag, count: 14 },
    { id: 'WaitingForPayment', label: 'در انتظار پرداخت', icon: CreditCard, count: 2 },
    { id: 'InProgress', label: 'سفارش‌های جاری', icon: Truck, count: 0 },
    { id: 'Delivered', label: 'تحویل شده', icon: CheckCircle2, count: 0 },
    { id: 'ReturnRequest', label: 'مرجوعی‌ها', icon: RotateCcw, count: 0 },
    { id: 'Cancelled', label: 'لغو شده', icon: XCircle, count: 12 },
  ];

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full text-right" dir="rtl">
      
      <div className="lg:hidden flex items-center gap-3 border-b pb-3 mb-1 shrink-0">
        <button 
          onClick={() => router.push('/profile')}
          className="p-1 -mr-1 hover:bg-muted rounded-full flex items-center justify-center transition-colors"
          aria-label="Back"
        >
          <ArrowRight className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-sm font-bold font-iran-yekan text-foreground">سفارش‌های من</span>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 w-full shrink-0 select-none px-1">
        {statusTabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = status === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "w-32 h-24 md:w-40 md:h-26 shrink-0 flex flex-col items-center justify-center gap-2 border rounded-2xl bg-background transition-all outline-none shadow-sm px-4",
                isActive 
                  ? "border-primary bg-primary/5 text-primary scale-105 font-bold" 
                  : "border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:border-zinc-300 hover:text-foreground"
              )}
            >
              <TabIcon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className="text-[10px] md:text-xs font-bold font-iran-sans leading-none truncate w-full">{tab.label}</span>
              <span className={cn(
                "text-[9px] md:text-[10px] font-bold font-iran-sans px-2 py-0.5 rounded-full shrink-0 mt-0.5",
                isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {tab.count} سفارش
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <PageLoading message="در حال دریافت تاریخچه سفارشات شما..." />
      ) : orders.length > 0 ? (
        <div className="flex flex-col gap-6 w-full">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {orders.map((order) => (
              <Card key={order.id} className="w-full border rounded-xl p-5 md:p-6 bg-background shadow-sm hover:border-primary/25 transition-all flex flex-col justify-between gap-4">
                
                <div className="flex items-center justify-between border-b border-dashed pb-3 w-full">
                  <span className="text-xs md:text-sm font-black text-foreground font-iran-sans">کد سفارش: {order.orderNumber}</span>
                  <span className={cn(
                    "font-bold text-[10px] md:text-xs",
                    order.status === 'WaitingForPayment' && "text-destructive",
                    order.status === 'Cancelled' && "text-muted-foreground",
                    order.status === 'InProgress' && "text-primary",
                    order.status === 'Delivered' && "text-success-500"
                  )}>
                    {order.statusLabel}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground font-iran-sans gap-4 w-full">
                  <div className="flex flex-col gap-1 text-right">
                    <span>تاریخ ثبت: {order.createDateFormatted}</span>
                    {order.status === 'WaitingForPayment' && (
                      <div className="flex items-center gap-1 mt-1 text-[10px]">
                        <span className="text-muted-foreground">مهلت پرداخت:</span>
                        <PayableTimer payableUntil={order.payableUntil} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[10px] text-muted-foreground">مبلغ سفارش:</span>
                    <span className="font-black text-foreground text-sm mt-1">{order.totalFinalPrice}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full pt-3.5 mt-1 border-t border-dashed">
                  <div className="flex items-center gap-2">
                    {order.shopProductImages.slice(0, 4).map((img, idx) => (
                      <div key={idx} className="w-9 h-9 rounded-lg border overflow-hidden bg-background shrink-0 p-0.5 shadow-sm">
                        <img src={getFullUrl(img)} className="w-full h-full object-contain" alt="" />
                      </div>
                    ))}
                    {order.shopProductImages.length > 4 && (
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                        +{order.shopProductImages.length - 4} کالا
                      </span>
                    )}
                  </div>

                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => router.push(`/profile/orders/${order.id}`)}
                    className="rounded-xl text-[10px] md:text-xs h-9.5 px-5 border-zinc-200 hover:bg-muted text-foreground flex items-center justify-center gap-1 shrink-0"
                  >
                    <span>مشاهده جزئیات</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>

              </Card>
            ))}
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
        <div className="w-full py-16 text-center border border-dashed rounded-xl bg-background flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground font-iran-sans">هیچ سفارشی در این بخش یافت نشد.</p>
        </div>
      )}

    </div>
  );
}