// src/components/composites/MobileBottomAction/MobileBottomAction.tsx
'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { cn } from '@/design-system/utils/cn';
import { toPersianDigits } from '@/core/utils/formatters';

export interface MobileBottomActionProps {
  label: string;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  leftContent?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  forceShowKey?: unknown;
  variant?: 'default' | 'notify';

  isInBasket?: boolean;
  basketQuantity?: number;
  maxStock?: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
  isUpdatingQuantity?: boolean;

  /** آیا BottomNav در صفحه هست؟ */
  hasBottomNav?: boolean;

  /** کلاس اضافه برای ردیوس */
  buttonRadius?: string;

  /** محتوای کشویی بالایی که چسبیده به بالای دکمه باز می‌شود */
  topDrawer?: React.ReactNode;
}

export function MobileBottomAction({
  label,
  onClick,
  isLoading = false,
  disabled = false,
  leftContent,
  icon,
  className,
  variant = 'default',
  isInBasket = false,
  basketQuantity = 0,
  maxStock,
  onIncrease,
  onDecrease,
  isUpdatingQuantity = false,
  hasBottomNav = false,
  buttonRadius = '',
  topDrawer,
}: MobileBottomActionProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const numericMaxStock = Number(maxStock);
  const isMaxStockReached =
    !isNaN(numericMaxStock) && numericMaxStock > 0 && basketQuantity >= numericMaxStock;

  return createPortal(
    <div
      dir="rtl"
      className={cn(
        'lg:hidden fixed inset-x-0 z-50 w-full transform-gpu flex flex-col select-none',
        className
      )}
      style={{
        bottom: hasBottomNav
          ? 'calc(4rem + env(safe-area-inset-bottom, 0px))'
          : '0px',
      }}
    >
      {/* کشوی متصل بالایی با انیمیشن باز شدن روان */}
      <AnimatePresence>
        {topDrawer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-full overflow-hidden border-t border-border bg-card/95 backdrop-blur-md shadow-overlay-top dark:shadow-overlay-top-dark"
          >
            {topDrawer}
          </motion.div>
        )}
      </AnimatePresence>

      {/* نوار اصلی اکشن دکمه‌ها */}
      <div
        className={cn(
          'w-full bg-card border-t border-border px-4 py-3 flex items-center justify-between gap-3',
          !topDrawer && 'shadow-overlay-top dark:shadow-overlay-top-dark'
        )}
        style={{
          paddingBottom: hasBottomNav
            ? '0.75rem'
            : 'max(0.75rem, env(safe-area-inset-bottom))',
        }}
      >
        {leftContent ? (
          <div className="flex min-w-0 flex-col items-start text-start shrink-0">
            {leftContent}
          </div>
        ) : null}

        <div className={cn('flex-1 min-w-0', leftContent ? 'max-w-[65%]' : 'w-full')}>
          {isInBasket && basketQuantity > 0 ? (
            <div
              className={cn(
                'flex items-center justify-between h-11 w-full rounded-lg border border-primary/40 bg-primary/10 px-2 shadow-xs select-none',
                buttonRadius
              )}
            >
              <button
                type="button"
                onClick={onIncrease}
                disabled={isUpdatingQuantity || isMaxStockReached}
                aria-label="افزایش تعداد"
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs transition-all active:scale-95',
                  (isUpdatingQuantity || isMaxStockReached) &&
                    'opacity-40 cursor-not-allowed active:scale-100'
                )}
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
              </button>

              <div className="flex flex-col items-center justify-center px-2 min-w-0">
                {isUpdatingQuantity ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <>
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {toPersianDigits(basketQuantity)} عدد
                    </span>
                    {isMaxStockReached ? (
                      <span className="text-3xs font-bold text-destructive leading-none mt-0.5 whitespace-nowrap">
                        سقف انبار ({toPersianDigits(numericMaxStock)})
                      </span>
                    ) : null}
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={onDecrease}
                disabled={isUpdatingQuantity}
                aria-label={basketQuantity === 1 ? 'حذف از سبد' : 'کاهش تعداد'}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md transition-all active:scale-95',
                  basketQuantity === 1
                    ? 'bg-destructive/15 text-destructive hover:bg-destructive/25'
                    : 'bg-primary/20 text-primary hover:bg-primary/30',
                  isUpdatingQuantity && 'opacity-40 cursor-not-allowed active:scale-100'
                )}
              >
                {basketQuantity === 1 ? (
                  <Trash2 className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4 stroke-[2.5]" />
                )}
              </button>
            </div>
          ) : (
            <Button
              variant={variant === 'notify' ? 'destructive' : disabled ? 'outline' : 'primary'}
              size="lg"
              fullWidth
              onClick={onClick}
              isLoading={isLoading}
              disabled={variant === 'notify' ? false : disabled}
              leftIcon={icon}
              className={cn(
                'flex h-11 items-center justify-center gap-2 text-xs font-bold shadow-xs whitespace-nowrap',
                buttonRadius
              )}
            >
              {label}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}