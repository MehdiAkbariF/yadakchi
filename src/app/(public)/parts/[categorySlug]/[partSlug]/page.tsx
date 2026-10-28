// src/app/(public)/parts/[categorySlug]/[partSlug]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getHttpClient } from '@/core/http/client';
import { getPartService } from '@/domains/front/part/services/part.service';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { PartDetailsContent } from '@/components/features/Part/PartDetailsContent';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';

interface PartPageProps {
  params: Promise<{ categorySlug: string; partSlug: string }> | { categorySlug: string; partSlug: string };
  searchParams:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
}

/**
 * کش کردن درخواست GetPartPage برای جلوگیری از ۲ بار صدا زدن API در SSR
 */
const getCachedPartData = cache(async (partSlug: string) => {
  const partService = getPartService();
  try {
    const cleanSlug = decodeURIComponent(partSlug || '');
    return await partService.getPartPage(cleanSlug);
  } catch (error: any) {
    const status = error?.status ?? error?.response?.status;
    if (status === 404) return null;
    throw error;
  }
});

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\u003c');
}

/* -------------------------------------------------------------------------- */
/*                                سئو و متادیتا                               */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string; partSlug: string }> | { categorySlug: string; partSlug: string };
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const { categorySlug, partSlug: rawPartSlug } = resolvedParams;

  if (!rawPartSlug) return { title: 'قطعه یدکی | یدک‌چی' };

  try {
    const partSlug = decodeURIComponent(rawPartSlug);
    const partData = await getCachedPartData(partSlug);
    if (!partData) return { title: 'قطعه یدکی | یدک‌چی' };

    const seo = partData.seoInformation || {};
    const title = seo.title && seo.title !== 'no seo' ? seo.title : `${partData.name || 'قطعه یدکی'} | یدک‌چی`;
    const description =
      seo.description && seo.description !== 'no seo'
        ? seo.description
        : partData.description
          ? partData.description.replace(/<[^>]*>/g, '').slice(0, 160)
          : 'خرید آنلاین قطعات یدکی خودرو در یدک‌چی';
    const canonicalUrl = `https://www.yadakchi.com/parts/${categorySlug}/${encodeURIComponent(partSlug)}`;

    return {
      title,
      description,
      alternates: { canonical: canonicalUrl },
    };
  } catch {
    return { title: 'قطعه یدکی | یدک‌چی' };
  }
}

/* -------------------------------------------------------------------------- */
/*                                 صفحه اصلی                                  */
/* -------------------------------------------------------------------------- */

export default async function PartPage({ params, searchParams }: PartPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const { categorySlug, partSlug: rawPartSlug } = resolvedParams;

  if (!rawPartSlug) {
    notFound();
  }

  const partSlug = decodeURIComponent(rawPartSlug);
  const partData = await getCachedPartData(partSlug);

  if (!partData) {
    notFound();
  }

  // استخراج امن categoryId (از دیتای قطعه یا از روی UUID در URL)
  const isCategorySlugUuid = /^[0-9a-fA-F-]{36}$/.test(categorySlug);
  const categoryId: string | undefined = partData.category?.id || (isCategorySlugUuid ? categorySlug : undefined);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
      },
    },
  });

  const productService = getProductService();
  const brandService = getBrandService();
  const carService = getCarService();

  queryClient.setQueryData(['front', 'parts', 'page', partSlug, undefined], partData);

  const fromPrice = resolvedSearchParams.fromPrice ? Number(resolvedSearchParams.fromPrice) : undefined;
  const toPrice = resolvedSearchParams.toPrice ? Number(resolvedSearchParams.toPrice) : undefined;
  const pageNumber = resolvedSearchParams.page ? Math.max(1, Number(resolvedSearchParams.page)) : 1;
  const pageSize = resolvedSearchParams.pageSize ? Math.max(1, Number(resolvedSearchParams.pageSize)) : 30;

  // 🎯 فیلترها کاملاً منطبق با اسکیما Swagger متد /api/Search/products
  const filters: SearchProductsRequest = {
    partIds: partData?.id ? [partData.id] : undefined,
    partCategoryIds: categoryId ? [categoryId] : undefined,
    onlyInStock: resolvedSearchParams.inStock === 'true' ? true : undefined,
    fromPrice: !isNaN(fromPrice as number) ? fromPrice : undefined,
    toPrice: !isNaN(toPrice as number) ? toPrice : undefined,
    orderType: (resolvedSearchParams.sort as any) || 'Selected',
    pageNumber: !isNaN(pageNumber) ? pageNumber : 1,
    pageSize: !isNaN(pageSize) ? pageSize : 30,
    brandIds:
      typeof resolvedSearchParams.brandIds === 'string'
        ? [resolvedSearchParams.brandIds]
        : Array.isArray(resolvedSearchParams.brandIds)
          ? resolvedSearchParams.brandIds
          : undefined,
    carIds:
      typeof resolvedSearchParams.carIds === 'string'
        ? [resolvedSearchParams.carIds]
        : Array.isArray(resolvedSearchParams.carIds)
          ? resolvedSearchParams.carIds
          : undefined,
    types:
      typeof resolvedSearchParams.types === 'string'
        ? ([Number(resolvedSearchParams.types)] as any)
        : Array.isArray(resolvedSearchParams.types)
          ? (resolvedSearchParams.types.map(Number) as any)
          : undefined,
  };

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
        const response = await client.get<any[]>('/api/Front/PartCategories');
        return Array.isArray(response.data) ? response.data : [];
      },
    }),
  ]);

  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `https://www.yadakchi.com/parts/${categorySlug}/${encodeURIComponent(partSlug)}/#webpage`,
    url: `https://www.yadakchi.com/parts/${categorySlug}/${encodeURIComponent(partSlug)}`,
    name: partData.name,
    description: partData.description ? partData.description.replace(/<[^>]*>/g, '').slice(0, 200) : '',
    isPartOf: { '@id': 'https://www.yadakchi.com/#website' },
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemaJson) }}
      />
      <PartDetailsContent
        categorySlug={categorySlug}
        partSlug={partSlug}
        partId={partData.id}
        categoryId={categoryId}
      />
    </HydrationBoundary>
  );
}