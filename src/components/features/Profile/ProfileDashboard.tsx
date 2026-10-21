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
  Plus,
} from 'lucide-react';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { useGetOrders, useGetUserVehicles } from '@/domains/userpanel/hooks/userpanel.hooks';
import { getFullUrl } from '@/core/utils/formatters';

const ORDER_STATUSES = [
  { id: 'WaitingForPayment', label: 'در انتظار پرداخت', icon: CreditCard },
  { id: 'InProgress', label: 'جاری', icon: Truck },
  { id: 'Delivered', label: 'تحویل شده', icon: CheckCircle2 },
  { id: 'ReturnRequest', label: 'مرجوع شده', icon: RotateCcw },
] as const;

export function ProfileDashboard() {
  const router = useRouter();
  const { data: ordersData } = useGetOrders('', '', '', 1);
  const { data: vehicles = [] } = useGetUserVehicles();

  const formatPrice = (value: number) => new Intl.NumberFormat('fa-IR').format(value);

  const getStatusCount = (statusId: string): number => {
    const orders = (ordersData as any)?.items || [];
    return orders.filter((o: any) => o.status === statusId).length;
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="w-full">
        <CardBody className="flex flex-col gap-5 p-5">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm font-bold text-foreground">سفارش‌های من</span>
            </div>
            <button
              type="button"
              onClick={() => router.push('/profile/orders')}
              className="flex items-center gap-0.5 text-xs font-bold text-primary outline-none hover:underline"
            >
              <span>مشاهده همه</span>
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>

          <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
            {ORDER_STATUSES.map((status) => {
              const StatusIcon = status.icon;
              const count = getStatusCount(status.id);
              return (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => router.push(`/profile/orders?status=${status.id}`)}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-border bg-card p-4 text-center transition-colors hover:border-primary/40 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <StatusIcon aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground">{status.label}</span>
                  <span className="mt-1 rounded-full bg-muted px-2.5 py-0.5 text-2xs font-bold text-muted-foreground">
                    {count} سفارش
                  </span>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <Card className="w-full">
        <CardBody className="flex flex-col gap-5 p-5">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Car aria-hidden="true" className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-foreground">گاراژ من</span>
            </div>
            <button
              type="button"
              onClick={() => router.push('/my-car')}
              className="flex items-center gap-0.5 text-xs font-bold text-primary outline-none hover:underline"
            >
              <span>مدیریت گاراژ ({formatPrice(vehicles.length)} از ۱۰)</span>
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>

          {vehicles.length > 0 ? (
            <div className="flex w-full flex-col gap-4">
              {vehicles.map((vehicle: any) => (
                <div
                  key={vehicle.id}
                  className="flex w-full flex-col items-stretch justify-between gap-5 rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40 md:flex-row"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                      {vehicle.carCover ? (
                        <img src={getFullUrl(vehicle.carCover)} className="h-full w-full object-contain" alt="" />
                      ) : (
                        <Car aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex w-full items-center gap-2">
                        <span className="truncate text-sm font-bold text-foreground">{vehicle.carModel}</span>
                        <span className="rounded-sm bg-muted px-2 py-0.5 text-2xs font-bold text-muted-foreground">
                          - {vehicle.title}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 text-2xs text-muted-foreground sm:grid-cols-2">
                        <div className="flex items-center gap-1.5">
                          <Gauge aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                          <span>کارکرد خودرو: {vehicle.mileage}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Wrench aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                          <span>سرویس بعدی: {vehicle.oilKmLimit}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:col-span-2">
                          <Calendar aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                          <span>تاریخ اضافه به گاراژ: {vehicle.lastServiceDateFormatted}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-3 border-t border-dashed border-border pt-3 md:border-t-0 md:pt-0 shrink-0">
                    {vehicle.isDefault ? (
                      <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-2xs font-bold text-success">
                        <Check aria-hidden="true" className="h-3 w-3" />
                        خودروی پیش‌فرض
                      </span>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/my-car')}
                      className="h-8 w-full text-2xs font-bold md:w-auto"
                    >
                      بروزرسانی کارکرد
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex w-full flex-col items-center justify-center py-8 text-center">
              <p className="text-xs text-muted-foreground">هیچ خودرویی در گاراژ شما ثبت نشده است.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/my-car/add')}
                className="mt-4 flex h-10 items-center justify-center gap-1 px-6 py-2 text-xs font-bold"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                <span>ثبت اولین خودرو در گاراژ</span>
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
