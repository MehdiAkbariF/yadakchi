// src/app/(public)/special/page.tsx

import type { Metadata } from 'next';
import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { getStaticService } from '@/domains/front/static/services/static.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { SpecialContent } from '@/components/features/Special/SpecialContent';
import { getHttpClient } from '@/core/http/client';
import type { SearchProductsRequest } from '@/domains/front/product/types/view.types';

/* -------------------------------------------------------------------------- */
/*                                  Metadata                                  */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'فروش ویژه | جشنواره آفرها و قطعات شگفت‌انگیز خودرو',
  description:
    'خرید انواع قطعات یدکی، لوازم بدنه و تجهیزات جانبی خودرو در جشنواره فروش ویژه یدکچی با تخفیف‌های زمان‌دار و فرصت محدود با ضمانت اصالت کالا.',
  alternates: {
    canonical: 'https://www.yadakchi.com/special',
  },
  openGraph: {
    title: 'فروش ویژه | جشنواره آفرها و قطعات شگفت‌انگیز خودرو',
    description: 'تخفیف‌های زمان‌دار شگفت‌انگیز قطعات خودرو در جشنواره فروش ویژه یدکچی',
    url: 'https://www.yadakchi.com/special',
    siteName: 'یدکچی',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: 'https://api.yadakchi.com/Logo.svg',
        width: 1200,
        height: 630,
        alt: 'فروش ویژه یدکچی',
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
/*                    فیلتر پایه صفحه فروش ویژه (زمان‌دار)                    */
/* -------------------------------------------------------------------------- */

/**
 * ⚠️ مهم: این ثابت باید دقیقاً با SPECIAL_BASE_FILTERS در
 * src/components/features/Special/SpecialContent.tsx یکسان باشد
 * تا queryKey سرور و کلاینت برابر و Hydration بدون refetch کار کند.
 *
 * مطابق سواگر /api/Search/Products:
 *   - onlyDiscounted:            تضمین تخفیف‌دار بودن
 *   - hasDiscountWithExpiration: فقط تخفیف‌های دارای تاریخ انقضا (ثانیه‌شمار)
 *   - onlyInStock:               فقط موجود در انبار
 *   - excludeDuplicateProducts:  جلوگیری از تکرار کالا از فروشندگان مختلف
 *   - sortBy: CreationDate + sortDesc: جدیدترین آفرها اول
 *   - includeAggregations:       برای سایدبار فیلترها
 */
const SPECIAL_BASE_FILTERS: SearchProductsRequest = {
  onlyDiscounted: true,
  hasDiscountWithExpiration: true,
  onlyInStock: true,
  excludeDuplicateProducts: true,
  sortBy: 'CreationDate',
  sortDesc: true,
  pageNumber: 1,
  pageSize: 30,
  includeAggregations: true,
};

/* -------------------------------------------------------------------------- */
/*                                 صفحه اصلی                                  */
/* -------------------------------------------------------------------------- */

export default async function SpecialPage() {
  // ✅ حل باگ Cache Miss: ست کردن staleTime تا کلاینت فوراً ۵ ریکوئست تکراری نزند
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
  const staticService = getStaticService();
  const httpClient = getHttpClient();

  // ✅ فیلتر سرور دقیقاً همان چیزی است که کلاینت در اولین رندر می‌سازد
  const initialFilters: SearchProductsRequest = { ...SPECIAL_BASE_FILTERS };

  // ✅ استفاده از Promise.allSettled جهت مقاومت در برابر خطای شبکه
  await Promise.allSettled([
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
    '@id': 'https://www.yadakchi.com/special/#webpage',
    url: 'https://www.yadakchi.com/special',
    name: 'فروش ویژه یدکچی | آفرهای شگفت‌انگیز و زمان‌دار',
    description: 'جشنواره قطعات یدکی و لوازم خودرو دارای تخفیف‌های زمان‌دار و فرصت خرید محدود در سراسر کشور',
    isPartOf: {
      '@id': 'https://www.yadakchi.com/#website',
    },
    about: {
      '@type': 'Thing',
      name: 'فروش شگفت‌انگیز لوازم خودرو',
    },
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* اسکریپت امن و سئو شده برای اسکیما گوگل */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemaJson) }}
      />
      <SpecialContent />
    </HydrationBoundary>
  );
}