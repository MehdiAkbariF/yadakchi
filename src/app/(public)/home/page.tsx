// app/home/page.tsx

import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { getAuthService } from '@/domains/auth/services/auth.service';
import { getBannerService } from '@/domains/front/banner/services/banner.service';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getBrandService } from '@/domains/front/reference/brand/services/brand.service';
import { getShopService } from '@/domains/front/shop/services/shop.service';
import { getStaticService } from '@/domains/front/static/services/static.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { HomeContent } from '@/components/features/Home/HomeContent';
import { cache } from 'react';

// ✅ ISR: کش کردن صفحه به مدت ۶۰ ثانیه
export const revalidate = 60;

// ✅ کش کردن داده‌های سنگین در سرور با React Cache
const getCachedHomeData = cache(async () => {
  const bannerService = getBannerService();
  const productService = getProductService();
  const brandService = getBrandService();
  const shopService = getShopService();
  const staticService = getStaticService();

  // ✅ فقط داده‌های ضروری بالا و وسط صفحه
  const [
    banners,
    nominatedDeals,
    mainBrands,
    shopCards,
    footer,
    staticCategories,
    productsByCategory
  ] = await Promise.allSettled([
    bannerService.getBanners('Home'),
    productService.getNominatedProducts(),
    brandService.getMainBrands(),
    shopService.getShopCards({ orderBy: 'Rank', pageNumber: 1, pageSize: 30 }),
    bannerService.getFrontFooter(),
    staticService.getStaticPageCategories(),
    productService.getNominatedProductsByCategories([
      'car-tools',
      'audio-video-multimedia-system',
      'Exhaust',
      'heater',
      'door-handles-locks-and-safety',
      'body-and-weatherstrips'
    ])
  ]);

  return {
    banners: banners.status === 'fulfilled' ? banners.value : [],
    nominatedDeals: nominatedDeals.status === 'fulfilled' ? nominatedDeals.value : null,
    mainBrands: mainBrands.status === 'fulfilled' ? mainBrands.value : [],
    shopCards: shopCards.status === 'fulfilled' ? shopCards.value : null,
    footer: footer.status === 'fulfilled' ? footer.value : null,
    staticCategories: staticCategories.status === 'fulfilled' ? staticCategories.value : [],
    productsByCategory: productsByCategory.status === 'fulfilled' ? productsByCategory.value : {},
  };
});

export default async function HomePage() {
  const queryClient = new QueryClient();

  // ✅ دریافت کاربر با سرویس صحیح
  const authService = getAuthService();
  const user = await authService.getCurrentUser();
  if (user) {
    queryClient.setQueryData(queryKeys.auth.user, user);
  }

  // ✅ دریافت داده‌های کش شده
  const data = await getCachedHomeData();

  // ✅ تنظیم داده‌ها در QueryClient
  queryClient.setQueryData(['front', 'banners', 'Home'], data.banners);
  queryClient.setQueryData(['front', 'products', 'nominated-deals', null], data.nominatedDeals);
  queryClient.setQueryData(['reference', 'brands', 'main'], data.mainBrands);
  queryClient.setQueryData(
    ['front', 'shop', 'cards', { orderBy: 'Rank', pageNumber: 1, pageSize: 30 }],
    data.shopCards
  );
  queryClient.setQueryData(['front', 'footer'], data.footer);
  queryClient.setQueryData(['front', 'static-page-categories'], data.staticCategories);

  // ✅ تنظیم محصولات هر دسته‌بندی
  Object.entries(data.productsByCategory).forEach(([category, products]) => {
    queryClient.setQueryData(
      ['front', 'products', 'nominated-category', category, null],
      products
    );
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout>
        <HomeContent />
      </MainLayout>
    </HydrationBoundary>
  );
}