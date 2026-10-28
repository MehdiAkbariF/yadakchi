// src/app/(public)/offers/page.tsx

import type { Metadata } from 'next';
import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { getHttpClient } from '@/core/http/client';
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { OffersContent } from '@/components/features/Offers/OffersContent';

/* -------------------------------------------------------------------------- */
/*                                  Metadata                                  */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'یدکچی آف | تخفیف‌ها و جشنواره‌های ویژه قطعات خودرو',
  description:
    'خرید قطعات یدکی، ابزارآلات و لوازم خودرو با تخفیف‌های شگفت‌انگیز، فرصت‌های محدود و قیمت‌های طلایی از فروشگاه‌های سراسر کشور در جشنواره یدکچی آف.',
  alternates: {
    canonical: 'https://www.yadakchi.com/offers',
  },
  openGraph: {
    title: 'یدکچی آف | تخفیف‌ها و جشنواره‌های ویژه قطعات خودرو',
    description:
      'خرید انواع قطعات خودرو با نازل‌ترین قیمت‌ها و تخفیف‌های طلایی در بازارگاه تخصصی یدکچی',
    url: 'https://www.yadakchi.com/offers',
    siteName: 'یدکچی',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: 'https://api.yadakchi.com/Logo.svg',
        width: 1200,
        height: 630,
        alt: 'یدکچی آف',
      },
    ],
  },
};

// بازسازی خودکار در پس‌زمینه سرور هر ۱ دقیقه (ISR)
export const revalidate = 60;

// پاک‌سازی امنیتی کاراکترهای خطرناک برای اسکریپت‌های JSON-LD
function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/* -------------------------------------------------------------------------- */
/*                                 صفحه اصلی                                  */
/* -------------------------------------------------------------------------- */

export default async function OffersPage() {
  // ✅ حل باگ Cache Miss: تنظیم staleTime تا کلاینت فوراً داده‌ها را دور نریزد
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // ۱ دقیقه کش پایدار در کلاینت
        gcTime: 5 * 60 * 1000,
      },
    },
  });

  const user = await getServerCurrentUser();
  if (user) {
    queryClient.setQueryData(queryKeys.auth.user, user);
  }

  const productService = getProductService();
  const brandService = getBrandService();
  const carService = getCarService();
  const httpClient = getHttpClient();

  // فیلتر اولیه صفحه لندینگ تخفیف‌ها (صفحه اول)
  const initialFilters = {
    hasDiscount: true,
    pageNumber: 1,
    pageSize: 30,
    orderType: 'Selected' as const,
  };

  // ✅ استفاده از Promise.allSettled تا خطای یک سرویس فرعی، کل صفحه را مسدود نکند
  await Promise.allSettled([
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
          params: { CarId: '' },
        });
        return Array.isArray(response.data) ? response.data : [];
      },
    }),
  ]);

  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.yadakchi.com/offers/#webpage',
    url: 'https://www.yadakchi.com/offers',
    name: 'یدکچی آف | تخفیف‌های طلایی قطعات خودرو',
    description:
      'لیست کامل قطعات یدکی و لوازم خودرو دارای تخفیف‌های شگفت‌انگیز و ویژه از فروشگاه‌های سراسر کشور',
    isPartOf: {
      '@id': 'https://www.yadakchi.com/#website',
    },
    about: {
      '@type': 'Thing',
      name: 'قطعات خودرو تخفیف‌دار',
    },
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* اسکریپت امن و سئو شده برای اسکیما گوگل */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemaJson) }}
      />
      <OffersContent />
    </HydrationBoundary>
  );
}