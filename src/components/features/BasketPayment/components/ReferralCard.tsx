'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/composites/Card';
import { Input } from '@/components/primitives/Input/Input';
import { Button } from '@/components/primitives/Button';
import { useApplyReferralCode } from '@/domains/front/basket/hooks/basket.hooks';
import { showToast } from '@/core/utils/toast';

export function ReferralCard() {
  const applyReferral = useApplyReferralCode();
  const [code, setCode] = useState('');

  const handleApply = async () => {
    if (!code.trim()) {
      showToast.error('لطفا کد معرف را وارد کنید');
      return;
    }
    try {
      await applyReferral.mutateAsync(code);
      showToast.success('کد معرف اعمال شد و اعتبار به حساب کاربری تخصیص یافت');
      setCode('');
    } catch (err: any) {
      showToast.error(err.userMessage || 'کد معرف وارد شده معتبر نیست');
    }
  };

  return (
    <Card className="w-full overflow-hidden  rounded-xl shadow-sm bg-background">
      <CardHeader className="border-b bg-muted/20 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4.5 w-4.5 text-primary" />
          <span className="text-sm font-bold font-iran-yekan text-foreground">ثبت کد معرف</span>
        </div>
      </CardHeader>
      <CardBody className="p-5 flex flex-col gap-3">
        <p className="text-xs text-muted-foreground font-iran-sans leading-relaxed">
          با وارد کردن کد معرف، هم دوستت و هم خودت (۱,۰۰۰,۰۰۰ ریال) اعتبار خرید دریافت می‌کنید.
        </p>
        <div className="flex gap-2 w-full mt-1">
          <Input
            placeholder="کد معرف را وارد کنید"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 font-iran-sans text-xs h-10 w-full"
          />
          <Button
            variant="outline"
            onClick={handleApply}
            isLoading={applyReferral.isPending}
            className="px-5 text-xs font-bold font-iran-sans h-10 rounded-xl"
          >
            ثبت معرف
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}