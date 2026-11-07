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
    // جلوگیری از اجرای دوباره در StrictMode (dev)
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    // بررسی اولیه‌ی پارامترها
    if (payload?.status == null || !payload?.token) {
      setResult('failed');
      return;
    }

    const verify = async () => {
      try {
        await verifyPayment.mutateAsync({
          refNum: payload.refNum,
          status: payload.status!,
          token: payload.token!,
        });
        setResult('success');
      } catch (err) {
        console.error('[PaymentCallback] Backend verification failed:', err);
        setResult('failed');
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (result === 'processing') {
    return (
      <div
        className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4 text-center"
        dir="rtl"
      >
        <Loader2 className="h-10 w-10 animate-spin text-shop" />
        <p className="text-title-sm">
          در حال بررسی وضعیت پرداخت...
        </p>
        <p className="text-base text-muted-foreground">لطفاً صفحه را نبندید</p>
      </div>
    );
  }

  return result === 'success' ? (
    <SuccessReceipt amount={amount} traceNo={traceNo} />
  ) : (
    <FailedReceipt amount={amount} traceNo={traceNo} />
  );
}