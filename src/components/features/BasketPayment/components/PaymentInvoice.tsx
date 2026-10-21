'use client';

import { Lock, ArrowLeft, Briefcase, FileCheck, ShieldCheck } from 'lucide-react';
import { Card, CardTitle } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button';
import { Checkbox } from '@/components/primitives/Checkbox/Checkbox';

export interface PaymentInvoiceProps {
  productPrice: number;
  discountPrice: number;
  shippingPrice: number;
  finalPrice: number;
  isLegalInvoice: boolean;
  isLegalUser: boolean;
  isSubmitting: boolean;
  onLegalInvoiceChange: (checked: boolean) => void;
  onPayment: () => void;
  onCompleteLegalInfo: () => void;
}

export function PaymentInvoice({
  productPrice,
  discountPrice,
  shippingPrice,
  finalPrice,
  isLegalInvoice,
  isLegalUser,
  isSubmitting,
  onLegalInvoiceChange,
  onPayment,
  onCompleteLegalInfo,
}: PaymentInvoiceProps) {
  const formatPrice = (value: number) =>
    new Intl.NumberFormat('fa-IR').format(Math.round(value));

  return (
    <Card className="sticky top-28 h-fit w-full shrink-0 rounded-xl border border-border/70 bg-card p-5 shadow-xs lg:w-[360px]">
      <CardTitle className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3.5 font-bold text-foreground">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileCheck aria-hidden="true" className="h-4 w-4" />
        </div>
        <span className="text-sm">صورتحساب نهایی</span>
      </CardTitle>

      <div className="mb-4 space-y-3.5 border-b border-border/60 pb-4 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>مجموع قیمت قطعات</span>
          <span className="font-semibold text-foreground">{formatPrice(productPrice)} تومان</span>
        </div>

        {discountPrice > 0 ? (
          <div className="flex items-center justify-between font-semibold text-destructive">
            <span>تخفیف اعمال‌شده</span>
            <span>- {formatPrice(discountPrice)} تومان</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between text-muted-foreground">
          <span>هزینه بسته‌بندی و ارسال</span>
          <span className="font-semibold text-foreground">
            {shippingPrice > 0 ? `${formatPrice(shippingPrice)} تومان` : 'رایگان'}
          </span>
        </div>
      </div>

      <div className="mb-6 flex items-baseline justify-between">
        <span className="text-xs font-bold text-foreground">مبلغ نهایی قابل پرداخت:</span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-primary">{formatPrice(finalPrice)}</span>
          <span className="text-2xs font-semibold text-muted-foreground">تومان</span>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onPayment}
        isLoading={isSubmitting}
        className="flex h-11 items-center justify-center gap-2 rounded-lg text-xs font-bold shadow-xs transition-transform active:scale-[0.99]"
      >
        <Lock className="h-4 w-4" />
        <span>پرداخت امن و ثبت نهایی سفارش</span>
        <ArrowLeft aria-hidden="true" className="me-1 h-4 w-4" />
      </Button>

      {/* بخش صدور فاکتور حقوقی/رسمی */}
      <div className="mt-5 w-full space-y-3 border-t border-dashed border-border/70 pt-4">
        <div className="flex items-start gap-2.5">
          <Checkbox
            checked={isLegalInvoice}
            disabled={!isLegalUser}
            onChange={onLegalInvoiceChange}
          />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-foreground">درخواست صدور فاکتور رسمی حقوقی</span>
            <p className="select-none text-2xs leading-relaxed text-muted-foreground">
              فاکتور رسمی شرکتی با کد اقتصادی صادر و در پنل کاربری قابل دریافت خواهد بود.
            </p>
            {!isLegalUser ? (
              <span className="text-2xs font-semibold text-destructive">
                اطلاعات حقوقی شرکت شما هنوز تایید نشده است.
              </span>
            ) : null}
          </div>
        </div>

        {!isLegalUser ? (
          <button
            type="button"
            onClick={onCompleteLegalInfo}
            className="flex items-center gap-1.5 text-xs font-bold text-primary outline-none hover:underline"
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>تکمیل و ارسال مدارک حقوقی</span>
          </button>
        ) : null}

        <div className="flex items-center justify-center gap-1.5 pt-2 text-2xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          <span>تضمین بازگشت وجه در صورت عدم انطباق کالا</span>
        </div>
      </div>
    </Card>
  );
}