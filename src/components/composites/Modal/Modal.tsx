// src/components/composites/Modal/Modal.tsx
'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  className?: string;
  overlayClassName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  mobileFullScreen?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  xs: 'md:max-w-sm',
  sm: 'md:max-w-md',
  md: 'md:max-w-lg',
  lg: 'md:max-w-2xl',
  xl: 'md:max-w-4xl',
  full: 'md:w-[94vw] md:max-w-7xl md:max-h-[92vh]',
};

export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  className,
  overlayClassName,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  mobileFullScreen = true,
}: ModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // ۱. قفل اسکرول صفحه زیرین
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ۲. کلید Escape
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape]);

  // ۳. مدیریت کلید Back گوشی بدون تداخل با لینک‌ها و ناوبری صفحات
  React.useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    const isMobile = window.innerWidth < 768;
    if (!isMobile || !mobileFullScreen) return;

    // ثبت یک استیت هش موقت
    if (window.location.hash !== '#modal') {
      window.history.pushState({ isModal: true }, '', '#modal');
    }

    const handlePopState = () => {
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // رفع باگ: پاکسازی بی‌خطر هش بدون فراخوانی history.back() تا لینک‌های کلیک‌شده کنسل نشوند!
      if (window.location.hash === '#modal') {
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(null, '', cleanUrl);
      }
    };
  }, [isOpen, mobileFullScreen]);

  if (!isOpen || !mounted) return null;

// src/components/composites/Modal/Modal.tsx

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[60] flex', // لایه ۶۰ همیشه بالاتر از z-40 اکشن بار موبایل است
        mobileFullScreen
          ? 'items-stretch md:items-center md:justify-center md:p-4'
          : 'items-center justify-center p-0 md:p-4'
      )}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in',
          mobileFullScreen ? 'hidden md:block' : 'block',
          overlayClassName
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className={cn(
          'relative z-10 flex flex-col bg-card border-border overflow-hidden outline-none',
          mobileFullScreen
            ? 'w-full h-[100dvh] max-h-[100dvh] rounded-none border-none animate-enter md:h-auto md:max-h-[88vh] md:rounded-2xl md:border md:shadow-2xl'
            : 'w-full max-h-[92dvh] rounded-t-2xl border-t md:h-auto md:max-h-[88vh] md:rounded-2xl md:border md:shadow-2xl md:animate-enter',
          sizeClasses[size],
          className
        )}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between gap-3 shrink-0 w-full select-none',
          'px-4 py-3 md:px-5 md:py-3.5',
          'border-b border-border/80 bg-card',
          className
        )}
        style={{
          paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
        }}
        {...props}
      >
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all"
            aria-label="بازگشت"
          >
            <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </button>
        ) : null}

        <div className="flex-1 min-w-0">{children}</div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="hidden md:inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="بستن"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    );
  }
);
ModalHeader.displayName = 'ModalHeader';

export interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const ModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-sm md:text-title-sm font-bold text-foreground', className)}
      {...props}
    />
  )
);
ModalTitle.displayName = 'ModalTitle';

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex-1 overflow-y-auto p-4 md:p-5 w-full min-h-0 overscroll-contain',
        className
      )}
      style={{
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))',
      }}
      {...props}
    />
  )
);
ModalBody.displayName = 'ModalBody';

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-3 shrink-0 w-full select-none',
        'p-4 border-t border-border/80 bg-card md:bg-muted/20',
        className
      )}
      style={{
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
      }}
      {...props}
    />
  )
);
ModalFooter.displayName = 'ModalFooter';