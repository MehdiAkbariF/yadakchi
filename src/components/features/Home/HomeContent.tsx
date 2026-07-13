'use client';

import { useGetBanners } from '@/domains/front/banner/hooks/banner.hooks';
import { useGetNominatedProductsByCategory } from '@/domains/front/product/hooks/product.hooks';
import { BannerSlider } from '@/components/features/Banner/BannerSlider';
import { Banner, BannerGroup } from '@/components/features/Banner/Banner';
import { ShopByCar } from '@/components/features/Car/ShopByCar';
import { HomeCategories } from '@/components/features/Part/HomeCategories';
import { DealsSlider } from '@/components/features/ProductCard/DealsSlider';
import { ProductSlider } from '@/components/features/ProductCard/ProductSlider';
import { BrandSlider } from '@/components/features/Brand/BrandSlider';
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';

export function HomeContent() {
  const { data: rawBanners = [], isLoading: isBannersLoading } = useGetBanners('Home');
  const { data: toolsData, isLoading: isToolsLoading, isError: isToolsError } = useGetNominatedProductsByCategory('car-tools');
  const { data: audioData, isLoading: isAudioLoading, isError: isAudioError } = useGetNominatedProductsByCategory('audio-video-multimedia-system');

  const sliderGroup = rawBanners?.find((b: any) => b.name === 'Home-Top-Slider') as unknown as BannerGroup;
  const a1BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A1') as unknown as BannerGroup;
  const a2BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A2') as unknown as BannerGroup;
  
  const a3BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A3') as unknown as BannerGroup;
  const a4BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A4') as unknown as BannerGroup;
  const a5BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A5') as unknown as BannerGroup;
  const a6BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A6') as unknown as BannerGroup;

  const a7BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A7') as unknown as BannerGroup;
  const a8BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A8') as unknown as BannerGroup;

  const hasLeftBanner = !!a1BannerGroup && a1BannerGroup.banners?.length > 0;
  const toolsProducts = toolsData?.products?.items || [];
  const audioProducts = audioData?.products?.items || [];

  if (isBannersLoading) {
    return (
      <div className="w-full space-y-4 md:space-y-6 py-0 animate-in fade-in duration-300">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-10 gap-4 md:gap-6 items-stretch w-full h-[180px] sm:h-[240px] md:h-[300px] lg:h-[350px] xl:h-[400px] 2xl:h-[440px]">
            <div className="md:col-span-7 h-full w-full">
              <Skeleton className="w-full h-full rounded-2xl" />
            </div>
            <div className="hidden md:block md:col-span-3 h-full w-full">
              <Skeleton className="w-full h-full rounded-2xl" />
            </div>
          </div>
        </div>
        
        <div className="w-full space-y-4 md:space-y-6 py-2 md:py-3">
          <ShopByCar />
          <HomeCategories />
          <DealsSlider />
          <Skeleton className="w-full aspect-[16/5.5] md:aspect-[16/3.5] lg:aspect-[16/2.6] rounded-2xl" />
          <ProductSlider title="ابزارآلات خودرو" products={[]} isLoading={true} isError={false} />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full pt-2">
            <Skeleton className="w-full aspect-[16/10] rounded-2xl" />
            <Skeleton className="w-full aspect-[16/10] rounded-2xl" />
            <Skeleton className="w-full aspect-[16/10] rounded-2xl" />
            <Skeleton className="w-full aspect-[16/10] rounded-2xl" />
          </div>

          <ProductSlider title="تیونینگ و تقویت خودرو" products={[]} isLoading={true} isError={false} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full pt-2">
            <Skeleton className="w-full aspect-[16/9] md:aspect-[16/5.5] rounded-2xl" />
            <Skeleton className="w-full aspect-[16/9] md:aspect-[16/5.5] rounded-2xl" />
          </div>

          <div className="w-full space-y-4 py-4">
            <div className="flex items-center gap-2 px-1">
              <Skeleton className="w-5 h-5" variant="circle" />
              <Skeleton className="w-32 h-5" />
            </div>
            <div className="w-full bg-background rounded-xl border p-4 flex gap-4 overflow-hidden justify-center">
              {[...Array(8)].map((_, index) => (
                <Skeleton key={index} className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 md:space-y-6 py-0">
      
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-10 gap-4 md:gap-6 items-stretch w-full h-[180px] sm:h-[240px] md:h-[300px] lg:h-[350px] xl:h-[400px] 2xl:h-[440px]">
          
          <div className={hasLeftBanner ? "md:col-span-7" : "md:col-span-10"}>
            <BannerSlider group={sliderGroup} aspectRatio="h-full" />
          </div>

          {hasLeftBanner && (
            <div className="hidden md:block md:col-span-3 h-full w-full">
              <Banner group={a1BannerGroup} aspectRatio="h-full" />
            </div>
          )}

        </div>
      </div>

      <div className="w-full space-y-4 md:space-y-6 py-2 md:py-3">
        
        <ShopByCar />

        <HomeCategories />

        <DealsSlider />

        {a2BannerGroup && (
          <div className="w-full">
            <Banner 
              group={a2BannerGroup} 
              aspectRatio="aspect-[16/5.5] md:aspect-[16/3.5] lg:aspect-[16/2.6]" 
            />
          </div>
        )}

        <ProductSlider
          title="ابزارآلات خودرو"
          products={toolsProducts}
          isLoading={isToolsLoading}
          isError={isToolsError}
          viewAllLink="/categories/car-tools"
          showTimer={false}
        />

        {(a3BannerGroup || a4BannerGroup || a5BannerGroup || a6BannerGroup) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full pt-2">
            {a3BannerGroup && (
              <Banner group={a3BannerGroup} aspectRatio="aspect-[16/10]" className="w-full" />
            )}
            {a4BannerGroup && (
              <Banner group={a4BannerGroup} aspectRatio="aspect-[16/10]" className="w-full" />
            )}
            {a5BannerGroup && (
              <Banner group={a5BannerGroup} aspectRatio="aspect-[16/10]" className="w-full" />
            )}
            {a6BannerGroup && (
              <Banner group={a6BannerGroup} aspectRatio="aspect-[16/10]" className="w-full" />
            )}
          </div>
        )}

        <ProductSlider
          title="تیونینگ و تقویت خودرو"
          products={audioProducts}
          isLoading={isAudioLoading}
          isError={isAudioError}
          viewAllLink="/categories/audio-video-multimedia-system"
          showTimer={false}
        />

        {(a7BannerGroup || a8BannerGroup) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full pt-2">
            {a7BannerGroup && (
              <Banner group={a7BannerGroup} aspectRatio="aspect-[16/9] md:aspect-[16/5.5]" className="w-full" />
            )}
            {a8BannerGroup && (
              <Banner group={a8BannerGroup} aspectRatio="aspect-[16/9] md:aspect-[16/5.5]" className="w-full" />
            )}
          </div>
        )}

        <BrandSlider />
      </div>

    </div>
  );
}