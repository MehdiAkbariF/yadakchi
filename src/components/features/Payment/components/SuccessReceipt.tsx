'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/primitives/Button';
import { toPersianDigits } from '@/core/utils/formatters';

export interface SuccessReceiptProps {
  amount: number;
  traceNo: string;
}

export function SuccessReceipt({ amount, traceNo }: SuccessReceiptProps) {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const animationDataRef = React.useRef<any>(null);
  const animInstanceRef = React.useRef<any>(null);

  React.useEffect(() => {
    let cancelled = false;

    fetch('/anumations/Payment-ok.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        animationDataRef.current = data;
        initLottie();
      })
      .catch((err) => {
        console.error('[SuccessReceipt] Failed to load animation JSON:', err);
      });

    return () => {
      cancelled = true;
      animInstanceRef.current?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initLottie = async () => {
    if (!containerRef.current || !animationDataRef.current) return;

    try {
      const mod: any = await import('lottie-web');
      const lottie = mod?.default ?? mod;

      if (!lottie?.loadAnimation) {
        console.error('[SuccessReceipt] lottie-web not available:', mod);
        return;
      }

      animInstanceRef.current?.destroy?.();

      animInstanceRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        animationData: animationDataRef.current,
        rendererSettings: {
          // ⭐ پر کردن کامل container (بدون فضای خالی)
          preserveAspectRatio: 'xMidYMid slice',
        },
      });
    } catch (err) {
      console.error('[SuccessReceipt] Lottie init failed:', err);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center" dir="rtl">
      <div className="my-auto flex flex-col items-center justify-center gap-y-1 text-center">
        {/* ⭐ Lottie کوچک‌تر + بدون فاصله اضافی */}
        <div
          ref={containerRef}
          className="mx-auto h-[6.875rem] w-[6.875rem] -mb-2"
          aria-label="انیمیشن پرداخت موفق"
        />

        <p className="text-base font-extrabold text-success">
          پرداخت با موفقیت انجام شد
        </p>

        <div className="mt-2 flex items-center justify-center gap-x-2">
          <p className="text-center text-base font-extrabold text-foreground">مبلغ:</p>
          <p className="text-base text-foreground">
            {toPersianDigits(amount)}{' '}
            <span className="text-xs text-muted-foreground">ریال</span>
          </p>
        </div>

        {traceNo && traceNo !== '-' && (
          <div className="flex items-center justify-center gap-x-2 text-[0.9375rem]">
            <p className="text-center text-base text-muted-foreground">شماره پیگیری:</p>
            <p className="text-title-sm">{traceNo}</p>
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="mt-6 h-11 rounded-xl border border-shop px-8 text-sm font-bold text-shop hover:bg-shop/5"
        >
          بازگشت به یدکچی
        </Button>
      </div>
    </div>
  );
}