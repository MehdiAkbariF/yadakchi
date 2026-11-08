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

function getString(val: string | string[] | undefined): string | null {
  if (Array.isArray(val)) return val[0] ?? null;
  return val ?? null;
}

function getNumber(val: string | string[] | undefined): number {
  const str = getString(val);
  if (!str) return 0;
  const num = Number(str);
  return isNaN(num) ? 0 : num;
}

export default async function PaymentResultPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // استخراج امن پارامترها با پشتیبانی از حروف بزرگ و کوچک درگاه
  const payload = {
    refNum: getString(params.RefNum) || getString(params.refNum),
    status: getString(params.Status) || getString(params.status) || getString(params.State) || getString(params.state),
    token: getString(params.Token) || getString(params.token),
    traceNo: getString(params.TraceNo) || getString(params.traceNo),
    affectiveAmount:
      getNumber(params.AffectiveAmount) ||
      getNumber(params.affectiveAmount) ||
      getNumber(params.Amount) ||
      getNumber(params.amount),
  };

  return <PaymentCallbackContent payload={payload} />;
}