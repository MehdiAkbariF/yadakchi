'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetUserNotifications } from '@/domains/userpanel/hooks/userpanel.hooks';
import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Select } from '@/components/primitives/Select/Select';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { 
  Bell, 
  ArrowRight, 
  Tag, 
  Info, 
  Settings, 
  Sparkles, 
  ShieldAlert, 
  Radio, 
  Clock, 
  MailWarning, 
  Store 
} from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export function NotificationsList() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'all' | 'discounts'>('all');
  const [priority, setPriority] = useState('');
  const [orderBy, setOrderBy] = useState<'Latest' | 'Oldest'>('Latest');
  const [page, setPage] = useState(1);

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
  const discountCount = allItems.filter(n => n.channel === 'Discount').length;

  const handleTabChange = (tab: 'all' | 'discounts') => {
    setActiveTab(tab);
    setPage(1);
  };

  const priorityOptions = [
    { value: '', label: 'همه پیام‌ها' },
    { value: 'Important', label: 'مهم' },
    { value: 'VeryImportant', label: 'خیلی مهم' }
  ];

  const orderOptions = [
    { value: 'Latest', label: 'جدیدترین‌ها' },
    { value: 'Oldest', label: 'قدیمی‌ترین‌ها' }
  ];

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Discount':
        return <Tag className="h-5 w-5 text-primary" />;
      case 'System':
        return <Settings className="h-5 w-5 text-zinc-500" />;
      case 'Information':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'AdminMessage':
        return <ShieldAlert className="h-5 w-5 text-destructive" />;
      case 'SellerMessage':
        return <Store className="h-5 w-5 text-orange-500" />;
      case 'Advertise':
        return <Sparkles className="h-5 w-5 text-yellow-500" />;
      case 'WebBroadcastMessage':
        return <Radio className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-zinc-500" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full text-right" dir="rtl">
      
      <div className="lg:hidden flex items-center justify-between border-b pb-3 mb-1 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/profile')}
            className="p-1 -mr-1 hover:bg-muted rounded-full flex items-center justify-center transition-colors"
            aria-label="Back"
          >
            <ArrowRight className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-sm font-bold font-iran-yekan text-foreground">پیام‌ها و اطلاعیه‌ها</span>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2 border-b pb-5">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary shrink-0" />
          <span className="text-lg md:text-xl font-black text-foreground font-iran-yekan">پیام‌ها و اطلاعیه‌ها</span>
        </div>
        <p className="text-xs text-muted-foreground font-iran-yekan">
          آخرین اطلاعیه‌ها، کدهای تخفیف، اخبار و پیام‌های سیستمی حساب کاربری شما
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none mt-2 border-b">
        <div className="flex items-center gap-5 pb-px w-full sm:w-auto shrink-0">
          <button
            onClick={() => handleTabChange('all')}
            className={cn(
              "text-xs md:text-sm font-bold font-iran-yekan pb-2 border-b-2 transition-all outline-none flex items-center gap-1.5",
              activeTab === 'all' ? "text-primary border-primary" : "text-muted-foreground border-transparent"
            )}
          >
            <span>همه پیام‌ها</span>
            <span className={cn(
              "text-[9px] md:text-[10px] font-bold font-iran-yekan px-2 py-0.5 rounded-full shrink-0",
              activeTab === 'all' ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('discounts')}
            className={cn(
              "text-xs md:text-sm font-bold font-iran-yekan pb-2 border-b-2 transition-all outline-none flex items-center gap-1.5",
              activeTab === 'discounts' ? "text-primary border-primary" : "text-muted-foreground border-transparent"
            )}
          >
            <span>تخفیف‌ها</span>
            <span className={cn(
              "text-[9px] md:text-[10px] font-bold font-iran-yekan px-2 py-0.5 rounded-full shrink-0",
              activeTab === 'discounts' ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {discountCount}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 pb-3 sm:pb-2.5 w-full sm:w-auto justify-start sm:justify-end">
          <div className="w-28 sm:w-36 shrink-0">
            <Select
              placeholder="اهمیت پیام"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              options={priorityOptions}
            />
          </div>

          <div className="w-28 sm:w-36 shrink-0">
            <Select
              placeholder="مرتب‌سازی"
              value={orderBy}
              onChange={(e) => {
                setOrderBy(e.target.value as any);
                setPage(1);
              }}
              options={orderOptions}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <PageLoading message="در حال دریافت پیام‌های شما..." />
      ) : notifications.length > 0 ? (
        <div className="flex flex-col gap-5 w-full animate-in fade-in duration-200">
          <div className="flex flex-col gap-4 w-full">
            {notifications.map((notif) => (
              <Card key={notif.id} className={cn(
                "w-full border rounded-2xl bg-card shadow-sm hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors p-4 md:p-5 relative",
                !notif.isRead && "border-primary/20 bg-primary/5"
              )}>
                <CardBody className="p-0 flex items-start gap-4 text-right">
                  <div className="w-10 h-10 shrink-0 rounded-full border bg-background flex items-center justify-center shadow-sm relative">
                    {getChannelIcon(notif.channel)}
                    {!notif.isRead && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-primary rounded-full ring-2 ring-background animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-4 w-full">
                      <span className="text-xs md:text-sm font-black text-foreground block truncate">{notif.title}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground shrink-0 font-iran-yekan">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{notif.createDateFormatted}</span>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-iran-yekan whitespace-pre-wrap break-words">{notif.body}</p>

                    {notif.linkType && notif.linkText && (
                      <div className="flex justify-start mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(notif.linkType as string)}
                          className="rounded-xl text-[10px] font-bold font-iran-yekan h-8 px-4"
                        >
                          {notif.linkText}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      ) : (
        <div className="w-full py-16 text-center border border-dashed rounded-2xl bg-card flex flex-col items-center justify-center gap-2">
          <MailWarning className="h-10 w-10 text-muted-foreground/60 stroke-[1.5]" />
          <span className="text-xs font-bold font-iran-yekan text-muted-foreground">هیچ پیامی در این بخش یافت نشد.</span>
        </div>
      )}

    </div>
  );
}