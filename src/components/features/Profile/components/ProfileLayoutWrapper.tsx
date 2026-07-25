'use client';

import { ProfileSidebar } from './ProfileSidebar';

interface ProfileLayoutWrapperProps {
  children: React.ReactNode;
  activeTab: string;
}

export function ProfileLayoutWrapper({ children, activeTab }: ProfileLayoutWrapperProps) {
  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 select-none text-right" dir="rtl">
      <div className="w-full lg:w-[320px] shrink-0">
        <ProfileSidebar />
      </div>
      <div className="flex-1 w-full min-w-0">
        {children}
      </div>
    </div>
  );
}