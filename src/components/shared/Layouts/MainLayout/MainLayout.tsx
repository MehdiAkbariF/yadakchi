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
  hideBottomNav?: boolean;
}

export function MainLayout({
  children,
  className,
  hideHeader = false,
  hideFooter = false,
  hideBottomNav = false,
}: MainLayoutProps) {
  const pathname = usePathname();

  // آیا در صفحات پروفایل هستیم؟
  const isProfileSection = pathname.startsWith('/profile');

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* در موبایلِ صفحات پروفایل، هدر سنگین مارکت‌پلیس را مخفی می‌کنیم اما در دسکتاپ همیشه نمایش داده می‌شود */}
      {!hideHeader && (
        <div className={cn(isProfileSection && 'hidden lg:block')}>
          <Header />
        </div>
      )}

      <main
        className={cn(
          'flex-1 w-full max-w-[1840px] mx-auto min-h-[80vh]',
          isProfileSection ? 'px-0 py-0 pb-16 lg:pb-8 lg:px-6 lg:py-6' : 'px-4 md:px-6 py-6 pb-20 lg:pb-6',
          className
        )}
      >
        <PageTransition key={pathname}>
          {children}
        </PageTransition>
      </main>

      {/* در صفحات پروفایل، فوتر را در موبایل مخفی می‌کنیم تا حس اپلیکیشن تمیز حفظ شود */}
      {!hideFooter && (
        <div className={cn(isProfileSection && 'hidden lg:block')}>
          <Footer />
        </div>
      )}

      {/* نوار اصلی پایین صفحه موبایل */}
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}