// src/components/sections/Header/components/CategoryDropdown/CategoryDropdown.tsx

'use client';

import Link from 'next/link';
import { CATEGORY_DROPDOWN } from '../../constants/header.constants';

interface CategoryDropdownProps {
  isOpen: boolean;
}

export function CategoryDropdown({ isOpen }: CategoryDropdownProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-1 w-56 bg-background border rounded-lg shadow-lg py-2 z-50">
      {CATEGORY_DROPDOWN.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}