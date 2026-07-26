'use client';

import { useState } from 'react';
import { Tag } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/composites/Card';
import { Input } from '@/components/primitives/Input/Input';
import { Button } from '@/components/primitives/Button';
import { useApplyDiscountCode } from '@/domains/front/basket/hooks/basket.hooks';
import { showToast } from '@/core/utils/toast';

export function DiscountCard() {
  const applyDiscount = useApplyDiscountCode();
  const [code, setCode] = useState('');

  const handleApply = async () => {
    if (!code.trim()) {
      showToast.error('لطفا کد تخفیف را وارد کنید');
      return;
    }
    try {
      await applyDiscount.mutateAsync(code);
      showToast.success('کد تخفیف با موفقیت اعمال شد');
      setCode('');
    } catch (err: any) {
      showToast.error(err.userMessage || 'کد تخفیف وارد شده معتبر نیست');
    }
  };

  return (
    <Card className="w-full overflow-hidden border rounded-xl shadow-sm bg-background">
      <CardHeader className="border-b bg-muted/20 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-4.5 w-4.5 text-primary" />
          <span className="text-sm font-bold font-iran-yekan text-foreground">کد تخفیف</span>
        </div>
      </CardHeader>
      <CardBody className="p-5 flex flex-col gap-3">
        <span className="text-xs text-muted-foreground font-iran-yekan block">اگر کد تخفیف دارین لطفا وارد کنین</span>
        <div className="flex gap-2 w-full mt-1">
          <Input
            placeholder="کد تخفیف را وارد کنید"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 font-iran-yekan text-xs h-10 w-full"
          />
          <Button
            variant="outline"
            onClick={handleApply}
            isLoading={applyDiscount.isPending}
            className="px-5 text-xs font-bold font-iran-yekan h-10 rounded-xl"
          >
            ثبت کد
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}