import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { getPartService } from '@/domains/front/part/services/part.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { SearchContent } from '@/components/features/ProductGrid/SearchContent';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const queryClient = new QueryClient();

  const user = await getServerCurrentUser();
  if (user) {
    queryClient.setQueryData(queryKeys.auth.user, user);
  }

  const productService = getProductService();
  const brandService = getBrandService();
  const carService = getCarService();
  const partService = getPartService();

  const filters: SearchProductsRequest = {
    searchTitle: typeof searchParams.q === 'string' ? searchParams.q : undefined,
    isProductInStock: searchParams.inStock === 'true' ? true : undefined,
    isSellerInUserCity: searchParams.userCity === 'true' ? true : undefined,
    partCategoryEnglishTitle: typeof searchParams.category === 'string' ? searchParams.category : undefined,
    partEnglishTitle: typeof searchParams.part === 'string' ? searchParams.part : undefined,
    carModel: typeof searchParams.carModel === 'string' ? searchParams.carModel : undefined,
    shopId: typeof searchParams.shopId === 'string' ? searchParams.shopId : undefined,
    cityId: typeof searchParams.cityId === 'string' ? searchParams.cityId : undefined,
    hasDiscount: searchParams.discount === 'true' ? true : undefined,
    hasDiscountWithExpiration: searchParams.discountExp === 'true' ? true : undefined,
    fromPrice: searchParams.fromPrice ? Number(searchParams.fromPrice) : undefined,
    toPrice: searchParams.toPrice ? Number(searchParams.toPrice) : undefined,
    orderType: (searchParams.sort as any) || 'Selected',
    pageNumber: searchParams.page ? Number(searchParams.page) : 1,
    pageSize: searchParams.pageSize ? Number(searchParams.pageSize) : 30,
    brandIds: typeof searchParams.brandIds === 'string' ? [searchParams.brandIds] : Array.isArray(searchParams.brandIds) ? searchParams.brandIds : undefined,
    carIds: typeof searchParams.carIds === 'string' ? [searchParams.carIds] : Array.isArray(searchParams.carIds) ? searchParams.carIds : undefined,
    partCategoryIds: typeof searchParams.partCategoryIds === 'string' ? [searchParams.partCategoryIds] : Array.isArray(searchParams.partCategoryIds) ? searchParams.partCategoryIds : undefined,
  };

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.front.products.search(filters),
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
      queryClient.prefetchQuery({
        queryKey: ['front', 'parts', 'categories-flat', 'all'],
        queryFn: () => partService.getPartCategories(''),
      }),
    ]);
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout>
        <SearchContent />
      </MainLayout>
    </HydrationBoundary>
  );
}