'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  RotateCcw,
  Store,
  Calendar,
  Truck,
  Package,
  MessageSquare,
  ArrowRight,
  FileText,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useGetReturnRequestDetails } from '@/domains/userpanel/hooks/userpanel.hooks';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { ReturnShipmentModal } from './components/ReturnShipmentModal';
import { formatToman } from '@/core/utils/currency';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

interface ReturnDetailsProps {
  returnId: string;
}

const getStatusMeta = (status: string) => {
  switch (status) {
    case 'Pending':
      return { label: 'در انتظار بررسی', color: 'text-warning bg-warning/10 border-warning/20' };
    case 'NeedsMoreDocumentation':
      return { label: 'نیاز به مدارک بیشتر', color: 'text-status-needs-action bg-status-needs-action/10 border-status-needs-action/20' };
    case 'WaitingForSellerResponse':
      return { label: 'در انتظار پاسخ فروشنده', color: 'text-status-waiting-response bg-status-waiting-response/10 border-status-waiting-response/20' };
    case 'Confirmed':
      return { label: 'تأیید شده (آماده ارسال)', color: 'text-primary bg-primary/10 border-primary/20' };
    case 'TraceNumberAdded':
    case 'SentBack':
      return { label: 'ارسال شده به فروشنده', color: 'text-info bg-info/10 border-info/20' };
    case 'Received':
      return { label: 'دریافت شده توسط فروشنده', color: 'text-success bg-success/10 border-success/20' };
    case 'Refunded':
      return { label: 'بازگشت وجه انجام شد', color: 'text-success bg-success/10 border-success/20' };
    case 'Denied':
      return { label: 'درخواست رد شده', color: 'text-destructive bg-destructive/10 border-destructive/20' };
    default:
      return { label: status, color: 'text-muted-foreground bg-muted border-border' };
  }
};

