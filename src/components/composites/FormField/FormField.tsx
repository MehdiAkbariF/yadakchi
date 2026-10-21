import * as React from 'react';
import { Input, type InputProps } from '@/components/primitives/Input';

export interface FormFieldProps extends InputProps {
  required?: boolean;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, required, ...props }, ref) => {
    const displayLabel = required && label ? `${label} *` : label;
    return (
      <Input
        ref={ref}
        label={displayLabel}
        required={required}
        aria-required={required || undefined}
        {...props}
      />
    );
  }
);

FormField.displayName = 'FormField';