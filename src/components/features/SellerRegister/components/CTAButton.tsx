'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/design-system/utils/cn';

interface CTAButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
  size?: 'md' | 'lg';
}

export function CTAButton({ onClick, label, className, size = 'lg' }: CTAButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  // ─── Magnetic Effect ───
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const x = useSpring(mouseX, { stiffness: 200, damping: 20 });
  const y = useSpring(mouseY, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // فاصله از مرکز
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;

    // حرکت مغناطیسی (حداکثر ۱۵px)
    mouseX.set(distX * 0.3);
    mouseY.set(distY * 0.3);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovering(false);
  };

  return (
    <div className={cn('relative inline-flex group', className)}>
      {/* هاله بیرونی — انیمیشن تنفس */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-primary via-orange-400 to-primary rounded-2xl blur-lg opacity-60 pointer-events-none"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* هاله داخلی */}
      <motion.div
        className="absolute -inset-0.5 bg-primary rounded-2xl blur-md opacity-40 pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <motion.button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
        style={{ x, y }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 overflow-hidden',
          'rounded-xl font-bold text-primary-foreground',
          'bg-primary hover:bg-primary-600',
          'shadow-brand-lg hover:shadow-brand-xl',
          'transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30',
          size === 'lg' && 'h-[52px] px-10 text-body-md',
          size === 'md' && 'h-[44px] px-7 text-body-sm'
        )}
      >
        {/* ─── Liquid Blob Effect ─── */}
        {isHovering && (
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-orange-400 to-primary"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}

        {/* ─── Shine Effect (از قبل) ─── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 300 60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.5" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.rect
            x="-100"
            y="0"
            width="80"
            height="100%"
            fill="url(#shineGrad)"
            initial={{ x: -100 }}
            animate={{ x: 350 }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut',
            }}
          />
        </svg>

        {/* ─── محتوا ─── */}
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

        {/* ─── ذرات رنگی در hover ─── */}
        {isHovering && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 100,
                  y: (Math.random() - 0.5) * 100,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut',
                }}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              />
            ))}
          </>
        )}
      </motion.button>
    </div>
  );
}