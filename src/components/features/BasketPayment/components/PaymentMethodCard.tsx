'use client';

import * as React from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/composites/Card';

// لوگوی اختصاصی وکتور بانک ملت
function MellatLogo({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <circle cx="24" cy="24" r="22" fill="#E11D48" />
      <circle cx="24" cy="24" r="14" fill="#881337" />
      <path d="M24 14v20M14 24h20" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <circle cx="24" cy="24" r="5" fill="#FFE4E6" />
    </svg>
  );
}

// لوگوی اختصاصی وکتور بانک سامان
function SamanLogo({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <rect width="48" height="48" rx="12" fill="#0284C7" />
      <path
        d="M14 34L24 14l10 20H14z"
        fill="#FFFFFF"
      />
      <circle cx="24" cy="27" r="4" fill="#0284C7" />
    </svg>
  );
}

// لوگوی اختصاصی وکتور بانک پارسیان
function ParsianLogo({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <rect width="48" height="48" rx="12" fill="#991B1B" />
      <path
        d="M24 12c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 18a6 6 0 110-12 6 6 0 010 12z"
        fill="#FBBF24"
      />
    </svg>
  );
}

// لوگوی اختصاصی وکتور بانک پاسارگاد
function PasargadLogo({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <rect width="48" height="48" rx="12" fill="#D97706" />
      <path
        d="M16 34V14h8c4.418 0 8 3.582 8 8s-3.582 8-8 8h-4v4h-4zm4-8h4c2.209 0 4-1.791 4-4s-1.791-4-4-4h-4v8z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// لوگوی نماد شبکه شاپرک
function ShaparakLogo({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <rect width="48" height="48" rx="12" fill="#1E293B" />
      <circle cx="24" cy="24" r="10" stroke="#38BDF8" strokeWidth="3" />
      <path d="M24 18v12M18 24h12" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const SUPPORTED_BANKS = [
  { name: 'بانک ملت', logo: MellatLogo, color: 'hover:border-rose-300' },
  { name: 'بانک سامان', logo: SamanLogo, color: 'hover:border-sky-300' },
  { name: 'بانک پارسیان', logo: ParsianLogo, color: 'hover:border-amber-300' },
  { name: 'بانک پاسارگاد', logo: PasargadLogo, color: 'hover:border-yellow-400' },
  { name: 'شبکه شاپرک', logo: ShaparakLogo, color: 'hover:border-cyan-300' },
];

export function PaymentMethodCard() {
  return (
    <Card className="w-full overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
      <CardHeader className="flex items-center justify-between border-b border-border/60 bg-card px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CreditCard aria-hidden="true" className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-foreground">انتخاب شیوه پرداخت</span>
        </div>

        <div className="flex items-center gap-1.5 text-2xs font-semibold text-success">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>پرداخت امن شتابی</span>
        </div>
      </CardHeader>

      <CardBody className="flex flex-col gap-5 p-5">
        {/* روش فعال پرداخت */}
        <div className="relative flex items-start justify-between rounded-xl border-2 border-primary bg-primary/[0.03] p-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  درگاه مستقیم بانکی (پرداخت اینترنتی)
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-2xs font-bold text-primary">
                  پیشنهادی
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                پرداخت سریع و آنلاین با کلیه کارت‌های عضو شبکه شتاب با رمز دوم پویا
              </p>
            </div>
          </div>

          <Lock className="hidden h-5 w-5 text-primary/60 sm:block" />
        </div>

        {/* بخش لوگوهای بانک‌های عضو با طراحی مدرن */}
        <div className="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-secondary/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-muted-foreground">
              پشتیبانی از درگاه‌های رسمی بانک‌های معتبر کشور:
            </span>
            <span className="text-2xs text-muted-foreground">اتصال هوشمند به خلوت‌ترین درگاه</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {SUPPORTED_BANKS.map((b) => {
              const Icon = b.logo;
              return (
                <div
                  key={b.name}
                  className={`flex items-center gap-2 rounded-lg border border-border/70 bg-card p-2 shadow-2xs transition-all duration-fast ${b.color} hover:shadow-xs`}
                >
                  <Icon className="h-6 w-6 shrink-0 rounded-md" />
                  <span className="text-xs font-semibold text-foreground/90">{b.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}