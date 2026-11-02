'use client';

import * as React from 'react';
import { cn } from '@/design-system/utils/cn';

export interface FlowLayoutProps {
  children: React.ReactNode;
  contentClassName?: string;
  hasBottomAction?: boolean;
}

/**
 * wrapper صفحات flow (برای padding و spacing).
 * هدر در Header.tsx مدیریت می‌شود، نه اینجا.
 */
export function FlowLayout({
  children,
  contentClassName,
  hasBottomAction = true,
}: FlowLayoutProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full py-6 md:px-6 lg:px-8',
        hasBottomAction && 'pb-28 lg:pb-8',
        'lg:mt-2',
        contentClassName
      )}
    >
      {children}
    </div>
  );
}