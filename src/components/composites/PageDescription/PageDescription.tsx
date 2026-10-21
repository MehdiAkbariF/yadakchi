import * as React from 'react';
import { cn } from '@/design-system/utils/cn';

export interface PageDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export const PageDescription = React.forwardRef<HTMLDivElement, PageDescriptionProps>(
  ({ className, title, description, children, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children}
    </div>
  )
);
PageDescription.displayName = 'PageDescription';