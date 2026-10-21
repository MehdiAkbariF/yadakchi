'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  ShoppingBag,
  Headphones,
  Wallet,
  Heart,
  MapPin,
  MessageSquare,
  Bell,
  Eye,
  Settings,
  LogOut,
  Copy,
  Share2,
  ChevronLeft,
} from 'lucide-react';
import { Card } from '@/components/composites/Card';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { useGetWalletBalances } from '@/domains/userpanel/hooks/userpanel.hooks';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

const MENU_ITEMS = [
  { id: 'orders', label: 'سفارش‌های من', icon: ShoppingBag, href: '/profile/orders' },
  { id: 'support', label: 'پشتیبانی', icon: Headphones, href: '/profile/support' },
  { id: 'wallet', label: 'کیف پول من', icon: Wallet, href: '/profile/wallet' },
  { id: 'favorites', label: 'کالاها و فروشگاه‌های محبوب', icon: Heart, href: '/profile/favorites' },
  { id: 'addresses', label: 'آدرس‌های من', icon: MapPin, href: '/profile/addresses' },
  { id: 'comments', label: 'نظرات و پرسش‌ها', icon: MessageSquare, href: '/profile/comments' },
  { id: 'notifications', label: 'پیام‌ها', icon: Bell, href: '/profile/notifications' },
  { id: 'history', label: 'آخرین کالاهای دیده شده', icon: Eye, href: '/profile/history' },
  { id: 'settings', label: 'اطلاعات حساب کاربری', icon: Settings, href: '/profile/settings' },
] as const;

export function ProfileSidebar() {
  const pathname = usePathname();
  const { user, logout, isLoggingOut } = useAuth();
  const { data: wallet } = useGetWalletBalances();

  const isDashboard = pathname === '/profile';

  React.useEffect(() => {
    let frameId: number;
    const performScroll = () => {
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };
    const triggerScroll = () => {
      performScroll();
      frameId = requestAnimationFrame(performScroll);
    };
    triggerScroll();
    const timer1 = setTimeout(triggerScroll, 50);
    const timer2 = setTimeout(triggerScroll, 150);
    const timer3 = setTimeout(triggerScroll, 300);
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname]);

  const getActiveTab = () => {
    if (pathname.includes('/orders')) return 'orders';
    if (pathname.includes('/support')) return 'support';
    if (pathname.includes('/wallet')) return 'wallet';
    if (pathname.includes('/favorites')) return 'favorites';
    if (pathname.includes('/addresses')) return 'addresses';
    if (pathname.includes('/comments')) return 'comments';
    if (pathname.includes('/notifications')) return 'notifications';
    if (pathname.includes('/history')) return 'history';
    if (pathname.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  const handleLogout = async () => {
    try {
      await logout(undefined);
      showToast.success('با موفقیت از حساب کاربری خود خارج شدید');
      window.location.href = '/';
    } catch {}
  };

  const handleCopyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      showToast.success('کد معرف شما با موفقیت کپی شد');
    }
  };

  const handleShareReferral = () => {
    if (user?.referralCode && typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: 'کد معرف یدک‌چی',
          text: `با اشتراک‌گذاری این کد، هم دوستت برای خرید اولش ۱۰۰,۰۰۰ تومان تخفیف می‌گیره و هم خودت ۱۰۰,۰۰۰ تومان اعتبار خرید دریافت می‌کنی.`,
          url: window.location.origin,
        })
        .catch(() => {});
    } else {
      handleCopyReferral();
    }
  };

  const handleWithdraw = () => {
    window.location.href = '/profile/wallet?action=withdraw';
  };

  return (
    <div
      className={cn(
        'w-full flex-col gap-5 select-none',
        isDashboard ? 'flex' : 'hidden lg:flex'
      )}
    >
      <Card className="flex w-full items-center justify-between gap-4 p-4">
        <div className="flex flex-col">
          <span className="mb-1 text-2xs text-muted-foreground">موجودی کیف پول</span>
          <span className="text-sm font-bold text-foreground">
            {wallet?.totalBalance || '۰ تومان'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleWithdraw}
          className="border-b border-primary pb-0.5 text-2xs font-bold text-primary outline-none transition-colors hover:text-primary-hover"
        >
          برداشت موجودی
        </button>
      </Card>

      {user?.referralCode ? (
        <Card className="flex w-full flex-col gap-3 p-4">
          <div className="flex w-full items-center justify-between border-b border-dashed border-border pb-2">
            <span className="text-2xs font-bold text-muted-foreground">کد معرف شما:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-foreground">
                {user.referralCode}
              </span>
              <button
                type="button"
                onClick={handleCopyReferral}
                aria-label="کپی کد معرف"
                className="rounded-sm p-1 text-primary transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Copy aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleShareReferral}
                aria-label="اشتراک‌گذاری کد معرف"
                className="rounded-sm p-1 text-primary transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Share2 aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-justify text-2xs leading-relaxed text-muted-foreground">
            با اشتراک‌گذاری این کد، هم دوستت برای خرید اولش ۱۰۰,۰۰۰ تومان تخفیف می‌گیره و هم خودت ۱۰۰,۰۰۰ تومان اعتبار خرید دریافت می‌کنی.
          </p>
        </Card>
      ) : null}

      <Card className="flex w-full flex-col gap-3 p-4">
        <div className="flex w-full items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent bg-accent text-primary">
              <User aria-hidden="true" className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">
                {user?.fullName || user?.lastName || 'کاربر یدک‌چی'}
              </span>
              <span className="mt-0.5 text-2xs text-muted-foreground">{user?.userName}</span>
            </div>
          </div>
          <Link
            href="/profile/settings"
            className="border-b border-primary pb-0.5 text-2xs font-bold text-primary outline-none transition-colors hover:text-primary-hover"
          >
            ویرایش
          </Link>
        </div>

        <nav className="flex w-full flex-col gap-1" aria-label="منوی پروفایل">
          {MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                scroll
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium outline-none transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isActive
                    ? 'bg-accent font-bold text-accent-foreground'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <div className="flex items-center gap-3">
                  <ItemIcon
                    aria-hidden="true"
                    className={cn('h-4.5 w-4.5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
                  />
                  <span>{item.label}</span>
                </div>
                <ChevronLeft
                  aria-hidden="true"
                  className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground/60')}
                />
              </Link>
            );
          })}

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-2 flex items-center gap-3 rounded-md border-t border-dashed border-border px-3 pb-3 pt-4 text-sm font-medium text-destructive outline-none transition-colors hover:bg-destructive/5 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
          >
            <LogOut aria-hidden="true" className="h-4.5 w-4.5 shrink-0" />
            <span>خروج از حساب</span>
          </button>
        </nav>
      </Card>
    </div>
  );
}