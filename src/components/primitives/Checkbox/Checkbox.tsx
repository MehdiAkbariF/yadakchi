import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, onChange, label, className, disabled, id }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          'flex items-center gap-2 select-none',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          className
        )}
      >
        <button
          ref={ref}
          id={checkboxId}
          type="button"
          role="checkbox"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
          className={cn(
            'h-5 w-5 shrink-0 rounded-sm border flex items-center justify-center',
            'transition-colors duration-fast ease-in-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            checked
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-input bg-card hover:border-primary'
          )}
        >
          {checked ? (
            <Check aria-hidden="true" className="h-3 w-3 stroke-[3]" />
          ) : null}
        </button>
        {label ? (
          <span className="text-sm text-foreground">{label}</span>
        ) : null}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
