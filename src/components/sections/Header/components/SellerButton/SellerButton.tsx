'use client';

import Link from 'next/link';
import { Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';

interface SellerButtonProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function SellerButton({ className, size = 'md' }: SellerButtonProps) {
  return (
    <Link
      href="/seller/register"
      aria-label="ثبت‌نام فروشنده و باز کردن فروشگاه در یدکچی"
      className={cn(
        "relative inline-flex items-center justify-center select-none overflow-hidden rounded-lg font-bold text-primary-foreground transition-all active:scale-95 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "bg-primary hover:bg-primary-hover",
        size === 'sm' ? "h-9 px-3 text-xs gap-1.5" : "h-10 px-4 text-xs sm:text-sm gap-2",
        className
      )}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-l from-transparent via-white/20 to-transparent -skew-x-20"
        initial={{ x: '200%' }}
        animate={{ x: '-200%' }}
        transition={{
          repeat: Infinity,
          repeatDelay: 4,
          duration: 1.2,
          ease: "easeInOut",
        }}
      />

      <Store aria-hidden="true" className="h-4 w-4 shrink-0 text-primary-foreground" />
      <span className="leading-none pt-0.5 whitespace-nowrap">
        فروشنده شو
      </span>
    </Link>
  );
}