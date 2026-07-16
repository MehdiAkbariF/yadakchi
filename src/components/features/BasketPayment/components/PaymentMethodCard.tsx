'use client';

import { CreditCard, CheckCircle2 } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/composites/Card';

export function PaymentMethodCard() {
  return (
    <Card className="w-full overflow-hidden border rounded-xl shadow-sm bg-background">
      <CardHeader className="border-b bg-muted/20 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4.5 w-4.5 text-primary" />
          <span className="text-sm font-bold font-iran-yekan text-foreground">انتخاب شیوه پرداخت</span>
        </div>
      </CardHeader>
      <CardBody className="p-5 flex flex-col gap-4">
        <div className="border border-primary bg-primary/5 rounded-xl p-4 flex items-start gap-3">
          <div className="shrink-0 mt-0.5 text-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm md:text-base font-bold text-foreground block font-iran-sans">درگاه بانکی (پرداخت اینترنتی)</span>
            <span className="text-xs text-muted-foreground block mt-1 font-iran-sans">پرداخت از تمامی بانک های عضو شتاب</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-3 justify-start">
          <span className="text-xs font-bold text-muted-foreground font-iran-sans">بانک‌های منتخب:</span>
          <div className="flex flex-wrap gap-2">
            <div className="border rounded-lg px-2.5 py-1 text-xs font-bold font-iran-sans text-zinc-500 bg-muted/30">سامان</div>
            <div className="border rounded-lg px-2.5 py-1 text-xs font-bold font-iran-sans text-zinc-500 bg-muted/30">پارسیان</div>
            <div className="border rounded-lg px-2.5 py-1 text-xs font-bold font-iran-sans text-zinc-500 bg-muted/30">ملت</div>
            <div className="border rounded-lg px-2.5 py-1 text-xs font-bold font-iran-sans text-zinc-500 bg-muted/30">پاسارگاد</div>
            <div className="border rounded-lg px-2.5 py-1 text-xs font-bold font-iran-sans text-zinc-500 bg-muted/30">سایر بانک‌ها</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}