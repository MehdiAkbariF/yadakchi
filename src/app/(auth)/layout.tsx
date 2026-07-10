// src/app/(auth)/layout.tsx

import { MainLayout } from '@/components/shared/Layouts/MainLayout';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout hideHeader hideFooter>
      {children}
    </MainLayout>
  );
}