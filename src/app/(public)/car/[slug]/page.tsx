import { Metadata } from 'next';
import { getHttpClient } from '@/core/http/client';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { CarDetailsContent } from '@/components/features/Car/CarDetailsContent';
import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';

interface CarPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const client = getHttpClient();
  try {
    const response = await client.get<any>('/api/Front/CarPage', {
      params: { CarModel: params.slug }
    });
    const seo = response.data?.seoInformation || {};
    return {
      title: seo.title && seo.title !== 'no seo' ? seo.title : `لوازم یدکی و قطعات خودروی ${response.data?.model || 'یدک‌چی'}`,
      description: seo.description && seo.description !== 'no seo' ? seo.description : (response.data?.description || ''),
    };
  } catch {
    return { title: 'یدک‌چی' };
  }
}

export default async function CarPage({ params, searchParams }: CarPageProps) {
  const queryClient = new QueryClient();
  const carService = getCarService();
  const productService = getProductService();
  const brandService = getBrandService();

  const filters: SearchProductsRequest = {
    carModel: params.slug,
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
        queryKey: ['reference', 'cars', 'page', params.slug],
        queryFn: () => carService.getCarPage(params.slug),
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
        <CarDetailsContent slug={params.slug} />
      </MainLayout>
    </HydrationBoundary>
  );
}