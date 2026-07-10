// src/components/primitives/Typography/Typography.tsx

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/design-system/utils/cn';

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
      h2: 'scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0',
      h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
      h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
      h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
      h6: 'scroll-m-20 text-base font-semibold tracking-tight',
      p: 'leading-7 [&:not(:first-child)]:mt-6',
      lead: 'text-xl text-muted-foreground',
      large: 'text-lg font-semibold',
      small: 'text-sm font-medium leading-none',
      muted: 'text-sm text-muted-foreground',
      code: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
      blockquote: 'mt-6 border-l-2 pl-6 italic',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    color: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      destructive: 'text-destructive',
      success: 'text-success-500',
      warning: 'text-warning-500',
    },
    weight: {
      thin: 'font-thin',
      extralight: 'font-extralight',
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
      black: 'font-black',
    },
  },
  defaultVariants: {
    variant: 'p',
    align: 'left',
    color: 'default',
    weight: 'normal',
  },
});

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'lead' | 'large' | 'small' | 'muted' | 'code' | 'blockquote';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: 'default' | 'muted' | 'primary' | 'destructive' | 'success' | 'warning';
  weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  children: React.ReactNode;
}

export function Typography({
  className,
  variant = 'p',
  align = 'left',
  color = 'default',
  weight = 'normal',
  as: Component = 'p',
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn(
        typographyVariants({ variant, align, color, weight }),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

// Shorthand components for easier use
export function H1(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h1" as="h1" />;
}

export function H2(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h2" as="h2" />;
}

export function H3(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h3" as="h3" />;
}

export function H4(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h4" as="h4" />;
}

export function P(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="p" as="p" />;
}

export function Lead(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="lead" as="p" />;
}

export function Large(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="large" as="div" />;
}

export function Small(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="small" as="span" />;
}

export function Muted(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="muted" as="p" />;
}