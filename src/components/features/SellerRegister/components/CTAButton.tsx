'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

interface CTAButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
  size?: 'md' | 'lg';
}

export function CTAButton({ onClick, label, className, size = 'lg' }: CTAButtonProps) {
  return (
    <div className={cn('relative inline-flex group', className)}>
      {/* هاله بیرونی */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-primary via-orange-400 to-primary rounded-2xl blur-lg opacity-60 pointer-events-none"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* هاله داخلی */}
      <motion.div
        className="absolute -inset-0.5 bg-primary rounded-2xl blur-md opacity-40 pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* دکمه اصلی — به‌جای Button از button خام استفاده می‌کنیم تا padding حتماً اعمال بشه */}
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 overflow-hidden',
          'rounded-xl font-bold text-primary-foreground',
          'bg-primary hover:bg-primary/90',
          'shadow-2xl shadow-primary/40 hover:shadow-primary/60',
          'transition-all duration-300',
          'active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          // ارتفاع و پدینگ دلخواه
          size === 'lg' && 'h-[52px] px-10 text-sm',
          size === 'md' && 'h-[44px] px-7 text-xs'
        )}
      >
        {/* اشعه درخشان متحرک */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 300 60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.rect
            x="-100"
            y="0"
            width="60"
            height="100%"
            fill="url(#shineGrad)"
            initial={{ x: -100 }}
            animate={{ x: 350 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: 'easeInOut',
            }}
          />
        </svg>

        {/* محتوای دکمه */}
        <span className="relative z-10 inline-flex items-center justify-center gap-2 whitespace-nowrap">
          <span>{label}</span>
          <motion.span
            animate={{ x: [0, -4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex"
          >
            <ArrowLeft className="h-4 w-4" />
          </motion.span>
        </span>
      </button>
    </div>
  );
}