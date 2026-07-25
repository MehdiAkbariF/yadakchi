import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { ProfileSidebar } from '@/components/features/Profile/components/ProfileSidebar';
import { getAuthService } from '@/domains/auth/services/auth.service';

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
      <div className="w-full flex flex-col lg:flex-row gap-8 select-none text-right" dir="rtl">
        <div className="w-full lg:w-[320px] shrink-0">
          <ProfileSidebar />
        </div>
        
        <div className="flex-1 w-full min-w-0">
          {children}
        </div>
      </div>
    </MainLayout>
  );
}