// src/components/sections/Header/components/CitySelector/CitySelector.tsx

'use client';

import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export function CitySelector() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      className="flex items-center gap-1 text-xs xl:text-sm hover:text-primary transition-colors whitespace-nowrap"
      onClick={() => setIsOpen(!isOpen)}
      aria-label="انتخاب شهر"
    >
      <MapPin className="h-3 w-3 xl:h-4 xl:w-4" />
      <span className="hidden 2xl:inline">شهر خود را انتخاب کنید</span>
      <span className="inline 2xl:hidden">شهر</span>
      <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
    </button>
  );
}