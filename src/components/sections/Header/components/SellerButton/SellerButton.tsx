// src/components/sections/Header/components/SellerButton/SellerButton.tsx

'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { cn } from '@/design-system/utils/cn';

interface SellerButtonProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function SellerButton({ className, size = 'sm' }: SellerButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Link href="/seller/register" className="relative inline-flex group select-none">
      
      {/* ۱. هاله نورانی معلق در پشت دکمه (Ambient Breathing Glow) */}
      {!shouldReduceMotion && (
        <motion.span
          aria-hidden="true"
          className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary via-amber-500 to-primary opacity-65 blur-sm -z-10 group-hover:opacity-100 
          transition-opacity duration-300"
          animate={{
            scale: [0.97, 1.04, 0.97],
            opacity: [0.5, 0.85, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* ۲. کالبد اصلی دکمه */}
      <Button 
        variant="primary" 
        size={size} 
        className={cn(
          // ایزوله‌سازی لایه‌ها
          "relative overflow-hidden isolate border border-white/20 shadow-md",
          // رفتارهای تعاملی مدرن
          "transition-all duration-300 active:scale-95 group-hover:shadow-lg",
          size === 'sm' && "text-xs px-3 h-8 gap-1",
          size === 'md' && "text-sm px-4 h-10 gap-2",
          className
        )}
      >
        {/* ۳. پس‌زمینه گرادیانتی زنده و پویا */}
        {!shouldReduceMotion ? (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-amber-600/80 to-primary bg-[length:200%_auto]"
            animate={{
              backgroundPosition: ['0% 50%', '200% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ) : (
          <span className="absolute inset-0 -z-10 bg-primary" />
        )}

        {/* ۴. اشعه شاینینگ شدید با ترنزیشن راست‌به‌چپ (RTL-Optimized Flare) */}
        {!shouldReduceMotion && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-2/3 -z-0 bg-gradient-to-l from-transparent via-white/45 to-transparent -skew-x-20 will-change-transform"
            initial={{ x: '250%' }}
            animate={{ x: '-250%' }}
            transition={{
              repeat: Infinity,
              repeatDelay: 2.2, // وقفه تنفس
              duration: 1,      // سرعت پرتاب اشعه
              ease: [0.16, 1, 0.3, 1], // شتاب انفجاری و خروج نرم
            }}
          />
        )}

        {/* ۵. آیکون چشمک‌زن برای لنگر انداختن نگاه کاربر */}
        <motion.span
          animate={shouldReduceMotion ? {} : {
            rotate: [0, -12, 12, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            repeat: Infinity,
            repeatDelay: 3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative z-10 flex items-center justify-center text-amber-300"
        >
          <Sparkles className={cn("shrink-0", size === 'sm' ? "h-3.5 w-3.5" : "h-4 w-4")} />
        </motion.span>

        {/* ۶. تایپوگرافی واضح و پرکنتراست */}
        <span className="relative z-10 font-black tracking-tight text-primary-foreground drop-shadow-xs">
          فروشنده شو
        </span>

      </Button>
    </Link>
  );
}