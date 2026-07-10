// src/components/shared/Layouts/AuthLayout/AuthLayout.tsx

import { cn } from '@/design-system/utils/cn';
import { Typography } from '@/components/primitives/Typography';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  className,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className={cn(
        'w-full max-w-md space-y-6 rounded-lg bg-background p-8 shadow-lg',
        className
      )}>
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl">Y</span>
          </div>
          <Typography variant="h3" className="mt-4">
            {title || 'خوش آمدید'}
          </Typography>
          {subtitle && (
            <Typography variant="muted" className="mt-2">
              {subtitle}
            </Typography>
          )}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}