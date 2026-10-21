import * as React from 'react';
import { cn } from '@/design-system/utils/cn';
import { inputVariants, type InputVariantProps } from '@/design-system/variants/input.variants';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    InputVariantProps {
  error?: string;
  label?: string;
  description?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      variant = 'default',
      size = 'md',
      type = 'text',
      error,
      label,
      description,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = `${inputId}-description`;
    const errorId = `${inputId}-error`;
    const hasError = Boolean(error);
    const resolvedVariant = hasError ? 'error' : variant;

    return (
      <div className={cn('w-full space-y-1.5', containerClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          {leftIcon ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            type={type}
            aria-invalid={hasError || undefined}
            aria-describedby={
              hasError ? errorId : description ? descriptionId : undefined
            }
            className={cn(
              inputVariants({ variant: resolvedVariant, size }),
              leftIcon && 'ps-10',
              rightIcon && 'pe-10',
              className
            )}
            {...props}
          />
          {rightIcon ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {rightIcon}
            </span>
          ) : null}
        </div>
        {hasError ? (
          <p id={errorId} role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : description ? (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';