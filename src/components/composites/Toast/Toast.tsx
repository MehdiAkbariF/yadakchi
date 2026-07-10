// src/components/composites/Toast/Toast.tsx

'use client';

import { useEffect, useState } from 'react';
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
  success: <CheckCircle className="h-5 w-5 text-success-500" />,
  error: <AlertCircle className="h-5 w-5 text-destructive" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning-500" />,
  info: <Info className="h-5 w-5 text-primary" />,
};

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-success-500 bg-success-50 dark:bg-success-950/20',
  error: 'border-destructive bg-destructive-50 dark:bg-destructive-950/20',
  warning: 'border-warning-500 bg-warning-50 dark:bg-warning-950/20',
  info: 'border-primary bg-primary-50 dark:bg-primary-950/20',
};

export function Toast({
  message,
  variant = 'info',
  duration = 5000,
  onClose,
  className,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-4 shadow-lg',
        'animate-in slide-in-from-top-full fade-in duration-300',
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      {iconMap[variant]}
      <span className="flex-1 text-sm">{message}</span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="shrink-0"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">بستن</span>
      </Button>
    </div>
  );
}

// Toast Container for stacking
export interface ToastContainerProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const positionStyles: Record<NonNullable<ToastContainerProps['position']>, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function ToastContainer({
  children,
  position = 'top-right',
}: ToastContainerProps) {
  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2',
        positionStyles[position]
      )}
    >
      {children}
    </div>
  );
}