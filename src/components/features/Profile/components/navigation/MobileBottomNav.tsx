'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Wallet, Headphones, User } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

const MOBILE_TABS = [
  { label: 'خانه', icon: Home, href: '/profile' },
  { label: 'سفارش‌ها', icon: ShoppingBag, href: '/profile/orders' },
  { label: 'کیف پول', icon: Wallet, href: '/profile/wallet' },
  { label: 'پشتیبانی', icon: Headphones, href: '/profile/support' },
  { label: 'پروفایل', icon: User, href: '/profile/settings' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  // در صفحه چت تیکت نوار پایین را مخفی می‌کنیم تا فضا برای تایپ آزاد باشد
  if (pathname.includes('/profile/support/') && pathname !== '/profile/support' && pathname !== '/profile/support/new') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t border-border/80 bg-card/95 px-2 backdrop-blur-lg lg:hidden pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      {MOBILE_TABS.map((tab) => {
        const isActive = tab.href === '/profile' 
          ? pathname === '/profile' 
          : pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all duration-200 active:scale-95',
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {isActive && (
              <span className="absolute -top-1.5 h-1 w-6 rounded-full bg-primary" />
            )}
            <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}