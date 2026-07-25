'use client';

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
      aria-label="Breadcrumb"
      className={cn(
        "w-full flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground font-iran-sans overflow-x-auto no-scrollbar py-1 select-none text-right",
        className
      )}
      dir="rtl"
    >
      <Link href="/" className="hover:text-primary transition-colors shrink-0">
        خانه
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={item.id} className="flex items-center gap-1.5 shrink-0">
            <ChevronLeft className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-700 shrink-0" />
            {isLast || !item.href ? (
              <span className="text-foreground font-bold truncate max-w-[120px] sm:max-w-none">
                {item.title}
              </span>
            ) : (
              <Link 
                href={item.href} 
                className="hover:text-primary transition-colors shrink-0"
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