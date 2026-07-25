import { Metadata } from 'next';
import { getHttpClient } from '@/core/http/client';
import { getShopService } from '@/domains/front/shop/services/shop.service';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ShopDetailsContent } from '@/components/features/Shop/ShopDetailsContent';
import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';

interface ShopPageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const client = getHttpClient();
  try {
    const response = await client.get<any>('/api/Front/ShopPage', {
      params: { ShopId: params.id }
    });
    const seo = response.data?.seoInformation || {};
    return {
      title: seo.title || `فروشگاه ${response.data?.shopTitle || 'یدک‌چی'}`,
      description: seo.description || '',
    };
  } catch {
    return { title: 'یدک‌چی' };
  }
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const queryClient = new QueryClient();
  const shopService = getShopService();
  const productService = getProductService();
  const brandService = getBrandService();
  const carService = getCarService();

  const filters: SearchProductsRequest = {
    shopId: params.id,
    isProductInStock: searchParams.inStock === 'true' ? true : undefined,
    isSellerInUserCity: searchParams.userCity === 'true' ? true : undefined,
    fromPrice: searchParams.fromPrice ? Number(searchParams.fromPrice) : undefined,
    toPrice: searchParams.toPrice ? Number(searchParams.toPrice) : undefined,
    orderType: (searchParams.sort as any) || 'Selected',
    pageNumber: searchParams.page ? Number(searchParams.page) : 1,
    pageSize: searchParams.pageSize ? Number(searchParams.pageSize) : 30,
    brandIds: typeof searchParams.brandIds === 'string' ? [searchParams.brandIds] : Array.isArray(searchParams.brandIds) ? searchParams.brandIds : undefined,
    carIds: typeof searchParams.carIds === 'string' ? [searchParams.carIds] : Array.isArray(searchParams.carIds) ? searchParams.carIds : undefined,
    types: typeof searchParams.types === 'string' ? [searchParams.types] as any : Array.isArray(searchParams.types) ? searchParams.types : undefined,
  };

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['front', 'shop', 'page', params.id],
        queryFn: () => shopService.getShopPage(params.id),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'search', filters],
        queryFn: () => productService.searchProducts(filters),
      }),
      queryClient.prefetchQuery({
        queryKey: ['reference', 'brands', 'names', {}],
        queryFn: () => brandService.getBrandsName({}),
      }),
      queryClient.prefetchQuery({
        queryKey: ['reference', 'cars', 'names', { pageNumber: 1, pageSize: 50 }],
        queryFn: () => carService.getCarsName({ pageNumber: 1, pageSize: 50 }),
      }),
    ]);
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout>
        <ShopDetailsContent id={params.id} />
      </MainLayout>
    </HydrationBoundary>
  );
}