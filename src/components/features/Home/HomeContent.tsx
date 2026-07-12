// src/components/features/Home/HomeContent.tsx

'use client';

import { useGetBanners } from '@/domains/front/banner/hooks/banner.hooks';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { useGetNominatedProductsByCategory } from '@/domains/front/product/hooks/product.hooks'; // لود هوک دسته بندی
import { BannerSlider } from '@/components/features/Banner/BannerSlider';
import { Banner, BannerGroup } from '@/components/features/Banner/Banner';
import { ShopByCar } from '@/components/features/Car/ShopByCar';
import { HomeCategories } from '@/components/features/Part/HomeCategories';
import { DealsSlider } from '@/components/features/ProductCard/DealsSlider';
import { ProductSlider } from '@/components/features/ProductCard/ProductSlider'; // لود اسلایدر عمومی جدید
import { Loader2 } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export function HomeContent() {
  const { user } = useAuth();
  
  // دریافت بنرهای هیدراته شده از سرور
  const { data: rawBanners = [], isLoading, isError } = useGetBanners('Home');

  // دریافت اطلاعات محصولات دسته بندی ابزارآلات خودرو (car-tools) به صورت کاملاً واقعی
  const { 
    data: toolsData, 
    isLoading: isToolsLoading, 
    isError: isToolsError 
  } = useGetNominatedProductsByCategory('car-tools');

  // استخراج ساختار جدید بنرها از داده‌های واکشی شده
  const sliderGroup = rawBanners?.find((b: any) => b.name === 'Home-Top-Slider') as unknown as BannerGroup;
  const a1BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A1') as unknown as BannerGroup;
  const a2BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A2') as unknown as BannerGroup;

  // بررسی پویا جهت فعال بودن بنر مکمل سمت چپ
  const hasLeftBanner = !!a1BannerGroup && a1BannerGroup.banners?.length > 0;

  // لیست محصولات ابزارآلات دیتابیس واقعی
  const toolsProducts = toolsData?.products?.items || [];

  return (
    <div className="w-full space-y-4 md:space-y-6 py-0">
      
      {/* ۱. بخش بنرهای بالای صفحه اصلی */}
      <div className="w-full">
        {/* حالت بارگذاری بنرها */}
        {isLoading && (
          <div className="w-full h-[180px] sm:h-[240px] md:h-[300px] lg:h-[350px] xl:h-[400px] 2xl:h-[440px] flex flex-col items-center justify-center gap-3 bg-muted/10 animate-pulse rounded-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-medium font-iran-sans text-muted-foreground">در حال بارگذاری بنرها...</span>
          </div>
        )}

        {/* حالت بروز خطا در دریافت اطلاعات */}
        {isError && (
          <div className="w-full h-[150px] flex flex-col items-center justify-center border border-dashed rounded-2xl bg-destructive/5 text-destructive p-6">
            <span className="text-sm font-bold font-iran-sans">خطا در واکشی اطلاعات بنرها از سرور اصلی.</span>
            <span className="text-xs font-iran-sans text-muted-foreground mt-1">لطفاً اتصال اینترنت خود یا خطاهای تب کنسول مرورگر را بررسی نمایید.</span>
          </div>
        )}

        {/* گرید بنرها با ارتفاع واکنش‌گرا و متقارن بدون لرزش یا تداخل ارتفاع */}
        {!isLoading && !isError && rawBanners.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-10 gap-4 md:gap-6 items-stretch w-full h-[180px] sm:h-[240px] md:h-[300px] lg:h-[350px] xl:h-[400px] 2xl:h-[440px] animate-in fade-in duration-300">
            
            {/* سمت راست: اسلایدر بنرهای متحرک (۷۰ درصد صفحه در تبلت و دسکتاپ، ۱۰۰ درصد در موبایل) */}
            <div className={cn(
              "w-full h-full",
              hasLeftBanner ? "md:col-span-7" : "md:col-span-10"
            )}>
              <BannerSlider group={sliderGroup} aspectRatio="h-full" />
            </div>

            {/* سمت چپ: بنر ثابت مکمل (۳۰ درصد صفحه - نمایش اختصاصی در دسکتاپ و تبلت به صورت کاملاً متقارن) */}
            {hasLeftBanner && (
              <div className="hidden md:block md:col-span-3 h-full w-full">
                <Banner group={a1BannerGroup} aspectRatio="h-full" />
              </div>
            )}

          </div>
        )}
      </div>

      {/* کانتینر فرعی صفحه اصلی با فواصل واکنش‌گرای فشرده‌تر و شیک */}
      <div className="w-full space-y-4 md:space-y-6 py-2 md:py-3">
        
        {/* ۲. بخش مینی‌مال خرید بر اساس خودرو */}
        <ShopByCar />

        {/* ۳. بخش هم‌عرض و اسلایدی خرید بر اساس دسته‌بندی قطعات */}
        <HomeCategories />

        {/* ۴. بخش اسلایدر تخفیف‌های شگفت‌انگیز با ثانیه‌شمار داینامیک و کارت‌های عریض جدید */}
        <DealsSlider />

        {/* ۵. بخش جدید بنر تمام‌عرض کشیده افقی Home-A2 */}
        {!isLoading && !isError && a2BannerGroup && (
          <div className="w-full animate-in fade-in duration-300">
            <Banner 
              group={a2BannerGroup} 
              aspectRatio="aspect-[16/5.5] md:aspect-[16/3.5] lg:aspect-[16/2.6]" 
            />
          </div>
        )}

        {/* ۶. اسلایدر عمومی جدید: رندر کاملاً داینامیک ابزارآلات خودرو (car-tools) بدون کادر کناری و با حاشیه مینی‌مال */}
        <ProductSlider
          title="ابزارآلات خودرو"
          products={toolsProducts}
          isLoading={isToolsLoading}
          isError={isToolsError}
          viewAllLink="/categories/car-tools"
          showTimer={false} // غیرفعال کردن ثانیه‌شمار برای زیبایی و خلوت‌تر شدن کادر
        />
      </div>

    </div>
  );
}