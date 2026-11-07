'use client';

import { useState } from 'react';
import { NAV_ITEMS } from '../../constants/header.constants';
import { NavItem } from '../NavItem/NavItem';
import { CategoryDropdown } from '../CategoryDropdown/CategoryDropdown';

export function DesktopNavigation() {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  return (
    <nav
      className="flex h-11 items-stretch gap-1 lg:gap-3 xl:gap-5"
      dir="rtl"
      aria-label="ناوبری اصلی سایت"
    >
      {NAV_ITEMS.map((item) => {
        const hasDropdown = item.hasDropdown;
        const isOpen = openCategoryId === item.id;

        return (
          <div
            key={item.id}
            className="relative flex items-center h-full"
            onMouseEnter={() => hasDropdown && setOpenCategoryId(item.id)}
            onMouseLeave={() => hasDropdown && setOpenCategoryId(null)}
            onFocus={() => hasDropdown && setOpenCategoryId(item.id)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setOpenCategoryId(null);
              }
            }}
          >
            <NavItem
              label={item.label}
              icon={item.icon}
              href={item.href}
              hasDropdown={hasDropdown}
              isOpen={isOpen}
              className="h-full whitespace-nowrap text-xs font-semibold text-foreground/85 transition-colors hover:text-primary lg:text-sm"
            />
            {hasDropdown && <CategoryDropdown isOpen={isOpen} />}
          </div>
        );
      })}
    </nav>
  );
}