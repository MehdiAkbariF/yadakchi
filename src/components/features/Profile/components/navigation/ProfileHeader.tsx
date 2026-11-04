// src/components/features/Profile/components/navigation/ProfileHeader.tsx
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowRight, Bell, LogOut } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/sections/Header/components/ThemeToggle/ThemeToggle';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';

const TITLE_MAP: Record<string, string> = {
  '/profile': 'حساب کاربری',
  '/profile/orders': 'سفارش‌های من',
  '/profile/wallet': 'کیف پول و تسویه',
  '/profile/support': 'پشتیبانی و تیکت‌ها',
  '/profile/support/new': 'ثبت تیکت جدید',
  '/profile/favorites': 'کالاهای محبوب',
  '/profile/addresses': 'آدرس‌های من',
  '/profile/comments': 'نظرات و پرسش‌ها',
  '/profile/notifications': 'پیام‌ها و اعلان‌ها',
  '/profile/history': 'بازدیدهای اخیر',
  '/profile/settings': 'اطلاعات حساب',
  '/profile/returns': 'درخواست‌های مرجوعی',
};

export function ProfileHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, isLoggingOut } = useAuth();

  const isMainDashboard = pathname === '/profile';

  let pageTitle = TITLE_MAP[pathname] || 'حساب کاربری';
  if (pathname.startsWith('/profile/orders/') && pathname !== '/profile/orders') {
    pageTitle = 'جزئیات سفارش';
  } else if (pathname.startsWith('/profile/support/') && pathname !== '/profile/support/new') {
    pageTitle = 'مکالمه تیکت';
  }

  return (
    <header
      className="sticky top-0 z-40 flex h-14 w-full select-none items-center justify-between border-b border-border/80 bg-card/90 px-4 backdrop-blur-md lg:hidden shadow-xs"
      dir="rtl"
    >
      <div className="flex items-center gap-3 min-w-0">
        {!isMainDashboard ? (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="بازگشت"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-foreground transition-all duration-fast active:scale-90 hover:bg-muted"
          >
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        ) : null}

        <h1 className="truncate text-xs sm:text-sm font-black text-foreground">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-foreground transition-all hover:bg-muted">
          <ThemeToggle />
        </div>

        <Link
          href="/profile/notifications"
          aria-label="پیام‌ها و اعلان‌ها"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-muted-foreground transition-all duration-fast active:scale-90 hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-4.5 w-4.5" />
        </Link>

        <button
          type="button"
          onClick={() => logout(undefined)}
          disabled={isLoggingOut}
          aria-label="خروج از حساب"
          title="خروج از حساب کاربری"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive transition-all duration-fast active:scale-90 hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}