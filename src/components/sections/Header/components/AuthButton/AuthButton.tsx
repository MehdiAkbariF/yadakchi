// src/components/sections/Header/components/AuthButton/AuthButton.tsx

'use client';

import Link from 'next/link';
import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { useAuth, useLogout } from '@/domains/auth/hooks/auth.hooks';

export function AuthButton() {
  const { isAuthenticated } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined);
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-1">
        <Link href="/profile">
          <Button variant="ghost" size="icon" aria-label="پروفایل">
            <User className="h-5 w-5" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon" onClick={handleLogout} disabled={logoutMutation.isPending} aria-label="خروج">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <Link href="/login">
      <Button variant="outline" size="sm" className="hidden sm:flex">
        ورود / ثبت‌نام
      </Button>
    </Link>
  );
}