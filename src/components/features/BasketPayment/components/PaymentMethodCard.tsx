'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardBody } from '@/components/composites/Card';
import { cn } from '@/design-system/utils/cn';

export function PaymentMethodCard() {
  return (
    <Card className="w-full overflow-hidden rounded-lg border border-primary/20 bg-primary/5 shadow-none">
      <CardBody className="flex flex-col gap-4 p-4 sm:p-5">
        
        {/* بخش بالایی: انتخاب روش پرداخت و لوگوی اصلی */}
        <div className="flex items-start justify-between gap-4">
          
          {/* دکمه رادیویی و متن‌ها */}
          <div className="flex items-start gap-3">
            {/* دکمه رادیویی با رنگ آبی دیزاین سیستم (shop) */}
            <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-shop bg-card">
              <div className="h-2.5 w-2.5 rounded-full bg-shop" />
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-foreground">
                درگاه بانکی (پرداخت اینترنتی)
              </span>
              <span className="text-xs text-muted-foreground">
                پرداخت از تمامی بانک های عضو شتاب
              </span>
            </div>
          </div>

          {/* لوگوی اصلی شتاب */}
          {/* <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-border/50 bg-card p-1 shadow-xs">
            <svg viewBox="0 0 48 24" className="h-full w-full object-contain">
              <rect x="2" y="4" width="8" height="16" rx="2" fill="var(--shop)" />
              <rect x="12" y="4" width="8" height="16" rx="2" fill="var(--shop)" opacity="0.8"/>
              <rect x="22" y="4" width="8" height="16" rx="2" fill="var(--shop)" opacity="0.6"/>
              <rect x="32" y="4" width="8" height="16" rx="2" fill="var(--shop)" opacity="0.4"/>
            </svg>
          </div> */}
        </div>

        {/* بخش پایینی: لوگوهای بانک‌ها */}
        <div className="mt-2 flex items-center justify-end gap-2">
          {[
            { src: '/banks-logo/parsian.png', alt: 'بانک پارسیان' },
            { src: '/banks-logo/pasargad.jpg', alt: 'بانک پاسارگاد' },
            { src: '/banks-logo/saman.png', alt: 'بانک سامان' },
            { src: '/banks-logo/tejarat.png', alt: 'بانک تجارت' },
          ].map((bank) => (
            <div
              key={bank.alt}
              className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-card shadow-xs"
            >
              <Image
                src={bank.src}
                alt={bank.alt}
                width={36}
                height={36}
                className="object-contain p-0.5"
              />
            </div>
          ))}
          
          {/* دکمه ... برای نمایش بقیه بانک‌ها */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card text-xs font-bold text-muted-foreground shadow-xs">
            ...
          </div>
        </div>

      </CardBody>
    </Card>
  );
}