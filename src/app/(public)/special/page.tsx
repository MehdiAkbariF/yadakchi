import { Metadata } from 'next';
import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { getPartService } from '@/domains/front/part/services/part.service';
import { getStaticService } from '@/domains/front/static/services/static.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { SpecialContent } from '@/components/features/Special/SpecialContent';
import { getHttpClient } from '@/core/http/client';

export const metadata: Metadata = {
  title: 'فروش ویژه | جشنواره آفرها و قطعات شگفت‌انگیز خودرو',
  description: 'خرید انواع قطعات یدکی، لوازم بدنه و تجهیزات جانبی خودرو در جشنواره فروش ویژه یدک‌چی با تخفیف‌های زمان‌دار و فرصت محدود با ضمانت اصالت کالا.',
  alternates: {
    canonical: 'https://www.yadakchi.com/special',
  },
  openGraph: {
    title: 'فروش ویژه | جشنواره آفرها و قطعات شگفت‌انگیز خودرو',
    description: 'تخفیف‌های زمان‌دار شگفت‌انگیز قطعات خودرو در جشنواره فروش ویژه یدک‌چی',
    url: 'https://www.yadakchi.com/special',
    siteName: 'یدک‌چی',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: 'https://api.yadakchi.com/Logo.svg',
        width: 1200,
        height: 630,
        alt: 'فروش ویژه یدک‌چی',
      },
    ],
  },
};

export const revalidate = 60;

export default async function SpecialPage() {
  const queryClient = new QueryClient();

  const user = await getServerCurrentUser();
  if (user) {
    queryClient.setQueryData(queryKeys.auth.user, user);
  }

  const productService = getProductService();
  const brandService = getBrandService();
  const carService = getCarService();
  const partService = getPartService();
  const staticService = getStaticService();

  const initialFilters = {
    hasDiscountWithExpiration: true,
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
        queryKey: ['front', 'current-time'],
        queryFn: () => staticService.getCurrentTime(),
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
    "@type": "CollectionPage",
    "@id": "https://www.yadakchi.com/special/#webpage",
    "url": "https://www.yadakchi.com/special",
    "name": "فروش ویژه یدک‌چی | آفرهای شگفت‌انگیز و زمان‌دار",
    "description": "جشنواره قطعات یدکی و لوازم خودرو دارای تخفیف‌های زمان‌دار و فرصت خرید محدود در سراسر کشور",
    "isPartOf": {
      "@id": "https://www.yadakchi.com/#website"
    },
    "about": {
      "@type": "Thing",
      "name": "فروش شگفت‌انگیز لوازم خودرو"
    }
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <SpecialContent />
    </HydrationBoundary>
  );
}