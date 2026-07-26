'use client';

import { CreditCard, ChevronLeft, AlertCircle } from 'lucide-react';
import { Card, CardTitle } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button';

interface CheckoutInvoiceProps {
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
  const formatNumber = (val: number) => new Intl.NumberFormat('fa-IR').format(val);

  return (
    <Card className="w-full lg:w-[360px] shrink-0 border rounded-xl p-5 bg-background shadow-sm h-fit text-right">
      <CardTitle className="font-iran-yekan font-extrabold text-foreground border-b pb-3 mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        <span>صورتحساب تسویه حساب</span>
      </CardTitle>

      <div className="space-y-4 border-b pb-4 mb-4 text-right">
        <div className="flex items-center justify-between text-xs font-medium font-iran-yekan text-muted-foreground">
          <span>قیمت محصولات</span>
          <span>{formatNumber(basket.totalOriginalPrice / 10)} تومان</span>
        </div>

        {basket.totalDiscountValue > 0 && (
          <div className="flex items-center justify-between text-xs font-bold font-iran-yekan text-destructive">
            <span>تخفیف‌ها</span>
            <span>- {formatNumber(basket.totalDiscountValue / 10)} تومان</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs font-medium font-iran-yekan text-muted-foreground">
          <span>هزینه ارسال</span>
          <span>{totalShipment > 0 ? `${formatNumber(totalShipment / 10)} تومان` : 'انتخاب نشده'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 text-right">
        <span className="text-xs font-bold font-iran-yekan text-muted-foreground">مبلغ نهایی قابل پرداخت</span>
        <span className="text-lg font-black font-iran-yekan text-foreground">{formatNumber(finalPayablePrice / 10)} تومان</span>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onSubmit}
        isLoading={isLoading}
        className="rounded-xl font-iran-yekan font-bold text-xs h-11 shadow-md shadow-primary/10 flex items-center justify-center gap-1"
      >
        <span>ثبت نهایی و پرداخت</span>
        <ChevronLeft className="h-4.5 w-4.5 mr-1" />
      </Button>
    </Card>
  );
}