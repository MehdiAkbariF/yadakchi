// src/components/features/Profile/ProfileDashboard.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Wallet,
  Car,
  Headphones,
  Heart,
  MapPin,
  ChevronLeft,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  Gauge,
  Wrench,
  Copy,
  Plus,
  ArrowLeft,
  AlertTriangle,
  MessageSquare,
  Bell,
  Eye,
  Settings,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import {
  useGetOrders,
  useGetUserVehicles,
  useGetWalletBalances,
} from '@/domains/userpanel/hooks/userpanel.hooks';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

const ORDER_STEPS = [
  { id: 'WaitingForPayment', label: 'در انتظار پرداخت', icon: CreditCard, color: 'text-amber-500' },
  { id: 'InProgress', label: 'در حال پردازش', icon: Truck, color: 'text-primary' },
  { id: 'Delivered', label: 'تحویل شده', icon: CheckCircle2, color: 'text-emerald-500' },
  { id: 'ReturnRequest', label: 'مرجوعی', icon: AlertTriangle, color: 'text-rose-500' },
] as const;

export function ProfileDashboard() {
  const router = useRouter();
  const { user, logout, isLoggingOut } = useAuth();

  const { data: ordersData } = useGetOrders('', '', '', 1);
  const { data: vehicles = [] } = useGetUserVehicles();
  const { data: wallet } = useGetWalletBalances();

  const orders = (ordersData as any)?.items || [];

  const pendingActionOrder = orders.find(
    (o: any) => o.status === 'WaitingForPayment' || o.status === 'InProgress'
  );

  const getStatusCount = (statusId: string): number => {
    return orders.filter((o: any) => o.status === statusId).length;
  };

  const handleCopyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      showToast.success('کد معرف شما با موفقیت کپی شد');
    }
  };

  const defaultVehicle = vehicles.find((v: any) => v.isDefault) || vehicles[0];

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-accent/40 p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-black text-primary-foreground shadow-sm shadow-primary/20">
              {user?.fullName ? user.fullName[0] : 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-3xs font-bold uppercase tracking-wider text-primary">
                داشبورد حساب کاربری
              </span>
              <h1 className="mt-0.5 text-base font-black text-foreground sm:text-lg">
                سلام، {user?.fullName || 'کاربر گرامی'} 👋
              </h1>
              <span className="mt-0.5 text-xs text-muted-foreground" dir="ltr">
                {user?.phoneNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/90 p-3 shadow-2xs sm:justify-end">
            <div className="flex flex-col text-right">
              <span className="text-3xs text-muted-foreground">موجودی کیف پول</span>
              <span className="text-sm font-black text-foreground">
                {wallet?.totalBalance || '۰ تومان'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/profile/wallet')}
              className="h-8 rounded-lg px-3 text-2xs font-bold text-primary hover:bg-primary/5"
            >
              مدیریت کیف پول
              <ArrowLeft className="h-3.5 w-3.5 ms-1" />
            </Button>
          </div>
        </div>

        {user?.referralCode && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3 text-2xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>کد معرف شما:</span>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 font-bold text-foreground hover:bg-accent hover:text-primary transition-colors"
              >
                <span>{user.referralCode}</span>
                <Copy className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
            <p className="hidden text-3xs text-muted-foreground/80 md:block">
              با معرفی یدکچی به دوستان، ۱۰۰,۰۰۰ تومان اعتبار هدیه بگیرید.
            </p>
          </div>
        )}
      </div>

      {pendingActionOrder && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-2xs transition-all">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {pendingActionOrder.status === 'WaitingForPayment' ? (
                <Clock className="h-5 w-5 animate-pulse" />
              ) : (
                <Truck className="h-5 w-5" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">
                {pendingActionOrder.status === 'WaitingForPayment'
                  ? 'سفارش در انتظار پرداخت شما'
                  : 'سفارش جاری شما در مرحله پردازش و ارسال است'}
              </span>
              <span className="text-2xs text-muted-foreground">
                کد سفارش: {pendingActionOrder.orderNumber} | مبلغ:{' '}
                {pendingActionOrder.totalFinalPrice}
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => router.push(`/profile/orders/${pendingActionOrder.id}`)}
            className="h-8 shrink-0 rounded-lg px-3.5 text-2xs font-bold shadow-xs"
          >
            مشاهده سفارش
            <ChevronLeft className="h-3.5 w-3.5 ms-0.5" />
          </Button>
        </div>
      )}

      <Card className="rounded-2xl border border-border/80 bg-card p-4.5 shadow-xs">
        <div className="flex items-center justify-between pb-3.5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4.5 w-4.5 text-primary" />
            <h2 className="text-xs font-bold text-foreground">وضعیت سفارش‌های من</h2>
          </div>
          <Link
            href="/profile/orders"
            className="flex items-center gap-0.5 text-2xs font-bold text-primary hover:underline"
          >
            <span>مشاهده همه ({toPersianDigits(orders.length)})</span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
          {ORDER_STEPS.map((step) => {
            const Icon = step.icon;
            const count = getStatusCount(step.id);

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => router.push(`/profile/orders?status=${step.id}`)}
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border/70 bg-card/60 p-3.5 text-center transition-all duration-fast hover:border-primary/40 hover:bg-accent/40 active:scale-[0.98]"
              >
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 transition-colors group-hover:bg-primary/10", step.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-2xs font-bold text-foreground">{step.label}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-3xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                  {toPersianDigits(count)} سفارش
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="rounded-2xl border border-border/80 bg-card p-4.5 shadow-xs">
        <div className="flex items-center justify-between pb-3.5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Car className="h-4.5 w-4.5 text-primary" />
            <h2 className="text-xs font-bold text-foreground">گاراژ من (خودروهای ثبت شده)</h2>
          </div>
          <Link
            href="/my-car"
            className="flex items-center gap-0.5 text-2xs font-bold text-primary hover:underline"
          >
            <span>مدیریت گاراژ ({toPersianDigits(vehicles.length)} از ۱۰)</span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        {defaultVehicle ? (
          <div className="mt-4 flex flex-col gap-4 rounded-xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-card p-1">
                {defaultVehicle.carCover ? (
                  <img
                    src={getFullUrl(defaultVehicle.carCover)}
                    alt={defaultVehicle.carModel}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Car className="h-8 w-8 text-muted-foreground/60" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-foreground">
                    {defaultVehicle.carModel}
                  </span>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-3xs font-bold text-primary">
                    خودروی پیش‌فرض
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-2xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                    کارکرد: {toPersianDigits(defaultVehicle.mileage || '۰')} کیلومتر
                  </span>
                  <span className="flex items-center gap-1">
                    <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                    سرویس دوره‌ای: {toPersianDigits(defaultVehicle.oilKmLimit || '۰')}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/my-car')}
              className="h-8 shrink-0 rounded-lg text-2xs font-bold"
            >
              بروزرسانی کارکرد
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center justify-center gap-2 py-6 text-center">
            <Car className="h-8 w-8 text-muted-foreground/40" />
            <span className="text-xs font-semibold text-muted-foreground">
              هنوز خودرویی به گاراژ خود اضافه نکرده‌اید.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/my-car/add')}
              className="mt-2 h-8 gap-1.5 rounded-lg text-2xs font-bold text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              افزودن خودرو به گاراژ
            </Button>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link
          href="/profile/addresses"
          className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 shadow-2xs transition-all hover:border-primary/40 hover:bg-accent/40 active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-foreground">آدرس‌های من</span>
            <span className="text-3xs text-muted-foreground mt-0.5">ثبت و تحویل</span>
          </div>
        </Link>

        <Link
          href="/profile/favorites"
          className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 shadow-2xs transition-all hover:border-primary/40 hover:bg-accent/40 active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
            <Heart className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-foreground">کالاهای محبوب</span>
            <span className="text-3xs text-muted-foreground mt-0.5">علاقه‌مندی‌ها</span>
          </div>
        </Link>

        <Link
          href="/profile/support"
          className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 shadow-2xs transition-all hover:border-primary/40 hover:bg-accent/40 active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Headphones className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-foreground">پشتیبانی آنلاین</span>
            <span className="text-3xs text-muted-foreground mt-0.5">تیکت‌ها</span>
          </div>
        </Link>

        <Link
          href="/profile/wallet"
          className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 shadow-2xs transition-all hover:border-primary/40 hover:bg-accent/40 active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-foreground">تسویه و برداشت</span>
            <span className="text-3xs text-muted-foreground mt-0.5">شماره شبا و کارت</span>
          </div>
        </Link>
      </div>

      <div className="flex flex-col gap-3 lg:hidden mt-2">
        <span className="text-2xs font-bold text-muted-foreground px-1">سایر بخش‌های حساب کاربری</span>
        
        <div className="flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60 shadow-2xs">
          <Link href="/profile/orders" className="flex items-center justify-between p-3.5 text-xs font-bold text-foreground hover:bg-muted/40">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-4.5 w-4.5 text-primary" />
              <span>تمام سفارش‌های من</span>
            </div>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link href="/profile/returns" className="flex items-center justify-between p-3.5 text-xs font-bold text-foreground hover:bg-muted/40">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-4.5 w-4.5 text-rose-500" />
              <span>درخواست‌های مرجوعی</span>
            </div>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link href="/profile/wallet" className="flex items-center justify-between p-3.5 text-xs font-bold text-foreground hover:bg-muted/40">
            <div className="flex items-center gap-3">
              <Wallet className="h-4.5 w-4.5 text-emerald-500" />
              <span>کیف پول و حساب‌های تسویه</span>
            </div>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link href="/profile/addresses" className="flex items-center justify-between p-3.5 text-xs font-bold text-foreground hover:bg-muted/40">
            <div className="flex items-center gap-3">
              <MapPin className="h-4.5 w-4.5 text-blue-500" />
              <span>آدرس‌های تحویل سفارش</span>
            </div>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link href="/profile/comments" className="flex items-center justify-between p-3.5 text-xs font-bold text-foreground hover:bg-muted/40">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4.5 w-4.5 text-amber-500" />
              <span>دیدگاه‌ها و پرسش‌های من</span>
            </div>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link href="/profile/notifications" className="flex items-center justify-between p-3.5 text-xs font-bold text-foreground hover:bg-muted/40">
            <div className="flex items-center gap-3">
              <Bell className="h-4.5 w-4.5 text-purple-500" />
              <span>پیام‌ها و اعلان‌ها</span>
            </div>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link href="/profile/history" className="flex items-center justify-between p-3.5 text-xs font-bold text-foreground hover:bg-muted/40">
            <div className="flex items-center gap-3">
              <Eye className="h-4.5 w-4.5 text-teal-500" />
              <span>کالاهای دیده شده اخیر</span>
            </div>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link href="/profile/support" className="flex items-center justify-between p-3.5 text-xs font-bold text-foreground hover:bg-muted/40">
            <div className="flex items-center gap-3">
              <Headphones className="h-4.5 w-4.5 text-sky-500" />
              <span>تیکت‌های پشتیبانی</span>
            </div>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link href="/profile/settings" className="flex items-center justify-between p-3.5 text-xs font-bold text-foreground hover:bg-muted/40">
            <div className="flex items-center gap-3">
              <Settings className="h-4.5 w-4.5 text-muted-foreground" />
              <span>اطلاعات حساب و حقوقی</span>
            </div>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Link>

          <button
            type="button"
            onClick={() => logout(undefined)}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-between p-3.5 text-xs font-bold text-destructive hover:bg-destructive/5 active:bg-destructive/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-4.5 w-4.5 text-destructive" />
              <span>خروج از حساب کاربری</span>
            </div>
            <ChevronLeft className="h-4 w-4 text-destructive/60" />
          </button>
        </div>
      </div>
    </div>
  );
}