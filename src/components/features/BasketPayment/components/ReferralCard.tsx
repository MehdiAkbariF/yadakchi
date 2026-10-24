'use client';

import * as React from 'react';
import { User } from 'lucide-react';
import { Card, CardBody } from '@/components/composites/Card';
import { Input } from '@/components/primitives/Input/Input';
import { Button } from '@/components/primitives/Button';
import { useApplyReferralCode } from '@/domains/front/basket/hooks/basket.hooks';
import { showToast } from '@/core/utils/toast';

export function ReferralCard() {
  const applyReferral = useApplyReferralCode();
  const [code, setCode] = React.useState('');

  const handleApply = async () => {
    if (!code.trim()) {
      showToast.error('لطفاً ابتدا کد معرف را وارد کنید');
      return;
    }
    try {
      await applyReferral.mutateAsync(code);
      showToast.success('کد معرف تایید شد و اعتبار هدیه به حسابتان منظور گردید');
      setCode('');
    } catch (err: any) {
      showToast.error(err.userMessage || 'کد معرف وارد شده معتبر نیست');
    }
  };

  return (
    <Card className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-none">
      <CardBody className="flex flex-col gap-4 p-4 sm:p-5">
        
        {/* بخش بالایی: عنوان و توضیحات - راست‌چین */}
        <div className="flex w-full flex-col items-start justify-start text-right gap-1">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">ثبت کد معرف</span>
          </div>
          <span className="text-xs text-muted-foreground">
            با وارد کردن کد معرف، هم دوستت و هم خودت (۱,۰۰۰,۰۰۰ ریال) اعتبار خرید دریافت می‌کنید.
          </span>
        </div>

        {/* بخش پایین: فیلد ورودی و دکمه */}
        <div className="flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 mt-2">
          {/* فیلد ورودی اول می‌آید تا در راست قرار بگیرد */}
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="کد معرف را وارد کنید"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              className="h-10 rounded-md border-border/80 text-xs text-left dir-ltr placeholder:text-right"
            />
          </div>

          <Button
            variant="primary"
            onClick={handleApply}
            isLoading={applyReferral.isPending}
            className="h-10 rounded-md px-8 text-xs font-bold bg-shop text-shop-foreground hover:bg-shop-hover shrink-0"
          >
            ثبت کد
          </Button>
        </div>

      </CardBody>
    </Card>
  );
}