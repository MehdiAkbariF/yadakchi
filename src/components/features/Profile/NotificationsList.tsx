'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
  Store,
} from 'lucide-react';
import { useGetUserNotifications } from '@/domains/userpanel/hooks/userpanel.hooks';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Select } from '@/components/primitives/Select/Select';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { cn } from '@/design-system/utils/cn';

function LottiePlayer({ path, className = 'w-48 h-48', loop = true }: { path: string; className?: string; loop?: boolean }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let anim: any = null;
    let isMounted = true;
    const init = async () => {
      try {
        const altPath = path.includes('/anumations/')
          ? path.replace('/anumations/', '/animations/')
          : path.replace('/animations/', '/anumations/');
        let animationData: any = null;
        for (const p of [path, altPath]) {
          try {
            const res = await fetch(p);
            if (res.ok) {
              animationData = await res.json();
              break;
            }
          } catch {}
        }
        if (!animationData || !isMounted || !containerRef.current) return;
        const lottieModule = await import('lottie-web');
        const lottie = lottieModule.default || lottieModule;
        if (containerRef.current && isMounted) {
          anim = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay: true,
            animationData,
          });
        }
      } catch {}
    };
    init();
    return () => {
      isMounted = false;
      anim?.destroy();
    };
  }, [path, loop]);

  return <div ref={containerRef} className={className} />;
}

const PRIORITY_OPTIONS = [
  { value: '', label: 'همه اولویت‌ها' },
  { value: 'Important', label: 'مهم' },
  { value: 'VeryImportant', label: 'خیلی مهم' },
] as const;

const ORDER_OPTIONS = [
  { value: 'Latest', label: 'جدیدترین' },
  { value: 'Oldest', label: 'قدیمی‌ترین' },
] as const;

function getChannelIcon(channel: string) {
  switch (channel) {
    case 'Discount':
      return <Tag aria-hidden="true" className="h-5 w-5 text-primary" />;
    case 'System':
      return <Settings aria-hidden="true" className="h-5 w-5 text-muted-foreground" />;
    case 'Information':
      return <Info aria-hidden="true" className="h-5 w-5 text-info" />;
    case 'AdminMessage':
      return <ShieldAlert aria-hidden="true" className="h-5 w-5 text-destructive" />;
    case 'SellerMessage':
      return <Store aria-hidden="true" className="h-5 w-5 text-warning" />;
    case 'Advertise':
      return <Sparkles aria-hidden="true" className="h-5 w-5 text-warning" />;
    case 'WebBroadcastMessage':
      return <Radio aria-hidden="true" className="h-5 w-5 text-primary" />;
    default:
      return <Bell aria-hidden="true" className="h-5 w-5 text-muted-foreground" />;
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
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="mb-1 flex items-center justify-between border-b border-border pb-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/profile')}
            aria-label="بازگشت"
            className="-me-1 flex items-center justify-center rounded-full p-1 transition-colors hover:bg-muted"
          >
            <ArrowRight aria-hidden="true" className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-sm font-bold text-foreground">پیام‌ها و اعلان‌ها</span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 border-b border-border pb-5">
        <div className="flex items-center gap-2">
          <Bell aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
          <span className="text-xl font-bold text-foreground">پیام‌ها و اعلان‌ها</span>
        </div>
        <p className="text-xs text-muted-foreground">
          تمام اطلاع‌رسانی‌های مربوط به سفارش و تخفیف‌های ویژه در این بخش قابل مشاهده است
        </p>
      </div>

      <div className="mt-2 flex flex-col justify-between gap-4 border-b border-border select-none sm:flex-row sm:items-center">
        <div className="flex w-full shrink-0 items-center gap-5 pb-px sm:w-auto">
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={cn(
              'flex items-center gap-1.5 border-b-2 pb-2 text-sm font-bold outline-none transition-colors',
              activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            )}
          >
            <span>همه اعلان‌ها</span>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-2xs font-bold',
                activeTab === 'all' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('discounts')}
            className={cn(
              'flex items-center gap-1.5 border-b-2 pb-2 text-sm font-bold outline-none transition-colors',
              activeTab === 'discounts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            )}
          >
            <span>تخفیف‌ها</span>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-2xs font-bold',
                activeTab === 'discounts' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {discountCount}
            </span>
          </button>
        </div>

        <div className="flex w-full items-center justify-start gap-2 pb-3 sm:w-auto sm:justify-end sm:pb-2.5">
          <div className="w-28 shrink-0 sm:w-36">
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

          <div className="w-28 shrink-0 sm:w-36">
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
      </div>

      {isLoading ? (
        <PageLoading label="در حال بارگذاری اعلان‌ها..." />
      ) : notifications.length > 0 ? (
        <div className="flex w-full flex-col gap-5">
          <div className="flex w-full flex-col gap-4">
            {notifications.map((notif: any) => (
              <Card
                key={notif.id}
                className={cn(
                  'relative w-full p-4 transition-colors md:p-5',
                  !notif.isRead && 'border-primary/30 bg-accent/30'
                )}
              >
                <CardBody className="flex items-start gap-4 p-0">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-xs">
                    {getChannelIcon(notif.channel)}
                    {!notif.isRead ? (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-primary ring-2 ring-background" />
                    ) : null}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="block truncate text-sm font-bold text-foreground">{notif.title}</span>
                      <div className="flex shrink-0 items-center gap-1.5 text-2xs text-muted-foreground">
                        <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                        <span>{notif.createDateFormatted}</span>
                      </div>
                    </div>

                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                      {notif.body}
                    </p>

                    {notif.linkType && notif.linkText ? (
                      <div className="mt-2 flex justify-start">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(notif.linkType as string)}
                          className="h-8 px-4 text-2xs font-bold"
                        >
                          {notif.linkText}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-4 py-12 text-center">
          <LottiePlayer path="/anumations/notif-bell.json" className="mx-auto h-48 w-48 max-w-full" />
          <span className="text-sm font-bold text-muted-foreground">هیچ اعلانی در این دسته یافت نشد.</span>
        </div>
      )}
    </div>
  );
}