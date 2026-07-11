// src/components/shared/Layouts/AuthLayout/AuthLayout.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/design-system/utils/cn';
import { ThemeToggle } from '@/components/sections/Header/components/ThemeToggle/ThemeToggle';
import { ArrowRight } from 'lucide-react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-between bg-background px-4 py-6 md:bg-muted/10 md:py-12" dir="rtl">
      
      {/* هدر کنترل‌ها: دکمه بازگشت در سمت راست و تغییر تم در سمت چپ به صورت کاملاً RTL */}
      <div className="flex w-full max-w-md items-center justify-between shrink-0 mb-6 md:mb-0">
        <Link href="/">
          <button className="flex items-center gap-1.5 text-xs font-bold font-iran-sans text-muted-foreground hover:text-primary transition-colors">
            {/* در پروتکل RTL جهت پیکان بازگشت به سمت راست اشاره می‌کند */}
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به سایت</span>
          </button>
        </Link>
        <ThemeToggle />
      </div>

      {/* بخش مرکزی: فرم و لوگو وسط‌چین */}
      <div className={cn(
        'w-full max-w-md space-y-6 bg-background rounded-none border-0 md:rounded-2xl md:p-8 md:shadow-lg md:border flex flex-col justify-center',
        className
      )}>
        {/* لوگو اختصاصی وسط‌چین به همراه متن زیرین */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-16 h-8 leading-none mb-1">
            <Image
              src="/Logo.svg"
              alt="Yadakchi Logo"
              width={64}
              height={64}
              className="object-contain block filter dark:invert"
              priority
            />
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground font-iran-yekan font-medium tracking-wide">
            انتخاب هوشمند قطعات خودرو
          </span>
        </div>

        {/* محتوای درونی فرم */}
        {children}
      </div>

      {/* پاصفحه ثابت راهنما و تماس در انتهای ویوپورت */}
      <div className="flex items-center gap-2.5 text-xs text-muted-foreground/80 font-iran-sans shrink-0 mt-8">
        <Link href="/help" className="hover:text-primary transition-colors">
          راهنمای ثبت نام
        </Link>
        <span className="text-muted-foreground/30 font-light">|</span>
        <Link href="/contact" className="hover:text-primary transition-colors">
          تماس با پشتیبانی
        </Link>
      </div>
    </div>
  );
}