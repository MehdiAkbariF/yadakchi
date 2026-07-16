'use client';

import { CreditCard, ArrowLeft, Briefcase } from 'lucide-react';
import { Card, CardTitle } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button';
import { Checkbox } from '@/components/primitives/Checkbox/Checkbox';

interface PaymentInvoiceProps {
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
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value);
  };

  return (
    <Card className="w-full lg:w-[360px] shrink-0 border rounded-xl p-5 bg-background shadow-sm h-fit text-right">
      <CardTitle className="font-iran-yekan font-extrabold text-foreground border-b pb-3 mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        <span>صورتحساب</span>
      </CardTitle>

      <div className="space-y-4 border-b pb-4 mb-4 text-right">
        <div className="flex items-center justify-between text-xs md:text-sm font-medium font-iran-sans text-muted-foreground">
          <span>قیمت محصولات</span>
          <span>{formatPrice(productPrice)} تومان</span>
        </div>

        <div className="flex items-center justify-between text-xs md:text-sm font-bold font-iran-sans text-destructive">
          <span>تخفیف ها</span>
          <span>{formatPrice(discountPrice)} تومان</span>
        </div>

        <div className="flex items-center justify-between text-xs md:text-sm font-medium font-iran-sans text-muted-foreground">
          <span>هزینه ارسال</span>
          <span>{formatPrice(shippingPrice)} تومان</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 text-right">
        <span className="text-xs md:text-sm font-bold font-iran-sans text-muted-foreground">جمع کل</span>
        <span className="text-lg font-black font-iran-sans text-foreground">{formatPrice(finalPrice)} تومان</span>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onPayment}
        isLoading={isSubmitting}
        className="rounded-xl font-iran-sans font-bold text-xs h-11 shadow-md shadow-primary/10 flex items-center justify-center gap-1"
      >
        <span>پرداخت و تکمیل سفارش</span>
        <ArrowLeft className="h-4.5 w-4.5 mr-1" />
      </Button>

      <span className="text-[10px] text-center text-muted-foreground block mt-2.5 font-iran-sans">
        ارسال در سریع ترین زمان ممکن انجام خواهد شد
      </span>

      <div className="border-t border-dashed mt-5 pt-4 space-y-3.5 text-right w-full">
        <div className="flex items-start gap-2.5 w-full">
          <Checkbox
            checked={isLegalInvoice}
            disabled={!isLegalUser}
            onChange={onLegalInvoiceChange}
          />
          <div className="">
            <p className="text-xs leading-relaxed text-muted-foreground font-iran-sans text-right select-none">
              با انتخاب این گزینه، فاکتور خرید شما به صورت حقوقی صادر خواهد شد. شما می‌توانید از قسمت سفارش در حساب کاربری خود، فاکتور خود را دریافت کنید.
            </p>
            {!isLegalUser && (
              <span className="text-[9px] text-destructive font-iran-sans block mt-1">
                جهت فعال‌سازی فاکتور حقوقی، ابتدا باید اطلاعات حقوقی خود را تکمیل کنید.
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-start w-full">
          <button
            type="button"
            onClick={onCompleteLegalInfo}
            className="text-xs font-bold font-iran-sans text-primary hover:underline flex items-center gap-1 mt-1 outline-none"
          >
            <Briefcase className="h-3.5 w-3.5 shrink-0" />
            <span>تکمیل اطلاعات حقوقی</span>
          </button>
        </div>
      </div>
    </Card>
  );
}