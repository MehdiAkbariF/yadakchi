// src/app/(public)/offers/page.tsx


import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { getPartService } from '@/domains/front/part/services/part.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { OffersContent } from '@/components/features/Offers/OffersContent';

/* 
  صفحه یدک‌چی آف به صورت کاملاً استاتیک و دوره‌ای (ISR) کش می‌شود 
  تا سنگین‌ترین کوئری‌های فیلتر تخفیف مستقیماً از روی کش با سرعت برق‌آسا لود شوند.
*/
export const revalidate = 60;

export default async function OffersPage() {
  const queryClient = new QueryClient();

  const user = await getServerCurrentUser();
  if (user) {
    queryClient.setQueryData(queryKeys.auth.user, user);
  }

  const productService = getProductService();
  const brandService = getBrandService();
  const carService = getCarService();
  const partService = getPartService();

  // فیلتر اولیه جهت پیش‌دانلود کالاها روی سرور
  const initialFilters = {
    hasDiscount: true,
    pageNumber: 1,
    pageSize: 30,
    orderType: 'Selected' as const,
  };

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.front.products.search(initialFilters),
        queryFn: () => productService.searchProducts(initialFilters),
      }),
      queryClient.prefetchQuery({
        queryKey: ['reference', 'brands', 'names', {}],
        queryFn: () => brandService.getBrandsName({}),
      }),
      queryClient.prefetchQuery({
        queryKey: ['reference', 'cars', 'names', { pageNumber: 1, pageSize: 50 }],
        queryFn: () => carService.getCarsName({ pageNumber: 1, pageSize: 50 }),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'parts', 'categories-flat', 'all'],
        queryFn: () => partService.getPartCategories(''),
      }),
    ]);
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
     
        <OffersContent />
     
    </HydrationBoundary>
  );
}