import * as React from 'react';
import { cn } from '@/design-system/utils/cn';
import { buttonVariants, type ButtonVariantProps } from '@/design-system/variants/button.variants';

const DotsLoader = () => (
  <span className="inline-flex items-center gap-1" aria-hidden="true">
    <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
    <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
    <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" />
  </span>
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      children,
      disabled,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        {...props}
      >
        {!isLoading && leftIcon ? <span aria-hidden="true">{leftIcon}</span> : null}
        {isLoading ? (
          loadingText ? (
            <>
              <span>{loadingText}</span>
              <DotsLoader />
            </>
          ) : (
            <DotsLoader />
          )
        ) : (
          children
        )}
        {!isLoading && rightIcon ? <span aria-hidden="true">{rightIcon}</span> : null}
      </button>
    );
  }
);

Button.displayName = 'Button';