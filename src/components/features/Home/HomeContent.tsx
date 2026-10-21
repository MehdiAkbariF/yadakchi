'use client';

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

export function HomeContent() {
  const { data: rawBanners = [] } = useGetBanners('Home');

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

  const { data: homePageData } = useTypedQuery<any>(
    ['front', 'get-home-page'],
    async () => {
      const client = getHttpClient();
      const response = await client.get<any>('/api/Front/GetHomePage');
      return response.data;
    },
    { staleTime: 30 * 60 * 1000 }
  );

  const sliderGroup = rawBanners?.find((b: any) => b.name === 'Home-Top-Slider') as unknown as BannerGroup;
  const a1BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A1') as unknown as BannerGroup;
  const a2BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A2') as unknown as BannerGroup;
  const a3BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A3') as unknown as BannerGroup;
  const a4BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A4') as unknown as BannerGroup;
  const a5BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A5') as unknown as BannerGroup;
  const a6BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A6') as unknown as BannerGroup;
  const a7BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A7') as unknown as BannerGroup;
  const a8BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A8') as unknown as BannerGroup;
  const a9BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A9') as unknown as BannerGroup;
  const a10BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A10') as unknown as BannerGroup;
  const a11BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A11') as unknown as BannerGroup;
  const a12BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A12') as unknown as BannerGroup;
  const a13BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A13') as unknown as BannerGroup;

  const hasLeftBanner = !!a1BannerGroup && a1BannerGroup.banners?.length > 0;
  const toolsProducts = toolsData?.products?.items || [];
  const audioProducts = audioData?.products?.items || [];
  const exhaustProducts = exhaustData?.products?.items || [];
  const heaterProducts = heaterData?.products?.items || [];
  const doorProducts = doorData?.products?.items || [];
  const bodyProducts = bodyData?.products?.items || [];

  return (
    <div className="w-full space-y-6">
      <div className="w-full">
        <div className="grid h-48 w-full grid-cols-1 items-stretch gap-6 sm:h-60 md:h-72 md:grid-cols-10 lg:h-80 xl:h-96">
          <div className={hasLeftBanner ? 'md:col-span-7' : 'md:col-span-10'}>
            <BannerSlider group={sliderGroup} aspectRatio="h-full" />
          </div>

          {hasLeftBanner ? (
            <div className="hidden h-full w-full md:col-span-3 md:block">
              <Banner group={a1BannerGroup} aspectRatio="h-full" priority />
            </div>
          ) : null}
        </div>
      </div>

      <div className="w-full space-y-6 py-2 md:py-3">
        <ShopByCar />
        <HomeCategories />
        <DealsSlider />

        {a2BannerGroup ? (
          <div className="w-full">
            <Banner
              group={a2BannerGroup}
              aspectRatio="aspect-[16/5.5] md:aspect-[16/3.5] lg:aspect-[16/2.6]"
            />
          </div>
        ) : null}

        <ProductSlider
          title="ابزارآلات خودرو"
          products={toolsProducts}
          isLoading={isToolsLoading}
          isError={isToolsError}
          viewAllLink="/part-category/car-tools"
        />

        {a3BannerGroup || a4BannerGroup || a5BannerGroup || a6BannerGroup ? (
          <div className="grid w-full grid-cols-2 gap-6 md:grid-cols-4">
            {a3BannerGroup ? <Banner group={a3BannerGroup} aspectRatio="aspect-[16/10]" className="w-full" /> : null}
            {a4BannerGroup ? <Banner group={a4BannerGroup} aspectRatio="aspect-[16/10]" className="w-full" /> : null}
            {a5BannerGroup ? <Banner group={a5BannerGroup} aspectRatio="aspect-[16/10]" className="w-full" /> : null}
            {a6BannerGroup ? <Banner group={a6BannerGroup} aspectRatio="aspect-[16/10]" className="w-full" /> : null}
          </div>
        ) : null}

        <ProductSlider
          title="تیونینگ و تقویت خودرو"
          products={audioProducts}
          isLoading={isAudioLoading}
          isError={isAudioError}
          viewAllLink="/part-category/audio-video-multimedia-system"
        />

        {a7BannerGroup || a8BannerGroup ? (
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            {a7BannerGroup ? (
              <Banner group={a7BannerGroup} aspectRatio="aspect-[16/9] md:aspect-[16/5.5]" className="w-full" />
            ) : null}
            {a8BannerGroup ? (
              <Banner group={a8BannerGroup} aspectRatio="aspect-[16/9] md:aspect-[16/5.5]" className="w-full" />
            ) : null}
          </div>
        ) : null}

        <BrandSlider />

        {a9BannerGroup || a10BannerGroup || a11BannerGroup ? (
          <div className="grid w-full grid-cols-2 gap-6 md:grid-cols-4">
            {a9BannerGroup ? (
              <div className="col-span-1">
                <Banner group={a9BannerGroup} aspectRatio="aspect-square md:aspect-[16/11]" />
              </div>
            ) : null}
            {a10BannerGroup ? (
              <div className="col-span-1">
                <Banner group={a10BannerGroup} aspectRatio="aspect-square md:aspect-[16/11]" />
              </div>
            ) : null}
            {a11BannerGroup ? (
              <div className="col-span-2">
                <Banner group={a11BannerGroup} aspectRatio="aspect-[16/7.5] md:aspect-[16/5.5]" />
              </div>
            ) : null}
          </div>
        ) : null}

        <ProductSlider
          title="اگزوز"
          products={exhaustProducts}
          isLoading={isExhaustLoading}
          isError={isExhaustError}
          viewAllLink="/part-category/Exhaust"
        />

        {a12BannerGroup ? (
          <div className="w-full">
            <Banner
              group={a12BannerGroup}
              aspectRatio="aspect-[16/5.5] md:aspect-[16/3.5] lg:aspect-[16/2.6]"
            />
          </div>
        ) : null}

        <ShopSlider />

        {a13BannerGroup ? (
          <div className="w-full">
            <Banner
              group={a13BannerGroup}
              aspectRatio="aspect-[16/5.5] md:aspect-[16/3.5] lg:aspect-[16/2.6]"
            />
          </div>
        ) : null}

        <ProductSlider
          title="بخاری"
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
          title="تجهیزات بدنه"
          products={bodyProducts}
          isLoading={isBodyLoading}
          isError={isBodyError}
          viewAllLink="/part-category/body-and-weatherstrips"
        />

        <PageDescription htmlContent={homePageData?.description} />
      </div>
    </div>
  );
}