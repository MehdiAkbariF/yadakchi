'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetOrders } from '@/domains/userpanel/hooks/userpanel.hooks';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { cn } from '@/design-system/utils/cn';
import { ShoppingBag, CreditCard, Truck, CheckCircle2, RotateCcw, XCircle, ChevronLeft } from 'lucide-react';

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
    { id: '', label: 'همه', icon: ShoppingBag, count: 14 },
    { id: 'WaitingForPayment', label: 'در انتظار پرداخت', icon: CreditCard, count: 2 },
    { id: 'InProgress', label: 'جاری', icon: Truck, count: 0 },
    { id: 'Delivered', label: 'تحویل شده', icon: CheckCircle2, count: 0 },
    { id: 'ReturnRequest', label: 'مرجوعی', icon: RotateCcw, count: 0 },
    { id: 'Cancelled', label: 'لغو شده', icon: XCircle, count: 12 },
  ];

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      
      <div className="border-b pb-2 flex items-center gap-5 overflow-x-auto no-scrollbar py-1 w-full">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "text-xs md:text-sm font-bold font-iran-sans pb-2 border-b-2 shrink-0 transition-colors outline-none flex items-center gap-1.5",
              status === tab.id ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageLoading message="در حال دریافت تاریخچه سفارشات شما..." />
      ) : orders.length > 0 ? (
        <div className="flex flex-col gap-4 w-full">
          
          <div className="hidden lg:block w-full border rounded-xl overflow-hidden bg-background">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-muted/20 border-b text-xs font-bold text-muted-foreground font-iran-yekan">
                  <th className="p-4">کد سفارش</th>
                  <th className="p-4">کالاها</th>
                  <th className="p-4">تاریخ ثبت</th>
                  <th className="p-4">مبلغ کل</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">مهلت پرداخت</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-b-0 hover:bg-muted/10 transition-colors text-xs font-iran-sans text-foreground font-medium">
                    <td className="p-4 font-bold">{order.orderNumber}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {order.shopProductImages.slice(0, 3).map((img, idx) => (
                          <div key={idx} className="w-9 h-9 rounded-lg border overflow-hidden bg-background shrink-0 flex items-center justify-center p-0.5">
                            <img src={getFullUrl(img)} className="w-full h-full object-contain" alt="" />
                          </div>
                        ))}
                        {order.shopProductImages.length > 3 && (
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-1 rounded-md">+{order.shopProductImages.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">{order.createDateFormatted}</td>
                    <td className="p-4 font-black">{order.totalFinalPrice}</td>
                    <td className="p-4">
                      <span className={cn(
                        "font-bold text-[10px]",
                        order.status === 'WaitingForPayment' && "text-destructive",
                        order.status === 'Cancelled' && "text-muted-foreground",
                        order.status === 'InProgress' && "text-primary",
                        order.status === 'Delivered' && "text-success-500"
                      )}>
                        {order.statusLabel}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {order.status === 'WaitingForPayment' ? '۳۰ دقیقه' : 'پایان یافته'}
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/profile/orders/${order.id}`)}
                        className="rounded-xl text-[10px] h-8 px-3.5 border-zinc-200"
                      >
                        جزئیات
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden flex flex-col gap-3.5 w-full">
            {orders.map((order) => (
              <Card key={order.id} className="w-full border rounded-xl p-4 bg-background flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-dashed pb-2.5 w-full">
                  <span className="text-xs font-black text-foreground font-iran-sans">کد سفارش: {order.orderNumber}</span>
                  <span className={cn(
                    "font-bold text-[10px]",
                    order.status === 'WaitingForPayment' && "text-destructive",
                    order.status === 'Cancelled' && "text-muted-foreground"
                  )}>
                    {order.statusLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground font-iran-sans">
                  <span>تاریخ: {order.createDateFormatted}</span>
                  <span className="font-bold text-foreground">{order.totalFinalPrice}</span>
                </div>
                <div className="flex items-center justify-between w-full pt-1.5 mt-1 border-t border-dashed">
                  <div className="flex items-center gap-1.5">
                    {order.shopProductImages.slice(0, 3).map((img, idx) => (
                      <div key={idx} className="w-8 h-8 rounded-lg border overflow-hidden bg-background shrink-0 p-0.5">
                        <img src={getFullUrl(img)} className="w-full h-full object-contain" alt="" />
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/profile/orders/${order.id}`)}
                    className="rounded-xl text-[10px] h-8.5 px-4"
                  >
                    <span>جزئیات</span>
                    <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
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