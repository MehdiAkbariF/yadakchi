// src/components/sections/Header/components/HeaderActions/HeaderActions.tsx

'use client';

import { SellerButton } from '../SellerButton/SellerButton';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { AuthButton } from '../AuthButton/AuthButton';
import { CartButton } from '../CartButton/CartButton';
import { MobileMenuToggle } from '../MobileMenuToggle/MobileMenuToggle';

interface HeaderActionsProps {
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export function HeaderActions({ isMobileMenuOpen, onMobileMenuToggle }: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <SellerButton />
      <ThemeToggle />
      <AuthButton />
      <CartButton />
      <MobileMenuToggle isOpen={isMobileMenuOpen} onClick={onMobileMenuToggle} />
    </div>
  );
}