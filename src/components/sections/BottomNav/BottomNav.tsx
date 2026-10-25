'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, LayoutGrid, ShoppingBag, Car, User } from 'lucide-react';
import { useGetBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { Badge } from '@/components/primitives/Badge';
import { cn } from '@/design-system/utils/cn';

export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const { user, isAuthenticated } = useAuth();
  const { data: basket } = useGetBasket();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // در صفحه چت تیکت نوار پایین را مخفی می‌کنیم تا کیبورد موبایل بدون مشکل باز شود
  const isInsideTicketChat = pathname.startsWith('/profile/support/') && pathname !== '/profile/support' && pathname !== '/profile/support/new';

  if (!mounted || isInsideTicketChat) return null;

  const cartCount = basket?.summary?.itemCount ?? 0;
  const profileLabel = isAuthenticated && user ? (user.fullName ?? user.lastName ?? 'پروفایل') : 'ورود';
  const profileHref = isAuthenticated ? '/profile' : '/login';

  const navItems = [
    { id: 'home', label: 'خانه', icon: Home, href: '/home' },
    { id: 'categories', label: 'دسته‌بندی', icon: LayoutGrid, href: '/categories' },
    { id: 'basket', label: 'سبد خرید', icon: ShoppingBag, href: '/basket', badge: cartCount },
    { id: 'my-car', label: 'ماشین من', icon: Car, href: '/my-car' },
    { id: 'profile', label: profileLabel, icon: User, href: profileHref },
  ];

  return (
    <nav
      aria-label="ناوبری پایین"
      className="lg:hidden fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-between border-t border-border/80 bg-card/95 backdrop-blur-md px-3 pb-safe select-none shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
    >
      <div className="mx-auto flex h-full w-full max-w-md items-center justify-between">
        {navItems.map((item) => {
          // بررسی فعال بودن تب (شامل تمام زیرمسیرهای پروفایل)
          const isActive = item.href === '/' 
            ? pathname === '/' 
            : pathname.startsWith(item.href);
          const IconComponent = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              draggable={false}
              className="relative flex h-full flex-1 flex-col items-center justify-center rounded-xl outline-none"
            >
              <motion.div
                whileTap={{ scale: 0.88 }}
                className={cn(
                  'relative flex items-center justify-center transition-colors duration-fast',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <IconComponent className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />

                {item.badge !== undefined && item.badge > 0 ? (
                  <Badge
                    variant="destructive"
                    size="sm"
                    className="absolute -top-1.5 -end-2.5 h-4 min-w-4 justify-center rounded-full p-0.5 text-3xs font-bold"
                  >
                    {item.badge}
                  </Badge>
                ) : null}
              </motion.div>

              <span
                className={cn(
                  'mt-1 max-w-[70px] truncate text-2xs  transition-colors duration-fast',
                  isActive ? 'font-bold text-primary' : 'font-medium text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}