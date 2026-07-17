'use client';

import { usePathname } from 'next/navigation';
import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { ProfileSidebar } from '@/components/features/Profile/components/ProfileSidebar';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname.includes('/orders')) return 'orders';
    if (pathname.includes('/support')) return 'support';
    if (pathname.includes('/wallet')) return 'wallet';
    if (pathname.includes('/favorites')) return 'favorites';
    if (pathname.includes('/addresses')) return 'addresses';
    if (pathname.includes('/comments')) return 'comments';
    if (pathname.includes('/notifications')) return 'notifications';
    if (pathname.includes('/history')) return 'history';
    if (pathname.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  return (
    <MainLayout>
      <div className="w-full flex flex-col lg:flex-row gap-8 select-none text-right" dir="rtl">
        <ProfileSidebar activeTab={getActiveTab()} />
        <div className="flex-1 w-full min-w-0">{children}</div>
      </div>
    </MainLayout>
  );
}