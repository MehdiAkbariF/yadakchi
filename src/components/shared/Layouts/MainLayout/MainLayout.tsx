'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { BottomNav } from '@/components/sections/BottomNav/BottomNav';
import { cn } from '@/design-system/utils/cn';
import { PageTransition } from '@/shared/Transitions/PageTransition';

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
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      {!hideHeader && <Header />}
      
      <main className={cn('flex-1 w-full max-w-[1840px] mx-auto px-4 md:px-6 py-6 pb-20 lg:pb-6 min-h-[80vh]', className)}>
        <PageTransition key={pathname}>
          {children}
        </PageTransition>
      </main>
      
      {!hideFooter && <Footer />}
      <BottomNav />
    </div>
  );
}