import { cva, type VariantProps } from 'class-variance-authority';

export const inputVariants = cva(
  [
    'flex w-full rounded-md border bg-background',
    'px-3 py-2 text-sm text-foreground',
    'placeholder:text-muted-foreground',
    'transition-colors duration-fast ease-in-out',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: 'border-input focus-visible:border-primary',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-success focus-visible:ring-success',
      },
      size: {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type InputVariantProps = VariantProps<typeof inputVariants>;