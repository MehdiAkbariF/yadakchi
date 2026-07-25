import { Metadata } from 'next';
import { getHttpClient } from '@/core/http/client';
import { getPartService } from '@/domains/front/part/services/part.service';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { PartDetailsContent } from '@/components/features/Part/PartDetailsContent';
import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';

interface PartPageProps {
  params: { categorySlug: string; partSlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: { params: { categorySlug: string; partSlug: string } }): Promise<Metadata> {
  const client = getHttpClient();
  try {
    const response = await client.get<any>('/api/Front/GetPartPage', {
      params: { PartEnglishName: params.partSlug }
    });
    const seo = response.data?.seoInformation || {};
    const title = seo.title && seo.title !== 'no seo' ? seo.title : (response.data?.name || 'یدک‌چی');
    const description = seo.description && seo.description !== 'no seo' ? seo.description : (response.data?.description || '');
    return {
      title,
      description,
    };
  } catch {
    return { title: 'یدک‌چی' };
  }
}

export default async function PartPage({ params, searchParams }: PartPageProps) {
  const queryClient = new QueryClient();
  const partService = getPartService();
  const productService = getProductService();
  const brandService = getBrandService();
  const carService = getCarService();

  const filters: SearchProductsRequest = {
    partCategoryEnglishTitle: params.categorySlug,
    partEnglishTitle: params.partSlug,
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
        queryKey: ['front', 'parts', 'page', params.partSlug, undefined],
        queryFn: () => partService.getPartPage(params.partSlug),
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
        <PartDetailsContent categorySlug={params.categorySlug} partSlug={params.partSlug} />
      </MainLayout>
    </HydrationBoundary>
  );
}