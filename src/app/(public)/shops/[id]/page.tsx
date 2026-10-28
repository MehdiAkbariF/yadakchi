// src/app/(public)/shops/[id]/page.tsx

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getHttpClient } from '@/core/http/client';
import { getShopService } from '@/domains/front/shop/services/shop.service';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ShopDetailsContent } from '@/components/features/Shop/ShopDetailsContent';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';
import { getFullUrl } from '@/core/utils/formatters';

interface ShopPageProps {
  params: Promise<{ id: string }> | { id: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

// ✅ بهینه‌سازی بحرانی ۱: کش کردن ریکوئست با React.cache برای جلوگیری از ۲ بار کال شدن API
const getCachedShopData = cache(async (shopId: string) => {
  const shopService = getShopService();
  try {
    return await shopService.getShopPage(shopId);
  } catch (error: any) {
    if (error?.status === 404 || error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
});

// جلوگیری از باگ‌های امنیتی XSS در اسکریپت‌های JSON-LD
function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/* -------------------------------------------------------------------------- */
/*                                سئو و متادیتا                                */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({ params }: { params: Promise<{ id: string }> | { id: string } }): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const shopId = resolvedParams.id;

  try {
    // استفاده از کش مشترک (هیچ ریکوئست اضافه‌ای ارسال نمی‌شود)
    const shopData = await getCachedShopData(shopId);
    if (!shopData) return { title: 'فروشگاه قطعات | یدکچی' };

    const seo = shopData.seoInformation || {};
    const title = seo.title || `فروشگاه لوازم یدکی ${shopData.shopTitle || 'یدکچی'}`;
    const description = (seo.description || `خرید مستقیم قطعات و لوازم یدکی خودرو از فروشگاه ${shopData.shopTitle} با ضمانت در یدکچی`).trim();
    const canonicalUrl = `https://www.yadakchi.com/shops/${shopId}`;
    const ogImage = shopData.logo ? getFullUrl(shopData.logo) : 'https://api.yadakchi.com/Logo.svg';

    return {
      title: `${title} | یدکچی`,
      description: description.slice(0, 160),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${title} | یدکچی`,
        description: description.slice(0, 160),
        url: canonicalUrl,
        siteName: 'یدکچی',
        locale: 'fa_IR',
        type: 'website',
        images: [
          {
            url: ogImage,
            width: 800,
            height: 600,
            alt: shopData.shopTitle,
          },
        ],
      },
    };
  } catch {
    return { title: 'فروشگاه لوازم یدکی | یدکچی' };
  }
}

/* -------------------------------------------------------------------------- */
/*                                صفحه اصلی                                   */
/* -------------------------------------------------------------------------- */

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  // ✅ سازگاری با Next.js 15
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const shopId = resolvedParams.id;

  if (!shopId) {
    notFound();
  }

  // استفاده از دیتای کش‌شده مشترک
  const shopData = await getCachedShopData(shopId);

  if (!shopData) {
    notFound();
  }

  // ✅ حل باگ Cache Miss: ست کردن staleTime تا کلاینت فوراً داده‌ها را رفرش نکند
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // ۱ دقیقه کش پایدار در کلاینت
        gcTime: 5 * 60 * 1000,
      },
    },
  });

  const productService = getProductService();
  const brandService = getBrandService();
  const carService = getCarService();

  // ثبت در کش برای استفاده فوری کامپوننت ShopDetailsContent
  queryClient.setQueryData(['front', 'shop', 'page', shopId], shopData);

  // پارس ایمن فیلترها و اعداد
  const fromPrice = resolvedSearchParams.fromPrice ? Number(resolvedSearchParams.fromPrice) : undefined;
  const toPrice = resolvedSearchParams.toPrice ? Number(resolvedSearchParams.toPrice) : undefined;
  const pageNumber = resolvedSearchParams.page ? Math.max(1, Number(resolvedSearchParams.page)) : 1;
  const pageSize = resolvedSearchParams.pageSize ? Math.max(1, Number(resolvedSearchParams.pageSize)) : 30;

  const filters: SearchProductsRequest = {
    shopId,
    isProductInStock: resolvedSearchParams.inStock === 'true' ? true : undefined,
    isSellerInUserCity: resolvedSearchParams.userCity === 'true' ? true : undefined,
    fromPrice: !isNaN(fromPrice as number) ? fromPrice : undefined,
    toPrice: !isNaN(toPrice as number) ? toPrice : undefined,
    orderType: (resolvedSearchParams.sort as any) || 'Selected',
    pageNumber: !isNaN(pageNumber) ? pageNumber : 1,
    pageSize: !isNaN(pageSize) ? pageSize : 30,
    brandIds: typeof resolvedSearchParams.brandIds === 'string' ? [resolvedSearchParams.brandIds] : Array.isArray(resolvedSearchParams.brandIds) ? resolvedSearchParams.brandIds : undefined,
    carIds: typeof resolvedSearchParams.carIds === 'string' ? [resolvedSearchParams.carIds] : Array.isArray(resolvedSearchParams.carIds) ? resolvedSearchParams.carIds : undefined,
    types: typeof resolvedSearchParams.types === 'string' ? [resolvedSearchParams.types] as any : Array.isArray(resolvedSearchParams.types) ? resolvedSearchParams.types : undefined,
  };

  // ✅ استفاده از Promise.allSettled جهت مقاومت در برابر خطای شبکه
  await Promise.allSettled([
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
          params: { CarId: '' },
        });
        return Array.isArray(response.data) ? response.data : [];
      },
    }),
  ]);

  // اسکیما استاندارد فروشگاه قطعات با اعتبارسنجی آدرس و تصویر
  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'AutoPartsStore',
    '@id': `https://www.yadakchi.com/shops/${shopId}/#organization`,
    name: shopData.shopTitle || 'فروشگاه لوازم یدکی',
    image: shopData.logo ? getFullUrl(shopData.logo) : 'https://api.yadakchi.com/Logo.svg',
    url: `https://www.yadakchi.com/shops/${shopId}`,
    address: shopData.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: shopData.address,
          addressCountry: 'IR',
        }
      : undefined,
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* اسکریپت امن و سئو شده برای اسکیما گوگل */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemaJson) }}
      />
      <ShopDetailsContent id={shopId} />
    </HydrationBoundary>
  );
}