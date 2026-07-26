import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { getServerCurrentUser } from '@/domains/auth/server.auth'; 
import { getBannerService } from '@/domains/front/banner/services/banner.service';
import { getProductService } from '@/domains/front/product/services/product.service';
import { getHttpClient } from '@/core/http/client';
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { HomeContent } from '@/components/features/Home/HomeContent';

/* 
  بهینه‌سازی طلایی ISR (Incremental Static Regeneration):
  با این دستور، نیکست‌جی کل کدهای HTML رندر شده صفحه اصلی را به مدت ۶۰ ثانیه روی سرور کش می‌کند.
  کاربران در مراجعات بعدی صفحه را به صورت آنی (زیر ۵۰ میلی‌ثانیه) باز می‌کنند و فرآیند ری‌ولیدیت در پس‌زمینه انجام می‌شود.
*/
export const revalidate = 60; 

export default async function HomePage() {
  const queryClient = new QueryClient();

  const user = await getServerCurrentUser();
  if (user) {
    queryClient.setQueryData(queryKeys.auth.user, user);
  }

  const bannerService = getBannerService();
  const productService = getProductService();
  const httpClient = getHttpClient();

  try {
    /* 
      تفکیک هوشمند بالای صفحه و پایین صفحه:
      به جای ۱۳ درخواست سنگین، فقط ۳ درخواست حیاتی و در دیدرس کاربر (LCP) را سرور ساید لود می‌کنیم.
      مابقی کوئری‌های انتهای صفحه (مانند فوتر و اسلایدرها) به صورت کلاینت ساید پس از سوار شدن صفحه لود می‌شوند.
    */
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
      })
    ]);
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout>
        <HomeContent />
      </MainLayout>
    </HydrationBoundary>
  );
}