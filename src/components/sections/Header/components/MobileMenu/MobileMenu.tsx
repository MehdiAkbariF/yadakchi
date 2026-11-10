'use client';

import * as React from 'react';
import Link from 'next/link';
import { Car, MapPin, ShoppingCart, LogOut } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { NAV_ITEMS } from '../../constants/header.constants';
import { useLogout } from '@/domains/auth/hooks/auth.hooks';
import { useGetBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { toPersianDigits } from '@/core/utils/formatters';

interface MobileMenuProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  onClose?: () => void;
}

export function MobileMenu({ isOpen, isAuthenticated, onClose }: MobileMenuProps) {
  const logoutMutation = useLogout();
  const { data: basket } = useGetBasket();

  // بستن منو با فشردن دکمه Escape کیبورد
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    logoutMutation.mutate(undefined);
    onClose?.();
  };

  const itemCount = basket?.summary?.itemCount || 0;

  return (
    <nav
      id="mobile-navigation-drawer"
      aria-label="منوی ناوبری موبایل"
      className="md:hidden border-t border-border p-4 space-y-4 bg-card animate-in fade-in duration-200"
    >
      <div className="space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-2.5 py-2.5 px-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted/60 hover:text-primary transition-colors"
            onClick={onClose}
          >
            <item.icon aria-hidden="true" className="h-4 w-4 text-primary" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="border-t border-border/70 pt-3 space-y-1">
        <Link
          href="/my-car"
          className="flex items-center gap-2.5 py-2.5 px-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted/60 hover:text-primary transition-colors"
          onClick={onClose}
        >
          <Car aria-hidden="true" className="h-4 w-4 text-primary" />
          <span>گاراژ من</span>
        </Link>
      </div>

      <div className="border-t border-border/70 pt-3 space-y-3">
        <Link
          href="/basket"
          className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/60 transition-colors"
          onClick={onClose}
        >
          <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <ShoppingCart aria-hidden="true" className="h-4 w-4 text-primary" />
            <span>سبد خرید</span>
          </div>
          {itemCount > 0 && (
            <Badge variant="destructive" size="sm">
              {toPersianDigits(itemCount)}
            </Badge>
          )}
        </Link>

        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 py-2 px-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors w-full text-right"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            <span>خروج از حساب کاربری</span>
          </button>
        ) : (
          <Link href="/login" onClick={onClose} className="block w-full">
            <Button variant="primary" size="sm" fullWidth className="rounded-lg h-9 font-bold">
              ورود / ثبت‌نام
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}