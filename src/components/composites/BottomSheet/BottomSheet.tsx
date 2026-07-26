'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';


interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) {
            onClose();
          }
        }}
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        className="relative z-10 w-full max-w-lg bg-background rounded-t-2xl shadow-2xl pb-safe flex flex-col max-h-[85vh]"
      >
        <div className="w-full flex flex-col items-center py-3 border-b shrink-0 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mb-3" />
          <span className="text-sm font-bold font-iran-yekan text-foreground px-4 text-center">{title}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}