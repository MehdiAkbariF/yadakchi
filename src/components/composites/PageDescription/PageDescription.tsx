import * as React from 'react';
import { cn } from '@/design-system/utils/cn';

export interface PageDescriptionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  title?: string;
  description?: string;
  htmlContent?: string;
  children?: React.ReactNode;
}

export const PageDescription = React.forwardRef<HTMLDivElement, PageDescriptionProps>(
  ({ className, title, description, htmlContent, children, ...props }, ref) => {
    // اگر هیچ محتوایی وجود نداشت، null برگردان
    if (!title && !description && !htmlContent && !children) return null;

    return (
      <div ref={ref} className={cn('space-y-4 py-6 border-t border-border/50', className)} {...props}>
        {title ? (
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {title}
          </h2>
        ) : null}

        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}

        {/* رندر محتوای HTML (مثل توضیحات صفحه اصلی) */}
        {htmlContent ? (
          <div
            className="prose prose-sm max-w-none text-xs leading-relaxed text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : null}

        {children}
      </div>
    );
  }
);
PageDescription.displayName = 'PageDescription';