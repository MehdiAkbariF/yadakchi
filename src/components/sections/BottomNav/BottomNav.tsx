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

  if (!mounted) return null;

  const cartCount = basket?.summary?.itemCount ?? 0;
  const profileLabel =
    isAuthenticated && user ? user.fullName ?? user.lastName ?? 'پروفایل' : 'ورود';
  const profileHref = isAuthenticated ? '/profile' : '/login';

  const navItems = [
    { id: 'home', label: 'خانه', icon: Home, href: '/' },
    { id: 'categories', label: 'دسته‌بندی', icon: LayoutGrid, href: '/categories' },
    { id: 'basket', label: 'سبد خرید', icon: ShoppingBag, href: '/basket', badge: cartCount },
    { id: 'my-car', label: 'ماشین من', icon: Car, href: '/my-car' },
    { id: 'profile', label: profileLabel, icon: User, href: profileHref },
  ];

  return (
    <nav
      aria-label="ناوبری پایین"
      className="lg:hidden fixed inset-x-0 bottom-0 z-fixed flex h-16 items-center justify-between border-t border-border bg-card px-4 shadow-sm pb-safe select-none"
    >
      <div className="mx-auto flex h-full w-full max-w-md items-center justify-between">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const IconComponent = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              draggable={false}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex h-full flex-1 flex-col items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  'relative flex items-center justify-center transition-colors duration-fast',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <IconComponent aria-hidden="true" className="h-5 w-5" />

                {item.badge !== undefined && item.badge > 0 ? (
                  <Badge
                    variant="destructive"
                    size="sm"
                    className="absolute -top-1.5 -end-2 h-4 min-w-4 justify-center rounded-full p-0.5 text-2xs font-bold"
                  >
                    {item.badge}
                  </Badge>
                ) : null}
              </motion.div>

              <span
                className={cn(
                  'mt-1.5 max-w-[65px] truncate text-2xs tracking-tight transition-colors duration-fast',
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
