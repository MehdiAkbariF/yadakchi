import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { inputVariants } from '@/design-system/variants/input.variants';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  error?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      containerClassName,
      options = [],
      error,
      label,
      description,
      placeholder,
      size = 'md',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    const descriptionId = `${selectId}-description`;
    const hasError = Boolean(error);

    return (
      <div className={cn('w-full space-y-1.5', containerClassName)}>
        {label ? (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={hasError || undefined}
            aria-describedby={
              hasError ? errorId : description ? descriptionId : undefined
            }
            className={cn(
              inputVariants({ variant: hasError ? 'error' : 'default', size }),
              'appearance-none pe-10 cursor-pointer',
              className
            )}
            {...props}
          >
            {placeholder ? <option value="">{placeholder}</option> : null}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
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

Select.displayName = 'Select';