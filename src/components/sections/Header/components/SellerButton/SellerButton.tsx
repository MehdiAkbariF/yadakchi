// src/components/sections/Header/components/SellerButton/SellerButton.tsx
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
      className={cn(
        "relative inline-flex items-center justify-center select-none overflow-hidden rounded-xl font-iran-yekan font-bold text-white transition-all active:scale-95 shadow-sm",
        "bg-[#f05023] hover:bg-[#f05023]", // دقیقاً رنگ و بدون تغییر در هاور
        size === 'sm' ? "h-9 px-3 text-xs gap-1.5" : "h-10 px-4 text-xs sm:text-sm gap-2",
        className
      )}
    >
      {/* اشعه شاینینگ ظریف و روان */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-l from-transparent via-white/25 to-transparent -skew-x-20"
        initial={{ x: '200%' }}
        animate={{ x: '-200%' }}
        transition={{
          repeat: Infinity,
          repeatDelay: 3.5,
          duration: 1.2,
          ease: "easeInOut",
        }}
      />

      {/* آیکون مرتبط فروشگاه مشابه تصویر */}
      <Store className={cn("shrink-0 text-white", size === 'sm' ? "h-4 w-4" : "h-4.5 w-4.5")} />

      {/* متن دکمه */}
      <span className="leading-none pt-0.5 whitespace-nowrap">
        فروشنده شو
      </span>
    </Link>
  );
}