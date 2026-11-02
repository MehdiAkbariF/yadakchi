// src/app/(public)/payment/callback/result/page.tsx

import type { Metadata } from 'next';
import { PaymentCallbackContent } from '@/components/features/Payment';

export const metadata: Metadata = {
  title: 'نتیجه پرداخت | یدکچی',
  description: 'نتیجه پرداخت سفارش در یدکچی',
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * استخراج رشته از مقدار searchParams
 */
function getString(val: string | string[] | undefined): string | null {
  if (Array.isArray(val)) return val[0] ?? null;
  return val ?? null;
}

/**
 * استخراج عدد از مقدار searchParams
 */
function getNumber(val: string | string[] | undefined): number {
  const str = getString(val);
  if (!str) return 0;
  const num = Number(str);
  return isNaN(num) ? 0 : num;
}

export default async function PaymentResultPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const payload = {
    refNum: getString(params.RefNum),
    status: getString(params.Status),
    token: getString(params.Token),
    traceNo: getString(params.TraceNo),
    affectiveAmount:
      getNumber(params.AffectiveAmount) || getNumber(params.Amount),
  };

  return <PaymentCallbackContent payload={payload} />;
}