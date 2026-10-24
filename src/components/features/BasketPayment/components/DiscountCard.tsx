'use client';

import * as React from 'react';
import { Tag, Sparkles, ArrowLeft } from 'lucide-react';
import { Card, CardBody } from '@/components/composites/Card';
import { Input } from '@/components/primitives/Input/Input';
import { Button } from '@/components/primitives/Button';
import { useApplyDiscountCode, useGetUserDiscountCodes } from '@/domains/front/basket/hooks/basket.hooks';
import { showToast } from '@/core/utils/toast';

export function DiscountCard() {
  const applyDiscount = useApplyDiscountCode();
  const { data: discountCodes = [] } = useGetUserDiscountCodes();
  const [code, setCode] = React.useState('');

  const handleApply = async (codeToApply?: string) => {
    const finalCode = (codeToApply || code).trim();
    if (!finalCode) {
      showToast.error('لطفاً ابتدا کد تخفیف را وارد کنید');
      return;
    }
    try {
      await applyDiscount.mutateAsync(finalCode);
      showToast.success('کد تخفیف با موفقیت روی سفارش شما اعمال شد');
      setCode('');
    } catch (err: any) {
      showToast.error(err.userMessage || 'کد تخفیف وارد شده معتبر نیست یا منقضی شده است');
    }
  };

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('fa-IR').format(val / 10) + ' تومان';

  return (
    <Card className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-none">
      <CardBody className="flex flex-col gap-4 p-4 sm:p-5">
        
        {/* بخش بالایی: عنوان و توضیحات - راست‌چین */}
        <div className="flex w-full flex-col items-start justify-start text-right gap-1">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-shop" />
            <span className="text-sm font-bold text-shop">کد تخفیف</span>
          </div>
          <span className="text-xs text-muted-foreground">
            اگر کد تخفیف دارین لطفا وارد کنین
          </span>
        </div>

        {/* بخش پایین: فیلد ورودی و دکمه */}
        <div className="flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 mt-2">
          {/* فیلد ورودی اول می‌آید تا در راست قرار بگیرد */}
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="کد تخفیف را وارد کنید"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              className="h-10 rounded-md border-border/80 text-xs text-left dir-ltr placeholder:text-right"
            />
          </div>
          
          <Button
            variant="primary"
            onClick={() => handleApply()}
            isLoading={applyDiscount.isPending}
            className="h-10 rounded-md px-8 text-xs font-bold bg-shop text-shop-foreground hover:bg-shop-hover shrink-0"
          >
            ثبت کد
          </Button>
        </div>

        {/* کدهای تخفیف اختصاصی کاربر (در صورت وجود) */}
        {discountCodes && discountCodes.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2.5 border-t border-dashed border-border pt-4">
            <span className="flex items-center justify-start gap-1.5 text-2xs font-bold text-foreground">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-warning" />
              کدهای تخفیف فعال در کیف شما:
            </span>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {discountCodes.map((d: any) => (
                <div
                  key={d.id}
                  onClick={() => handleApply(d.code)}
                  className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-md border border-dashed border-shop/40 bg-shop/5 p-3 transition-all duration-fast hover:border-shop hover:bg-shop/10"
                >
                  <div className="flex flex-col items-start gap-0.5 text-right">
                    <span className="font-mono text-xs font-bold text-shop tracking-wider dir-ltr">
                      {d.code}
                    </span>
                    <span className="text-2xs text-muted-foreground">
                      مبلغ تخفیف: <strong className="text-foreground">{formatPrice(d.amount)}</strong>
                    </span>
                  </div>
                  
                  <span className="flex items-center gap-1 text-2xs font-bold text-shop transition-transform group-hover:-translate-x-1">
                    <ArrowLeft className="h-3 w-3" />
                    <span>اعمال</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}