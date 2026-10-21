'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Button } from '@/components/primitives/Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, 'ellipsis-end', totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push(1, 'ellipsis-start', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', totalPages);
  }

  return (
    <nav
      aria-label="صفحه‌بندی"
      className={cn('flex items-center justify-center gap-2 select-none py-6', className)}
    >
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="shrink-0"
        aria-label="صفحه قبل"
      >
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {pages.map((page, index) => {
          if (typeof page === 'string') {
            return (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            );
          }
          const isActive = page === currentPage;
          return (
            <button
              key={`page-${page}`}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`صفحه ${new Intl.NumberFormat('fa-IR').format(page)}`}
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary hover:bg-accent'
              )}
            >
              {new Intl.NumberFormat('fa-IR').format(page)}
            </button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="shrink-0"
        aria-label="صفحه بعد"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
      </Button>
    </nav>
  );
}
