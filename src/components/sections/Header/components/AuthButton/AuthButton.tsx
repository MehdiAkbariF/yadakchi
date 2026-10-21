// src/components/sections/Header/components/AuthButton/AuthButton.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { cn } from '@/design-system/utils/cn';

export function AuthButton() {
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
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
    // استخراج نام کاربر (مثال: سلام مهدی)
    const firstName = user.firstName || user.fullName?.split(' ')[0] || user.shopTitle || 'کاربر';
    const displayName = `سلام ${firstName}`;

    return (
      <div 
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative inline-block"
        dir="rtl"
      >
        {/* دکمه مطابق با کادر سفید داخل تصویر */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "h-10 px-3.5 rounded-md border border-border bg-card flex items-center gap-2 select-none transition-all shadow-xs hover:bg-muted dark:hover:bg-muted/60",
            isOpen && "border-border bg-muted"
          )}
        >
          {/* آیکون کاربر مشکی/تیره */}
          <User className="h-4 w-4 text-foreground shrink-0" />
          
          <span className="text-xs font-bold text-foreground max-w-[110px] truncate leading-none">
            {displayName}
          </span>

          {/* فلش چپ مطابق عکس */}
          <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0 me-0.5" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <div className="absolute left-0 top-full pt-2 z-50 w-48">
              <div className="absolute -top-2 left-0 right-0 h-4 bg-transparent pointer-events-auto" />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden rounded-md border border-border/80 bg-popover p-1.5 shadow-xl"
              >
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>پنل کاربری من</span>
                </Link>

                <div className="my-1 border-t border-border/60" />

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold text-destructive rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
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

  return (
    <Link href="/login" className="inline-block">
      <button 
        type="button"
        className="h-10 px-4 rounded-md border border-border bg-card text-xs font-bold text-foreground flex items-center gap-2 shadow-xs hover:bg-muted dark:hover:bg-muted transition-colors"
      >
        <User className="h-4 w-4 text-foreground" />
        <span>ورود / ثبت‌نام</span>
      </button>
    </Link>
  );
}
