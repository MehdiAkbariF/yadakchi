'use client';

import Link from 'next/link';
import { ShoppingCart, ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, CardTitle } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button';

interface BasketInvoiceProps {
  basket: any;
}

export function BasketInvoice({ basket }: BasketInvoiceProps) {
  const formatNumber = (val: number) => new Intl.NumberFormat('fa-IR').format(val);

  return (
    <Card className="w-full lg:w-[360px] shrink-0 border rounded-xl p-5 bg-background shadow-sm h-fit">
      <CardTitle className="font-iran-yekan font-extrabold text-foreground border-b pb-3 mb-4 flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-primary" />
        <span>صورتحساب</span>
      </CardTitle>

      <div className="space-y-4 border-b pb-4 mb-4 text-right">
        <div className="flex items-center justify-between text-xs font-medium font-iran-yekan text-muted-foreground">
          <span>قیمت محصولات ({formatNumber(basket.summary.itemCount)} قطعه)</span>
          <span>{basket.total.totalPrice}</span>
        </div>

        {basket.total.totalDiscountRaw > 0 && (
          <div className="flex items-center justify-between text-xs font-bold font-iran-yekan text-destructive">
            <span>تخفیف‌ها</span>
            <span>- {basket.total.totalDiscount}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-5 text-right">
        <span className="text-xs font-bold font-iran-yekan text-muted-foreground">جمع کل</span>
        <span className="text-lg font-black font-iran-yekan text-foreground">{basket.total.finalPrice}</span>
      </div>

      <Link href="/checkout" className="w-full block">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="rounded-xl font-iran-yekan font-bold text-xs h-11 shadow-md shadow-primary/10 flex items-center justify-center gap-1"
        >
          <span>ادامه فرآیند خرید</span>
          <ArrowLeft className="h-4.5 w-4.5 mr-1" />
        </Button>
      </Link>

      <div className="mt-5 border-t border-dashed pt-4 flex flex-col gap-3 text-right">
        <div className="flex gap-2 items-start text-[10px] sm:text-xs leading-relaxed text-muted-foreground/85 font-iran-yekan">
          <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>در صورتی که کالایی در سبد خرید، ناموجود یا غیر فعال شده است، با ادامه دادن به خرید، کالا به صورت خودکار از سبد خرید شما حذف می‌شود.</p>
        </div>
        <div className="flex gap-2 items-start text-[10px] sm:text-xs leading-relaxed text-muted-foreground/85 font-iran-yekan">
          <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>هزینه این سفارش هنوز پرداخت نشده‌ و در صورت اتمام موجودی، کالاها از سبد حذف می‌شوند.</p>
        </div>
      </div>
    </Card>
  );
}