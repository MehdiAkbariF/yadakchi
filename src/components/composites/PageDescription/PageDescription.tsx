// src/components/composites/PageDescription/PageDescription.tsx

import * as React from 'react';
import { cn } from '@/design-system/utils/cn';

export interface PageDescriptionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  title?: string;
  description?: string;
  htmlContent?: string;
  children?: React.ReactNode;
}

// تابع اختصاصی و سبک ضد XSS + پاکسازی فونت سایزهای اضافه ادیتور
function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  return dirty
    // حذف تگ‌های اسکریپت و آی‌فریم
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    // حذف هندلرهای جاوااسکریپت
    .replace(/\s*on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '')
    // خنثی‌سازی پروتکل جاوااسکریپت در href
    .replace(/href\s*=\s*(['"])\s*javascript:.*?\1/gi, 'href="#"')
    // حذف صریح font-size و font-family از استایل‌های اینلاین ادیتور ادمین
    .replace(/font-size\s*:\s*[^;"]+;?/gi, '')
    .replace(/font-family\s*:\s*[^;"]+;?/gi, '');
}

export const PageDescription = React.forwardRef<HTMLDivElement, PageDescriptionProps>(
  ({ className, title, description, htmlContent, children, ...props }, ref) => {
    if (!title && !description && !htmlContent && !children) return null;

    const safeHtml = React.useMemo(() => {
      return htmlContent ? sanitizeHtml(htmlContent) : '';
    }, [htmlContent]);

    return (
      <div ref={ref} className={cn('space-y-4 py-6 border-t border-border/50', className)} {...props}>
        {title ? (
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
            {title}
          </h2>
        ) : null}

        {description ? (
          <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}

        {safeHtml ? (
          <div
            className={cn(
              'prose prose-sm max-w-none text-muted-foreground dark:prose-invert',
              // اعمال صریح سایز ریز برای تمام تگ‌های درون HTML
              'prose-p:text-xs sm:prose-p:text-sm prose-p:leading-6 prose-p:my-2',
              'prose-headings:text-sm sm:prose-headings:text-base prose-headings:font-bold prose-headings:text-foreground prose-headings:my-3',
              'prose-li:text-xs sm:prose-li:text-sm prose-li:my-1',
              'prose-strong:text-foreground prose-strong:font-bold',
              'prose-a:text-primary prose-a:underline-offset-4',
              // خنثی‌سازی اسپان‌های دارای فونت سایز اجباری
              '[&_span]:!text-inherit [&_p]:!text-inherit'
            )}
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        ) : null}

        {children}
      </div>
    );
  }
);

PageDescription.displayName = 'PageDescription';