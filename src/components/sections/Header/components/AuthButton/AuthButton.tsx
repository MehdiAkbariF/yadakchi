// src/components/sections/Header/components/AuthButton/AuthButton.tsx

'use client';

import Link from 'next/link';
import { User as UserIcon, LogOut, ChevronDown, Store, UserCheck } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { cn } from '@/design-system/utils/cn';

export function AuthButton() {
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout(undefined);
  };

  if (isAuthenticated && user) {
    // ترجیح نمایش عنوان فروشگاه برای فروشندگان و نام خانوادگی برای بقیه نقش‌ها
    const displayName = user.shopTitle || user.fullName || user.lastName || 'پروفایل';
    const isSeller = !!user.shopTitle;

    return (
      <div className="flex items-center gap-2 group relative">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border hover:bg-muted transition-colors cursor-pointer select-none">
          {isSeller ? (
            <Store className="h-4 w-4 text-primary shrink-0" />
          ) : (
            <UserCheck className="h-4 w-4 text-primary shrink-0" />
          )}
          <span className="text-xs font-bold font-iran-sans text-foreground max-w-[120px] truncate">
            {displayName}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-hover:rotate-180" />
        </div>

        {/* منوی کشویی پروفایل و خروج سریع کاربر */}
        <div className="absolute top-full left-0 mt-1 w-44 bg-background border rounded-lg shadow-xl py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
          <Link href="/profile">
            <button className="flex items-center gap-2 w-full px-4 py-2.5 text-right text-xs hover:bg-muted text-foreground transition-colors font-iran-sans font-medium">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              پنل کاربری من
            </button>
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-right text-xs hover:bg-destructive/10 text-destructive border-t transition-colors font-iran-sans font-bold"
          >
            <LogOut className="h-4 w-4" />
            خروج از حساب
          </button>
        </div>
      </div>
    );
  }

  // اگر کاربر لاگین نبود، دکمه شیک ورود/ثبت‌نام
  return (
    <Link href="/login">
      <Button 
        variant="outline" 
        size="sm" 
        className="font-iran-sans font-bold text-xs px-4 h-9 flex items-center gap-1 text-foreground hover:bg-muted"
      >
        <UserIcon className="h-4 w-4 text-muted-foreground" />
        ورود / ثبت‌نام
      </Button>
    </Link>
  );
}