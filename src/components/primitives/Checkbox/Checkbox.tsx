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
          'group flex items-center gap-2.5 select-none',
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
            'h-5 w-5 shrink-0 rounded-md border flex items-center justify-center',
            'transition-all duration-fast ease-in-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            checked
              ? 'border-primary bg-primary text-primary-foreground shadow-xs'
              : 'border-input bg-card group-hover:border-primary/80 group-hover:bg-accent/40'
          )}
        >
          {checked ? (
            <Check aria-hidden="true" className="h-3.5 w-3.5 stroke-[3] text-primary-foreground" />
          ) : null}
        </button>
        {label ? (
          <span className="text-sm font-medium text-foreground group-hover:text-foreground/90">
            {label}
          </span>
        ) : null}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';