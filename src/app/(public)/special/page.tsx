// src/app/(public)/special/page.tsx

import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { getPartService } from '@/domains/front/part/services/part.service';
import { getStaticService } from '@/domains/front/static/services/static.service'; // سرویس زمان جهت همگام‌سازی تایمرها
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { SpecialContent } from '@/components/features/Special/SpecialContent';

/* 
  صفحه فروش ویژه به صورت کاملاً استاتیک و دوره‌ای (ISR) کش می‌شود 
  تا سنگین‌ترین کوئری‌های فیلتر تخفیف زمان‌دار مستقیماً از روی کش با سرعت لود شوند.
*/
export const revalidate = 60;

export default async function SpecialPage() {
  const queryClient = new QueryClient();

  const user = await getServerCurrentUser();
  if (user) {
    queryClient.setQueryData(queryKeys.auth.user, user);
  }

  const productService = getProductService();
  const brandService = getBrandService();
  const carService = getCarService();
  const partService = getPartService();
  const staticService = getStaticService();

  // فیلتر اولیه جهت پیش‌دانلود کالاها روی سرور
  const initialFilters = {
    hasDiscountWithExpiration: true,
    pageNumber: 1,
    pageSize: 30,
    orderType: 'Selected' as const,
  };

  try {
    await Promise.all([
      // ۱. پرفچ کالاهای دارای تخفیف زمان‌دار
      queryClient.prefetchQuery({
        queryKey: queryKeys.front.products.search(initialFilters),
        queryFn: () => productService.searchProducts(initialFilters),
      }),
      // ۲. پرفچ زمان رسمی سرور جهت همگام‌سازی ثانیه‌شمار کارت‌ها
      queryClient.prefetchQuery({
        queryKey: ['front', 'current-time'],
        queryFn: () => staticService.getCurrentTime(),
      }),
      // ۳. پرفچ برندها
      queryClient.prefetchQuery({
        queryKey: ['reference', 'brands', 'names', {}],
        queryFn: () => brandService.getBrandsName({}),
      }),
      // ۴. پرفچ خودروها
      queryClient.prefetchQuery({
        queryKey: ['reference', 'cars', 'names', { pageNumber: 1, pageSize: 50 }],
        queryFn: () => carService.getCarsName({ pageNumber: 1, pageSize: 50 }),
      }),
      // ۵. پرفچ دسته‌بندی‌ها
      queryClient.prefetchQuery({
        queryKey: ['front', 'parts', 'categories-flat', 'all'],
        queryFn: () => partService.getPartCategories(''),
      }),
    ]);
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      
        <SpecialContent />
      
    </HydrationBoundary>
  );
}