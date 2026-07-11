// src/components/shared/Layouts/AuthLayout/AuthLayout.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/design-system/utils/cn';
import { ThemeToggle } from '@/components/sections/Header/components/ThemeToggle/ThemeToggle';
import { ArrowRight } from 'lucide-react';
import { Typography } from '@/components/primitives/Typography';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function AuthLayout({ children, title, className }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-between bg-background px-4 py-6 md:py-12" dir="rtl">
      
      {/* هدر کنترل‌ها: دکمه بازگشت و تغییر تم */}
      <div className="flex w-full max-w-5xl items-center justify-between shrink-0 mb-8 md:mb-0">
        <Link href="/">
          <button className="flex items-center gap-1.5 text-xs font-bold font-iran-sans text-muted-foreground hover:text-primary transition-colors">
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به سایت</span>
          </button>
        </Link>
        <ThemeToggle />
      </div>

      {/* بخش مرکزی: فرم و لوگو وسط‌چین با عرض استاندارد و کمتر */}
      <div className={cn('w-full max-w-md space-y-6 flex flex-col justify-center', className)}>
        
        {/* لوگو اختصاصی وسط‌چین (دو برابر بزرگتر شده) */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-48 h-16 leading-none mb-3">
            <Image
              src="/Logo.svg"
              alt="Yadakchi Logo"
              width={192}
              height={96}
              className="object-contain block filter "
              priority
            />
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground font-iran-yekan 
          font-medium tracking-wide">
            انتخاب هوشمند قطعات خودرو
          </span>
        </div>

        {/* عنوان (مثل ورود | ثبت‌نام) راست‌چین */}
        {title && (
          <div className="w-full">
            <Typography variant="h4" className="font-iran-yekan font-bold text-foreground text-right">
              {title}
            </Typography>
          </div>
        )}

        {/* محتوای درونی فرم (بدون کادر و سایه) */}
        <div className="w-full">
          {children}
        </div>
      </div>

      {/* پاصفحه ثابت راهنما و تماس */}
      <div className="flex items-center gap-2.5 text-xs text-muted-foreground/80 font-iran-sans shrink-0 mt-8 md:mt-0">
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