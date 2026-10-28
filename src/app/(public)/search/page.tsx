import type { Metadata } from 'next';
import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { getPartService } from '@/domains/front/part/services/part.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { SearchContent } from '@/components/features/ProductGrid/SearchContent';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';
import { getHttpClient } from '@/core/http';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

// جلوگیری از باگ‌های امنیتی XSS در اسکریپت‌های ساختاریافته
function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/* -------------------------------------------------------------------------- */
/*                 سئوی داینامیک متناسب با عبارت جستجو شده                    */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(searchParams);
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q.trim() : '';
  const carModel = typeof resolvedParams.carModel === 'string' ? resolvedParams.carModel.trim() : '';
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category.trim() : '';

  let pageTitle = 'جستجوی قطعات یدکی و لوازم خودرو';

  if (query && carModel) {
    pageTitle = `خرید و قیمت ${query} برای ${carModel}`;
  } else if (query) {
    pageTitle = `قیمت و خرید ${query}`;
  } else if (carModel) {
    pageTitle = `لوازم یدکی و قطعات ${carModel}`;
  } else if (category) {
    pageTitle = `قطعات دسته ${category}`;
  }

  const canonicalUrl = 'https://www.yadakchi.com/search';

  return {
    title: `${pageTitle} | یدکچی`,
    description: `جستجو، مقایسه قیمت و خرید آنلاین ${query || 'قطعات یدکی'} از معتبرترین فروشگاه‌های قطعات کشور با ضمانت اصالت در یدکچی.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${pageTitle} | یدکچی`,
      description: 'بازارگاه تخصصی و جامع خرید آنلاین انواع قطعات و لوازم یدکی خودرو در ایران',
      url: canonicalUrl,
      siteName: 'یدکچی',
      locale: 'fa_IR',
      type: 'website',
      images: [
        {
          url: 'https://api.yadakchi.com/Logo.svg',
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                صفحه اصلی سرچ                               */
/* -------------------------------------------------------------------------- */

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // ✅ حل باگ Next.js 15: حل ناهمگام searchParams
  const resolvedParams = await Promise.resolve(searchParams);

  // ✅ حل باگ Cache Miss: ست کردن staleTime تا در کلاینت فورا دوباره درخواست ارسال نشود
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // ۱ دقیقه کش پایدار در کلاینت بدون رفرش ناخواسته
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
  const partService = getPartService();

  // نرمال‌سازی ایمن فیلترها
  const fromPrice = resolvedParams.fromPrice ? Number(resolvedParams.fromPrice) : undefined;
  const toPrice = resolvedParams.toPrice ? Number(resolvedParams.toPrice) : undefined;
  const pageNumber = resolvedParams.page ? Math.max(1, Number(resolvedParams.page)) : 1;
  const pageSize = resolvedParams.pageSize ? Math.max(1, Number(resolvedParams.pageSize)) : 30;

  const filters: SearchProductsRequest = {
    searchTitle: typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined,
    isProductInStock: resolvedParams.inStock === 'true' ? true : undefined,
    isSellerInUserCity: resolvedParams.userCity === 'true' ? true : undefined,
    partCategoryEnglishTitle: typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined,
    partEnglishTitle: typeof resolvedParams.part === 'string' ? resolvedParams.part : undefined,
    carModel: typeof resolvedParams.carModel === 'string' ? resolvedParams.carModel : undefined,
    shopId: typeof resolvedParams.shopId === 'string' ? resolvedParams.shopId : undefined,
    cityId: typeof resolvedParams.cityId === 'string' ? resolvedParams.cityId : undefined,
    hasDiscount: resolvedParams.discount === 'true' ? true : undefined,
    hasDiscountWithExpiration: resolvedParams.discountExp === 'true' ? true : undefined,
    fromPrice: !isNaN(fromPrice as number) ? fromPrice : undefined,
    toPrice: !isNaN(toPrice as number) ? toPrice : undefined,
    orderType: (resolvedParams.sort as any) || 'Selected',
    pageNumber: !isNaN(pageNumber) ? pageNumber : 1,
    pageSize: !isNaN(pageSize) ? pageSize : 30,
    brandIds: typeof resolvedParams.brandIds === 'string' ? [resolvedParams.brandIds] : Array.isArray(resolvedParams.brandIds) ? resolvedParams.brandIds : undefined,
    carIds: typeof resolvedParams.carIds === 'string' ? [resolvedParams.carIds] : Array.isArray(resolvedParams.carIds) ? resolvedParams.carIds : undefined,
    partCategoryIds: typeof resolvedParams.partCategoryIds === 'string' ? [resolvedParams.partCategoryIds] : Array.isArray(resolvedParams.partCategoryIds) ? resolvedParams.partCategoryIds : undefined,
  };

  // ✅ استفاده از Promise.allSettled تا در صورت خطای یک سرویس فرعی، کل صفحه مسدود نشود
  await Promise.allSettled([
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
          params: { CarId: '' },
        });
        return Array.isArray(response.data) ? response.data : [];
      },
    }),
  ]);

  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    '@id': 'https://www.yadakchi.com/search/#webpage',
    url: 'https://www.yadakchi.com/search',
    name: 'نتایج جستجوی قطعات یدکی خودرو | یدکچی',
    description: 'صفحه نمایش نتایج جستجو و فیلترینگ قطعات خودرو بر اساس برند، مدل خودرو و دسته‌بندی قطعه',
    isPartOf: {
      '@id': 'https://www.yadakchi.com/#website',
    },
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemaJson) }}
      />
      <SearchContent />
    </HydrationBoundary>
  );
}