import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { ProfileSidebar } from '@/components/features/Profile/components/ProfileSidebar';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
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