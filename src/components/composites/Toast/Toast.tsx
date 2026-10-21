'use client';

import * as React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Button } from '@/components/primitives/Button';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

const iconMap: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle aria-hidden="true" className="h-5 w-5 text-success" />,
  error: <AlertCircle aria-hidden="true" className="h-5 w-5 text-destructive" />,
  warning: <AlertTriangle aria-hidden="true" className="h-5 w-5 text-warning" />,
  info: <Info aria-hidden="true" className="h-5 w-5 text-info" />,
};

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-success bg-card',
  error: 'border-destructive bg-card',
  warning: 'border-warning bg-card',
  info: 'border-info bg-card',
};

export function Toast({ message, variant = 'info', duration = 5000, onClose, className }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 rounded-lg border p-4 shadow-md',
        'animate-slide-in-from-top',
        variantStyles[variant],
        className
      )}
    >
      {iconMap[variant]}
      <span className="flex-1 text-sm text-foreground">{message}</span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="shrink-0"
      >
        <X aria-hidden="true" className="h-4 w-4" />
        <span className="sr-only">بستن</span>
      </Button>
    </div>
  );
}

export interface ToastContainerProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const positionStyles: Record<NonNullable<ToastContainerProps['position']>, string> = {
  'top-right': 'top-4 end-4',
  'top-left': 'top-4 start-4',
  'bottom-right': 'bottom-4 end-4',
  'bottom-left': 'bottom-4 start-4',
  'top-center': 'top-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2',
  'bottom-center': 'bottom-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2',
};

export function ToastContainer({ children, position = 'top-right' }: ToastContainerProps) {
  return (
    <div className={cn('fixed z-toast flex flex-col gap-2', positionStyles[position])}>
      {children}
    </div>
  );
}
