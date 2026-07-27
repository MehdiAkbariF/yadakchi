// src/app/(public)/home/page.tsx

import type { Metadata } from 'next'; // وارد کردن تایپ متادیتا برای سئو
import { getBannerService } from '@/domains/front/banner/services/banner.service';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getPartService } from '@/domains/front/part/services/part.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getShopService } from '@/domains/front/shop/services/shop.service';
import { getHttpClient } from '@/core/http/client';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { HomeContent } from '@/components/features/Home/HomeContent';


export const metadata: Metadata = {
  title: 'یدک‌چی | بازارگاه تخصصی قطعات خودرو و لوازم یدکی',
  description: 'خرید مستقیم و آنلاین انواع قطعات یدکی، لوازم بدنه، ابزارآلات و تجهیزات خودرو از معتبرترین فروشگاه‌های سراسر کشور با ضمانت اصالت کالا در یدک‌چی.',
  alternates: {
    canonical: 'https://www.yadakchi.com/home', // اصلاح دیکته کلید به alternates جهت تعریف آدرس کانونیکال رسمی
  },
  openGraph: {
    title: 'یدک‌چی | بازارگاه تخصصی قطعات خودرو و لوازم یدکی',
    description: 'بزرگ‌ترین بازارگاه تخصصی خودرو و لوازم یدکی در ایران. خرید مستقیم قطعات خودرو از فروشگاه‌های سراسر کشور.',
    url: 'https://www.yadakchi.com/home',
    siteName: 'یدک‌چی',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: 'https://api.yadakchi.com/Logo.svg',
        width: 1200,
        height: 630,
        alt: 'یدک‌چی | بازارگاه تخصصی قطعات خودرو',
      },
    ],
  },
};

export const revalidate = 60; 

export default async function HomePage() {
  const queryClient = new QueryClient();

  const bannerService = getBannerService();
  const productService = getProductService();
  const partService = getPartService();
  const brandService = getBrandService();
  const shopService = getShopService();
  const httpClient = getHttpClient();

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['front', 'banners', 'Home'],
        queryFn: () => bannerService.getBanners('Home'),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'get-home-page'],
        queryFn: async () => {
          const response = await httpClient.get<any>('/api/Front/GetHomePage');
          return response.data;
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'nominated-deals', null],
        queryFn: () => productService.getNominatedProducts(),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'parts', 'categories-flat', 'all'],
        queryFn: async () => {
          const response = await httpClient.get<any[]>('/api/Front/PartCategories', {
            params: { CarId: '' }
          });
          return Array.isArray(response.data) ? response.data : [];
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'nominated-category', 'car-tools', null],
        queryFn: () => productService.getNominatedProductsByCategory('car-tools'),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'nominated-category', 'audio-video-multimedia-system', null],
        queryFn: () => productService.getNominatedProductsByCategory('audio-video-multimedia-system'),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'nominated-category', 'Exhaust', null],
        queryFn: () => productService.getNominatedProductsByCategory('Exhaust'),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'nominated-category', 'heater', null],
        queryFn: () => productService.getNominatedProductsByCategory('heater'),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'nominated-category', 'door-handles-locks-and-safety', null],
        queryFn: () => productService.getNominatedProductsByCategory('door-handles-locks-and-safety'),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'products', 'nominated-category', 'body-and-weatherstrips', null],
        queryFn: () => productService.getNominatedProductsByCategory('body-and-weatherstrips'),
      }),
      queryClient.prefetchQuery({
        queryKey: ['reference', 'brands', 'main'],
        queryFn: () => brandService.getMainBrands(),
      }),
      queryClient.prefetchQuery({
        queryKey: ['front', 'shop', 'cards', { orderBy: 'Rank', pageNumber: 1, pageSize: 30 }],
        queryFn: () => shopService.getShopCards({ orderBy: 'Rank', pageNumber: 1, pageSize: 30 }),
      }),
    ]);
  } catch (error) {}


  const schemaJson = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AutoPartsStore",
        "@id": "https://www.yadakchi.com/#organization",
        "name": "یدک‌چی",
        "url": "https://www.yadakchi.com",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://www.yadakchi.com/#logo",
          "url": "https://api.yadakchi.com/Logo.svg",
          "caption": "یدک‌چی | بازارگاه تخصصی قطعات خودرو"
        },
        "image": "https://api.yadakchi.com/Logo.svg",
        "description": "بزرگ‌ترین بازارگاه تخصصی خودرو و لوازم یدکی در ایران. خرید مستقیم قطعات خودرو از فروشگاه‌های سراسر کشور.",
        "telephone": "+982112345678",
        "email": "yadakchi@info.com",
        "priceRange": "IRR",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "خیابان ملت، بازار بزرگ لوازم یدکی ملت",
          "addressLocality": "Tehran",
          "addressRegion": "Tehran",
          "postalCode": "1234567890",
          "addressCountry": "IR"
        },
        "sameAs": [
          "https://www.instagram.com/yadakchi",
          "https://t.me/yadakchi"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://www.yadakchi.com/#website",
        "url": "https://www.yadakchi.com",
        "name": "یدک‌چی | بازارگاه تخصصی قطعات خودرو",
        "description": "بزرگ‌ترین بازارگاه تخصصی خودرو و لوازم یدکی در ایران",
        "publisher": {
          "@id": "https://www.yadakchi.com/#organization"
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.yadakchi.com/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ],
        "inLanguage": "fa-IR"
      }
    ]
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <HomeContent />
    </HydrationBoundary>
  );
}