// src/app/(public)/bestsellers/page.tsx

import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { getHttpClient } from '@/core/http/client';
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { BestsellersContent } from '@/components/features/Bestsellers/BestsellersContent';
import type { SearchProductsRequest } from '@/domains/front/product/types/view.types';

export const revalidate = 60;


const BESTSELLERS_BASE_FILTERS: SearchProductsRequest = {
  orderType: 'BestSelling',
  onlyInStock: true,
  excludeDuplicateProducts: true,
  pageNumber: 1,
  pageSize: 30,
  includeAggregations: true,
};

export default async function BestsellersPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
      },
    },
  });

  const user = await getServerCurrentUser();
  if (user) {
    queryClient.setQueryData(queryKeys.auth.user, user);
  }

  const productService = getProductService();
  const brandService = getBrandService();
  const carService = getCarService();
  const httpClient = getHttpClient();

  const initialFilters: SearchProductsRequest = { ...BESTSELLERS_BASE_FILTERS };

  await Promise.allSettled([
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
      queryFn: async () => {
        const response = await httpClient.get<any[]>('/api/Front/PartCategories', {
          params: { CarId: '' },
        });
        return Array.isArray(response.data) ? response.data : [];
      },
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BestsellersContent />
    </HydrationBoundary>
  );
}