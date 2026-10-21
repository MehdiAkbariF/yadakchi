import * as React from 'react';
import { cn } from '@/design-system/utils/cn';
import { inputVariants } from '@/design-system/variants/input.variants';

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  error?: string;
  label?: string;
  description?: string;
  containerClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      containerClassName,
      error,
      label,
      description,
      size = 'md',
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const descriptionId = `${textareaId}-description`;
    const errorId = `${textareaId}-error`;
    const hasError = Boolean(error);

    return (
      <div className={cn('w-full space-y-1.5', containerClassName)}>
        {label ? (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError ? errorId : description ? descriptionId : undefined
          }
          className={cn(
            inputVariants({ variant: hasError ? 'error' : 'default', size }),
            'min-h-[80px] resize-y py-2',
            className
          )}
          {...props}
        />
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

TextArea.displayName = 'TextArea';