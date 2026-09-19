// src/components/sections/Header/components/AuthButton/AuthButton.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, LogOut, ChevronDown, Store, UserCheck } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { cn } from '@/design-system/utils/cn';

export function AuthButton() {
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // بستن منو در صورت کلیک در هر نقطه دیگر از صفحه
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // مدیریت هوشمند ورود و خروج ماوس با ایجاد وقفه تنفسی (Grace Period)
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // ایجاد تاخیر ۱۵۰ میلی‌ثانیه‌ای تا اگر دست کاربر لرزید منو بسته نشود
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    logout(undefined);
  };

  if (isAuthenticated && user) {
    const displayName = user.shopTitle || user.fullName || user.lastName || 'پروفایل';
    const isSeller = !!user.shopTitle;

    return (
      <div 
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative inline-block text-right"
        dir="rtl"
      >
        {/* دکمه اصلی (Trigger) - تبدیل شده به تگ استاندارد button با پشتیبانی لمسی */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 select-none",
            "hover:bg-muted/80 active:scale-97",
            isOpen ? "bg-muted border-primary/40 ring-2 ring-primary/10" : "bg-muted/40 border-border/70"
          )}
        >
          {isSeller ? (
            <Store className="h-4 w-4 text-primary shrink-0" />
          ) : (
            <UserCheck className="h-4 w-4 text-primary shrink-0" />
          )}
          <span className="text-xs font-bold text-foreground max-w-[120px] truncate">
            {displayName}
          </span>
          <ChevronDown 
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ease-out",
              isOpen && "rotate-180 text-primary"
            )} 
          />
        </button>

        {/* منوی کشویی با Framer Motion */}
        <AnimatePresence>
          {isOpen && (
            <div 
              className="absolute left-0 top-full pt-2 z-50 w-48"
            >
              {/* پل نامرئی (Safe Area Bridge): 
                  این لایه فضای خالی بین دکمه و منو را پر می‌کند تا ماوس هرگز ارتباطش قطع نشود */}
              <div className="absolute -top-2 left-0 right-0 h-4 bg-transparent pointer-events-auto" />

              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="overflow-hidden rounded-xl border border-border/70 bg-popover/95 backdrop-blur-md p-1 shadow-xl ring-1 ring-black/5"
              >
                {/* اصلاح خطای ساختاری: لینک مستقیم بدون دکمه تودرتو */}
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-foreground rounded-lg transition-colors hover:bg-muted active:bg-muted/80"
                >
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>پنل کاربری من</span>
                </Link>

                <div className="my-1 border-t border-border/50" />

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold text-destructive rounded-lg transition-colors hover:bg-destructive/10 active:bg-destructive/15 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>{isLoggingOut ? 'در حال خروج...' : 'خروج از حساب'}</span>
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // وضعیت عدم احراز هویت
  return (
    <Link href="/login" className="inline-block">
      <Button 
        variant="outline" 
        size="sm" 
        className="h-9 px-4 text-xs font-bold gap-1.5 text-foreground hover:bg-muted active:scale-95 transition-transform"
      >
        <UserIcon className="h-4 w-4 text-muted-foreground" />
        ورود / ثبت‌نام
      </Button>
    </Link>
  );
}