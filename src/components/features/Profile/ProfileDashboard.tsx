'use client';

import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  ChevronLeft, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  RotateCcw,
  Car,
  Gauge,
  Wrench,
  Calendar,
  Check,
  Plus
} from 'lucide-react';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { useGetOrders, useGetUserVehicles } from '@/domains/userpanel/hooks/userpanel.hooks';

export function ProfileDashboard() {
  const router = useRouter();
  const { data: ordersData } = useGetOrders('', '', '', 1);
  const { data: vehicles = [], isLoading, isError, error } = useGetUserVehicles();

  console.log('[Dashboard Debug] Vehicles Array:', vehicles);
  console.log('[Dashboard Debug] Loading State:', isLoading);
  
  if (isError) {
    console.error('[Dashboard Debug] React Query Error:', error);
  }

  const orderStatuses = [
    { id: 'WaitingForPayment', label: 'در انتظار پرداخت', count: 2, icon: CreditCard },
    { id: 'InProgress', label: 'جاری', count: 0, icon: Truck },
    { id: 'Delivered', label: 'تحویل شده', count: 0, icon: CheckCircle2 },
    { id: 'ReturnRequest', label: 'مرجوع شده', count: 0, icon: RotateCcw },
  ];

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value);
  };

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      <Card className="w-full border rounded-xl bg-background shadow-sm">
        <CardBody className="p-5 flex flex-col gap-5">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary shrink-0" />
              <span className="text-xs md:text-sm font-bold text-foreground font-iran-yekan">سفارش‌های من</span>
            </div>
            <button 
              onClick={() => router.push('/profile/orders')}
              className="text-xs font-bold font-iran-sans text-primary hover:underline flex items-center gap-0.5 outline-none"
            >
              <span>مشاهده همه</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            {orderStatuses.map((status) => {
              const StatusIcon = status.icon;
              return (
                <div 
                  key={status.id}
                  onClick={() => router.push(`/profile/orders?status=${status.id}`)}
                  className="p-4 border rounded-xl bg-background hover:border-primary/25 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <StatusIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] md:text-xs font-bold text-foreground font-iran-sans">{status.label}</span>
                  <span className="text-[10px] font-bold text-muted-foreground font-iran-sans bg-muted px-2.5 py-0.5 rounded-full mt-1">
                    {status.count} سفارش
                  </span>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <Card className="w-full border rounded-xl bg-background shadow-sm">
        <CardBody className="p-5 flex flex-col gap-5">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              <span className="text-xs md:text-sm font-bold text-foreground font-iran-yekan">گاراژ من</span>
            </div>
            <button 
              onClick={() => router.push('/my-car')}
              className="text-xs font-bold font-iran-sans text-primary hover:underline flex items-center gap-0.5 outline-none"
            >
              <span>مدیریت گاراژ ({formatPrice(vehicles.length)} از ۱۰)</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {vehicles.length > 0 ? (
            <div className="flex flex-col gap-4 w-full">
              {vehicles.map((vehicle: any) => (
                <div key={vehicle.id} className="w-full flex flex-col md:flex-row items-stretch justify-between gap-5 border rounded-xl p-4 bg-background hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors">
                  <div className="flex-1 flex gap-4 items-start min-w-0">
                    <div className="w-16 h-16 shrink-0 rounded-xl border bg-muted/10 flex items-center justify-center overflow-hidden">
                      {vehicle.carCover ? (
                        <img src={getFullUrl(vehicle.carCover)} className="w-full h-full object-contain" alt="" />
                      ) : (
                        <Car className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-right flex flex-col gap-1">
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-xs md:text-sm font-bold text-foreground truncate font-iran-sans">{vehicle.carModel}</span>
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-iran-sans">- {vehicle.title}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-2 text-[10px] md:text-xs text-muted-foreground font-iran-sans">
                        <div className="flex items-center gap-1.5">
                          <Gauge className="h-4 w-4 text-zinc-400" />
                          <span>کارکرد خودرو: {vehicle.mileage}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Wrench className="h-4 w-4 text-zinc-400" />
                          <span>سرویس بعدی: {vehicle.oilKmLimit}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:col-span-2">
                          <Calendar className="h-4 w-4 text-zinc-400" />
                          <span>تاریخ اضافه به گاراژ: {vehicle.lastServiceDateFormatted}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-3 shrink-0 border-t md:border-t-0 border-dashed pt-3 md:pt-0">
                    {vehicle.isDefault && (
                      <span className="text-[9px] font-bold text-success-500 bg-success-50 dark:bg-success-950/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-iran-sans animate-in zoom-in duration-150">
                        <Check className="h-3 w-3" />
                        خودروی پیش فرض
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/my-car')}
                      className="rounded-xl text-[10px] font-bold font-iran-sans h-8 w-full md:w-auto"
                    >
                      بروزرسانی کارکرد
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full py-8 text-center flex flex-col items-center justify-center">
              <p className="text-xs text-muted-foreground font-iran-sans">هیچ خودرویی در گاراژ شما ثبت نشده است.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/my-car/add')}
                className="rounded-xl mt-4 text-xs font-bold font-iran-sans h-10 px-6 py-2 flex items-center justify-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>ثبت اولین خودرو در گاراژ</span>
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

    </div>
  );
}