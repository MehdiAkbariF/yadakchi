'use client';

import * as React from 'react';
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
  const modalRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'fixed inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in',
          overlayClassName
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        className={cn(
          'relative z-10 flex flex-col bg-background overflow-hidden',
          'w-full h-full max-h-full max-w-none rounded-none',
          'md:w-full md:max-w-2xl md:h-auto md:max-h-[90vh] md:rounded-xl md:shadow-lg',
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
          'flex items-center justify-between gap-3 shrink-0 w-full',
          'px-4 py-3 md:px-6 md:py-4',
          'border-b border-border md:border-b md:border-border',
          className
        )}
        {...props}
      >
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="بازگشت"
          >
            <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </button>
        ) : null}
        <div className="flex-1 min-w-0">{children}</div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden md:inline-flex shrink-0 rounded-full"
            onClick={onClose}
          >
            <X aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">بستن</span>
          </Button>
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
      className={cn('text-base font-semibold text-foreground', className)}
      {...props}
    />
  )
);
ModalTitle.displayName = 'ModalTitle';

export interface ModalDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  ModalDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
ModalDescription.displayName = 'ModalDescription';

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex-1 overflow-y-auto p-4 md:p-6 w-full', className)}
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
        'flex items-center gap-2 shrink-0 w-full',
        'p-4 md:p-6 md:pt-0 border-t border-border md:border-t-0',
        className
      )}
      {...props}
    />
  )
);
ModalFooter.displayName = 'ModalFooter';