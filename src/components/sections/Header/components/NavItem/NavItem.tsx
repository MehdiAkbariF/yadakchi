'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

interface NavItemProps {
  label: string;
  icon?: React.ElementType;
  href: string;
  hasDropdown?: boolean;
  isOpen?: boolean;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function NavItem({ 
  label, 
  icon: Icon, 
  href, 
  hasDropdown = false, 
  isOpen = false,
  className,
  onMouseEnter,
  onMouseLeave,
}: NavItemProps) {
  return (
    <div 
      className="relative flex items-center h-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={href}
        className={cn(
          "flex items-center gap-1.5 font-medium hover:text-primary transition-colors h-full px-1",
          "text-xs xl:text-sm",
          isOpen && "text-primary font-bold",
          className
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary shrink-0" />}
        <span className="whitespace-nowrap">{label}</span>
        {hasDropdown && (
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground',
              isOpen && 'rotate-180 text-primary'
            )}
          />
        )}
      </Link>
    </div>
  );
}