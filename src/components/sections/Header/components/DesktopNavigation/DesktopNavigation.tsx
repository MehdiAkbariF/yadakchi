// src/components/sections/Header/components/DesktopNavigation/DesktopNavigation.tsx

'use client';

import { useState } from 'react';
import { NAV_ITEMS } from '../../constants/header.constants';
import { NavItem } from '../NavItem/NavItem';
import { CategoryDropdown } from '../CategoryDropdown/CategoryDropdown';

export function DesktopNavigation() {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  return (
    <nav className="flex items-center gap-2 lg:gap-4 xl:gap-6">
      {NAV_ITEMS.map((item) => (
        <div
          key={item.id}
          className="relative group"
          onMouseEnter={() => item.hasDropdown && setOpenCategoryId(item.id)}
          onMouseLeave={() => item.hasDropdown && setOpenCategoryId(null)}
        >
          <NavItem
            label={item.label}
            icon={item.icon}
            href={item.href}
            hasDropdown={item.hasDropdown}
            isOpen={openCategoryId === item.id}
            className="text-xs lg:text-sm whitespace-nowrap"
          />
          {item.hasDropdown && <CategoryDropdown isOpen={openCategoryId === item.id} />}
        </div>
      ))}
    </nav>
  );
}