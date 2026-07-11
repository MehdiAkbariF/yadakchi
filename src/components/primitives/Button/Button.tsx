// src/components/primitives/Button/Button.tsx

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/design-system/utils/cn';

// 🚨 کامپوننت سه نقطه پرشی (Bouncing Dots)
const DotsLoader = () => (
  <span className="inline-flex items-center gap-1">
    <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]"></span>
    <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]"></span>
    <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce"></span>
  </span>
);

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2', // اضافه شدن gap برای فاصله استاندارد
    'rounded-md text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    'active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90',
          'dark:bg-primary dark:text-primary-foreground',
          'dark:hover:bg-primary/90',
        ],
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80',
          'dark:bg-secondary dark:text-secondary-foreground',
          'dark:hover:bg-secondary/80',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90',
          'dark:bg-destructive dark:text-destructive-foreground',
          'dark:hover:bg-destructive/90',
        ],
        outline: [
          'border border-input bg-background',
          'hover:bg-accent hover:text-accent-foreground',
          'dark:border-input dark:bg-background',
          'dark:hover:bg-accent dark:hover:text-accent-foreground',
        ],
        ghost: [
          'hover:bg-accent hover:text-accent-foreground',
          'dark:hover:bg-accent dark:hover:text-accent-foreground',
        ],
        link: [
          'underline-offset-4 hover:underline text-primary',
          'dark:text-primary',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      loadingText,
      children,
      disabled,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, fullWidth, className })
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* 🚨 نمایش آیکون سمت راست فقط زمانی که در حال لود نیست */}
        {!isLoading && leftIcon && <span className="ml-1">{leftIcon}</span>}
        
        {/* نمایش متن یا متن لودینگ */}
        {isLoading && loadingText ? loadingText : children}
        
        {/* 🚨 نمایش سه نقطه لودینگ به جای آیکون چرخان */}
        {isLoading && !loadingText && <DotsLoader />}
        {isLoading && loadingText && <DotsLoader />}
        
        {/* نمایش آیکون سمت چپ فقط زمانی که در حال لود نیست */}
        {!isLoading && rightIcon && <span className="mr-1">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';