'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/primitives/Button';
import { cn } from '@/design-system/utils/cn';

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
}

export function MobileBottomAction({
  label,
  onClick,
  isLoading,
  disabled,
  leftContent,
  icon,
  className,
  variant = 'default',
}: MobileBottomActionProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      dir="rtl"
      className={cn(
        // ✅ چسبیدن دقیق به بالای باتم‌ناو با bottom-16 (ارتفاع ۶۴ پیکسل)
        'lg:hidden fixed bottom-16 inset-x-0 z-40 w-full',
        'bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]',
        'flex items-center justify-between gap-4',
        className
      )}
    >
      {leftContent ? (
        <div className="flex min-w-0 flex-col items-start text-start shrink-0">{leftContent}</div>
      ) : null}

      <div className={cn('flex-1', leftContent ? 'max-w-[62%]' : 'w-full')}>
        <Button
          variant={variant === 'notify' ? 'destructive' : disabled ? 'outline' : 'primary'}
          size="lg"
          fullWidth
          onClick={onClick}
          isLoading={isLoading}
          disabled={variant === 'notify' ? false : disabled}
          leftIcon={icon}
          className="h-11 rounded-xl text-xs sm:text-sm font-bold shadow-xs"
        >
          {label}
        </Button>
      </div>
    </div>,
    document.body
  );
}