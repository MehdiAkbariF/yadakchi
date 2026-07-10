// src/components/sections/Header/Header.tsx

'use client';

import Link from 'next/link';
import { Menu, ShoppingCart, User, LogOut, Heart } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Button } from '@/components/primitives/Button';
import { Typography } from '@/components/primitives/Typography';
import { Badge } from '@/components/primitives/Badge';
import { SearchBar } from '@/components/features/SearchBar';
import { useAuth, useLogout } from '@/domains/auth/hooks/auth.hooks';
import { useGetBasket } from '@/domains/front/basket/hooks/basket.hooks';

export interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const { data: basket } = useGetBasket();

  const handleLogout = () => {
    logoutMutation.mutate(undefined);
  };

  return (
    <header className={cn('border-b bg-background', className)}>
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">Y</span>
          </div>
          <Typography variant="h5" className="hidden sm:block">
            یادکچی
          </Typography>
        </Link>

        {/* Search Bar - وسط */}
        <div className="flex-1 max-w-xl hidden md:block">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Wishlist */}
          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              <span className="sr-only">علاقه‌مندی‌ها</span>
            </Button>
          </Link>

          {/* Basket */}
          <Link href="/basket">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {basket && basket.summary.itemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  size="sm" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {basket.summary.itemCount}
                </Badge>
              )}
              <span className="sr-only">سبد خرید</span>
            </Button>
          </Link>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">پروفایل</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">خروج</span>
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm">
                ورود / ثبت‌نام
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">منو</span>
          </Button>
        </div>
      </div>
    </header>
  );
}