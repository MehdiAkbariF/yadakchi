import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getProductService } from '@/domains/front/product/services/product.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ProductContent } from '@/components/features/Product/ProductContent';
import { getFullUrl } from '@/core/utils/formatters';

interface ProductPageProps {
  params: Promise<{ slug: string[] }> | { slug: string[] };
}

// بازتولید هوشمند کش سروری صفحه هر ۱۲۰ ثانیه (ISR برای سرعت رعدآسا)
export const revalidate = 120;

// ایزوله‌سازی و کش درخواست واکشی اطلاعات محصول در طول رندر سرور
const getCachedProductData = cache(async (productCode: number) => {
  const productService = getProductService();
  try {
    const data = await productService.getProductPageData(productCode);
    return data;
  } catch (error: any) {
    console.error(`❌ [ProductPage Error] Failed to load productCode ${productCode}:`, error?.message || error);
    return null;
  }
});

// استخراج ایمن کد عددی کالا از اسلاگ فارسی/انگلیسی
async function extractProductCode(paramsPromise: ProductPageProps['params']): Promise<number> {
  const resolvedParams = await Promise.resolve(paramsPromise);
  const slugSegment = resolvedParams?.slug?.[0] || '';
  const cleanCode = slugSegment.replace('ykp-', '').replace(/\D/g, '');
  return parseInt(cleanCode, 10);
}

// انکود امن داده‌های اسکیما برای جلوگیری از باگ‌های XSS
function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/* -------------------------------------------------------------------------- */
/*                              Metadata Generator                            */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const productCode = await extractProductCode(params);
  if (!productCode || isNaN(productCode)) return { title: 'محصول | یدکچی' };

  try {
    const pageData = await getCachedProductData(productCode);
    if (!pageData?.product) return { title: 'محصول یافت نشد | یدکچی' };

    const product = pageData.product;
    const cleanDesc = (product.seo?.description || product.description || '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const resolvedParams = await Promise.resolve(params);
    const safeSlugPath = (resolvedParams.slug || []).map((s) => encodeURIComponent(s)).join('/');
    
    // یکپارچه‌سازی دامنه بدون www با بقیه بخش‌های سایت
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yadakchi.com';
    const canonicalUrl = `${baseUrl}/product/${safeSlugPath}`;
    const ogImage = product.image ? getFullUrl(product.image) : `${baseUrl}/Logo.svg`;

    const title = `${product.title} | یدکچی`;
    const description = cleanDesc.slice(0, 160) || `خرید اینترنتی ${product.title} با تضمین اصالت و بهترین قیمت در یدکچی`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
        robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true,
          'max-snippet': -1,
          'max-image-preview': 'none',
          'max-video-preview': -1,
        },
         },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: 'یدکچی',
        locale: 'fa_IR',
        type: 'website',
        images: [
          {
            url: ogImage,
            width: 800,
            height: 800,
            alt: product.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return { title: 'یدکچی | بازارگاه تخصصی قطعات خودرو' };
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Main Page                                 */
/* -------------------------------------------------------------------------- */

export default async function ProductPage({ params }: ProductPageProps) {
  const productCode = await extractProductCode(params);

  if (!productCode || isNaN(productCode)) {
    notFound();
  }

  const pageData = await getCachedProductData(productCode);

  if (!pageData || !pageData.product) {
    notFound();
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
      },
    },
  });

  queryClient.setQueryData(['front', 'products', 'page-data', productCode], pageData);

  const product = pageData.product;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yadakchi.com';
  const defaultImage = `${baseUrl}/Logo.svg`;

  // گردآوری تمام فروشندگان و استوک‌ها
  const sellers = [
    ...(pageData.shopProducts?.newOnline || []),
    ...(pageData.shopProducts?.newLocal || []),
    ...(pageData.shopProducts?.stockOnline || []),
    ...(pageData.shopProducts?.stockLocal || []),
    ...(pageData.shopProducts?.takeOffOnline || []),
    ...(pageData.shopProducts?.takeOffLocal || []),
  ];

  // محاسبه کمترین و بیشترین قیمت معتبر
  const validPrices = sellers
    .map((s: any) => s.finalPriceRaw || s.price || 0)
    .filter((p: number) => p > 0);

  const lowPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const highPrice = validPrices.length > 0 ? Math.max(...validPrices) : lowPrice;

  // ساخت لیست تصاویر معتبر با فال‌بک مطمئن (الزام گوگل)
  const productImages =
    product.gallery?.length > 0
      ? product.gallery.map((img: string) => getFullUrl(img))
      : product.image
      ? [getFullUrl(product.image)]
      : [defaultImage];

  // ساخت آفرها با تضمین عدم بروز خطا در گوگل حتی در کالاهای ناموجود
  const offersData =
    sellers.length > 0
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'IRR',
          lowPrice: lowPrice,
          highPrice: highPrice,
          offerCount: sellers.length,
          offers: sellers.map((s: any) => ({
            '@type': 'Offer',
            price: s.finalPriceRaw || s.price || lowPrice,
            priceCurrency: 'IRR',
            itemCondition:
              s.type === 'New'
                ? 'https://schema.org/NewCondition'
                : 'https://schema.org/UsedCondition',
            availability:
              s.quantity > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Store',
              name: s.shop?.title || s.shop?.shopTitle || 'یدکچی',
            },
          })),
        }
      : {
          '@type': 'Offer',
          price: 0,
          priceCurrency: 'IRR',
          availability: 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
        };

  // اسکیمای جامع و رسمی Google Rich Snippet
  const schemaJson = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: product.title,
        image: productImages,
        description: product.description
          ? product.description.replace(/<[^>]*>/g, '').trim()
          : `خرید آنلاین ${product.title} در بازارگاه یدکچی`,
        sku: String(product.partNumber || product.code || productCode),
        mpn: String(product.partNumber || product.code || productCode),
        brand: {
          '@type': 'Brand',
          name: product.brand?.name || 'یدکچی',
        },
        ...(product.rateCount > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: Number(product.averageRate || 5).toFixed(1),
                reviewCount: product.rateCount,
                bestRating: '5',
                worstRating: '1',
              },
            }
          : {}),
        offers: offersData,
      },
      // اسکیمای BreadcrumbList جهت نمایش شاخه ناوبری در نتایج سرچ گوگل
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'صفحه اصلی',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'قطعات خودرو',
            item: `${baseUrl}/categories`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.title,
            item: `${baseUrl}/product/ykp-${productCode}`,
          },
        ],
      },
    ],
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* تزریق اسکریپت رسمی داده‌های ساختاریافته گوگل */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemaJson) }}
      />
      <ProductContent productCode={productCode} initialData={pageData} />
    </HydrationBoundary>
  );
}