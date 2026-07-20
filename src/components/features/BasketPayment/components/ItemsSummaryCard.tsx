'use client';

import { Truck, ChevronLeft } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/composites/Card';

interface ItemsSummaryCardProps {
  onOpenTracking: () => void;
}

export function ItemsSummaryCard({ onOpenTracking }: ItemsSummaryCardProps) {
  return (
    <Card className="w-full overflow-hidden border rounded-xl shadow-sm bg-background">
      <CardHeader className="border-b bg-muted/20 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-4.5 w-4.5 text-primary" />
          <span className="text-sm font-bold font-iran-yekan text-foreground">کالاها و ارسال</span>
        </div>
        <span className="text-[10px] font-bold font-iran-sans text-muted-foreground bg-muted px-2.5 py-0.5 rounded-lg">۱ عدد کالا ۱ مرسوله</span>
      </CardHeader>
      <CardBody className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b pb-4 border-zinc-100 cursor-pointer group" onClick={onOpenTracking}>
          <div className="flex flex-col text-right">
            <span className="text-xs md:text-sm font-bold text-foreground font-iran-sans">کالاها در ۱ ارسال (مرسوله) به دست شما خواهد رسید.</span>
            <span className="text-[10px] md:text-xs text-muted-foreground font-iran-sans mt-0.5">اطلاع از روند ارسال و پردازش</span>
          </div>
          <span className="text-xs text-primary font-bold flex items-center gap-1 shrink-0">
            <ChevronLeft className="h-4.5 w-4.5 transform transition-transform group-hover:-translate-x-1" />
          </span>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b pb-3 border-zinc-100">
            <span className="text-xs md:text-sm font-bold font-iran-yekan text-foreground">مرسوله یک</span>
            <span className="text-[10px] md:text-xs font-bold font-iran-sans text-primary">ارسال یدکچی</span>
          </div>

          <div className="flex gap-4 items-center pt-2">
            <div className="w-16 h-16 shrink-0 rounded-xl border bg-muted/10 flex items-center justify-center overflow-hidden">
              <div className="text-[10px] font-bold font-iran-sans text-muted-foreground">Product</div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs md:text-sm font-bold text-foreground block truncate font-iran-sans">۱ عدد | قطعه نو</span>
              <span className="text-[10px] md:text-xs text-muted-foreground block mt-1 font-iran-sans">پیروز یدک</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}