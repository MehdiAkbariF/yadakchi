'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ isOpen, onClose, title, children, className }: BottomSheetProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-end justify-center" role="dialog" aria-modal="true">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-foreground/40 backdrop-blur-sm"
        aria-hidden="true"
      />
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onClose();
        }}
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        className={cn(
          'relative z-10 flex flex-col max-h-[85vh] w-full max-w-lg',
          'bg-background rounded-t-xl shadow-lg',
          className
        )}
      >
        <div className="w-full flex flex-col items-center shrink-0 gap-2 py-3 border-b border-border cursor-grab active:cursor-grabbing">
          <div className="h-1.5 w-12 rounded-full bg-border" />
          <span className="px-4 text-center text-base font-semibold text-foreground">{title}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-5 scrollbar-none">{children}</div>
      </motion.div>
    </div>,
    document.body
  );
}