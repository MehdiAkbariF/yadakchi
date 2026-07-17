'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight } from 'lucide-react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      onClose();
    };

    window.history.pushState({ modalOpen: 'system-modal' }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (window.history.state?.modalOpen === 'system-modal') {
          window.history.back();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleClose = () => {
    if (window.history.state?.modalOpen === 'system-modal') {
      window.history.back();
    } else {
      onClose();
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center text-right"
      role="dialog"
      aria-modal="true"
      dir="rtl"
    >
      <div
        className={cn(
          'fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity',
          overlayClassName
        )}
        onClick={closeOnOverlayClick ? handleClose : undefined}
      />
      <div
        ref={modalRef}
        className={cn(
          'relative z-10 w-full h-full max-h-full max-w-none rounded-none p-0 flex flex-col fixed inset-0 bg-background overflow-hidden md:relative md:w-full md:max-w-lg md:h-auto md:max-h-[90vh] md:rounded-2xl md:p-6 md:shadow-xl md:overflow-y-auto',
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
    const handleClose = () => {
      if (onClose) {
        if (window.history.state?.modalOpen === 'system-modal') {
          window.history.back();
        } else {
          onClose();
        }
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between space-x-4 rtl:space-x-reverse border-b md:border-b-0 pb-3 md:pb-0 px-4 py-3 md:px-0 md:py-0 bg-muted/10 md:bg-transparent shrink-0 w-full',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2 flex-1">
          {onClose && (
            <button 
              onClick={handleClose}
              className="md:hidden p-1 -mr-1 hover:bg-muted rounded-full"
              aria-label="Back"
            >
              <ArrowRight className="h-5 w-5 text-foreground" />
            </button>
          )}
          <div className="flex-1">{children}</div>
        </div>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden md:flex shrink-0 rounded-full"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">بستن</span>
          </Button>
        )}
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
        className={cn('text-sm md:text-base font-bold font-iran-yekan text-foreground', className)}
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
      className={cn('text-xs md:text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
ModalDescription.displayName = 'ModalDescription';

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('flex-1 overflow-y-auto p-5 md:p-0 md:py-4 w-full', className)} {...props} />;
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
          'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 rtl:sm:space-x-reverse shrink-0 p-4 md:p-0 border-t md:border-t-0 w-full',
          className
        )}
        {...props}
      />
    );
  }
);
ModalFooter.displayName = 'ModalFooter';