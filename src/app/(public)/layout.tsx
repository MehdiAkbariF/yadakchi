// src/app/(public)/layout.tsx

import { MainLayout } from '@/components/shared/Layouts/MainLayout';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {

  return <MainLayout>{children}</MainLayout>;
}