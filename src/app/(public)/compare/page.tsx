// src/app/(public)/compare/page.tsx

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CompareContent } from '@/components/features/Compare/CompareContent';
import { PageLoading } from '@/components/composites/Loading/PageLoading';

export const metadata: Metadata = {
  title: 'مقایسه تخصصی قطعات خودرو | یدکچی',
  description: 'مقایسه فنی، قیمت و مشخصات قطعات یدکی خودرو در بازارگاه یدکچی',
};

export default function ComparePage() {
  return (
    <Suspense fallback={<PageLoading label="در حال بارگذاری صفحه مقایسه..." />}>
      <CompareContent />
    </Suspense>
  );
}