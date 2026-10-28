'use client';

import * as React from 'react';
import { useGetBanners } from '@/domains/front/banner/hooks/banner.hooks';
import { useGetNominatedProductsByCategory } from '@/domains/front/product/hooks/product.hooks';
import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { getHttpClient } from '@/core/http/client';
import { BannerSlider } from '@/components/features/Banner/BannerSlider';
import { Banner, BannerGroup } from '@/components/features/Banner/Banner';
import { ShopByCar } from '@/components/features/Car/ShopByCar';
import { HomeCategories } from '@/components/features/Part/HomeCategories';
import { DealsSlider } from '@/components/features/ProductCard/DealsSlider';
import { ProductSlider } from '../ProductCard/ProductSlider';
import { BrandSlider } from '@/components/features/Brand/BrandSlider';
import { ShopSlider } from '@/components/features/Shop/ShopSlider';
import { PageDescription } from '@/components/composites/PageDescription/PageDescription';
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';

export function HomeContent() {
  const { data: rawBanners = [], isLoading: isBannersLoading } = useGetBanners('Home');

  // دریافت کالاهای منتخب دسته‌بندی‌های صفحه اصلی
  const { data: toolsData, isLoading: isToolsLoading, isError: isToolsError } =
    useGetNominatedProductsByCategory('car-tools');
  const { data: audioData, isLoading: isAudioLoading, isError: isAudioError } =
    useGetNominatedProductsByCategory('audio-video-multimedia-system');
  const { data: exhaustData, isLoading: isExhaustLoading, isError: isExhaustError } =
    useGetNominatedProductsByCategory('Exhaust');
  const { data: heaterData, isLoading: isHeaterLoading, isError: isHeaterError } =
    useGetNominatedProductsByCategory('heater');
  const { data: doorData, isLoading: isDoorLoading, isError: isDoorError } =
    useGetNominatedProductsByCategory('door-handles-locks-and-safety');
  const { data: bodyData, isLoading: isBodyLoading, isError: isBodyError } =
    useGetNominatedProductsByCategory('body-and-weatherstrips');

  // اطلاعات صفحه اصلی (توضیحات سئو و متنی فوتر)
  const { data: homePageData } = useTypedQuery<any>(
    ['front', 'get-home-page'],
    async () => {
      const client = getHttpClient();
      const response = await client.get<any>('/api/Front/GetHomePage');
      return response.data;
    },
    { staleTime: 30 * 60 * 1000, retry: 2 }
  );

  // ✅ بهینه‌سازی فوق‌العاده: ساخت دیکشنری بنرها برای دسترسی O(1) به جای 14 بار Array.find
  const bannersMap = React.useMemo(() => {
    const map: Record<string, BannerGroup> = {};
    if (Array.isArray(rawBanners)) {
      for (const group of rawBanners) {
        if (group?.name) {
          map[group.name] = group as unknown as BannerGroup;
        }
      }
    }
    return map;
  }, [rawBanners]);

  const sliderGroup = bannersMap['Home-Top-Slider'];
  const topLeftBannerGroup = bannersMap['TopLeft'];
  const hasLeftBanner = !!topLeftBannerGroup && topLeftBannerGroup.banners?.length > 0;

  const toolsProducts = toolsData?.products?.items || [];
  const audioProducts = audioData?.products?.items || [];
  const exhaustProducts = exhaustData?.products?.items || [];
  const heaterProducts = heaterData?.products?.items || [];
  const doorProducts = doorData?.products?.items || [];
  const bodyProducts = bodyData?.products?.items || [];

  return (
    <div className="w-full space-y-6 sm:space-y-8 mt-3">
      
      {/* ================= 1. بخش بالای صفحه (اسلایدر اصلی + بنر کناری) ================= */}
      <section aria-label="اسلایدر و بنرهای برگزیده" className="w-full">
        <div className="grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-10 md:gap-6">
          
          {/* اسلایدر اصلی */}
          <div className={hasLeftBanner ? 'md:col-span-7' : 'md:col-span-10'}>
            <div className="relative w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px] overflow-hidden rounded-2xl">
              {isBannersLoading ? (
                <Skeleton className="h-full w-full rounded-2xl" />
              ) : (
                <BannerSlider group={sliderGroup} aspectRatio="h-full" />
              )}
            </div>
          </div>

          {/* بنر کناری (مختص تبلت و دسکتاپ) */}
          {hasLeftBanner && (
            <div className="hidden h-full w-full md:col-span-3 md:block">
              <div className="relative w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px] overflow-hidden rounded-2xl">
                {isBannersLoading ? (
                  <Skeleton className="h-full w-full rounded-2xl" />
                ) : (
                  <Banner group={topLeftBannerGroup} aspectRatio="h-full" priority />
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= 2. دسترسی سریع و پروموشن‌ها ================= */}
      <div className="w-full space-y-6 sm:space-y-8">
        <ShopByCar />
        <HomeCategories />
        <DealsSlider />

        {/* بنر تکی عرضی A2 */}
       {/* ۱. بنر تکی عرضی A2 (باریک و استاندارد در دسکتاپ) */}
        {bannersMap['A2-Banner'] && (
          <div className="w-full overflow-hidden rounded-2xl">
            <Banner
              group={bannersMap['A2-Banner']}
              aspectRatio="aspect-[21/9] sm:aspect-[24/8] md:aspect-[32/7] lg:aspect-[40/7]"
            />
          </div>
        )}

        {/* ۲. اسلایدر ابزارآلات */}
        <ProductSlider
          title="ابزارآلات خودرو"
          products={toolsProducts}
          isLoading={isToolsLoading}
          isError={isToolsError}
          viewAllLink="/part-category/car-tools"
        />

        {/* ۳. چهار بنر کنار هم (A3 تا A6) */}
        {(bannersMap['A3-Banner'] || bannersMap['A4-Banner'] || bannersMap['A5-Banner'] || bannersMap['A6-Banner']) && (
          <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
            {bannersMap['A3-Banner'] && <Banner group={bannersMap['A3-Banner']} aspectRatio="aspect-[16/10]" />}
            {bannersMap['A4-Banner'] && <Banner group={bannersMap['A4-Banner']} aspectRatio="aspect-[16/10]" />}
            {bannersMap['A5-Banner'] && <Banner group={bannersMap['A5-Banner']} aspectRatio="aspect-[16/10]" />}
            {bannersMap['A6-Banner'] && <Banner group={bannersMap['A6-Banner']} aspectRatio="aspect-[16/10]" />}
          </div>
        )}

        {/* ۴. اسلایدر تیونینگ */}
        <ProductSlider
          title="تیونینگ و تقویت خودرو"
          products={audioProducts}
          isLoading={isAudioLoading}
          isError={isAudioError}
          viewAllLink="/part-category/audio-video-multimedia-system"
        />

        {/* ۵. دو بنر دوتایی (A7 و A8) - در دسکتاپ ارتفاع کنترل‌شده */}
        {(bannersMap['A7-Banner'] || bannersMap['A8-Banner']) && (
          <div className="grid w-full grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6">
            {bannersMap['A7-Banner'] && (
              <Banner group={bannersMap['A7-Banner']} aspectRatio="aspect-[21/9] md:aspect-[16/6]" />
            )}
            {bannersMap['A8-Banner'] && (
              <Banner group={bannersMap['A8-Banner']} aspectRatio="aspect-[21/9] md:aspect-[16/6]" />
            )}
          </div>
        )}

        {/* ۶. برندهای برگزیده */}
        <BrandSlider />

        {/* ۷. بنرهای ترکیبی (A9, A10, A11) */}
        {(bannersMap['A9-Banner'] || bannersMap['A10-Banner'] || bannersMap['A11-Banner']) && (
          <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
            {bannersMap['A9-Banner'] && (
              <div className="col-span-1">
                <Banner group={bannersMap['A9-Banner']} aspectRatio="aspect-square md:aspect-[16/11]" />
              </div>
            )}
            {bannersMap['A10-Banner'] && (
              <div className="col-span-1">
                <Banner group={bannersMap['A10-Banner']} aspectRatio="aspect-square md:aspect-[16/11]" />
              </div>
            )}
            {bannersMap['A11-Banner'] && (
              <div className="col-span-2">
                <Banner group={bannersMap['A11-Banner']} aspectRatio="aspect-[2/1] md:aspect-[16/5]" />
              </div>
            )}
          </div>
        )}

        {/* ۸. بنر تکی عرضی A12 */}
        {bannersMap['A12-Banner'] && (
          <div className="w-full overflow-hidden rounded-2xl">
            <Banner
              group={bannersMap['A12-Banner']}
              aspectRatio="aspect-[21/9] sm:aspect-[24/8] md:aspect-[32/7] lg:aspect-[40/7]"
            />
          </div>
        )}

        {/* ۹. فروشندگان برگزیده */}
        <ShopSlider />

        {/* ۱۰. بنر تکی عرضی A13 */}
        {bannersMap['A13-Banner'] && (
          <div className="w-full overflow-hidden rounded-2xl">
            <Banner
              group={bannersMap['A13-Banner']}
              aspectRatio="aspect-[21/9] sm:aspect-[24/8] md:aspect-[32/7] lg:aspect-[40/7]"
            />
          </div>
        )}
        {/* اسلایدرهای انتهایی */}
        <ProductSlider
          title="سیستم بخاری و گرمایش"
          products={heaterProducts}
          isLoading={isHeaterLoading}
          isError={isHeaterError}
          viewAllLink="/part-category/heater"
        />

        <ProductSlider
          title="دستگیره و قفل درب"
          products={doorProducts}
          isLoading={isDoorLoading}
          isError={isDoorError}
          viewAllLink="/part-category/door-handles-locks-and-safety"
        />

        <ProductSlider
          title="تجهیزات بدنه و عایق‌بندی"
          products={bodyProducts}
          isLoading={isBodyLoading}
          isError={isBodyError}
          viewAllLink="/part-category/body-and-weatherstrips"
        />

        {/* متن سئو و توضیحات انتهای صفحه */}
        <PageDescription htmlContent={homePageData?.description} />
      </div>
    </div>
  );
}