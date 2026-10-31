'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  RotateCcw,
  ChevronLeft,
  Truck,
  Package,
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Store,
} from 'lucide-react';
import { useGetReturnRequests } from '@/domains/userpanel/hooks/userpanel.hooks';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { LottiePlayer } from '@/components/shared/Lottie/LottiePlayer';
import { ReturnShipmentModal } from './components/ReturnShipmentModal';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';

interface ReturnsListProps {
  initialStatus: string;
  initialPage: number;
}

const STATUS_TABS = [
  { id: '', label: 'همه', icon: RotateCcw },
  { id: 'Pending', label: 'در انتظار بررسی', icon: Clock },
  { id: 'NeedsMoreDocumentation', label: 'نیاز به مدارک', icon: FileText },
  { id: 'WaitingForSellerResponse', label: 'در انتظار فروشنده', icon: Store },
  { id: 'Confirmed', label: 'تأیید شده', icon: CheckCircle2 },
  { id: 'TraceNumberAdded', label: 'کد رهگیری ثبت شد', icon: Truck },
  { id: 'SentBack', label: 'ارسال به فروشنده', icon: Truck },
  { id: 'Received', label: 'دریافت شد', icon: Package },
  { id: 'Refunded', label: 'بازگشت وجه', icon: RotateCcw },
  { id: 'Denied', label: 'رد شده', icon: XCircle },
] as const;

export function ReturnsList({ initialStatus, initialPage }: ReturnsListProps) {
  const router = useRouter();
  const [status, setStatus] = React.useState(initialStatus);
  const [page, setPage] = React.useState(initialPage);
  const [selectedReturnId, setSelectedReturnId] = React.useState<string | null>(null);

  const { data: returnsResponse, isLoading } = useGetReturnRequests(
    page,
    status || undefined,
  );

  const returns = returnsResponse?.items || [];
  const totalPages = returnsResponse?.totalPages || 1;

  const handleTabChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
    router.push(`/profile/returns?status=${newStatus}`);
  };

  const getReturnStatusMeta = (s: string) => {
    switch (s) {
      case 'Pending':
        return { label: 'در انتظار بررسی', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      case 'NeedsMoreDocumentation':
        return { label: 'نیاز به مدارک بیشتر', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
      case 'WaitingForSellerResponse':
        return { label: 'در انتظار پاسخ فروشنده', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
      case 'Confirmed':
        return { label: 'تأیید شده', color: 'text-primary bg-primary/10 border-primary/20' };
      case 'TraceNumberAdded':
        return { label: 'کد رهگیری ثبت شد', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
      case 'SentBack':
        return { label: 'ارسال به فروشنده', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
      case 'Received':
        return { label: 'دریافت شده', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
      case 'Refunded':
        return { label: 'بازگشت وجه انجام شد', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
      case 'Denied':
        return { label: 'رد شده', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
      default:
        return { label: s, color: 'text-muted-foreground bg-muted border-border' };
    }
  };

  return (
    <div className="flex w-full flex-col gap-5" dir="rtl">
      {/* هدر دسکتاپ */}
      <div className="hidden lg:flex flex-col gap-1 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-primary" />
          <h1 className="text-base font-black text-foreground sm:text-lg">
            درخواست‌های مرجوعی
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          پیگیری وضعیت درخواست‌های مرجوعی، ثبت بارنامه ارسال و مشاهده بازگشت وجه
        </p>
      </div>

      {/* تب‌های وضعیت */}
      <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
        {STATUS_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = status === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-150',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border/80 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              <TabIcon
                className={cn(
                  'h-4 w-4',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground',
                )}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* لیست */}
      {isLoading ? (
        <PageLoading label="در حال دریافت درخواست‌های مرجوعی..." />
      ) : returns.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {returns.map((req: any) => {
              const meta = getReturnStatusMeta(req.status);

              return (
                <Card
                  key={req.id}
                  className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-colors hover:border-primary/30 sm:p-5"
                >
                  <div>
                    {/* ردیف بالا: شماره درخواست و وضعیت */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          شماره درخواست:
                        </span>
                        <span className="font-bold text-foreground" dir="ltr">
                          #{toPersianDigits(req.requestNumber)}
                        </span>
                      </div>

                      <span
                        className={cn(
                          'rounded-lg border px-2 py-1 text-xs font-bold',
                          meta.color,
                        )}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {/* ردیف کالا و فروشگاه */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-card p-1">
                        {req.productImage ? (
                          <img
                            src={getFullUrl(req.productImage)}
                            alt={req.productTitle}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="line-clamp-1 text-xs font-bold text-foreground">
                          {req.productTitle}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          فروشگاه: {req.shopTitle}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          تاریخ ثبت: {req.createDateFormatted}
                        </span>
                      </div>
                    </div>

                    {/* مبلغ بازگشتی */}
                    <div className="mt-3 flex items-center justify-between border-t border-dashed border-border/60 pt-3">
                      <span className="text-xs text-muted-foreground">
                        مبلغ قابل بازگشت:
                      </span>
                      <span className="text-sm font-black text-primary">
                        {req.totlaPayBackAmount}
                      </span>
                    </div>
                  </div>

                  {/* اکشن‌ها */}
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                    {req.status === 'Confirmed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedReturnId(req.id)}
                        className="h-8 gap-2 rounded-lg text-xs font-bold"
                      >
                        <Truck className="h-4 w-4" />
                        <span>ثبت بارنامه ارسال</span>
                      </Button>
                    )}

                    {req.status !== 'Confirmed' && <div />}

                    {/* اصلاح ریدایرکت به صفحه تکی مرجوعی */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/profile/returns/${req.id}`)}
                      className="h-8 gap-1 rounded-lg text-xs font-bold text-primary hover:bg-primary/5"
                    >
                      <span>جزئیات درخواست</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              setPage(p);
              router.push(`/profile/returns?status=${status}&page=${p}`);
            }}
          />
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card py-12 text-center shadow-xs">
          <div className="mx-auto -mb-2 flex h-48 w-48 max-w-full items-center justify-center">
            <LottiePlayer
              path="/animations/packaging-for-delivery.json"
              className="h-full w-full"
              loop={true}
            />
          </div>
          <p className="mt-5 text-sm font-bold text-foreground">
            درخواستی در این دسته وجود ندارد
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            شما هیچ درخواست مرجوعی با وضعیت «
            {STATUS_TABS.find((t) => t.id === status)?.label}» ثبت نکرده‌اید.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/profile/orders')}
            className="mt-4 h-9 gap-2 rounded-xl px-5 text-xs font-bold shadow-xs"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>مشاهده سفارش‌ها</span>
          </Button>
        </div>
      )}

      {/* مودال ثبت بارنامه */}
      {selectedReturnId && (
        <ReturnShipmentModal
          isOpen={!!selectedReturnId}
          onClose={() => setSelectedReturnId(null)}
          returnRequestId={selectedReturnId}
        />
      )}
    </div>
  );
}