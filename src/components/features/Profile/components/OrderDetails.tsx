'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Receipt,
  ArrowRight,
  Truck,
  Copy,
  Phone,
  PackageCheck,
  PackageX,
  MapPin,
  Store,
  Check,
  Ban,
  RotateCcw,
  Package,
} from 'lucide-react';
import {
  useGetOrderDetails,
  useRetryOrderPayment,
  useMarkSubOrderReceived,
  useMarkSubOrderNotReceived,
} from '@/domains/userpanel/hooks/userpanel.hooks';
import { Card, CardBody, CardHeader } from '@/components/composites/Card';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { ReturnRequestModal } from './ReturnRequestModal';
import { CancelOrderModal } from './CancelOrderModal';
import { ReturnShipmentModal } from './ReturnShipmentModal';
import { Button } from '@/components/primitives/Button/Button';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl } from '@/core/utils/formatters';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  WaitingForPayment: { label: 'در انتظار پرداخت', color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
  InProgress: { label: 'در حال پردازش و ارسال', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  Delivered: { label: 'تحویل داده شده', color: 'text-success', bg: 'bg-success/10 border-success/20' },
  ReturnRequest: { label: 'درخواست مرجوعی', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  Cancelled: { label: 'لغو شده', color: 'text-muted-foreground', bg: 'bg-secondary border-border/80' },
  SystemCancelled: { label: 'لغو خودکار سیستم', color: 'text-muted-foreground', bg: 'bg-secondary border-border/80' },
};

export interface OrderDetailsProps {
  orderId: string;
}

export function OrderDetails({ orderId }: OrderDetailsProps) {
  const router = useRouter();
  const { data: order, isLoading } = useGetOrderDetails(orderId);
  const retryPayment = useRetryOrderPayment();
  const markReceived = useMarkSubOrderReceived();
  const markNotReceived = useMarkSubOrderNotReceived();

  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = React.useState(false);
  const [isReturnShipmentOpen, setIsReturnShipmentOpen] = React.useState(false);

  const [selectedSubOrder, setSelectedSubOrder] = React.useState<any | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<any | null>(null);
  const [activeReturnRequestId, setActiveReturnRequestId] = React.useState<string>('');
  const [copiedTrace, setCopiedTrace] = React.useState<string | null>(null);

  const handleCopyTrace = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTrace(code);
    showToast.success('کد رهگیری کپی شد');
    setTimeout(() => setCopiedTrace(null), 2500);
  };

  const handleRetryPayment = async () => {
    try {
      const response: any = await retryPayment.mutateAsync(orderId);
      const gatewayUrl =
        response?.link ||
        response?.paymentUrl ||
        response?.data?.link ||
        response?.data?.paymentUrl;
      if (gatewayUrl) {
        showToast.success('در حال انتقال به درگاه بانکی...');
        window.location.href = gatewayUrl;
      } else {
        showToast.error('خطا در دریافت درگاه بانکی');
      }
    } catch (error: any) {
      showToast.error(error.userMessage || 'خطا در برقراری ارتباط با بانک');
    }
  };

  const handleConfirmReceived = async (subOrderId: string) => {
    try {
      await markReceived.mutateAsync(subOrderId);
      showToast.success('دریافت مرسوله با موفقیت تایید شد');
    } catch {
      showToast.error('خطا در تایید وضعیت تحویل');
    }
  };

  const handleConfirmNotReceived = async (subOrderId: string) => {
    try {
      await markNotReceived.mutateAsync(subOrderId);
      showToast.success('گزارش عدم دریافت مرسوله ثبت شد و توسط پشتیبانی پیگیری خواهد شد');
    } catch {
      showToast.error('خطا در ثبت گزارش عدم دریافت');
    }
  };

  if (isLoading || !order) {
    return <PageLoading label="در حال بارگذاری اطلاعات کامل سفارش..." />;
  }

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('fa-IR').format(Math.round((val || 0) / 10));

  const statusCfg = STATUS_MAP[order.status] || {
    label: order.status,
    color: 'text-foreground',
    bg: 'bg-secondary',
  };

  const canCancel = order.status === 'WaitingForPayment' || order.status === 'InProgress';
  const hasSubOrders = order.subOrders && order.subOrders.length > 0;

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      {/* هدر صفحه و دکمه بازگشت */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/profile/orders')}
            className="rounded-lg p-2 transition-colors hover:bg-secondary"
          >
            <ArrowRight aria-hidden="true" className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-foreground sm:text-base">
              سفارش شماره {order.orderNumber}
            </h1>
            <span className="text-2xs text-muted-foreground">
              ثبت‌شده در تاریخ {new Date(order.createDate).toLocaleDateString('fa-IR')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canCancel ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
              className="flex h-8 items-center gap-1 rounded-lg border-destructive/40 text-2xs font-bold text-destructive hover:bg-destructive/10"
            >
              <Ban className="h-4 w-4" />
              <span>لغو سفارش</span>
            </Button>
          ) : null}

          <span className={cn('rounded-full border px-3 py-1 text-xs font-bold', statusCfg.bg, statusCfg.color)}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* ستون راست: مرسوله‌ها و آدرس تحویل */}
        <div className="flex w-full flex-col gap-5 lg:col-span-8">
          {/* کارت آدرس تحویل سفارش */}
          {order.userLocation ? (
            <Card className="w-full rounded-xl border border-border/70 bg-card p-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="text-xs font-bold text-foreground">آدرس تحویل گیرنده:</span>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {order.userLocation.address} (پلاک {order.userLocation.plaque}، واحد {order.userLocation.unit})
                  </p>
                  <div className="mt-1 flex flex-wrap gap-4 text-2xs text-muted-foreground font-semibold">
                    <span>گیرنده: {order.userLocation.receiverFullName}</span>
                    <span>تماس: {order.userLocation.receiverMobile}</span>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {/* لیست مرسوله‌ها (SubOrders) */}
          {hasSubOrders ? (
            <div className="flex flex-col gap-4">
              {order.subOrders.map((sub: any, idx: number) => {
                const subStatus = STATUS_MAP[sub.status] || {
                  label: sub.status,
                  color: 'text-primary',
                  bg: 'bg-secondary',
                };

                const isDelivered =
                  order.status === 'Delivered' ||
                  sub.status === 'Delivered' ||
                  sub.status === 'Received' ||
                  Boolean(sub.recieveDate);

                return (
                  <Card key={sub.id} className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
                    {/* هدر مرسوله */}
                    <CardHeader className="flex items-center justify-between border-b border-border/60 bg-card px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">
                          مرسوله {new Intl.NumberFormat('fa-IR').format(idx + 1)} از {new Intl.NumberFormat('fa-IR').format(order.subOrders.length)}
                        </span>
                      </div>

                      <span className={cn('rounded-full border px-3 py-1 text-2xs font-bold', subStatus.bg, subStatus.color)}>
                        {subStatus.label}
                      </span>
                    </CardHeader>

                    <CardBody className="flex flex-col gap-4 p-5">
                      {/* اطلاعات فروشگاه ارسال‌کننده */}
                      <div className="flex items-center justify-between border-b border-border/50 pb-3">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-bold text-foreground">فروشگاه: {sub.shop?.shopTitle || 'یدک‌چی'}</span>
                        </div>
                        <span className="text-2xs text-muted-foreground">
                          روش ارسال: <strong>{sub.shipmentMethod === 'Local' ? 'تحویل حضوری' : sub.shipmentMethod}</strong>
                        </span>
                      </div>

                      {/* اطلاعات رهگیری هوشمند مرسوله */}
                      {sub.traceNumber || sub.driverFullName ? (
                        <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
                          {sub.traceNumber ? (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground font-semibold">کد رهگیری پستی / تیپاکس:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-foreground tracking-wider">{sub.traceNumber}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyTrace(sub.traceNumber)}
                                  className="flex items-center gap-1 rounded-md bg-card border px-2 py-1 text-2xs font-semibold text-primary shadow-2xs hover:bg-secondary"
                                >
                                  {copiedTrace === sub.traceNumber ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                                  <span>{copiedTrace === sub.traceNumber ? 'کپی شد' : 'کپی'}</span>
                                </button>
                              </div>
                            </div>
                          ) : null}

                          {sub.driverFullName ? (
                            <div className="flex items-center justify-between pt-1 border-t border-border/40">
                              <span className="text-muted-foreground">مشخصات راننده پیک:</span>
                              <div className="flex items-center gap-2 font-bold text-foreground">
                                <span>{sub.driverFullName}</span>
                                {sub.driverMobile ? (
                                  <a href={`tel:${sub.driverMobile}`} className="flex items-center gap-1 text-primary hover:underline">
                                    <Phone className="h-3 w-3" />
                                    <span>{sub.driverMobile}</span>
                                  </a>
                                ) : null}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {/* لیست اقلام مرسوله */}
                      <div className="flex flex-col divide-y divide-border/60">
                        {sub.subOrderItems?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-card p-1 shadow-2xs">
                                <img
                                  src={getFullUrl(item.shopProduct?.product?.image)}
                                  className="h-full w-full object-contain"
                                  alt=""
                                />
                              </div>
                              <div className="flex flex-col gap-1 min-w-0 flex-1">
                                <span className="truncate text-xs font-bold text-foreground">
                                  {item.shopProduct?.product?.title}
                                </span>
                                <div className="flex items-center gap-2 text-2xs text-muted-foreground">
                                  <span>تعداد: {new Intl.NumberFormat('fa-IR').format(item.quantity)} عدد</span>
                                  <span>•</span>
                                  <span className="font-bold text-foreground">
                                    {formatPrice(item.finalTotalPrice)} تومان
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* دکمه ثبت درخواست مرجوعی برای این کالا */}
                            {isDelivered ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedSubOrder(sub);
                                  setSelectedItem(item);
                                  setIsReturnModalOpen(true);
                                }}
                                className="h-8 shrink-0 rounded-lg text-2xs font-bold text-amber-600 border-amber-500/40 hover:bg-amber-500/10"
                              >
                                درخواست مرجوعی
                              </Button>
                            ) : null}
                          </div>
                        ))}
                      </div>

                      {/* دکمه‌های تایید تحویل یا اعلام عدم دریافت */}
                      {sub.status === 'InProgress' ? (
                        <div className="mt-2 flex flex-wrap items-center justify-end gap-2 border-t border-dashed border-border/60 pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfirmNotReceived(sub.id)}
                            className="flex items-center gap-1 rounded-lg text-xs font-bold text-destructive border-destructive/40 hover:bg-destructive/10"
                          >
                            <PackageX className="h-4 w-4" />
                            <span>بسته را دریافت نکردم</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfirmReceived(sub.id)}
                            className="flex items-center gap-1 rounded-lg text-xs font-bold text-success border-success/40 hover:bg-success/10"
                          >
                            <PackageCheck className="h-4 w-4" />
                            <span>کالا را تحویل گرفتم</span>
                          </Button>
                        </div>
                      ) : null}

                      {/* دکمه ثبت رسید پستی مرجوعی */}
                      {sub.status === 'ReturnRequest' ? (
                        <div className="mt-2 flex items-center justify-end border-t border-dashed border-border/60 pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveReturnRequestId(sub.id);
                              setIsReturnShipmentOpen(true);
                            }}
                            className="flex items-center gap-1 rounded-lg text-xs font-bold text-primary border-primary/40 hover:bg-primary/10"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span>ثبت بارنامه مرجوعی کالا</span>
                          </Button>
                        </div>
                      ) : null}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card p-12 text-center shadow-xs">
              <Package className="mb-2 h-10 w-10 text-muted-foreground/40" />
              <p className="text-xs font-semibold text-muted-foreground">
                هیچ مرسوله یا کالایی برای این سفارش ثبت نشده است (داده تستی).
              </p>
            </Card>
          )}
        </div>

        {/* ستون چپ: صورتحساب و پرداخت */}
        <div className="flex w-full flex-col gap-4 lg:col-span-4">
          <Card className="sticky top-28 rounded-xl border border-border/70 bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3 font-bold text-foreground text-sm">
              <Receipt className="h-4 w-4 text-primary" />
              <span>خلاصه فاکتور مالی</span>
            </div>

            <div className="flex flex-col gap-3 border-b border-border/60 py-4 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>قیمت کالاها:</span>
                <span className="font-semibold text-foreground">{formatPrice(order.totalOriginalPrice)} تومان</span>
              </div>

              {order.totalDiscountValue > 0 ? (
                <div className="flex items-center justify-between text-destructive font-semibold">
                  <span>تخفیف:</span>
                  <span>- {formatPrice(order.totalDiscountValue)} تومان</span>
                </div>
              ) : null}

              <div className="flex items-center justify-between text-muted-foreground">
                <span>هزینه باربری و ارسال:</span>
                <span className="font-semibold text-foreground">{formatPrice(order.totalShipmentPrice)} تومان</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between py-4">
              <span className="text-xs font-bold text-foreground">مبلغ نهایی پرداخت:</span>
              <span className="text-base font-bold text-primary">{formatPrice(order.totalFinalPrice)} تومان</span>
            </div>

            {order.status === 'WaitingForPayment' ? (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleRetryPayment}
                isLoading={retryPayment.isPending}
                className="flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold shadow-xs"
              >
                <CreditCard className="h-4 w-4" />
                <span>پرداخت اینترنتی سفارش</span>
              </Button>
            ) : null}
          </Card>
        </div>
      </div>

      {/* مودال ثبت درخواست مرجوعی */}
      <ReturnRequestModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        subOrder={selectedSubOrder}
        item={selectedItem}
      />

      {/* مودال لغو سفارش */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        orderId={order.id}
      />

      {/* مودال ارسال رسید پستی مرجوعی */}
      <ReturnShipmentModal
        isOpen={isReturnShipmentOpen}
        onClose={() => setIsReturnShipmentOpen(false)}
        returnRequestId={activeReturnRequestId}
      />
    </div>
  );
}