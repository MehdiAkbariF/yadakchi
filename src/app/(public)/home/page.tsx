// src/app/(public)/home/page.tsx

import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { getServerCurrentUser } from '@/domains/auth/server.auth'; 
import { getBannerService } from '@/domains/front/banner/services/banner.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { HomeContent } from '@/components/features/Home/HomeContent';

export default async function HomePage() {
  const queryClient = new QueryClient();

  // ۱. دریافت اطلاعات کاربر در سمت سرور
  const user = await getServerCurrentUser();
  if (user) {
    queryClient.setQueryData(queryKeys.auth.user, user);
  }

  // ۲. پیش‌خوانی اطلاعات بنرها در سمت سرور (Prefetch)
  const bannerService = getBannerService();
  try {
    await queryClient.prefetchQuery({
      queryKey: ['front', 'banners', 'Home'],
      queryFn: () => bannerService.getBanners('Home'),
    });
  } catch (error) {
    // نادیده گرفتن خطا جهت پایداری بالا در لودینگ ابتدایی صفحه
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout>
        <HomeContent />
      </MainLayout>
    </HydrationBoundary>
  );
}