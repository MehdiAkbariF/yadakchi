import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { getAuthService } from '@/domains/auth/services/auth.service';
import { ProfileDesktopNav } from '@/components/features/Profile/components/navigation/ProfileDesktopNav';
import { ProfileHeader } from '@/components/features/Profile/components/navigation/ProfileHeader';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default async function ProfileLayout({ children }: ProfileLayoutProps) {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();

  const authService = getAuthService();
  const currentUser = await authService.getCurrentUser({ cookie: cookieHeader });

  if (!currentUser) {
    redirect('/login?redirect=/profile');
  }

  return (
    <MainLayout>
      <div className="w-full" dir="rtl">
        {/* هدر مخصوص اپلیکیشن در موبایل به همراه کشوی دسترسی سریع */}
        <ProfileHeader />

        {/* افزایش عرض دسکتاپ به 1680px برای مانیتورهای عریض و استفاده حداکثری از فضا */}
        <div className="mx-auto w-full max-w-[105rem] px-3 sm:px-6 lg:px-8 xl:px-10 py-4 lg:py-8">
          <div className="flex items-start gap-8">
            {/* منوی ثابت سایدبار در دسکتاپ (عرض 300px عریض و خوانا) */}
            <div className="hidden lg:block w-[18.125rem] xl:w-[20rem] shrink-0">
              <ProfileDesktopNav />
            </div>

            {/* بخش اصلی محتوای داشبورد */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}