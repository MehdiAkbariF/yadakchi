import { Metadata } from 'next';
import { getProductService } from '@/domains/front/product/services/product.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ProductContent } from '@/components/features/Product/ProductContent';
import { getFullUrl } from '@/core/utils/formatters';

interface ProductPageProps {
  params: { slug: string[] };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const slugSegment = params.slug[0];
  const productCode = parseInt(slugSegment.replace('ykp-', ''), 10);
  const productService = getProductService();
  const pageData = await productService.getProductPageData(productCode);

  if (!pageData) {
    return {
      title: 'محصول یدک‌چی',
    };
  }

  const product = pageData.product;
  const cleanDesc = product.seo?.description || product.description || '';

  return {
    title: `${product.title} | یدک‌چی`,
    description: cleanDesc.slice(0, 160),
    alternates: {
      canonical: `https://www.yadakchi.com/product/${params.slug.join('/')}`,
    },
    openGraph: {
      title: `${product.title} | یدک‌چی`,
      description: cleanDesc.slice(0, 160),
      url: `https://www.yadakchi.com/product/${params.slug.join('/')}`,
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
}

export default async function ProductPage({ params }: ProductPageProps) {
  const queryClient = new QueryClient();
  const productService = getProductService();
  const slugSegment = params.slug[0];
  const productCode = parseInt(slugSegment.replace('ykp-', ''), 10);

  const pageData = await productService.getProductPageData(productCode);

  if (pageData) {
    queryClient.setQueryData(['front', 'products', 'page-data', productCode], pageData);
  }

  const product = pageData?.product;
  const sellers = pageData
    ? [
        ...(pageData.shopProducts.newOnline || []),
        ...(pageData.shopProducts.newLocal || []),
        ...(pageData.shopProducts.stockOnline || []),
        ...(pageData.shopProducts.stockLocal || []),
        ...(pageData.shopProducts.takeOffOnline || []),
        ...(pageData.shopProducts.takeOffLocal || []),
      ]
    : [];

  const offers = sellers.map((s) => ({
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

  const lowPrice = sellers.length > 0 ? Math.min(...sellers.map((s) => s.finalPriceRaw)) : 0;
  const highPrice = sellers.length > 0 ? Math.max(...sellers.map((s) => s.finalPriceRaw)) : 0;

  const schemaJson = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.title,
        "image": product.gallery.length > 0 ? product.gallery.map((img) => getFullUrl(img)) : [getFullUrl(product.image)],
        "description": product.description ? product.description.replace(/<[^>]*>/g, '') : '',
        "sku": product.partNumber || String(product.code),
        "mpn": product.partNumber || String(product.code),
        "brand": {
          "@type": "Brand",
          "name": product.brand.name,
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
      }
    : null;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
      )}
      <ProductContent productCode={productCode} />
    </HydrationBoundary>
  );
}