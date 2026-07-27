// src/app/(public)/bestsellers/page.tsx

import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { getPartService } from '@/domains/front/part/services/part.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { BestsellersContent } from '@/components/features/Bestsellers/BestsellersContent';

/* 
  صفحه پرفروش‌ترین‌ها به صورت کاملاً استاتیک و دوره‌ای (ISR) کش می‌شود 
  تا سنگین‌ترین کوئری‌های فیلتر فروش برتر مستقیماً از روی کش با سرعت برق‌آسا لود شوند.
*/
export const revalidate = 60;

export default async function BestsellersPage() {
  const queryClient = new QueryClient();

  const user = await getServerCurrentUser();
  if (user) {
    queryClient.setQueryData(queryKeys.auth.user, user);
  }

  const productService = getProductService();
  const brandService = getBrandService();
  const carService = getCarService();
  const partService = getPartService();

  // فیلتر اولیه جهت پیش‌دانلود کالاها روی سرور بر اساس اولویت پرفروش‌ترین‌ها
  const initialFilters = {
    orderType: 'BestSelling' as const,
    pageNumber: 1,
    pageSize: 30,
  };

  try {
    await Promise.all([
      // ۱. پرفچ کالاها بر اساس فیلتر پرفروش‌ترین‌ها
      queryClient.prefetchQuery({
        queryKey: queryKeys.front.products.search(initialFilters),
        queryFn: () => productService.searchProducts(initialFilters),
      }),
      // ۲. پرفچ برندها
      queryClient.prefetchQuery({
        queryKey: ['reference', 'brands', 'names', {}],
        queryFn: () => brandService.getBrandsName({}),
      }),
      // ۳. پرفچ خودروها
      queryClient.prefetchQuery({
        queryKey: ['reference', 'cars', 'names', { pageNumber: 1, pageSize: 50 }],
        queryFn: () => carService.getCarsName({ pageNumber: 1, pageSize: 50 }),
      }),
      // ۴. پرفچ دسته‌بندی‌ها
      queryClient.prefetchQuery({
        queryKey: ['front', 'parts', 'categories-flat', 'all'],
        queryFn: () => partService.getPartCategories(''),
      }),
    ]);
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
     
        <BestsellersContent />
      
    </HydrationBoundary>
  );
}