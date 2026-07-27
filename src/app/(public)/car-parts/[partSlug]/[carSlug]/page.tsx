import { Metadata } from 'next';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { getPartService } from '@/domains/front/part/services/part.service';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getHttpClient } from '@/core/http/client';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { CarPartsContent } from '@/components/features/CarParts/CarPartsContent';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';


interface CarPartsPageProps {
  params: { partSlug: string; carSlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: CarPartsPageProps): Promise<Metadata> {
  const decodedCarModel = decodeURIComponent(params.carSlug).replace(/-/g, ' ');
  const carService = getCarService();
  const partService = getPartService();

  try {
    const [carData, categoryData] = await Promise.all([
      carService.getCarPage(decodedCarModel),
      partService.getPartCategoryPage(params.partSlug)
    ]);

    const carName = carData?.model || decodedCarModel;
    const partName = categoryData?.category?.name || params.partSlug;

    return {
      title: `خرید لوازم یدکی و قطعات ${partName} ${carName} | یدک‌چی`,
      description: `خرید، مقایسه قیمت و سفارش آنلاین قطعات گروه ${partName} مخصوص خودروی ${carName} با ضمانت اصالت کالا و ارسال سریع در یدک‌چی.`,
      alternates: {
        canonical: `https://www.yadakchi.com/car-parts/${params.partSlug}/${params.carSlug}`,
      },
    };
  } catch {
    return { title: 'یدک‌چی' };
  }
}

export default async function CarPartsPage({ params, searchParams }: CarPartsPageProps) {
  const queryClient = new QueryClient();
  const carService = getCarService();
  const partService = getPartService();
  const productService = getProductService();
  const brandService = getBrandService();

  const decodedCarModel = decodeURIComponent(params.carSlug).replace(/-/g, ' ');

  const [carData, categoryData] = await Promise.all([
    carService.getCarPage(decodedCarModel).catch(() => null),
    partService.getPartCategoryPage(params.partSlug).catch(() => null)
  ]);

  if (carData) {
    queryClient.setQueryData(['reference', 'cars', 'page', decodedCarModel], carData);
  }
  if (categoryData) {
    queryClient.setQueryData(['front', 'parts', 'category-page', params.partSlug], categoryData);
  }

  const filters: SearchProductsRequest = {
    carModel: decodedCarModel,
    partCategoryEnglishTitle: params.partSlug,
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

  const schemaJson = carData && categoryData
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `https://www.yadakchi.com/car-parts/${params.partSlug}/${params.carSlug}/#webpage`,
        "url": `https://www.yadakchi.com/car-parts/${params.partSlug}/${params.carSlug}`,
        "name": `خرید قطعات ${categoryData.category.name} ${carData.model}`,
        "description": `آرشیو کامل و لیست قیمت قطعات گروه ${categoryData.category.name} مخصوص خودروی ${carData.model}`,
        "isPartOf": {
          "@id": "https://www.yadakchi.com/#website"
        }
      }
    : null;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
      )}
      <CarPartsContent 
        partSlug={params.partSlug} 
        carSlug={params.carSlug} 
      />
    </HydrationBoundary>
  );
}