'use client';

import { CreditCard, ChevronLeft, ShieldCheck, Truck, Headphones } from 'lucide-react';
import { Card, CardTitle } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button';

export interface CheckoutInvoiceProps {
  basket: any;
  totalShipment: number;
  finalPayablePrice: number;
  onSubmit: () => void;
  isLoading: boolean;
}

export function CheckoutInvoice({
  basket,
  totalShipment,
  finalPayablePrice,
  onSubmit,
  isLoading,
}: CheckoutInvoiceProps) {
  const formatNumber = (val: number) =>
    new Intl.NumberFormat('fa-IR').format(Math.round(val / 10));

  return (
    <Card className="sticky top-28 h-fit w-full shrink-0 rounded-xl border border-border/70 bg-card p-5 shadow-xs lg:w-[360px]">
      <CardTitle className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3.5 font-bold text-foreground">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CreditCard aria-hidden="true" className="h-4 w-4" />
        </div>
        <span className="text-sm">خلاصه صورتحساب</span>
      </CardTitle>

      <div className="mb-4 space-y-3.5 border-b border-border/60 pb-4 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>قیمت کل محصولات</span>
          <span className="font-semibold text-foreground">
            {formatNumber(basket.totalOriginalPrice || basket.totalPrice || 0)} تومان
          </span>
        </div>

        {basket.totalDiscountValue > 0 ? (
          <div className="flex items-center justify-between text-destructive font-semibold">
            <span>سود شما از خرید</span>
            <span>- {formatNumber(basket.totalDiscountValue)} تومان</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            <span>مجموع هزینه ارسال</span>
          </div>
          <span className="font-semibold text-foreground">
            {totalShipment > 0 ? `${formatNumber(totalShipment)} تومان` : 'انتخاب نشده'}
          </span>
        </div>
      </div>

      <div className="mb-6 flex items-baseline justify-between">
        <span className="text-xs font-bold text-foreground">مبلغ نهایی قابل پرداخت:</span>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-primary">
            {formatNumber(finalPayablePrice)}
          </span>
          <span className="text-2xs font-semibold text-muted-foreground">تومان</span>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onSubmit}
        isLoading={isLoading}
        className="flex h-11 items-center justify-center gap-1.5 rounded-lg text-xs font-bold shadow-xs transition-transform active:scale-[0.99]"
      >
        <span>تایید شیوه ارسال و پرداخت</span>
        <ChevronLeft aria-hidden="true" className="h-4 w-4 stroke-[2.5]" />
      </Button>

      {/* بخش اعتمادسازی و پشتیبانی خرید */}
      <div className="mt-5 flex flex-col gap-2.5 border-t border-dashed border-border/70 pt-4 text-2xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
          <span>ضمانت اصالت و سلامت فیزیکی قطعات</span>
        </div>
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 shrink-0 text-primary" />
          <span>پشتیبانی فنی در صورت عدم تطابق با خودرو</span>
        </div>
      </div>
    </Card>
  );
}