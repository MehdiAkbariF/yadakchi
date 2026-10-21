'use client';

import { useState } from 'react';
import { NAV_ITEMS } from '../../constants/header.constants';
import { NavItem } from '../NavItem/NavItem';
import { CategoryDropdown } from '../CategoryDropdown/CategoryDropdown';

export function DesktopNavigation() {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  return (
    <nav className="flex items-center gap-1 lg:gap-3 xl:gap-5">
      {NAV_ITEMS.map((item) => {
        const hasDropdown = item.hasDropdown;
        const isOpen = openCategoryId === item.id;

        return (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => hasDropdown && setOpenCategoryId(item.id)}
            onMouseLeave={() => hasDropdown && setOpenCategoryId(null)}
          >
            <NavItem
              label={item.label}
              icon={item.icon}
              href={item.href}
              hasDropdown={hasDropdown}
              isOpen={isOpen}
              className="text-xs font-medium text-foreground/90 transition-colors hover:text-primary lg:text-sm whitespace-nowrap"
            />
            {hasDropdown && <CategoryDropdown isOpen={isOpen} />}
          </div>
        );
      })}
    </nav>
  );
}