export function ReturnDetails({ returnId }: ReturnDetailsProps) {
  const router = useRouter();
  const { data: request, isLoading, isError } = useGetReturnRequestDetails(returnId);
  const [isShipmentModalOpen, setIsShipmentModalOpen] = React.useState(false);

  if (isLoading) {
    return <PageLoading label="در حال دریافت جزئیات درخواست مرجوعی..." />;
  }

  if (isError || !request) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-3 py-16 text-center" dir="rtl">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-title-sm">درخواست مرجوعی یافت نشد</h2>
        <Button variant="outline" size="sm" onClick={() => router.push('/profile/returns')}>
          بازگشت به لیست مرجوعی‌ها
        </Button>
      </div>
    );
  }

  const statusMeta = getStatusMeta(request.status);
  const canSubmitShipment = request.status === 'Confirmed';

  const handleCopyTrace = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast.success('کد رهگیری کپی شد');
  };

  return (
    <div className="flex w-full flex-col gap-4 pb-16" dir="rtl">
      {/* دکمه بازگشت و هدر */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/profile/returns')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border bg-card hover:bg-muted"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground">
              جزئیات درخواست مرجوعی #{toPersianDigits(request.returnRequestNumber)}
            </h1>
            <span className="text-xs text-muted-foreground">
              ثبت شده در تاریخ {new Date(request.confirmedDate).toLocaleDateString('fa-IR')}
            </span>
          </div>
        </div>

        {/* لینک به تیکت پشتیبانی مربوطه */}
        {request.ticketId && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push(`/profile/support/${request.ticketId}`)}
            className="h-9 gap-2 rounded-xl text-xs font-bold shadow-xs"
          >
            <MessageSquare className="h-4 w-4" />
            <span>مشاهده و پیام در تیکت پشتیبانی</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* کارت خلاصه وضعیت و مشخصات */}
      <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/30 p-3">
            <span className="text-muted-foreground">وضعیت درخواست:</span>
            <span className={cn('rounded-lg border px-2.5 py-1 text-2xs font-bold', statusMeta.color)}>
              {statusMeta.label}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/30 p-3">
            <span className="text-muted-foreground">فروشگاه طرف معامله:</span>
            <span className="font-bold text-foreground">{request.shop?.shopTitle}</span>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/30 p-3">
            <span className="text-muted-foreground">روش بازگشت کالا:</span>
            <span className="font-bold text-foreground">
              {request.returnRequestReturnMethod === 'Post' ? 'پست پیشتاز' : request.returnRequestReturnMethod || 'تیپاکس'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/30 p-3">
            <span className="text-muted-foreground">کد پیگیری بارنامه:</span>
            <span className="font-bold text-foreground" dir="ltr">
              {request.traceNumber ? toPersianDigits(request.traceNumber) : 'هنوز ثبت نشده'}
            </span>
          </div>
        </div>

        {/* پیام مدیر در صورت وجود */}
        {request.adminDescription && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-foreground">
            <span className="font-bold text-primary">توضیحات پشتیبانی Yadakchi: </span>
            {request.adminDescription}
          </div>
        )}

        {/* دکمه ثبت بارنامه اگر درخواست تایید شده است */}
        {canSubmitShipment && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-warning/30 bg-warning/10 p-3">
            <span className="text-xs font-semibold text-warning/90 dark:text-warning/90">
              درخواست شما تأیید شد. لطفاً پس از تحویل کالا به پست، شماره بارنامه و فیش پستی را ثبت فرمایید.
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsShipmentModalOpen(true)}
              className="h-8 gap-1.5 rounded-lg text-xs font-bold"
            >
              <Truck className="h-4 w-4" />
              <span>ثبت بارنامه ارسال</span>
            </Button>
          </div>
        )}
      </Card>

      {/* اقلام مرجوعی */}
      <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
        <h2 className="mb-4 text-label">کالاهای مرجوعی این درخواست</h2>

        <div className="flex flex-col gap-4">
          {request.items?.map((it: any) => {
            const product = it.subOrderItem?.shopProduct?.product;
            const reason = it.returnRequestReason;

            return (
              <div
                key={it.id}
                className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card p-1">
                    {product?.image ? (
                      <img src={getFullUrl(product.image)} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <span className="font-bold text-foreground">{product?.title || 'کالای مرجوعی'}</span>
                    <span className="text-2xs text-muted-foreground">
                      تعداد مرجوعی: {toPersianDigits(it.quantity)} عدد
                    </span>
                    {reason?.name && (
                      <span className="text-2xs text-destructive font-semibold">علت: {reason.name}</span>
                    )}
                    <p className="mt-1 text-xs text-foreground/80 leading-relaxed bg-card p-2 rounded-lg border border-border/50">
                      شرح شما: {it.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-xs font-bold">
                  <span className="text-muted-foreground text-2xs">مبلغ استرداد این قلم:</span>
                  <span className="text-primary text-sm font-bold">{formatToman(it.itemReturnAmount || it.originalPrice)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* خلاصه مبالغ بازگشتی */}
      <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
        <h2 className="mb-3 text-label">خلاصه مبالغ بازگشت وجه</h2>

        <div className="flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>مبلغ بازگشتی کالاها:</span>
            <span className="font-bold text-foreground">{formatToman(request.totalItemPaybackAmount)}</span>
          </div>

          {request.totalReturnShipmentPaybackAmount > 0 && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span>جبران هزینه ارسال پستی عودت:</span>
              <span className="font-bold text-foreground">{formatToman(request.totalReturnShipmentPaybackAmount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border/80 pt-3 text-sm font-bold">
            <span className="text-foreground">مجموع کل قابل عودت به کیف پول / حساب:</span>
            <span className="text-base font-bold text-primary">{formatToman(request.totlaPayBackAmount)}</span>
          </div>
        </div>
      </Card>

      {/* مودال ارسال بارنامه پستی */}
      {isShipmentModalOpen && (
        <ReturnShipmentModal
          isOpen={isShipmentModalOpen}
          onClose={() => setIsShipmentModalOpen(false)}
          returnRequestId={request.id}
        />
      )}
    </div>
  );
}