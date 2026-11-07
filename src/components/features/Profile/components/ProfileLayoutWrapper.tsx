'use client';

import { ProfileSidebar } from './ProfileSidebar';

export interface ProfileLayoutWrapperProps {
  children: React.ReactNode;
  activeTab: string;
}

export function ProfileLayoutWrapper({ children }: ProfileLayoutWrapperProps) {
  return (
    <div className="flex w-full flex-col gap-6 select-none lg:flex-row lg:gap-8">
      <div className="w-full shrink-0 lg:w-[18.75rem] xl:w-[20rem]">
        <ProfileSidebar />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}