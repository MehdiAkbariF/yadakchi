// src/app/(public)/part-category/[slug]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getHttpClient } from '@/core/http/client';
import { getPartService } from '@/domains/front/part/services/part.service';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { PartCategoryContent } from '@/components/features/Part/PartCategoryContent';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';

interface PartCategoryPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const client = getHttpClient();
  try {
    const response = await client.get<any>('/api/Front/PartCategoryPage', {
      params: { PartCategoryEnglishTitle: params.slug }
    });
    const seo = response.data?.seoInformation || {};
    return {
      title: seo.title || response.data?.name || 'یدک‌چی',
      description: seo.description || response.data?.description || '',
      alternates: {
        canonical: `https://www.yadakchi.com/part-category/${params.slug}`,
      },
    };
  } catch {
    return { title: 'یدک‌چی' };
  }
}

export default async function PartCategoryPage({ params, searchParams }: PartCategoryPageProps) {
  const queryClient = new QueryClient();
  const partService = getPartService();
  const productService = getProductService();
  const brandService = getBrandService();
  const carService = getCarService();

  let categoryData = null;

  try {
    categoryData = await partService.getPartCategoryPage(params.slug);
  } catch (error: any) {
    if (error?.status === 404) {
      notFound();
    }
  }

  if (!categoryData) {
    notFound();
  }

  queryClient.setQueryData(['front', 'parts', 'category-page', params.slug], categoryData);

  const filters: SearchProductsRequest = {
    partCategoryEnglishTitle: params.slug,
    isProductInStock: searchParams.inStock === 'true' ? true : undefined,
    isSellerInUserCity: searchParams.userCity === 'true' ? true : undefined,
    fromPrice: searchParams.fromPrice ? Number(searchParams.fromPrice) : undefined,
    toPrice: searchParams.toPrice ? Number(searchParams.toPrice) : undefined,
    orderType: (searchParams.sort as any) || 'Selected',
    pageNumber: searchParams.page ? Number(searchParams.page) : 1,
    pageSize: searchParams.pageSize ? Number(searchParams.pageSize) : 30,
    brandIds: typeof searchParams.brandIds === 'string' ? [searchParams.brandIds] : Array.isArray(searchParams.brandIds) ? searchParams.brandIds : undefined,
    carIds: typeof searchParams.carIds === 'string' ? [searchParams.carIds] : Array.isArray(searchParams.carIds) ? searchParams.carIds : undefined,
    types: typeof searchParams.types === 'string' ? [searchParams.types] as any : Array.isArray(searchParams.types) ? searchParams.types : undefined,
  };

  try {
    await Promise.all([
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
    "@id": `https://www.yadakchi.com/part-category/${params.slug}/#webpage`,
    "url": `https://www.yadakchi.com/part-category/${params.slug}`,
    "name": categoryData.category.name,
    "description": categoryData.category.description,
    "isPartOf": {
      "@id": "https://www.yadakchi.com/#website"
    }
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <PartCategoryContent slug={params.slug} />
    </HydrationBoundary>
  );
}