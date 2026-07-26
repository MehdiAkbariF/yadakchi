'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingBag, Car, User } from 'lucide-react';
import { useGetBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { cn } from '@/design-system/utils/cn';
import { Badge } from '@/components/primitives/Badge';
import { motion } from 'framer-motion';

export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { data: basket } = useGetBasket();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const cartCount = basket?.summary?.itemCount || 0;
  const profileLabel = isAuthenticated && user ? (user.fullName || user.lastName || 'پروفایل') : 'ورود';
  const profileHref = isAuthenticated ? '/profile' : '/login';

  const navItems = [
    { id: 'home', label: 'خانه', icon: Home, href: '/' },
    { id: 'categories', label: 'دسته‌بندی', icon: LayoutGrid, href: '/categories' },
    { id: 'basket', label: 'سبد خرید', icon: ShoppingBag, href: '/basket', badge: cartCount },
    { id: 'my-car', label: 'ماشین من', icon: Car, href: '/my-car' },
    { id: 'profile', label: profileLabel, icon: User, href: profileHref },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t h-16 px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-between pb-safe">
      <div className="flex w-full items-center justify-between max-w-md mx-auto h-full">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const IconComponent = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              draggable={false}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "relative flex items-center justify-center px-4.5 py-1 rounded-full transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground/70"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-primary/10 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                
                <IconComponent
                  className={cn(
                    "h-5 w-5 transition-all duration-200 z-10",
                    isActive ? "text-primary scale-110" : "text-muted-foreground"
                  )}
                />
                
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    size="sm"
                    className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center p-0.5 text-[9px] font-bold rounded-full z-20 animate-in zoom-in duration-200"
                  >
                    {item.badge}
                  </Badge>
                )}
              </motion.div>
              
              <span
                className={cn(
                  "text-[9px] font-iran-yekan font-bold transition-colors duration-200 truncate max-w-[65px] tracking-tight mt-1",
                  isActive ? "text-primary font-black" : "text-muted-foreground/75"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}