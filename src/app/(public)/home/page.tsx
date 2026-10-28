// src/app/(public)/home/page.tsx

import type { Metadata } from 'next';
import { cache } from 'react';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getBannerService } from '@/domains/front/banner/services/banner.service';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getShopService } from '@/domains/front/shop/services/shop.service';
import { getHttpClient } from '@/core/http/client';
import { HomeContent } from '@/components/features/Home/HomeContent';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface HomePageResponse {
  description?: string;
  [key: string]: unknown;
}

interface PartCategory {
  id?: string | number;
  name?: string;
  slug?: string;
  [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/*                                 Constants                                  */
/* -------------------------------------------------------------------------- */

const NOMINATED_CATEGORIES = [
  'car-tools',
  'audio-video-multimedia-system',
  'Exhaust',
  'heater',
  'door-handles-locks-and-safety',
  'body-and-weatherstrips',
] as const;

type NominatedCategory = (typeof NOMINATED_CATEGORIES)[number];

// ✅ اصلاح شد: دقیقا منطبق با پارامترهای ارسالی در کامپوننت کلاینتی ShopSlider
const SHOP_CARDS_PARAMS = {
  orderBy: 'Rating', // اصلاح از 'Rank' به 'Rating' جهت برقراری کش در کلاینت
  pageNumber: 1,
  pageSize: 30,
} as const;

/* -------------------------------------------------------------------------- */
/*                              Query Key Factory                             */
/* -------------------------------------------------------------------------- */

const homeKeys = {
  all: ['front'] as const,
  banners: (placement: string) => ['front', 'banners', placement] as const,
  homePage: () => ['front', 'get-home-page'] as const,
  nominatedDeals: () => ['front', 'products', 'nominated-deals', null] as const,
  partsCategories: () => ['front', 'parts', 'categories-flat', 'all'] as const,
  nominatedCategory: (slug: NominatedCategory) =>
    ['front', 'products', 'nominated-category', slug, null] as const,
  mainBrands: () => ['reference', 'brands', 'main'] as const,
  shopCards: (params: typeof SHOP_CARDS_PARAMS) =>
    ['front', 'shop', 'cards', params] as const,
};

/* -------------------------------------------------------------------------- */
/*                          React Query Client Factory                        */
/* -------------------------------------------------------------------------- */

// الگوی استاندارد ایزوله‌سازی QueryClient برای هر رکوئست سروری
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

/* -------------------------------------------------------------------------- */
/*                                  Metadata                                  */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'یدکچی | بازارگاه تخصصی قطعات خودرو و لوازم یدکی',
  description:
    'خرید مستقیم و آنلاین انواع قطعات یدکی، لوازم بدنه، ابزارآلات و تجهیزات خودرو از معتبرترین فروشگاه‌های سراسر کشور با ضمانت اصالت کالا در یدکچی.',
  alternates: {
    canonical: 'https://www.yadakchi.com/home',
  },
  openGraph: {
    title: 'یدکچی | بازارگاه تخصصی قطعات خودرو و لوازم یدکی',
    description:
      'بزرگ‌ترین بازارگاه تخصصی خودرو و لوازم یدکی در ایران. خرید مستقیم قطعات خودرو از فروشگاه‌های سراسر کشور.',
    url: 'https://www.yadakchi.com/home',
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

// بازتولید صفحه در پس‌زمینه سرور هر ۶۰ ثانیه (ISR)
export const revalidate = 60;

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

const schemaJson = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AutoPartsStore',
      '@id': 'https://www.yadakchi.com/#organization',
      name: 'یدکچی',
      url: 'https://www.yadakchi.com',
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://www.yadakchi.com/#logo',
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
      '@id': 'https://www.yadakchi.com/#website',
      url: 'https://www.yadakchi.com',
      name: 'یدکچی | بازارگاه تخصصی قطعات خودرو',
      description: 'بزرگ‌ترین بازارگاه تخصصی خودرو و لوازم یدکی در ایران',
      publisher: {
        '@id': 'https://www.yadakchi.com/#organization',
      },
      potentialAction: [
        {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate:
              'https://www.yadakchi.com/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      ],
      inLanguage: 'fa-IR',
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*                                  Page                                      */
/* -------------------------------------------------------------------------- */

export default async function HomePage() {
  const queryClient = getQueryClient();

  const bannerService = getBannerService();
  const productService = getProductService();
  const brandService = getBrandService();
  const shopService = getShopService();
  const httpClient = getHttpClient();

  // اجرای موازی تمام Prefetchها بدون مسدود کردن یکدیگر
  const prefetches: Array<Promise<void>> = [
    queryClient.prefetchQuery({
      queryKey: homeKeys.banners('Home'),
      queryFn: () => bannerService.getBanners('Home'),
      retry: 2,
    }),

    queryClient.prefetchQuery({
      queryKey: homeKeys.homePage(),
      queryFn: async () => {
        const response =
          await httpClient.get<HomePageResponse>('/api/Front/GetHomePage');
        return response.data;
      },
      retry: 1,
    }),

    queryClient.prefetchQuery({
      queryKey: homeKeys.nominatedDeals(),
      queryFn: () => productService.getNominatedProducts(),
      retry: 1,
    }),

    queryClient.prefetchQuery({
      queryKey: homeKeys.partsCategories(),
      queryFn: async () => {
        const response = await httpClient.get<PartCategory[]>(
          '/api/Front/PartCategories',
          { params: { CarId: '' } },
        );
        return Array.isArray(response.data) ? response.data : [];
      },
      retry: 1,
    }),

    ...NOMINATED_CATEGORIES.map((slug) =>
      queryClient.prefetchQuery({
        queryKey: homeKeys.nominatedCategory(slug),
        queryFn: () => productService.getNominatedProductsByCategory(slug),
        retry: 1,
      }),
    ),

    queryClient.prefetchQuery({
      queryKey: homeKeys.mainBrands(),
      queryFn: () => brandService.getMainBrands(),
      retry: 1,
    }),

    queryClient.prefetchQuery({
      queryKey: homeKeys.shopCards(SHOP_CARDS_PARAMS),
      queryFn: () => shopService.getShopCards(SHOP_CARDS_PARAMS),
      retry: 1,
    }),
  ];

  // استفاده از allSettled برای اطمینان از اینکه قطعی یک سرویس مانع لود بقیه صفحه نمی‌شود
  const results = await Promise.allSettled(prefetches);

  if (process.env.NODE_ENV === 'development') {
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `❌ [HomePage Prefetch Error] Index ${index}:`,
          result.reason,
        );
      }
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* اسکیما و سئوی ساختاریافته گوگل */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemaJson) }}
      />
      <HomeContent />
    </HydrationBoundary>
  );
}