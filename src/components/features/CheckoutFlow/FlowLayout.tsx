'use client';

import * as React from 'react';
import { FlowHeader, FlowStep } from './FlowHeader';
import { cn } from '@/design-system/utils/cn';

export interface FlowLayoutProps {
  step: FlowStep;
  title?: string;
  children: React.ReactNode;
  contentClassName?: string;
  hasBottomAction?: boolean;
}

/**
 * wrapper صفحات flow.
 *
 * - در دسکتاپ: هدر/فوتر سراسری سایت بالای محتوا است (از MainLayout).
 *   پس فقط یک padding کوچک بالای محتوا می‌گذاریم.
 * - در موبایل: هدر مینیمال اختصاصی (FlowHeader) نمایش داده می‌شود.
 */
export function FlowLayout({
  step,
  title,
  children,
  contentClassName,
  hasBottomAction = true,
}: FlowLayoutProps) {
  return (
    <div className="flex min-h-[calc(100dvh-var(--header-height,0px))] flex-col">
      <FlowHeader step={step} title={title} />

      <main
        className={cn(
          'mx-auto w-full flex-1 px-4 py-6 md:px-6 lg:px-8',
          hasBottomAction && 'pb-28 lg:pb-8',
          'lg:mt-2',
          contentClassName
        )}
      >
        {children}
      </main>
    </div>
  );
}