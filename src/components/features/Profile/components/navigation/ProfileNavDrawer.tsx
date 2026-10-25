'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ShoppingBag,
  Wallet,
  Headphones,
  Heart,
  MapPin,
  MessageSquare,
  Bell,
  Eye,
  Settings,
  X,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { cn } from '@/design-system/utils/cn';

const ALL_MENU_GROUPS = [
  {
    groupTitle: 'فعالیت‌های خرید و سفارش',
    items: [
      { label: 'سفارش‌های من', icon: ShoppingBag, href: '/profile/orders' },
      { label: 'کالاهای محبوب', icon: Heart, href: '/profile/favorites' },
      { label: 'کالاهای دیده شده اخیر', icon: Eye, href: '/profile/history' },
      { label: 'نظرات و پرسش‌ها', icon: MessageSquare, href: '/profile/comments' },
    ],
  },
  {
    groupTitle: 'امور مالی و آدرس‌ها',
    items: [
      { label: 'کیف پول و تسویه حساب', icon: Wallet, href: '/profile/wallet' },
      { label: 'آدرس‌های تحویل', icon: MapPin, href: '/profile/addresses' },
    ],
  },
  {
    groupTitle: 'حساب و پشتیبانی',
    items: [
      { label: 'اطلاعات حساب و امنیت', icon: Settings, href: '/profile/settings' },
      { label: 'پیام‌ها و اعلان‌ها', icon: Bell, href: '/profile/notifications' },
      { label: 'پشتیبانی و تیکت‌ها', icon: Headphones, href: '/profile/support' },
    ],
  },
];

interface ProfileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileNavDrawer({ isOpen, onClose }: ProfileNavDrawerProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // بستن منو هنگام جابجایی بین صفحات
  React.useEffect(() => {
    onClose();
  }, [pathname]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay تیره پشت منو */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden"
          />

          {/* پنل کشویی Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] rounded-t-3xl border-t border-border/80 bg-card p-5 shadow-2xl flex flex-col lg:hidden"
          >
            {/* دستگیره شیت و هدر کشو */}
            <div className="flex flex-col items-center">
              <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30 mb-3" />
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm">
                  {user?.fullName ? user.fullName[0] : 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">
                    {user?.fullName || 'کاربر یدک‌چی'}
                  </span>
                  <span className="text-3xs text-muted-foreground " dir="ltr">
                    {user?.phoneNumber}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* لیست آیتم‌های اسکرول‌پذیر */}
            <div className="flex-1 overflow-y-auto py-3 space-y-4 no-scrollbar">
              <Link
                href="/profile"
                className={cn(
                  'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors',
                  pathname === '/profile'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/40 text-foreground hover:bg-muted'
                )}
              >
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4" />
                  <span>داشبورد کاربری (صفحه اصلی)</span>
                </div>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Link>

              {ALL_MENU_GROUPS.map((group, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <span className="px-2 text-3xs font-bold text-muted-foreground">
                    {group.groupTitle}
                  </span>
                  <div className="flex flex-col rounded-2xl border border-border/60 bg-muted/20 p-1">
                    {group.items.map((item) => {
                      const isActive = pathname.startsWith(item.href);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'text-foreground hover:bg-card'
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground/60" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => logout(undefined)}
                className="flex w-full items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>خروج از حساب کاربری</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}