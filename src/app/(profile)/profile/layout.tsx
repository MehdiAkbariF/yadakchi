import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { ProfileSidebar } from '@/components/features/Profile/components/ProfileSidebar';
import { getAuthService } from '@/domains/auth/services/auth.service';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default async function ProfileLayout({ children }: ProfileLayoutProps) {
  // گرفتن هدر کوکی در سرورکامپوننت برای احراز هویت
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();

  const authService = getAuthService();
  const currentUser = await authService.getCurrentUser({ cookie: cookieHeader });

  // اگر کاربر معتبر یافت نشد، انتقال سریع به صفحه لاگین به همراه بازگشت به روت جاری
  if (!currentUser) {
    redirect('/login?redirect=/profile');
  }

  return (
    <MainLayout>
      <div className="w-full flex flex-col lg:flex-row gap-8 select-none text-right" dir="rtl">
        <div className="w-full lg:w-[280px] shrink-0">
          <ProfileSidebar />
        </div>
        
        <div className="flex-1 w-full min-w-0">
          {children}
        </div>
      </div>
    </MainLayout>
  );
}