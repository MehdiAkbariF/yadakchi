import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { getServerCurrentUser } from '@/domains/auth/server.auth'; 
import { getBannerService } from '@/domains/front/banner/services/banner.service';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getShopService } from '@/domains/front/shop/services/shop.service';
import { getHttpClient } from '@/core/http/client';
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { HomeContent } from '@/components/features/Home/HomeContent';

export default async function HomePage() {
  const queryClient = new QueryClient();

  const user = await getServerCurrentUser();
  if (user) {
    queryClient.setQueryData(queryKeys.auth.user, user);
  }

  const bannerService = getBannerService();
  const productService = getProductService();
  const brandService = getBrandService();
  const shopService = getShopService();
  const httpClient = getHttpClient();

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['front', 'banners', 'Home'],
        queryFn: () => bannerService.getBanners('Home'),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'nominated-category', 'car-tools', null],
        queryFn: () => productService.getNominatedProductsByCategory('car-tools'),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'nominated-category', 'audio-video-multimedia-system', null],
        queryFn: () => productService.getNominatedProductsByCategory('audio-video-multimedia-system'),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'nominated-category', 'Exhaust', null],
        queryFn: () => productService.getNominatedProductsByCategory('Exhaust'),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'nominated-category', 'heater', null],
        queryFn: () => productService.getNominatedProductsByCategory('heater'),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'nominated-category', 'door-handles-locks-and-safety', null],
        queryFn: () => productService.getNominatedProductsByCategory('door-handles-locks-and-safety'),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'nominated-category', 'body-and-weatherstrips', null],
        queryFn: () => productService.getNominatedProductsByCategory('body-and-weatherstrips'),
      }),
      queryClient.prefetchQuery({
        queryKey: ['reference', 'brands', 'main'],
        queryFn: () => brandService.getMainBrands(),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'shop', 'cards', { orderBy: 'Rank', pageNumber: 1, pageSize: 30 }],
        queryFn: () => shopService.getShopCards({ orderBy: 'Rank', pageNumber: 1, pageSize: 30 }),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'get-home-page'],
        queryFn: async () => {
          const response = await httpClient.get<any>('/api/Front/GetHomePage');
          return response.data;
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'nominated-deals', null],
        queryFn: () => productService.getNominatedProducts(),
      })
    ]);
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout>
        <HomeContent />
      </MainLayout>
    </HydrationBoundary>
  );
}