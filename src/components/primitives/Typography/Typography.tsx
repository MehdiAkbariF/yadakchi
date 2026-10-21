import * as React from 'react';
import { cn } from '@/design-system/utils/cn';
import {
  typographyVariants,
  type TypographyVariantProps,
} from '@/design-system/variants/typography.variants';

type VariantKey = NonNullable<TypographyVariantProps['variant']>;

const defaultElement: Record<VariantKey, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  p: 'p',
  lead: 'p',
  large: 'div',
  small: 'span',
  muted: 'p',
  code: 'code',
  blockquote: 'blockquote',
};

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    TypographyVariantProps {
  as?: React.ElementType;
  children: React.ReactNode;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      className,
      variant = 'p',
      align,
      color = 'default',
      weight,
      as,
      children,
      ...props
    },
    ref
  ) => {
    const Component = (as ?? defaultElement[variant as VariantKey] ?? 'p') as React.ElementType;
    return (
      <Component
        ref={ref}
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
);

Typography.displayName = 'Typography';

export const H1 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'as'>>(
  (props, ref) => <Typography ref={ref} as="h1" variant="h1" {...props} />
);
H1.displayName = 'H1';

export const H2 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'as'>>(
  (props, ref) => <Typography ref={ref} as="h2" variant="h2" {...props} />
);
H2.displayName = 'H2';

export const H3 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'as'>>(
  (props, ref) => <Typography ref={ref} as="h3" variant="h3" {...props} />
);
H3.displayName = 'H3';

export const H4 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'as'>>(
  (props, ref) => <Typography ref={ref} as="h4" variant="h4" {...props} />
);
H4.displayName = 'H4';

export const P = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant' | 'as'>>(
  (props, ref) => <Typography ref={ref} as="p" variant="p" {...props} />
);
P.displayName = 'P';

export const Lead = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant' | 'as'>>(
  (props, ref) => <Typography ref={ref} as="p" variant="lead" {...props} />
);
Lead.displayName = 'Lead';

export const Large = React.forwardRef<HTMLDivElement, Omit<TypographyProps, 'variant' | 'as'>>(
  (props, ref) => <Typography ref={ref} as="div" variant="large" {...props} />
);
Large.displayName = 'Large';

export const Small = React.forwardRef<HTMLSpanElement, Omit<TypographyProps, 'variant' | 'as'>>(
  (props, ref) => <Typography ref={ref} as="span" variant="small" {...props} />
);
Small.displayName = 'Small';

export const Muted = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant' | 'as'>>(
  (props, ref) => <Typography ref={ref} as="p" variant="muted" {...props} />
);
Muted.displayName = 'Muted';