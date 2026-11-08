// src/components/composites/BottomSheet/BottomSheet.tsx
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
  maxWidth?: string;
  /** ارتفاع: auto | half | fixed (ارتفاع ثابت ۷۵درصد برای جلوگیری از پرش تب‌ها) | full */
  size?: 'auto' | 'half' | 'fixed' | 'full';
  disableDrag?: boolean;
  dragCloseThreshold?: number;
  centerOnDesktop?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<BottomSheetProps['size']>, string> = {
  auto: 'max-h-[85dvh]',
  half: 'h-[55dvh]',
  fixed: 'h-[75dvh] sm:h-[36rem]', // ارتفاع ثابت و استاندارد دو تب
  full: 'h-[92dvh] sm:h-[88dvh]',
};

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  maxWidth = 'max-w-lg',
  size = 'fixed',
  disableDrag = false,
  dragCloseThreshold = 80,
  centerOnDesktop = true,
}: BottomSheetProps) {
  const [mounted, setMounted] = React.useState(false);
  const dragControls = useDragControls();
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // قفل اسکرول صفحه
  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // بستن با Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // فیزیک درگ نیتیو
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > dragCloseThreshold || info.velocity.y > 450) {
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
          {/* Backdrop: سبک و بهینه برای جلوگیری از لگ زدن موبایل */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60"
            aria-hidden="true"
          />

          {/* پنل شیت با سخت‌افزار شتاب‌یافته خالص (GPU Composited) */}
          <motion.div
            ref={panelRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 34,
              mass: 0.8,
            }}
            drag={disableDrag ? false : 'y'}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.55 }}
            onDragEnd={handleDragEnd}
            className={cn(
              'relative z-10 flex w-full flex-col overflow-hidden bg-card',
              'transform-gpu will-change-transform select-none',
              'rounded-t-[1.75rem] border-t border-border/80 shadow-2xl',
              centerOnDesktop && 'sm:rounded-2xl sm:border sm:shadow-2xl',
              SIZE_CLASSES[size],
              maxWidth,
              className
            )}
          >
            {/* دستگیره درگ با تاچ‌تارگت وسیع و روان */}
            <div className="flex w-full shrink-0 flex-col items-center border-b border-border/70 pb-2.5 pt-2">
              {!disableDrag && (
                <div
                  onPointerDown={(e) => dragControls.start(e)}
                  className="flex h-7 w-full cursor-grab touch-none items-center justify-center active:cursor-grabbing"
                  aria-hidden="true"
                >
                  <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30 transition-all duration-fast active:scale-95 active:bg-muted-foreground/60" />
                </div>
              )}
              <span className="px-4 text-center text-xs sm:text-sm font-bold text-foreground">
                {title}
              </span>
            </div>

            {/* بدنه شیت با اسکرول مستقل و بدون پرش ارتفاع */}
            <div
              className={cn(
                'flex flex-1 flex-col min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 scrollbar-thin',
                'pb-[max(1.5rem,env(safe-area-inset-bottom))]'
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