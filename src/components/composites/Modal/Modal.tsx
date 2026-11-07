// src/components/composites/Modal/Modal.tsx
'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Button } from '@/components/primitives/Button';

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
      className="fixed inset-0 z-modal flex items-center justify-center p-0 md:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in',
          overlayClassName
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        className={cn(
          'relative z-10 flex flex-col bg-card border-border overflow-hidden outline-none',
          'w-full h-full max-h-full rounded-none',
          'md:w-full md:h-auto md:max-h-[88vh] md:rounded-2xl md:border md:shadow-2xl md:animate-enter',
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
          'flex items-center justify-between gap-3 shrink-0 w-full',
          'px-4 py-3 md:px-5 md:py-3.5',
          'border-b border-border/80 bg-card',
          className
        )}
        {...props}
      >
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none transition-colors"
            aria-label="بازگشت"
          >
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : null}
        <div className="flex-1 min-w-0">{children}</div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden md:inline-flex shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
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
      className={cn('text-title-sm', className)}
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
    className={cn('text-xs text-muted-foreground', className)}
    {...props}
  />
));
ModalDescription.displayName = 'ModalDescription';

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex-1 overflow-y-auto p-4 md:p-5 w-full min-h-0', className)}
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
        'flex items-center justify-end gap-2 shrink-0 w-full',
        'p-3.5 md:p-4 border-t border-border/80 bg-muted/20',
        className
      )}
      {...props}
    />
  )
);
ModalFooter.displayName = 'ModalFooter';