import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { getServerCurrentUser } from '@/domains/auth/server.auth'; 
import { getProductService } from '@/domains/front/product/services/product.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { notFound, redirect } from 'next/navigation';
import { ProductContent } from '@/components/features/Product/ProductContent';
import { getProductUrl } from '@/core/utils/formatters';

interface ProductPageProps {
  params: { slug: string[] };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const slugArray = params.slug || [];
  const firstSegment = slugArray[0] ? decodeURIComponent(slugArray[0]) : '';
  
  let match = firstSegment.match(/ykp-(\d+)/);
  let productCode = match ? Number(match[1]) : null;

  if (!productCode) {
    const rawMatch = firstSegment.match(/^(\d+)$/) || firstSegment.match(/(\d+)/);
    productCode = rawMatch ? Number(rawMatch[1]) : null;
  }

  if (!productCode) {
    notFound();
  }

  const queryClient = new QueryClient();
  const user = await getServerCurrentUser();
  if (user) {
    queryClient.setQueryData(queryKeys.auth.user, user);
  }

  const productService = getProductService();

  try {
    const pageData = await productService.getProductPageData(productCode);
    if (!pageData) {
      notFound();
    }

    const correctUrl = getProductUrl(productCode, pageData.product.title);
    const currentPath = `/product/${slugArray.map(decodeURIComponent).join('/')}`;

    if (decodeURIComponent(currentPath) !== decodeURIComponent(correctUrl)) {
      redirect(correctUrl);
    }

    queryClient.setQueryData(['front', 'products', 'page-data', productCode], pageData);

    const productId = pageData.product.id;

    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'comments-average', productId],
        queryFn: () => productService.getProductCommentsAverage(productId),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'comments-list', productId, 'Newest', 1],
        queryFn: () => productService.getProductComments(productId, 'Newest', 1, 30),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'inquiries-list', productId, 'Latest', 1],
        queryFn: () => productService.getProductInquiries(productId, 'Latest', 1, 30),
      }),
    ]);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error && (error as any).digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("====================================================");
    console.error("[SERVER DETAILED ERROR ON PRODUCT DETAILS PAGE]:", error);
    console.error("====================================================");
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout>
        <ProductContent productCode={productCode} />
      </MainLayout>
    </HydrationBoundary>
  );
}