import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { User } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full bg-muted',
  {
    variants: {
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-24 w-24',
        '3xl': 'h-32 w-32',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, children, ...props }, ref) => {
    const [errored, setErrored] = React.useState(false);
    const showImage = Boolean(src) && !errored;

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt ?? ''}
            className="h-full w-full object-cover"
            onError={() => setErrored(true)}
          />
        ) : fallback ? (
          <span className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">
            {fallback.slice(0, 2).toUpperCase()}
          </span>
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted-foreground">
            <User aria-hidden="true" className="h-1/2 w-1/2" />
          </span>
        )}
        {children}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center bg-muted text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

AvatarFallback.displayName = 'AvatarFallback';

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
}

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, ...props }, ref) => (
    <img
      ref={ref}
      src={src}
      alt={alt ?? ''}
      className={cn('h-full w-full object-cover', className)}
      {...props}
    />
  )
);

AvatarImage.displayName = 'AvatarImage';