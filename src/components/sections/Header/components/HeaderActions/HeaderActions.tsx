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
    <div className="flex items-center gap-2 sm:gap-2.5">
      <SellerButton />
      <div className="hidden sm:block">
        <ThemeToggle />
      </div>
      <AuthButton />
      <CartButton />
      <div className="border-s border-border/60 ps-1.5 lg:hidden">
        <MobileMenuToggle isOpen={isMobileMenuOpen} onClick={onMobileMenuToggle} />
      </div>
    </div>
  );
}