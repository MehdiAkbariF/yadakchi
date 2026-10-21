'use client';

import Link from 'next/link';
import { ShoppingCart, ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, CardTitle } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button';

export interface BasketInvoiceProps {
  basket: any;
}

export function BasketInvoice({ basket }: BasketInvoiceProps) {
  const formatNumber = (val: number) => new Intl.NumberFormat('fa-IR').format(val);

  return (
    <Card className="h-fit w-full shrink-0 p-5 shadow-xs lg:w-[360px]">
      <CardTitle className="mb-4 flex items-center gap-2 border-b border-border pb-3 font-bold text-foreground">
        <ShoppingCart aria-hidden="true" className="h-5 w-5 text-primary" />
        <span>صورتحساب</span>
      </CardTitle>

      <div className="mb-4 space-y-4 border-b border-border pb-4">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>قیمت محصولات ({formatNumber(basket.summary.itemCount)} قطعه)</span>
          <span>{basket.total.totalPrice}</span>
        </div>

        {basket.total.totalDiscountRaw > 0 ? (
          <div className="flex items-center justify-between text-xs font-bold text-destructive">
            <span>تخفیف‌ها</span>
            <span>- {basket.total.totalDiscount}</span>
          </div>
        ) : null}
      </div>

      <div className="mb-5 flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground">جمع کل</span>
        <span className="text-lg font-bold text-foreground">{basket.total.finalPrice}</span>
      </div>

      <Link href="/checkout" className="block w-full">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="flex h-11 items-center justify-center gap-1 text-xs font-bold shadow-xs"
        >
          <span>ادامه فرآیند خرید</span>
          <ArrowLeft aria-hidden="true" className="me-1 h-4 w-4" />
        </Button>
      </Link>

      <div className="mt-5 flex flex-col gap-3 border-t border-dashed border-border pt-4">
        <div className="flex items-start gap-2 text-2xs leading-relaxed text-muted-foreground sm:text-xs">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            در صورتی که کالایی در سبد خرید، ناموجود یا غیر فعال شده است، با ادامه دادن به خرید، کالا به صورت خودکار از سبد خرید شما حذف می‌شود.
          </p>
        </div>
        <div className="flex items-start gap-2 text-2xs leading-relaxed text-muted-foreground sm:text-xs">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            هزینه این سفارش هنوز پرداخت نشده‌ و در صورت اتمام موجودی، کالاها از سبد حذف می‌شوند.
          </p>
        </div>
      </div>
    </Card>
  );
}