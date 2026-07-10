// src/components/composites/FormField/FormField.tsx

import { forwardRef } from 'react';
import { cn } from '@/design-system/utils/cn';
import { Input } from '@/components/primitives/Input';
import { Typography } from '@/components/primitives/Typography';

export interface FormFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      className,
      label,
      error,
      description,
      required,
      leftIcon,
      rightIcon,
      size = 'md',
      variant = 'default',
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id || `field-${Math.random().toString(36).substring(7)}`;
    const hasError = !!error;

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label
            htmlFor={fieldId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <Input
          ref={ref}
          id={fieldId}
          size={size}
          variant={hasError ? 'error' : variant}
          error={error}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          aria-describedby={
            error ? `${fieldId}-error` : description ? `${fieldId}-description` : undefined
          }
          {...props}
        />
        {error && (
          <Typography
            id={`${fieldId}-error`}
            variant="small"
            color="destructive"
            className="mt-1"
          >
            {error}
          </Typography>
        )}
        {description && !error && (
          <Typography
            id={`${fieldId}-description`}
            variant="small"
            color="muted"
            className="mt-1"
          >
            {description}
          </Typography>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';