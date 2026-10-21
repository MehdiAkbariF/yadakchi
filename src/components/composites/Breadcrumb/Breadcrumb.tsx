'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export interface BreadcrumbItem {
  id: string;
  title: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items = [], className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="مسیر صفحه"
      className={cn(
        'w-full flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1',
        'text-2xs md:text-xs text-muted-foreground',
        className
      )}
    >
      <Link
        href="/"
        className="shrink-0 transition-colors hover:text-primary"
      >
        خانه
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={item.id} className="flex shrink-0 items-center gap-1.5">
            <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-border" />
            {isLast || !item.href ? (
              <span
                aria-current={isLast ? 'page' : undefined}
                className="max-w-[120px] truncate font-semibold text-foreground sm:max-w-none"
              >
                {item.title}
              </span>
            ) : (
              <Link
                href={item.href}
                className="shrink-0 transition-colors hover:text-primary"
              >
                {item.title}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}