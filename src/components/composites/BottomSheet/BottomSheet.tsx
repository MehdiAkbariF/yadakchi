'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  /** حداکثر عرض پنل در دسکتاپ (پیش‌فرض: max-w-lg) */
  maxWidth?: string;
  /** ارتفاع: auto (بر اساس محتوا تا 85dvh) | half | full */
  size?: 'auto' | 'half' | 'full';
  /** غیرفعال کردن کشیدن برای بستن */
  disableDrag?: boolean;
  /** آستانه کشیدن برای بستن (px) */
  dragCloseThreshold?: number;
  /** نمایش پنل به‌صورت Modal در دسکتاپ (پیش‌فرض: true) */
  centerOnDesktop?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<BottomSheetProps['size']>, string> = {
  auto: 'max-h-[85dvh]',
  half: 'h-[55dvh]',
  full: 'h-[92dvh] sm:h-[88dvh]',
};

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  maxWidth = 'max-w-lg',
  size = 'auto',
  disableDrag = false,
  dragCloseThreshold = 100,
  centerOnDesktop = true,
}: BottomSheetProps) {
  const [mounted, setMounted] = React.useState(false);
  const dragControls = useDragControls();
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // قفل اسکرول body با حفظ مقدار اولیه و جلوگیری از پرش اسکرول‌بار
  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // بستن با Esc
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // focus trap ساده
  React.useEffect(() => {
    if (!isOpen) return;
    const previousActive = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => {
      const focusable = panelRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }, 60);
    return () => {
      clearTimeout(timer);
      previousActive?.focus?.();
    };
  }, [isOpen]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > dragCloseThreshold || info.velocity.y > 600) {
      onClose();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-modal flex justify-center',
            centerOnDesktop ? 'items-end sm:items-center' : 'items-end'
          )}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          dir="rtl"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            drag={disableDrag ? false : 'y'}
            dragControls={dragControls}
            dragListener={false} // فقط از دستگیره کشیده شود، نه از محتوا
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
            className={cn(
              'relative z-10 flex w-full flex-col overflow-hidden bg-background',
              // موبایل: bottom sheet
              'rounded-t-2xl border-t border-border/80 shadow-xl',
              // دسکتاپ: modal
              centerOnDesktop && 'sm:rounded-2xl sm:border sm:shadow-2xl',
              SIZE_CLASSES[size],
              maxWidth,
              className
            )}
          >
            {/* Header + Handle */}
            <div className="flex w-full shrink-0 flex-col items-center gap-2.5 border-b border-border py-3.5">
              {!disableDrag && (
                <div
                  onPointerDown={(e) => dragControls.start(e)}
                  className="flex w-full cursor-grab touch-none items-center justify-center active:cursor-grabbing"
                  aria-hidden="true"
                >
                  <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30 transition-colors active:bg-muted-foreground/60" />
                </div>
              )}
              <span className="px-4 text-center text-base font-bold text-foreground">{title}</span>
            </div>

            {/* Body */}
            <div
              className={cn(
                'flex-1 overflow-y-auto overscroll-contain p-5 scrollbar-none',
                'pb-[max(1.25rem,env(safe-area-inset-bottom))]'
              )}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}