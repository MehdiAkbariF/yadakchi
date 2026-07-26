'use client';

import { cn } from '@/design-system/utils/cn';
import { Button } from '@/components/primitives/Button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis-end', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, 'ellipsis-start', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', totalPages);
      }
    }

    return pages.map((page, index) => {
      if (typeof page === 'string') {
        return (
          <div key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center text-muted-foreground shrink-0 select-none">
            <MoreHorizontal className="h-4 w-4" />
          </div>
        );
      }

      const isActive = page === currentPage;

      return (
        <button
          key={`page-${page}`}
          onClick={() => onPageChange(page)}
          className={cn(
            "w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-iran-yekan font-bold transition-all select-none shrink-0",
            isActive 
              ? "bg-primary border-primary text-white shadow-md scale-105" 
              : "bg-background text-foreground hover:border-primary/30 hover:bg-primary/5"
          )}
        >
          {new Intl.NumberFormat('fa-IR').format(page)}
        </button>
      );
    });
  };

  return (
    <div className={cn("flex items-center justify-center gap-2 select-none py-6", className)}>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-xl border shrink-0"
        aria-label="Previous Page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {renderPages()}
      </div>

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-xl border shrink-0"
        aria-label="Next Page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}