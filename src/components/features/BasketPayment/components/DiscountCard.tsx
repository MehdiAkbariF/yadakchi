'use client';

import * as React from 'react';
import { Tag, Sparkles, Check, ArrowLeft } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/composites/Card';
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
    <Card className="w-full overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
      <CardHeader className="flex items-center justify-between border-b border-border/60 bg-card px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Tag aria-hidden="true" className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-foreground">کد تخفیف</span>
        </div>
      </CardHeader>

      <CardBody className="flex flex-col gap-4 p-5">
        <div className="flex w-full items-center gap-2">
          <Input
            placeholder="کد تخفیف خود را اینجا وارد کنید..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            className="h-10.5 flex-1 rounded-lg text-xs"
          />
          <Button
            variant="primary"
            onClick={() => handleApply()}
            isLoading={applyDiscount.isPending}
            className="h-10 rounded-lg px-6 text-xs font-bold shadow-xs"
          >
            اعمال کد
          </Button>
        </div>

        {/* کدهای تخفیف اختصاصی کاربر با ظاهر ووچر مدرن */}
        {discountCodes && discountCodes.length > 0 ? (
          <div className="mt-1 flex flex-col gap-2.5 border-t border-dashed border-border/70 pt-3.5">
            <span className="flex items-center gap-1.5 text-2xs font-bold text-foreground">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-warning" />
              کدهای تخفیف فعال در کیف شما:
            </span>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {discountCodes.map((d: any) => (
                <div
                  key={d.id}
                  onClick={() => handleApply(d.code)}
                  className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] p-3 transition-all duration-fast hover:border-primary hover:bg-primary/[0.07]"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs font-bold text-primary tracking-wider">
                      {d.code}
                    </span>
                    <span className="text-2xs text-muted-foreground">
                      مبلغ تخفیف: <strong className="text-foreground">{formatPrice(d.amount)}</strong>
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-2xs font-bold text-primary transition-transform group-hover:-translate-x-1">
                    <span>اعمال</span>
                    <ArrowLeft className="h-3 w-3" />
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