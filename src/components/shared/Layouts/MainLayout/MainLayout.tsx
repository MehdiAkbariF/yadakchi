// src/components/shared/Layouts/MainLayout/MainLayout.tsx

import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { cn } from '@/design-system/utils/cn';

export interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export function MainLayout({
  children,
  className,
  hideHeader = false,
  hideFooter = false,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {!hideHeader && <Header />}
      <main className={cn('flex-1 container py-8', className)}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}