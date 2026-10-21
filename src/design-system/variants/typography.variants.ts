import { cva, type VariantProps } from 'class-variance-authority';

export const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'scroll-mt-20 text-5xl font-bold tracking-tight',
      h2: 'scroll-mt-20 text-3xl font-semibold tracking-tight',
      h3: 'scroll-mt-20 text-2xl font-semibold tracking-tight',
      h4: 'scroll-mt-20 text-xl font-semibold',
      h5: 'scroll-mt-20 text-lg font-semibold',
      h6: 'scroll-mt-20 text-base font-semibold',
      p: 'text-base leading-reading',
      lead: 'text-lg leading-reading text-muted-foreground',
      large: 'text-lg font-semibold',
      small: 'text-sm font-medium',
      muted: 'text-sm text-muted-foreground',
      code: 'font-mono rounded-sm bg-muted px-1 py-0.5 text-sm font-semibold',
      blockquote: 'border-s-2 border-border ps-4 italic text-muted-foreground',
    },
    align: {
      start: 'text-start',
      center: 'text-center',
      end: 'text-end',
      justify: 'text-justify',
    },
    color: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      destructive: 'text-destructive',
      success: 'text-success',
      warning: 'text-warning',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    variant: 'p',
    color: 'default',
    weight: 'normal',
  },
});

export type TypographyVariantProps = VariantProps<typeof typographyVariants>;