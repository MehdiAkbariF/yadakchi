// src/components/features/BasketPayment/components/DiscountCard.tsx

'use client';

import { useState } from 'react';
import { Tag, Sparkles, Check } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/composites/Card';
import { Input } from '@/components/primitives/Input/Input';
import { Button } from '@/components/primitives/Button';
import { useApplyDiscountCode, useGetUserDiscountCodes } from '@/domains/front/basket/hooks/basket.hooks';
import { showToast } from '@/core/utils/toast';

export function DiscountCard() {
  const applyDiscount = useApplyDiscountCode();
  const { data: discountCodes = [] } = useGetUserDiscountCodes();
  const [code, setCode] = useState('');

  const handleApply = async (codeToApply: string) => {
    const finalCode = (codeToApply || code).trim();
    if (!finalCode) {
      showToast.error('لطفاً کد تخفیف را وارد کنید');
      return;
    }
    try {
      await applyDiscount.mutateAsync(finalCode);
      showToast.success('کد تخفیف با موفقیت بر روی سفارش اعمال شد');
      setCode('');
    } catch (err: any) {
      showToast.error(err.userMessage || 'کد تخفیف وارد شده معتبر نیست یا منقضی شده است');
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('fa-IR').format(val / 10) + ' تومان';
  };

  return (
    <Card className="w-full overflow-hidden border rounded-xl shadow-sm bg-background">
      <CardHeader className="border-b bg-muted/20 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-4.5 w-4.5 text-primary" />
          <span className="text-sm font-bold font-iran-yekan text-foreground">کد تخفیف</span>
        </div>
      </CardHeader>
      <CardBody className="p-5 flex flex-col gap-4">
        <span className="text-xs text-muted-foreground font-iran-yekan">
          اگر کد تخفیف اختصاصی دارید، آن را در کادر زیر وارد کنید:
        </span>
        
        <div className="flex gap-2 w-full">
          <Input
            placeholder="کد تخفیف را وارد کنید..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 font-iran-yekan text-xs h-10 w-full"
          />
          <Button
            variant="outline"
            onClick={() => handleApply(code)}
            isLoading={applyDiscount.isPending}
            className="px-5 text-xs font-bold font-iran-yekan h-10 rounded-xl"
          >
            ثبت کد
          </Button>
        </div>

        {discountCodes && discountCodes.length > 0 && (
          <div className="mt-2 pt-3 border-t border-dashed flex flex-col gap-2.5">
            <span className="text-[11px] font-bold text-foreground font-iran-yekan flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              کدهای تخفیف فعال در حساب شما:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {discountCodes.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleApply(d.code)}
                  className="p-2.5 border rounded-xl border-dashed hover:border-primary bg-muted/10 hover:bg-primary/5 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-black font-iran-yekan text-foreground">{d.code}</span>
                    <span className="text-[10px] text-muted-foreground font-iran-yekan">
                      مبلغ: {formatPrice(d.amount)}
                    </span>
                  </div>
                  <Button size="icon-sm" variant="ghost" className="h-7 w-7 rounded-lg text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}