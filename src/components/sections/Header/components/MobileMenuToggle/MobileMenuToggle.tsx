// src/components/sections/Header/components/MobileMenuToggle/MobileMenuToggle.tsx

'use client';

import { Menu, X } from 'lucide-react';
import { Button } from '@/components/primitives/Button';

interface MobileMenuToggleProps {
  isOpen: boolean;
  onClick: () => void;
}

export function MobileMenuToggle({ isOpen, onClick }: MobileMenuToggleProps) {
  return (
    <Button variant="ghost" size="icon" className="md:hidden" onClick={onClick} aria-label={isOpen ? 'بستن منو' : 'باز کردن منو'}>
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  );
}