import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-lg font-medium whitespace-nowrap',
    'transition-all duration-fast ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-primary-foreground shadow-xs',
          'hover:bg-primary-hover hover:shadow-sm',
          'active:bg-primary-active',
        ],
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80',
        ],
        outline: [
          'border border-border bg-background text-foreground shadow-xs',
          'hover:bg-muted hover:border-muted-foreground/30 hover:text-foreground',
        ],
        'outline-primary': [
          'border border-primary/60 bg-transparent text-primary',
          'hover:bg-primary/10 hover:border-primary',
          'active:bg-primary/20',
        ],
        ghost: [
          'text-foreground',
          'hover:bg-muted hover:text-foreground',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground shadow-xs',
          'hover:bg-destructive/90',
        ],
        link: [
          'text-primary underline-offset-4',
          'hover:underline',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-xs font-semibold sm:h-10 sm:text-sm',
        lg: 'h-11 px-6 text-sm font-semibold sm:h-12 sm:text-base',
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

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;