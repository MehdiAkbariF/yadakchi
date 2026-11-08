// src/components/features/Payment/PaymentCallbackContent.tsx
'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { useVerifySamanPayment } from '@/domains/front/basket/hooks/basket.hooks';
import { SuccessReceipt } from './components/SuccessReceipt';
import { FailedReceipt } from './components/FailedReceipt';

export interface PaymentCallbackPayload {
  refNum?: string | null;
  status?: string | null;
  token?: string | null;
  traceNo?: string | null;
  affectiveAmount?: number;
}

export interface PaymentCallbackContentProps {
  payload: PaymentCallbackPayload;
}

type Result = 'processing' | 'success' | 'failed';

export function PaymentCallbackContent({ payload }: PaymentCallbackContentProps) {
  const verifyPayment = useVerifySamanPayment();
  const [result, setResult] = React.useState<Result>('processing');
  const hasRunRef = React.useRef(false);

  const amount = payload?.affectiveAmount ?? 0;
  const traceNo = payload?.traceNo ?? '-';

  React.useEffect(() => {
    // جلوگیری از اجرای دوباره در StrictMode
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    // اگر توکن از بانک دریافت نشده باشد مستقیماً ناموفق است
    if (!payload?.token) {
      setResult('failed');
      return;
    }

    const verify = async () => {
      try {
        await verifyPayment.mutateAsync({
          refNum: payload.refNum || '',
          status: payload.status !== null && payload.status !== undefined ? payload.status : 0,
          token: payload.token!,
        });

     
        setResult('success');
      } catch (err) {
        console.error('[PaymentCallback] Backend verification failed:', err);
        setResult('failed');
      }
    };

    verify();
  }, [payload, verifyPayment]);

  if (result === 'processing') {
    return (
      <div
        className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4 text-center"
        dir="rtl"
      >
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-title-sm font-bold text-foreground">
          در حال بررسی و تایید وضعیت پرداخت...
        </p>
        <p className="text-xs text-muted-foreground">لطفاً صفحه را نبندید یا رفرش نکنید</p>
      </div>
    );
  }

  return result === 'success' ? (
    <SuccessReceipt amount={amount} traceNo={traceNo} />
  ) : (
    <FailedReceipt amount={amount} traceNo={traceNo} />
  );
}