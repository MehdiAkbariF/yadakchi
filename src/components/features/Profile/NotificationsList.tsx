// src/components/features/Profile/NotificationsList.tsx
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
  Filter,
  CheckCircle2,
  Calendar,
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

const TIME_OPTIONS = [
  { value: '', label: 'همه زمان‌ها' },
  { value: 'Today', label: 'امروز' },
  { value: 'OneWeek', label: 'یک هفته اخیر' },
  { value: 'OneMonth', label: 'یک ماه اخیر' },
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
  const [activeTab, setActiveTab] = React.useState<'all' | 'unread' | 'discounts' | 'system'>('all');
  const [priority, setPriority] = React.useState('');
  const [timePeriod, setTimePeriod] = React.useState('');
  const [orderBy, setOrderBy] = React.useState<'Latest' | 'Oldest'>('Latest');
  const [page, setPage] = React.useState(1);

  // محاسبه پارامترهای تمیز و بدون باگ
  const queryFilters = React.useMemo(() => {
    return {
      pageNumber: page,
      pageSize: 10,
      channel: activeTab === 'discounts' ? 'Discount' : activeTab === 'system' ? 'System' : undefined,
      isRead: activeTab === 'unread' ? false : undefined, // مقدار بولین واقعی
      priority: priority || undefined,
      timePeriod: timePeriod || undefined,
      orderBy: orderBy,
    };
  }, [page, activeTab, priority, timePeriod, orderBy]);

  const { data: notificationsResponse, isLoading } = useGetUserNotifications(queryFilters);

  // واکشی کل اعلان‌ها جهت محاسبه تعداد در تب‌ها
  const { data: allNotifsResponse } = useGetUserNotifications({ pageNumber: 1, pageSize: 50 });
  const notifications = notificationsResponse?.items || [];
  const totalPages = notificationsResponse?.totalPages || 1;

  const allItems = allNotifsResponse?.items || [];
  const totalCount = allItems.length;
  const unreadCount = allItems.filter((n: any) => !n.isRead).length;
  const discountCount = allItems.filter((n: any) => n.channel === 'Discount').length;

  const handleTabChange = (tab: 'all' | 'unread' | 'discounts' | 'system') => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5" dir="rtl">
      
      {/* هدر دسکتاپ */}
      <div className="hidden lg:flex flex-col gap-1 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">پیام‌ها و اعلان‌ها</h1>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground">
          اطلاعیه‌های وضعیت سفارش، کدهای تخفیف، و پیام‌های اختصاصی شما.
        </p>
      </div>

      {/* نوار تب‌ها و فیلترها (کاملاً واکنش‌گرا و موبایل‌فرست) */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-xs select-none">
        
        {/* تب‌های افقی قابل اسکرول در موبایل */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
              activeTab === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <span>همه پیام‌ها</span>
            <span className={cn('rounded-md px-1.5 py-0.2 text-3xs font-bold', activeTab === 'all' ? 'bg-primary-foreground/20 text-white' : 'bg-card text-foreground')}>
              {toPersianDigits(totalCount)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('unread')}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
              activeTab === 'unread'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <span>خوانده‌نشده</span>
            {unreadCount > 0 && (
              <span className={cn('rounded-md px-1.5 py-0.2 text-3xs font-bold', activeTab === 'unread' ? 'bg-primary-foreground/20 text-white' : 'bg-destructive/15 text-destructive')}>
                {toPersianDigits(unreadCount)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('discounts')}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
              activeTab === 'discounts'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>تخفیف‌ها</span>
            {discountCount > 0 && (
              <span className={cn('rounded-md px-1.5 py-0.2 text-3xs font-bold', activeTab === 'discounts' ? 'bg-primary-foreground/20 text-white' : 'bg-card text-foreground')}>
                {toPersianDigits(discountCount)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('system')}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
              activeTab === 'system'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>سیستمی</span>
          </button>
        </div>

        {/* فیلترهای تکمیلی طبق پارامترهای سواگر */}
        <div className="grid grid-cols-3 gap-2 border-t border-dashed border-border/60 pt-2.5">
          <Select
            placeholder="اولویت"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            options={[...PRIORITY_OPTIONS]}
          />

          <Select
            placeholder="بازه زمانی"
            value={timePeriod}
            onChange={(e) => {
              setTimePeriod(e.target.value);
              setPage(1);
            }}
            options={[...TIME_OPTIONS]}
          />

          <Select
            placeholder="ترتیب"
            value={orderBy}
            onChange={(e) => {
              setOrderBy(e.target.value as any);
              setPage(1);
            }}
            options={[...ORDER_OPTIONS]}
          />
        </div>
      </div>

      {/* نمایش لیست پیام‌ها */}
      {isLoading ? (
        <PageLoading label="در حال دریافت پیام‌ها..." />
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
                {/* نقطه نشانگر خوانده‌نشده */}
                {!notif.isRead && (
                  <span className="absolute top-4 start-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                )}

                <div className="flex items-start gap-3.5">
                  <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-2xs', meta.bg)}>
                    {meta.icon}
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5 min-w-0">
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

                    <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground leading-relaxed text-right whitespace-pre-line break-words">
                      {notif.body}
                    </p>

                    {notif.linkType && notif.linkText && (
                      <div className="mt-2 flex justify-start">
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
        <div className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-card py-16 text-center shadow-xs">
          <LottiePlayer path="/animations/notif-bell.json" className="mx-auto h-40 w-40" />
          <span className="text-xs font-semibold text-muted-foreground">
            هیچ پیامی با این مشخصات یافت نشد.
          </span>
        </div>
      )}
    </div>
  );
}