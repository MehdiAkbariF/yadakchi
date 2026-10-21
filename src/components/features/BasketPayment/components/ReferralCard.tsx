'use client';

import * as React from 'react';
import { Gift } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/composites/Card';
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
    <Card className="w-full overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
      <CardHeader className="flex items-center justify-between border-b border-border/60 bg-card px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Gift aria-hidden="true" className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-foreground">کد معرف (هدیه دوستان)</span>
        </div>
      </CardHeader>

      <CardBody className="flex flex-col gap-3 p-5">
        <p className="text-xs leading-relaxed text-muted-foreground">
          با ثبت کد معرف، ۱۰۰,۰۰۰ تومان اعتبار خرید به کیف پول شما و دوستتان اضافه خواهد شد.
        </p>

        <div className="flex w-full items-center gap-2">
          <Input
            placeholder="کد معرف ۶ رقمی را وارد کنید..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            className="h-10.5 flex-1 rounded-lg text-xs"
          />
          <Button
            variant="outline"
            onClick={handleApply}
            isLoading={applyReferral.isPending}
            className="h-10 rounded-lg border-border px-5 text-xs font-bold transition-colors hover:border-primary/50 hover:bg-secondary/40"
          >
            ثبت معرف
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}