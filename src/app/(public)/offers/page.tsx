import { Metadata } from 'next';
import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { getPartService } from '@/domains/front/part/services/part.service';
import { getHttpClient } from '@/core/http/client';
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { OffersContent } from '@/components/features/Offers/OffersContent';

export const metadata: Metadata = {
  title: 'یدک‌چی آف | تخفیف‌ها و جشنواره‌های ویژه قطعات خودرو',
  description: 'خرید قطعات یدکی، ابزارآلات و لوازم خودرو با تخفیف‌های شگفت‌انگیز، فرصت‌های محدود و قیمت‌های طلایی از فروشگاه‌های سراسر کشور در جشنواره یدک‌چی آف.',
  alternates: {
    canonical: 'https://www.yadakchi.com/offers',
  },
  openGraph: {
    title: 'یدک‌چی آف | تخفیف‌ها و جشنواره‌های ویژه قطعات خودرو',
    description: 'خرید انواع قطعات خودرو با نازل‌ترین قیمت‌ها و تخفیف‌های طلایی در بازارگاه تخصصی یدک‌چی',
    url: 'https://www.yadakchi.com/offers',
    siteName: 'یدک‌چی',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: 'https://api.yadakchi.com/Logo.svg',
        width: 1200,
        height: 630,
        alt: 'یدک‌چی آف',
      },
    ],
  },
};

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
  const httpClient = getHttpClient();

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
        queryFn: async () => {
          const response = await httpClient.get<any[]>('/api/Front/PartCategories', {
            params: { CarId: '' }
          });
          return Array.isArray(response.data) ? response.data : [];
        },
      }),
    ]);
  } catch (error) {}

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://www.yadakchi.com/offers/#webpage",
    "url": "https://www.yadakchi.com/offers",
    "name": "یدک‌چی آف | تخفیف‌های طلایی قطعات خودرو",
    "description": "لیست کامل قطعات یدکی و لوازم خودرو دارای تخفیف‌های شگفت‌انگیز و ویژه از فروشگاه‌های سراسر کشور",
    "isPartOf": {
      "@id": "https://www.yadakchi.com/#website"
    },
    "about": {
      "@type": "Thing",
      "name": "قطعات خودرو تخفیف‌دار"
    }
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <OffersContent />
    </HydrationBoundary>
  );
}