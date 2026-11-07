'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Tag,
  Info,
  Settings,
  Sparkles,
  ShieldAlert,
  Radio,
  Clock,
  Store,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';
import { useGetUserNotifications } from '@/domains/userpanel/hooks/userpanel.hooks';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Select } from '@/components/primitives/Select/Select';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { LottiePlayer } from '@/components/shared/Lottie/LottiePlayer';
import { toPersianDigits } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';

const PRIORITY_OPTIONS = [
  { value: '', label: 'همه اولویت‌ها' },
  { value: 'Important', label: 'اولویت مهم' },
  { value: 'VeryImportant', label: 'خیلی مهم' },
] as const;

const ORDER_OPTIONS = [
  { value: 'Latest', label: 'جدیدترین‌ها' },
  { value: 'Oldest', label: 'قدیمی‌ترین‌ها' },
] as const;

function getChannelMeta(channel: string) {
  switch (channel) {
    case 'Discount':
      return {
        icon: <Tag className="h-4.5 w-4.5 text-primary" />,
        bg: 'bg-primary/10 border-primary/20',
        badgeLabel: 'تخفیف و پیشنهاد',
      };
    case 'System':
      return {
        icon: <Settings className="h-4.5 w-4.5 text-muted-foreground" />,
        bg: 'bg-muted border-border',
        badgeLabel: 'سیستمی',
      };
    case 'Information':
      return {
        icon: <Info className="h-4.5 w-4.5 text-info" />,
        bg: 'bg-info/10 border-info/20',
        badgeLabel: 'اطلاعیه',
      };
    case 'AdminMessage':
      return {
        icon: <ShieldAlert className="h-4.5 w-4.5 text-destructive" />,
        bg: 'bg-destructive/10 border-destructive/20',
        badgeLabel: 'پیام مدیریت',
      };
    case 'SellerMessage':
      return {
        icon: <Store className="h-4.5 w-4.5 text-warning" />,
        bg: 'bg-warning/10 border-warning/20',
        badgeLabel: 'پیام فروشنده',
      };
    case 'Advertise':
      return {
        icon: <Sparkles className="h-4.5 w-4.5 text-warning" />,
        bg: 'bg-warning/10 border-warning/20',
        badgeLabel: 'ویژه',
      };
    case 'WebBroadcastMessage':
      return {
        icon: <Radio className="h-4.5 w-4.5 text-primary" />,
        bg: 'bg-primary/10 border-primary/20',
        badgeLabel: 'اطلاع‌رسانی عمومی',
      };
    default:
      return {
        icon: <Bell className="h-4.5 w-4.5 text-muted-foreground" />,
        bg: 'bg-muted border-border',
        badgeLabel: 'پیام',
      };
  }
}

