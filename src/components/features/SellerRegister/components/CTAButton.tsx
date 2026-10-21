'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export interface CTAButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
  size?: 'md' | 'lg';
}

export function CTAButton({ onClick, label, className, size = 'lg' }: CTAButtonProps) {
  return (
    <div className={cn('group relative inline-flex', className)}>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1 rounded-xl bg-gradient-to-r from-primary via-primary-hover to-primary opacity-60 blur-lg"
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-0.5 rounded-xl bg-primary opacity-40 blur-md"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <button
        type="button"
        onClick={onClick}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md font-bold text-primary-foreground',
          'bg-primary hover:bg-primary-hover',
          'shadow-lg transition-colors duration-normal',
          'active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          size === 'lg' && 'h-[52px] px-10 text-sm',
          size === 'md' && 'h-11 px-7 text-xs'
        )}
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 300 60"
          preserveAspectRatio="none"
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
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
          />
        </svg>

        <span className="relative z-10 inline-flex items-center justify-center gap-2 whitespace-nowrap">
          <span>{label}</span>
          <motion.span
            animate={{ x: [0, -4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          </motion.span>
        </span>
      </button>
    </div>
  );
}