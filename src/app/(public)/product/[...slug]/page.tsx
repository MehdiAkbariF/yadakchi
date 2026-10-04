import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductService } from '@/domains/front/product/services/product.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ProductContent } from '@/components/features/Product/ProductContent';
import { getFullUrl } from '@/core/utils/formatters';

interface ProductPageProps {
  params: Promise<{ slug: string[] }> | { slug: string[] };
}

// استخراج ایمن کد محصول از اسلاگ
async function extractProductCode(paramsPromise: ProductPageProps['params']): Promise<number> {
  const resolvedParams = await Promise.resolve(paramsPromise);
  const slugSegment = resolvedParams?.slug?.[0] || '';
  const cleanCode = slugSegment.replace('ykp-', '').replace(/\D/g, '');
  return parseInt(cleanCode, 10);
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const productCode = await extractProductCode(params);
  if (!productCode || isNaN(productCode)) return { title: 'محصول یدک‌چی' };

  const productService = getProductService();
  try {
    const pageData = await productService.getProductPageData(productCode);
    if (!pageData) return { title: 'محصول یدک‌چی' };

    const product = pageData.product;
    const cleanDesc = product.seo?.description || product.description || '';
    const resolvedParams = await Promise.resolve(params);

    return {
      title: `${product.title} | یدک‌چی`,
      description: cleanDesc.slice(0, 160),
      alternates: {
        canonical: `https://www.yadakchi.com/product/${resolvedParams.slug.join('/')}`,
      },
      openGraph: {
        title: `${product.title} | یدک‌چی`,
        description: cleanDesc.slice(0, 160),
        url: `https://www.yadakchi.com/product/${resolvedParams.slug.join('/')}`,
        siteName: 'یدک‌چی',
        locale: 'fa_IR',
        type: 'website',
        images: [
          {
            url: getFullUrl(product.image),
            width: 800,
            height: 600,
            alt: product.title,
          },
        ],
      },
    };
  } catch {
    return { title: 'یدک‌چی' };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const productCode = await extractProductCode(params);

  if (!productCode || isNaN(productCode)) {
    notFound();
  }

  // ایجاد QueryClient همراه با تنظیم staleTime برای جلوگیری از خالی شدن دیتا در کلاینت
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // ۵ دقیقه معتبر بودن دیتا در کلاینت بدون رفرش ناخواسته
      },
    },
  });

  const productService = getProductService();

  try {
    // استفاده از prefetchQuery استاندارد TanStack
    await queryClient.prefetchQuery({
      queryKey: ['front', 'products', 'page-data', productCode],
      queryFn: () => productService.getProductPageData(productCode),
    });
  } catch (error: any) {
    if (error?.status === 404) {
      notFound();
    }
  }

  const pageData: any = queryClient.getQueryData(['front', 'products', 'page-data', productCode]);

  if (!pageData) {
    notFound();
  }

  const product = pageData.product;
  const sellers = [
    ...(pageData.shopProducts.newOnline || []),
    ...(pageData.shopProducts.newLocal || []),
    ...(pageData.shopProducts.stockOnline || []),
    ...(pageData.shopProducts.stockLocal || []),
    ...(pageData.shopProducts.takeOffOnline || []),
    ...(pageData.shopProducts.takeOffLocal || []),
  ];

  const offers = sellers.map((s: any) => ({
    "@type": "Offer",
    "price": s.finalPriceRaw,
    "priceCurrency": "IRR",
    "itemCondition": s.type === 'New' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    "availability": s.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "seller": {
      "@type": "Store",
      "name": s.shop.title,
    },
  }));

  const lowPrice = sellers.length > 0 ? Math.min(...sellers.map((s: any) => s.finalPriceRaw)) : 0;
  const highPrice = sellers.length > 0 ? Math.max(...sellers.map((s: any) => s.finalPriceRaw)) : 0;

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": product.gallery?.length > 0 ? product.gallery.map((img: string) => getFullUrl(img)) : [getFullUrl(product.image)],
    "description": product.description ? product.description.replace(/<[^>]*>/g, '') : '',
    "sku": product.partNumber || String(product.code),
    "mpn": product.partNumber || String(product.code),
    "brand": {
      "@type": "Brand",
      "name": product.brand?.name,
    },
    "aggregateRating": product.rateCount > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.averageRate,
      "reviewCount": product.rateCount,
      "bestRating": "5",
      "worstRating": "1",
    } : undefined,
    "offers": sellers.length > 0 ? {
      "@type": "AggregateOffer",
      "priceCurrency": "IRR",
      "lowPrice": lowPrice,
      "highPrice": highPrice,
      "offerCount": sellers.length,
      "offers": offers,
    } : undefined,
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <ProductContent productCode={productCode} initialData={pageData} />
    </HydrationBoundary>
  );
}