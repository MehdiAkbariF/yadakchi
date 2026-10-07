// src/app/(public)/page/[slug]/loading.tsx

import { PageLoading } from '@/components/composites/Loading/PageLoading';

export default function StaticPageLoading() {
  return <PageLoading message="در حال بارگذاری صفحه..." />;
}