// src/app/(public)/part-category/[slug]/page.tsx

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getHttpClient } from '@/core/http/client';
import { getPartService } from '@/domains/front/part/services/part.service';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { PartCategoryContent } from '@/components/features/Part/PartCategoryContent';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';

interface PartCategoryPageProps {
  params: Promise<{ slug: string }> | { slug: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

// کش سروری مقاوم: هیچ خطایی (حتی ۵۰۰ سرور) کل صفحه Next.js را متوقف نمی‌کند
const getCachedCategoryData = cache(async (slug: string) => {
  const partService = getPartService();
  try {
    const data = await partService.getPartCategoryPage(slug);
    return data;
  } catch (error: any) {
    console.error(`❌ [PartCategory Error] Failed to load slug "${slug}":`, error?.message || error);
    return null;
  }
});

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/* -------------------------------------------------------------------------- */
/*                                سئو و متادیتا                                */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = decodeURIComponent(resolvedParams.slug || '').trim();

  try {
    const categoryData = await getCachedCategoryData(slug);
    if (!categoryData) return { title: 'دسته‌بندی قطعات خودرو | یدکچی' };

    const category = categoryData.category || categoryData;
    const seo = categoryData.seoInformation || category?.seoInformation || {};
    const title = seo.title || category.name ? `${category.name} | یدکچی` : 'دسته‌بندی قطعات خودرو | یدکچی';
    const description = (seo.description || category.description || `خرید و قیمت قطعات ${category.name || ''} با ضمانت اصالت در یدکچی`).trim();
    const canonicalUrl = `https://yadakchi.com/part-category/${slug}`;

    return {
      title,
      description: description.slice(0, 160),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description: description.slice(0, 160),
        url: canonicalUrl,
        siteName: 'یدکچی',
        locale: 'fa_IR',
        type: 'website',
        images: [
          {
            url: 'https://api.yadakchi.com/Logo.svg',
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
    };
  } catch {
    return { title: 'دسته‌بندی قطعات خودرو | یدکچی' };
  }
}

/* -------------------------------------------------------------------------- */
/*                                صفحه اصلی                                   */
/* -------------------------------------------------------------------------- */

export default async function PartCategoryPage({ params, searchParams }: PartCategoryPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const slug = decodeURIComponent(resolvedParams.slug || '').trim();

  if (!slug) {
    notFound();
  }

  // دریافت دیتای کش‌شده (با قابلیت Fallback در صورت خطای ۵۰۰ بک‌اند)
  const categoryData = await getCachedCategoryData(slug);

  if (!categoryData) {
    notFound();
  }

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

  queryClient.setQueryData(['front', 'parts', 'category-page', slug], categoryData);

  const fromPrice = resolvedSearchParams.fromPrice ? Number(resolvedSearchParams.fromPrice) : undefined;
  const toPrice = resolvedSearchParams.toPrice ? Number(resolvedSearchParams.toPrice) : undefined;
  const pageNumber = resolvedSearchParams.page ? Math.max(1, Number(resolvedSearchParams.page)) : 1;
  const pageSize = resolvedSearchParams.pageSize ? Math.max(1, Number(resolvedSearchParams.pageSize)) : 30;

  const filters: SearchProductsRequest = {
    partCategoryEnglishTitle: slug,
    onlyInStock: resolvedSearchParams.inStock === 'true' ? true : undefined,
    onlyDiscounted: resolvedSearchParams.discount === 'true' ? true : undefined,
    onlyDirectShipping: resolvedSearchParams.directShipping === 'true' ? true : undefined,
    onlyNominated: resolvedSearchParams.nominated === 'true' ? true : undefined,
    fromPrice: !isNaN(fromPrice as number) ? fromPrice : undefined,
    toPrice: !isNaN(toPrice as number) ? toPrice : undefined,
    orderType: (resolvedSearchParams.sort as any) || 'Selected',
    pageNumber: !isNaN(pageNumber) ? pageNumber : 1,
    pageSize: !isNaN(pageSize) ? pageSize : 30,
    brandIds: typeof resolvedSearchParams.brandIds === 'string' ? [resolvedSearchParams.brandIds] : Array.isArray(resolvedSearchParams.brandIds) ? resolvedSearchParams.brandIds : undefined,
    carIds: typeof resolvedSearchParams.carIds === 'string' ? [resolvedSearchParams.carIds] : Array.isArray(resolvedSearchParams.carIds) ? resolvedSearchParams.carIds : undefined,
    partIds: typeof resolvedSearchParams.partIds === 'string' ? [resolvedSearchParams.partIds] : Array.isArray(resolvedSearchParams.partIds) ? resolvedSearchParams.partIds : undefined,
    types: typeof resolvedSearchParams.types === 'string' ? [resolvedSearchParams.types] as any : Array.isArray(resolvedSearchParams.types) ? resolvedSearchParams.types : undefined,
    includeAggregations: true, // ✅ حتماً فعال باشد
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
        const response = await client.get<any[]>('/api/Front/PartCategories', {
          params: { CarId: '' },
        });
        return Array.isArray(response.data) ? response.data : [];
      },
    }),
  ]);

  const category = categoryData.category || categoryData;

  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `https://yadakchi.com/part-category/${slug}/#webpage`,
    url: `https://yadakchi.com/part-category/${slug}`,
    name: category?.name || 'دسته‌بندی قطعات خودرو',
    description: category?.description ? category.description.replace(/<[^>]*>/g, '').trim() : '',
    isPartOf: {
      '@id': 'https://yadakchi.com/#website',
    },
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemaJson) }}
      />
      <PartCategoryContent slug={slug} />
    </HydrationBoundary>
  );
}