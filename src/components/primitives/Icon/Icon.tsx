// src/components/primitives/Icon/Icon.tsx

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/design-system/utils/cn';
import { LucideProps } from 'lucide-react';

const iconVariants = cva('shrink-0', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
      '2xl': 'h-10 w-10',
      '3xl': 'h-12 w-12',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface IconProps
  extends Omit<LucideProps, 'size'>,
    VariantProps<typeof iconVariants> {
  icon: React.ComponentType<LucideProps>;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, icon: IconComponent, ...props }, ref) => {
    return (
      <IconComponent
        ref={ref}
        className={cn(iconVariants({ size }), className)}
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';