export function NotificationsList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'all' | 'discounts'>('all');
  const [priority, setPriority] = React.useState('');
  const [orderBy, setOrderBy] = React.useState<'Latest' | 'Oldest'>('Latest');
  const [page, setPage] = React.useState(1);

  const selectedChannel = activeTab === 'discounts' ? 'Discount' : '';

  const { data: notificationsResponse, isLoading } = useGetUserNotifications(
    page,
    selectedChannel,
    priority,
    undefined,
    orderBy
  );

  const { data: countsResponse } = useGetUserNotifications(1, '', '', undefined, 'Latest');
  const notifications = notificationsResponse?.items || [];
  const totalPages = notificationsResponse?.totalPages || 1;
  const allItems = countsResponse?.items || [];
  const totalCount = allItems.length;
  const discountCount = allItems.filter((n: any) => n.channel === 'Discount').length;

  const handleTabChange = (tab: 'all' | 'discounts') => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5" dir="rtl">
      
      {/* هدر فقط در دسکتاپ نمایش داده می‌شود؛ در موبایل هدر اپلیکیشن بالا فعال است */}
      <div className="hidden lg:flex flex-col gap-1 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">پیام‌ها و اعلان‌ها</h1>
        </div>
        <p className="text-base text-muted-foreground">
          تمام اطلاعیه‌های سفارش‌ها، کدهای تخفیف و پیام‌های سیستمی را در این بخش پیگیری کنید.
        </p>
      </div>

      {/* نوار فیلتر و تب‌ها به سبک بومی اپلیکیشن */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between select-none">
        
        {/* تب‌های کپسولی */}
        <div className="flex items-center gap-1.5 rounded-xl bg-muted/60 p-1">
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
              activeTab === 'all'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>همه پیام‌ها</span>
            <span
              className={cn(
                'rounded-md px-1.5 py-0.2 text-3xs  font-bold',
                activeTab === 'all' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}
            >
              {toPersianDigits(totalCount)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('discounts')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
              activeTab === 'discounts'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>تخفیف‌ها</span>
            <span
              className={cn(
                'rounded-md px-1.5 py-0.2 text-3xs  font-bold',
                activeTab === 'discounts' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}
            >
              {toPersianDigits(discountCount)}
            </span>
          </button>
        </div>

        {/* فیلترهای اولویت و ترتیب (در موبایل هر کدام ۵۰٪ عرض می‌گیرند) */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:w-36">
            <Select
              placeholder="اولویت"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              options={[...PRIORITY_OPTIONS]}
            />
          </div>

          <div className="flex-1 sm:w-36">
            <Select
              placeholder="مرتب‌سازی"
              value={orderBy}
              onChange={(e) => {
                setOrderBy(e.target.value as any);
                setPage(1);
              }}
              options={[...ORDER_OPTIONS]}
            />
          </div>
        </div>
      </div>

      {/* لیست اعلان‌ها */}
      {isLoading ? (
        <PageLoading label="در حال دریافت پیام‌های شما..." />
      ) : notifications.length > 0 ? (
        <div className="flex flex-col gap-3 sm:gap-4">
          {notifications.map((notif: any) => {
            const meta = getChannelMeta(notif.channel);

            return (
              <Card
                key={notif.id}
                className={cn(
                  'relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all shadow-xs',
                  !notif.isRead
                    ? 'border-primary/40 bg-gradient-to-r from-primary/5 via-card to-card'
                    : 'border-border/80 bg-card hover:border-border'
                )}
              >
                {/* نشانگر نقطه نورانی برای پیام‌های خوانده‌نشده */}
                {!notif.isRead && (
                  <span className="absolute top-4 start-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                )}

                <div className="flex items-start gap-3.5">
                  {/* آیکون کانال با پدینگ و فرم زیبا */}
                  <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-2xs', meta.bg)}>
                    {meta.icon}
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                    {/* ردیف تایتل و تگ نوع پیام */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate text-xs sm:text-sm font-bold text-foreground">
                          {notif.title}
                        </span>
                        <span className="hidden sm:inline-block rounded-md bg-muted px-2 py-0.5 text-3xs font-bold text-muted-foreground">
                          {meta.badgeLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-3xs text-muted-foreground font-medium shrink-0">
                        <Clock className="h-3 w-3 text-muted-foreground/80" />
                        <span>{notif.createDateFormatted}</span>
                      </div>
                    </div>

                    {/* متن پیام با فاصله‌گذاری و خوانایی بالا */}
                    <p className="mt-0.5 text-base text-muted-foreground leading-relaxed text-right whitespace-pre-line break-words">
                      {notif.body}
                    </p>

                    {/* دکمه اکشن در صورت وجود لینک اختصاصی */}
                    {notif.linkType && notif.linkText && (
                      <div className="mt-3 flex justify-start">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(notif.linkType as string)}
                          className="h-8 gap-1.5 rounded-xl border-primary/30 px-3.5 text-2xs font-bold text-primary hover:bg-primary/5 active:scale-95 transition-all"
                        >
                          <span>{notif.linkText}</span>
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      ) : (
        /* استیت خالی اعلان‌ها */
        <div className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-card py-16 text-center">
          <LottiePlayer path="/animations/notif-bell.json" className="mx-auto h-40 w-40" />
          <span className="text-label-muted">
            هیچ پیامی در این دسته‌بندی یافت نشد.
          </span>
        </div>
      )}

    </div>
  );
}