// src/app/(public)/blog/page.tsx

import type { Metadata } from 'next';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getBlogService } from '@/domains/blog/services/blog.service';
import { BlogListContent } from '@/components/features/Blog/BlogListContent';

export const metadata: Metadata = {
  title: 'مجله تخصصی خودرو و قطعات یدکی | یدک‌چی',
  description: 'دانشنامه و مقالات تخصصی معرفی، نگهداری، عیب‌یابی و راهنمای خرید انواع قطعات خودرو و لوازم یدکی در یدک‌چی.',
  alternates: {
    canonical: 'https://www.yadakchi.com/blog',
  },
  openGraph: {
    title: 'مجله تخصصی خودرو و قطعات یدکی | یدک‌چی',
    description: 'راهنمای جامع و مقالات تخصصی دنیای خودرو و لوازم یدکی در ایران',
    url: 'https://www.yadakchi.com/blog',
    siteName: 'یدک‌چی',
    locale: 'fa_IR',
    type: 'website',
  },
};

export const revalidate = 120; // بازتولید افزایشی هر ۲ دقیقه

interface BlogPageProps {
  searchParams: {
    category?: string;
    q?: string;
    page?: string;
    carTypeIds?: string | string[];
    partIds?: string | string[];
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const queryClient = new QueryClient();
  const blogService = getBlogService();

  const category = searchParams.category;
  const q = searchParams.q;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const carTypeIds = Array.isArray(searchParams.carTypeIds)
    ? searchParams.carTypeIds
    : searchParams.carTypeIds ? [searchParams.carTypeIds] : undefined;
  const partIds = Array.isArray(searchParams.partIds)
    ? searchParams.partIds
    : searchParams.partIds ? [searchParams.partIds] : undefined;

  const filters = {
    title: q,
    blogCategoryId: category,
    carTypeIds,
    partIds,
    pageNumber: page,
    pageSize: 12,
  };

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['blog', 'categories'],
        queryFn: () => blogService.getCategories(),
      }),
      queryClient.prefetchQuery({
        queryKey: ['blog', 'filters', { blogCategoryId: category, carTypeIds, partIds }],
        queryFn: () => blogService.getFilters({ blogCategoryId: category, carTypeIds, partIds }),
      }),
      queryClient.prefetchQuery({
        queryKey: ['blog', 'posts', filters],
        queryFn: () => blogService.getPosts(filters),
      }),
    ]);
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlogListContent />
    </HydrationBoundary>
  );
}