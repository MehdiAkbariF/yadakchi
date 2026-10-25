'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ShoppingBag,
  Wallet,
  Heart,
  MapPin,
  MessageSquare,
  Bell,
  Eye,
  Settings,
  LogOut,
  Copy,
  ChevronLeft,
  Headphones,
} from 'lucide-react';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { useGetWalletBalances } from '@/domains/userpanel/hooks/userpanel.hooks';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'داشبورد کاربری', icon: Home, href: '/profile' },
  { id: 'orders', label: 'سفارش‌های من', icon: ShoppingBag, href: '/profile/orders' },
  { id: 'wallet', label: 'کیف پول و تسویه', icon: Wallet, href: '/profile/wallet' },
  { id: 'support', label: 'تیکت‌های پشتیبانی', icon: Headphones, href: '/profile/support' },
  { id: 'favorites', label: 'کالاهای محبوب', icon: Heart, href: '/profile/favorites' },
  { id: 'addresses', label: 'آدرس‌های من', icon: MapPin, href: '/profile/addresses' },
  { id: 'comments', label: 'نظرات و پرسش‌ها', icon: MessageSquare, href: '/profile/comments' },
  { id: 'notifications', label: 'پیام‌ها و اعلان‌ها', icon: Bell, href: '/profile/notifications' },
  { id: 'history', label: 'کالاهای دیده شده', icon: Eye, href: '/profile/history' },
  { id: 'settings', label: 'اطلاعات حساب کاربری', icon: Settings, href: '/profile/settings' },
];

export function ProfileDesktopNav() {
  const pathname = usePathname();
  const { user, logout, isLoggingOut } = useAuth();
  const { data: wallet } = useGetWalletBalances();

  const handleCopyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      showToast.success('کد معرف کپی شد');
    }
  };

  return (
    <aside className="sticky top-24 hidden w-72 shrink-0 flex-col gap-4 lg:flex">
      {/* کارد اطلاعات کاربری */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-4.5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-base border border-primary/20">
            {user?.fullName ? user.fullName[0] : 'U'}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-bold text-foreground">
              {user?.fullName || user?.lastName || 'کاربر یدک‌چی'}
            </span>
            <span className="text-2xs text-muted-foreground  mt-0.5" dir="ltr">
              {user?.phoneNumber || user?.userName}
            </span>
          </div>
        </div>

        {/* موجودی سریع */}
        <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 border border-border/40">
          <div className="flex flex-col">
            <span className="text-3xs text-muted-foreground">کیف پول</span>
            <span className="text-xs font-bold text-foreground mt-0.5">
              {wallet?.totalBalance || '۰ تومان'}
            </span>
          </div>
          <Link
            href="/profile/wallet"
            className="text-2xs font-bold text-primary hover:underline"
          >
            برداشت وجه
          </Link>
        </div>

        {/* کد معرف با کپی سریع */}
        {user?.referralCode && (
          <div className="flex items-center justify-between rounded-xl border border-dashed border-border px-3 py-2 text-2xs">
            <span className="text-muted-foreground">کد معرف:</span>
            <button
              type="button"
              onClick={handleCopyReferral}
              className="flex items-center gap-1.5  font-bold text-foreground hover:text-primary transition-colors"
            >
              <span>{user.referralCode}</span>
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* منوی ناوبری اصلی */}
      <nav className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-card p-2 shadow-xs">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/profile'
            ? pathname === '/profile'
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('h-4 w-4 transition-colors', isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
                <span>{item.label}</span>
              </div>
              <ChevronLeft className={cn('h-3.5 w-3.5 opacity-50 transition-transform', isActive && 'rotate-180 opacity-100')} />
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => logout(undefined)}
          disabled={isLoggingOut}
          className="mt-2 flex items-center gap-3 rounded-xl border-t border-border/60 px-3.5 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>خروج از حساب</span>
        </button>
      </nav>
    </aside>
  );
}