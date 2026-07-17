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
  Copy,
  Share2
} from 'lucide-react';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { useGetOrders, useGetUserVehicles, useGetWalletBalances } from '@/domains/userpanel/hooks/userpanel.hooks';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { showToast } from '@/core/utils/toast';

export function ProfileDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: wallet } = useGetWalletBalances();
  const { data: ordersData } = useGetOrders('', '', '', 1);
  const { data: vehicles = [] } = useGetUserVehicles();

  const totalCount = ordersData?.totalCount || 0;
  const defaultVehicle = vehicles.find(v => v.isDefault) || vehicles[0] || null;

  const orderStatuses = [
    { id: 'WaitingForPayment', label: 'در انتظار پرداخت', count: 2, icon: CreditCard },
    { id: 'InProgress', label: 'جاری', count: 0, icon: Truck },
    { id: 'Delivered', label: 'تحویل شده', count: 0, icon: CheckCircle2 },
    { id: 'ReturnRequest', label: 'مرجوع شده', count: 0, icon: RotateCcw },
  ];

  const handleCopyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      showToast.success('کد معرف شما با موفقیت کپی شد');
    }
  };

  const handleShareReferral = () => {
    if (user?.referralCode && typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'کد معرف یدک‌چی',
        text: `با ثبت کد معرف من در خرید اول خود تخفیف بگیرید. کد معرف: ${user.referralCode}`,
        url: window.location.origin
      }).catch(() => {});
    } else {
      handleCopyReferral();
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      
      <div className="hidden lg:grid grid-cols-2 gap-4 w-full">
        <Card className="w-full border rounded-xl p-4 bg-background flex items-center justify-between gap-4">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-muted-foreground font-iran-sans mb-1">موجودی کیف پول:</span>
            <span className="text-base font-black text-foreground font-iran-sans">{wallet?.totalBalance || '۰ تومان'}</span>
          </div>
          <button
            onClick={() => router.push('/profile/wallet?action=withdraw')}
            className="text-[10px] font-bold font-iran-sans text-primary border-b border-primary pb-0.5 hover:text-primary/80 transition-colors outline-none"
          >
            برداشت موجودی
          </button>
        </Card>

        {user?.referralCode && (
          <Card className="w-full border rounded-xl p-4 bg-background flex flex-col gap-3">
            <div className="flex items-center justify-between w-full border-b border-dashed pb-2">
              <span className="text-[10px] font-bold text-muted-foreground font-iran-sans">کد معرف شما:</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-foreground font-iran-sans tracking-widest">{user.referralCode}</span>
                <button onClick={handleCopyReferral} className="text-primary hover:scale-105 transition-transform outline-none" aria-label="Copy">
                  <Copy className="h-4 w-4" />
                </button>
                <button onClick={handleShareReferral} className="text-primary hover:scale-105 transition-transform outline-none" aria-label="Share">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-[9px] leading-relaxed text-muted-foreground font-iran-sans text-justify">
              با اشتراک‌گذاری این کد، هم دوستت برای خرید اولش ۱۰۰,۰۰۰ تومان تخفیف می‌گیره و هم خودت ۱۰۰,۰۰۰ تومان اعتبار خرید دریافت می‌کنی.
            </p>
          </Card>
        )}
      </div>

      <Card className="w-full border rounded-xl bg-background shadow-sm">
        <CardBody className="p-5 flex flex-col gap-5">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4.5 w-4.5 text-primary shrink-0" />
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
              <Car className="h-4.5 w-4.5 text-primary" />
              <span className="text-xs md:text-sm font-bold text-foreground font-iran-yekan">گاراژ من</span>
            </div>
            <button 
              onClick={() => router.push('/profile/garage')}
              className="text-xs font-bold font-iran-sans text-primary hover:underline flex items-center gap-0.5 outline-none"
            >
              <span>مشاهده گاراژ ({formatPrice(vehicles.length)} از ۱۰)</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {defaultVehicle ? (
            <div className="w-full flex flex-col md:flex-row items-stretch justify-between gap-5 border rounded-xl p-4 bg-background">
              <div className="flex-1 flex gap-4 items-start min-w-0">
                <div className="w-16 h-16 shrink-0 rounded-xl border bg-muted/10 flex items-center justify-center overflow-hidden">
                  {defaultVehicle.carCover ? (
                    <img src={getFullUrl(defaultVehicle.carCover)} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Car className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-right flex flex-col gap-1">
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xs md:text-sm font-bold text-foreground truncate font-iran-sans">{defaultVehicle.title}</span>
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-iran-sans">{defaultVehicle.carModel}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-2 text-[10px] md:text-xs text-muted-foreground font-iran-sans">
                    <div className="flex items-center gap-1">
                      <Gauge className="h-3.5 w-3.5 text-zinc-400" />
                      <span>کارکرد خودرو: {defaultVehicle.mileage}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wrench className="h-3.5 w-3.5 text-zinc-400" />
                      <span>سرویس بعدی: {defaultVehicle.oilKmLimit}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:col-span-2">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      <span>تاریخ اضافه به گاراژ: {defaultVehicle.lastServiceDateFormatted}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between gap-3 shrink-0 border-t md:border-t-0 border-dashed pt-3 md:pt-0">
                <span className="text-[9px] font-bold text-success-500 bg-success-50 dark:bg-success-950/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-iran-sans">
                  <Check className="h-3 w-3" />
                  خودروی پیش فرض
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-[10px] font-bold font-iran-sans h-8"
                >
                  به‌روزرسانی کارکرد
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full py-8 text-center flex flex-col items-center justify-center">
              <p className="text-xs text-muted-foreground font-iran-sans">هیچ خودرویی در گاراژ شما ثبت نشده است.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/profile/garage/add')}
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

const getFullUrl = (path: string | null) => {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};