// src/components/composites/Modal/Modal.tsx

'use client';

import { forwardRef, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Button } from '@/components/primitives/Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  className,
  overlayClassName,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // اثر اول: مدیریت قفل اسکرول بدنه و فوکوس اولیه مودال
  // وابستگی فقط به isOpen است تا فوکوس فقط یکبار زمان باز شدن اجرا شود و باKeystrokeها تغییر نکند
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // اثر دوم: هندل کردن کلید بازگشت اسکیپ (Escape) به صورت مستقل و بدون تداخل با فوکوس اینپوت‌ها
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity',
          overlayClassName
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div
        ref={modalRef}
        className={cn(
          'relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-background p-6 shadow-xl',
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

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between space-x-4 rtl:space-x-reverse',
          className
        )}
        {...props}
      >
        <div className="flex-1">{children}</div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">بستن</span>
        </Button>
      </div>
    );
  }
);
ModalHeader.displayName = 'ModalHeader';

export interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn('text-lg font-semibold', className)}
        {...props}
      />
    );
  }
);
ModalTitle.displayName = 'ModalTitle';

export interface ModalDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const ModalDescription = forwardRef<
  HTMLParagraphElement,
  ModalDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
ModalDescription.displayName = 'ModalDescription';

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('py-4', className)} {...props} />;
  }
);
ModalBody.displayName = 'ModalBody';

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 rtl:sm:space-x-reverse',
          className
        )}
        {...props}
      />
    );
  }
);
ModalFooter.displayName = 'ModalFooter';