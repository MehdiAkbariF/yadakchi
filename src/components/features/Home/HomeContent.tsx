// src/components/features/Home/HomeContent.tsx

'use client';

import { useGetBanners } from '@/domains/front/banner/hooks/banner.hooks';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { useGetNominatedProductsByCategory } from '@/domains/front/product/hooks/product.hooks';
import { BannerSlider } from '@/components/features/Banner/BannerSlider';
import { Banner, BannerGroup } from '@/components/features/Banner/Banner';
import { ShopByCar } from '@/components/features/Car/ShopByCar';
import { HomeCategories } from '@/components/features/Part/HomeCategories';
import { DealsSlider } from '@/components/features/ProductCard/DealsSlider';
import { ProductSlider } from '@/components/features/ProductCard/ProductSlider';
import { Loader2 } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export function HomeContent() {
  const { user } = useAuth();
  
  // دریافت بنرهای هیدراته شده از سرور
  const { data: rawBanners = [], isLoading, isError } = useGetBanners('Home');

  // دریافت اطلاعات محصولات شگفت‌انگیز ابزارآلات خودرو
  const { 
    data: toolsData, 
    isLoading: isToolsLoading, 
    isError: isToolsError 
  } = useGetNominatedProductsByCategory('car-tools');

  // استخراج گروه‌های مختلف بنرها از پاسخ سرور
  const sliderGroup = rawBanners?.find((b: any) => b.name === 'Home-Top-Slider') as unknown as BannerGroup;
  const a1BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A1') as unknown as BannerGroup;
  const a2BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A2') as unknown as BannerGroup;
  
  // چهار بنر متوالی زیر اسلایدر آخر
  const a3BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A3') as unknown as BannerGroup;
  const a4BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A4') as unknown as BannerGroup;
  const a5BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A5') as unknown as BannerGroup;
  const a6BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A6') as unknown as BannerGroup;

  const hasLeftBanner = !!a1BannerGroup && a1BannerGroup.banners?.length > 0;
  const toolsProducts = toolsData?.products?.items || [];

  return (
    <div className="w-full space-y-4 md:space-y-6 py-0">
      
      {/* ۱. بخش اسلایدر هدر و بنر کناری مکمل در بالای صفحه */}
      <div className="w-full">
        {isLoading && (
          <div className="w-full h-[180px] sm:h-[240px] md:h-[300px] lg:h-[350px] xl:h-[400px] 2xl:h-[440px] flex flex-col items-center justify-center gap-3 bg-muted/10 animate-pulse rounded-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-medium font-iran-sans text-muted-foreground">در حال بارگذاری بنرها...</span>
          </div>
        )}

        {isError && (
          <div className="w-full h-[150px] flex flex-col items-center justify-center border border-dashed rounded-2xl bg-destructive/5 text-destructive p-6">
            <span className="text-sm font-bold font-iran-sans">خطا در دریافت اطلاعات بنرها از سرور.</span>
            <span className="text-xs font-iran-sans text-muted-foreground mt-1">لطفاً اتصال اینترنت خود را بررسی نمایید.</span>
          </div>
        )}

        {!isLoading && !isError && rawBanners.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-10 gap-4 md:gap-6 items-stretch w-full h-[180px] sm:h-[240px] md:h-[300px] lg:h-[350px] xl:h-[400px] 2xl:h-[440px] animate-in fade-in duration-300">
            
            {/* سمت راست: اسلایدر بنرهای متحرک (۷۰٪ عرض در دسکتاپ) */}
            <div className={cn(
              "w-full h-full",
              hasLeftBanner ? "md:col-span-7" : "md:col-span-10"
            )}>
              <BannerSlider group={sliderGroup} aspectRatio="h-full" />
            </div>

            {/* سمت چپ: بنر ثابت مکمل Home-A1 (۳۰٪ عرض در دسکتاپ) */}
            {hasLeftBanner && (
              <div className="hidden md:block md:col-span-3 h-full w-full">
                <Banner group={a1BannerGroup} aspectRatio="h-full" />
              </div>
            )}

          </div>
        )}
      </div>

      {/* کانتینر اصلی محتوای صفحه با فواصل استاندارد واکنشی */}
      <div className="w-full space-y-4 md:space-y-6 py-2 md:py-3">
        
        {/* ۲. بخش خرید بر اساس خودرو */}
        <ShopByCar />

        {/* ۳. بخش خرید بر اساس دسته‌بندی قطعات */}
        <HomeCategories />

        {/* ۴. بخش اسلایدر شگفت‌انگیز */}
        <DealsSlider />

        {/* ۵. بنر تمام‌عرض افقی Home-A2 */}
        {!isLoading && !isError && a2BannerGroup && (
          <div className="w-full animate-in fade-in duration-300">
            <Banner 
              group={a2BannerGroup} 
              aspectRatio="aspect-[16/5.5] md:aspect-[16/3.5] lg:aspect-[16/2.6]" 
            />
          </div>
        )}

        {/* ۶. آخرین اسلایدر صفحه اصلی (اسلایدر عمومی ابزارآلات خودرو) */}
        <ProductSlider
          title="ابزارآلات خودرو"
          products={toolsProducts}
          isLoading={isToolsLoading}
          isError={isToolsError}
          viewAllLink="/categories/car-tools"
          showTimer={false}
        />

        {/* ۷. بخش چهار بنر مکمل (۴ تایی در دسکتاپ و ۲×۲ در موبایل) - قرارگیری زیر آخرین اسلایدر */}
        {!isLoading && !isError && (a3BannerGroup || a4BannerGroup || a5BannerGroup || a6BannerGroup) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full pt-2 animate-in fade-in duration-300">
            {a3BannerGroup && (
              <Banner 
                group={a3BannerGroup} 
                aspectRatio="aspect-[16/10]" 
                className="w-full" 
              />
            )}
            {a4BannerGroup && (
              <Banner 
                group={a4BannerGroup} 
                aspectRatio="aspect-[16/10]" 
                className="w-full" 
              />
            )}
            {a5BannerGroup && (
              <Banner 
                group={a5BannerGroup} 
                aspectRatio="aspect-[16/10]" 
                className="w-full" 
              />
            )}
            {a6BannerGroup && (
              <Banner 
                group={a6BannerGroup} 
                aspectRatio="aspect-[16/10]" 
                className="w-full" 
              />
            )}
          </div>
        )}
      </div>

    </div>
  );
}