import { Metadata } from 'next';
import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { getPartService } from '@/domains/front/part/services/part.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { SearchContent } from '@/components/features/ProductGrid/SearchContent';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';
import { getHttpClient } from '@/core/http/client';

export const metadata: Metadata = {
  title: 'جستجوی قطعات یدکی و لوازم خودرو | یدک‌چی',
  description: 'جستجو، مقایسه قیمت و خرید آنلاین انواع قطعات یدکی خودرو، ابزارآلات کارگاهی و لوازم بدنه از معتبرترین فروشگاه‌های قطعات کشور در یدک‌چی.',
  alternates: {
    canonical: 'https://www.yadakchi.com/search',
  },
  openGraph: {
    title: 'جستجوی قطعات یدکی و لوازم خودرو | یدک‌چی',
    description: 'بازارگاه تخصصی و جامع خرید آنلاین انواع قطعات و لوازم یدکی خودرو در ایران',
    url: 'https://www.yadakchi.com/search',
    siteName: 'یدک‌چی',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: 'https://api.yadakchi.com/Logo.svg',
        width: 1200,
        height: 630,
        alt: 'یدک‌چی جستجوی قطعات',
      },
    ],
  },
};

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
        queryFn: async () => {
          const client = getHttpClient();
          const response = await client.get<any[]>('/api/Front/PartCategories', {
            params: { CarId: '' }
          });
          return Array.isArray(response.data) ? response.data : [];
        },
      }),
    ]);
  } catch (error) {}

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "@id": "https://www.yadakchi.com/search/#webpage",
    "url": "https://www.yadakchi.com/search",
    "name": "نتایج جستجوی قطعات یدکی خودرو | یدک‌چی",
    "description": "صفحه نمایش نتایج جستجو و فیلترینگ قطعات خودرو بر اساس برند، مدل خودرو و دسته‌بندی قطعه",
    "isPartOf": {
      "@id": "https://www.yadakchi.com/#website"
    }
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <SearchContent />
    </HydrationBoundary>
  );
}