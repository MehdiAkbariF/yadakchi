// src/components/sections/Header/components/MobileMenu/MobileMenu.tsx

'use client';

import Link from 'next/link';
import { Car, MapPin, ShoppingCart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { NAV_ITEMS } from '../../constants/header.constants';
import { useAuth, useLogout } from '@/domains/auth/hooks/auth.hooks';
import { useGetBasket } from '@/domains/front/basket/hooks/basket.hooks';

interface MobileMenuProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  onClose?: () => void;
}

export function MobileMenu({ isOpen, isAuthenticated, onClose }: MobileMenuProps) {
  const logoutMutation = useLogout();
  const { data: basket } = useGetBasket();

  if (!isOpen) return null;

  const handleLogout = () => {
    logoutMutation.mutate(undefined);
    onClose?.();
  };

  return (
    <div className="md:hidden border-t p-4 space-y-4 bg-background">
      {/* منوی اصلی (بدون جستجو) */}
      <div className="space-y-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-2 py-2 text-sm hover:text-primary transition-colors"
            onClick={onClose}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>

      {/* بخش‌های اضافی */}
      <div className="border-t pt-3 space-y-2">
        <Link href="/my-car" className="flex items-center gap-2 py-2 text-sm hover:text-primary transition-colors" onClick={onClose}>
          <Car className="h-4 w-4" />
          ماشین من
        </Link>
        <button className="flex items-center gap-2 py-2 text-sm hover:text-primary transition-colors w-full text-right">
          <MapPin className="h-4 w-4" />
          شهر خود را انتخاب کنید
        </button>
      </div>

      {/* سبد خرید و احراز هویت */}
      <div className="border-t pt-3 space-y-3">
        {/* سبد خرید */}
        <Link href="/basket" className="flex items-center justify-between py-2" onClick={onClose}>
          <div className="flex items-center gap-2 text-sm">
            <ShoppingCart className="h-4 w-4" />
            سبد خرید
          </div>
          {basket && basket.summary.itemCount > 0 && (
            <Badge variant="destructive" size="sm">
              {basket.summary.itemCount}
            </Badge>
          )}
        </Link>

        {/* ورود/خروج */}
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 py-2 text-sm text-destructive hover:text-destructive/80 transition-colors w-full text-right"
          >
            <LogOut className="h-4 w-4" />
            خروج از حساب
          </button>
        ) : (
          <Link href="/login" onClick={onClose}>
            <Button variant="primary" size="sm" fullWidth>
              ورود / ثبت‌نام
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}