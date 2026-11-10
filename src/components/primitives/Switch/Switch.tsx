// src/components/primitives/Switch/Switch.tsx
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onChange, className, disabled = false, id, 'aria-label': ariaLabel }, ref) => {
    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5',
          'transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // استفاده از Flex جهت تراز کردن کاملاً مستقل از راست‌به‌چپ یا چپ‌به‌راست بودن
          checked ? 'justify-start bg-primary' : 'justify-end bg-input',
          className
        )}
      >
        <motion.span
          layout
          transition={{
            type: 'spring',
            stiffness: 600,
            damping: 35,
          }}
          className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md"
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';