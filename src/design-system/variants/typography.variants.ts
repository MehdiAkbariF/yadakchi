import { cva, type VariantProps } from 'class-variance-authority';

export const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'scroll-mt-20 text-3xl font-bold tracking-tight lg:text-4xl',
      h2: 'scroll-mt-20 text-2xl font-bold tracking-tight lg:text-3xl',
      h3: 'scroll-mt-20 text-xl font-semibold tracking-tight lg:text-2xl',
      h4: 'scroll-mt-20 text-lg font-semibold lg:text-xl',
      h5: 'scroll-mt-20 text-base font-semibold lg:text-lg',
      h6: 'scroll-mt-20 text-sm font-semibold lg:text-base',
      p: 'text-sm leading-reading lg:text-base',
      lead: 'text-base leading-reading text-muted-foreground lg:text-lg',
      large: 'text-base font-semibold lg:text-lg',
      small: 'text-xs font-medium lg:text-sm',
      muted: 'text-xs text-muted-foreground lg:text-sm',
      'label': 'text-xs font-bold text-foreground',
      'label-muted': 'text-xs font-bold text-muted-foreground',
      'label-2xs': 'text-2xs font-bold text-muted-foreground',
      'title-sm': 'text-sm font-bold text-foreground',
      'title-sm-muted': 'text-sm font-medium text-muted-foreground',
      code: 'rounded-sm bg-muted px-1 py-0.5 text-xs font-semibold lg:text-sm',
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