// src/shared/Transitions/PageTransition.tsx
'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';

interface PageTransitionProps {
  children: React.ReactNode;
  routeKey?: string;
  duration?: number;
  className?: string;
}

export function PageTransition({
  children,
  routeKey,
  duration = 250,
  className,
}: PageTransitionProps) {
  const pathname = usePathname();
  const key = routeKey ?? pathname;

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={key}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: duration / 1000, ease: 'easeInOut' }}
        className={cn('w-full', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}