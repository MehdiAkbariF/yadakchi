'use client';

import * as React from 'react';
import { CheckCircle2, ShoppingCart, Truck, CreditCard } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import type { FlowStep } from './FlowHeader';

export interface FlowProgressBarProps {
  currentStep: FlowStep;
}

const STEPS: { key: FlowStep; label: string; icon: React.ReactNode }[] = [
  { key: 'basket', label: 'سبد خرید', icon: <ShoppingCart className="h-3 w-3" /> },
  { key: 'checkout', label: 'ارسال', icon: <Truck className="h-3 w-3" /> },
  { key: 'payment', label: 'پرداخت', icon: <CreditCard className="h-3 w-3" /> },
];

/**
 * نوار پیشرفت مراحل — آبی ملایم (`shop` token)، فقط در موبایل.
 * به زیر FlowHeader می‌چسبد (top-14).
 */
export function FlowProgressBar({ currentStep }: FlowProgressBarProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div
      className="lg:hidden fixed top-14 inset-x-0 z-30 border-b border-shop/15 bg-card/95 backdrop-blur-xl"
      dir="rtl"
      aria-label="مراحل خرید"
    >
      <div className="mx-auto flex h-9 max-w-lg items-center justify-between px-4">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isActive = idx === currentIdx;
          return (
            <React.Fragment key={step.key}>
              <div
                className={cn(
                  'flex items-center gap-1 shrink-0 transition-colors',
                  isActive && 'text-shop',
                  isDone && 'text-shop/80',
                  !isActive && !isDone && 'text-muted-foreground/50'
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full transition-colors',
                    isActive && 'bg-shop text-shop-foreground',
                    isDone && 'bg-shop/15 text-shop',
                    !isActive && !isDone && 'bg-muted text-muted-foreground/60'
                  )}
                >
                  {isDone ? <CheckCircle2 className="h-2.5 w-2.5" /> : step.icon}
                </span>
                <span
                  className={cn(
                    'text-[0.625rem]',
                    isActive && 'font-black',
                    isDone && 'font-bold',
                    !isActive && !isDone && 'font-medium'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-1.5 h-[0.125rem] flex-1 rounded-full transition-colors',
                    idx < currentIdx ? 'bg-shop/50' : 'bg-border'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}