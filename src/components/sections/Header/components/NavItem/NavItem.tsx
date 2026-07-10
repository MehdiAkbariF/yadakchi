// src/components/sections/Header/components/NavItem/NavItem.tsx

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
      className="relative group"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={href}
        className={cn(
          "flex items-center gap-1 font-medium hover:text-primary transition-colors py-2",
          "text-xs xl:text-sm",
          className
        )}
      >
        {Icon && <Icon className="h-3 w-3 xl:h-4 xl:w-4" />}
        <span className="whitespace-nowrap">{label}</span>
        {hasDropdown && (
          <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
        )}
      </Link>
    </div>
  );
}