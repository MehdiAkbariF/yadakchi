import type { Metadata } from 'next';
import { cache } from 'react';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getBannerService } from '@/domains/front/banner/services/banner.service';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getShopService } from '@/domains/front/shop/services/shop.service';
import { getPartService } from '@/domains/front/part/services/part.service';
import { getHttpClient } from '@/core/http/client';
import { HomeContent } from '@/components/features/Home/HomeContent';

const SHOP_CARDS_PARAMS = {
  orderBy: 'Rating',
  pageNumber: 1,
  pageSize: 30,
} as const;

const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          gcTime: 5 * 60 * 1000,
        },
      },
    })
);

export const metadata: Metadata = {
  title: 'یدکچی | بازارگاه تخصصی قطعات خودرو و لوازم یدکی',
  description:
    'خرید مستقیم و آنلاین انواع قطعات یدکی، لوازم بدنه، ابزارآلات و تجهیزات خودرو از معتبرترین فروشگاه‌های سراسر کشور با ضمانت اصالت کالا در یدکچی.',
  alternates: {
    canonical: 'https://yadakchi.com/',
  },
  openGraph: {
    title: 'یدکچی | بازارگاه تخصصی قطعات خودرو و لوازم یدکی',
    description:
      'بزرگ‌ترین بازارگاه تخصصی خودرو و لوازم یدکی در ایران. خرید مستقیم قطعات خودرو از فروشگاه‌های سراسر کشور.',
    url: 'https://yadakchi.com/',
    siteName: 'یدکچی',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: 'https://api.yadakchi.com/Logo.svg',
        width: 1200,
        height: 630,
        alt: 'یدکچی | بازارگاه تخصصی قطعات خودرو',
      },
    ],
  },
};

export const revalidate = 60;

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

const schemaJson = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AutoPartsStore',
      '@id': 'https://yadakchi.com/#organization',
      name: 'یدکچی',
      url: 'https://yadakchi.com',
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://yadakchi.com/#logo',
        url: 'https://api.yadakchi.com/Logo.svg',
        caption: 'یدکچی | بازارگاه تخصصی قطعات خودرو',
      },
      image: 'https://api.yadakchi.com/Logo.svg',
      description:
        'بزرگ‌ترین بازارگاه تخصصی خودرو و لوازم یدکی در ایران. خرید مستقیم قطعات خودرو از فروشگاه‌های سراسر کشور.',
      priceRange: 'IRR',
      inLanguage: 'fa-IR',
      sameAs: [
        'https://www.instagram.com/yadakchi',
        'https://t.me/yadakchi',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://yadakchi.com/#website',
      url: 'https://yadakchi.com',
      name: 'یدکچی | بازارگاه تخصصی قطعات خودرو',
      description: 'بزرگ‌ترین بازارگاه تخصصی خودرو و لوازم یدکی در ایران',
      publisher: {
        '@id': 'https://yadakchi.com/#organization',
      },
      potentialAction: [
        {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://yadakchi.com/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      ],
      inLanguage: 'fa-IR',
    },
  ],
};

export default async function HomePage() {
  const queryClient = getQueryClient();

  const bannerService = getBannerService();
  const productService = getProductService();
  const brandService = getBrandService();
  const shopService = getShopService();
  const partService = getPartService();
  const httpClient = getHttpClient();

  let mainCategories: any[] = [];
  try {
    mainCategories = await partService.getPartCategories(undefined, true);
  } catch {
    mainCategories = [];
  }

  const validCategories = Array.isArray(mainCategories) ? mainCategories : [];

  const prefetches: Array<Promise<void>> = [
    queryClient.prefetchQuery({
      queryKey: ['front', 'banners', 'Home'],
      queryFn: () => bannerService.getBanners('Home'),
      retry: 2,
    }),

    queryClient.prefetchQuery({
      queryKey: ['front', 'parts', 'categories', undefined, true],
      queryFn: () => validCategories,
    }),

    queryClient.prefetchQuery({
      queryKey: ['front', 'get-home-page'],
      queryFn: async () => {
        const response = await httpClient.get<any>('/api/Front/GetHomePage');
        return response.data;
      },
      retry: 1,
    }),

    queryClient.prefetchQuery({
      queryKey: ['front', 'products', 'nominated-deals', null],
      queryFn: () => productService.getNominatedProducts(),
      retry: 1,
    }),

    queryClient.prefetchQuery({
      queryKey: ['reference', 'brands', 'main'],
      queryFn: () => brandService.getMainBrands(),
      retry: 1,
    }),

    queryClient.prefetchQuery({
      queryKey: ['front', 'shop', 'cards', SHOP_CARDS_PARAMS],
      queryFn: () => shopService.getShopCards(SHOP_CARDS_PARAMS),
      retry: 1,
    }),

    ...validCategories.map((cat: any) =>
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'nominated-category', cat.englishTitle || cat.id, null],
        queryFn: () => productService.getNominatedProductsByCategory(cat.englishTitle || cat.id),
        retry: 1,
      })
    ),
  ];

  await Promise.allSettled(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemaJson) }}
      />
      <HomeContent />
    </HydrationBoundary>
  );
}