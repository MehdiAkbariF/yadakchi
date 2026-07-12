// src/components/features/Home/HomeContent.tsx

'use client';

import { useGetBanners } from '@/domains/front/banner/hooks/banner.hooks';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { BannerSlider } from '@/components/features/Banner/BannerSlider';
import { Banner, BannerGroup } from '@/components/features/Banner/Banner';
import { Typography } from '@/components/primitives/Typography';
import { Loader2 } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export function HomeContent() {
  const { user } = useAuth();
  
  // دریافت داده‌ها از کش هیدراته‌شده سمت سرور
  const { data: rawBanners = [], isLoading, isError } = useGetBanners('Home');

  // استخراج ساختار جدید بنرها از داده‌های واکشی شده
  const sliderGroup = rawBanners?.find((b: any) => b.name === 'Home-Top-Slider') as unknown as BannerGroup;
  const a1BannerGroup = rawBanners?.find((b: any) => b.name === 'Home-A1') as unknown as BannerGroup;

  // بررسی پویا جهت فعال بودن بنر مکمل سمت چپ
  const hasLeftBanner = !!a1BannerGroup && a1BannerGroup.banners?.length > 0;

  return (
    <div className="w-full space-y-8 py-0">
      
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

        {/* 
          گرید بنرها با ارتفاع فشرده‌تر و بسیار خوش‌تناسب برای دسکتاپ و تبلت.
          بدون تداخل با قد صفحه یا لرزش در لودینگ ابتدایی.
        */}
        {!isLoading && !isError && rawBanners.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-10 gap-4 md:gap-6 items-stretch w-full h-[180px] sm:h-[240px] md:h-[300px] lg:h-[350px] xl:h-[400px] 2xl:h-[440px] animate-in fade-in duration-300">
            
            {/* سمت راست: اسلایدر بنرهای متحرک (۷۰ درصد صفحه در تبلت و دسکتاپ، ۱۰۰ درصد در موبایل) */}
            <div className={cn(
              "w-full h-full",
              hasLeftBanner ? "md:col-span-7" : "md:col-span-10"
            )}>
              <BannerSlider group={sliderGroup} aspectRatio="h-full" />
            </div>

            {/* سمت چپ: بنر ثابت مکمل (۳۰ درصد صفحه - نمایش اختصاصی در دسکتاپ و تبلت با ارتفاع کوچک‌تر شده جدید) */}
            {hasLeftBanner && (
              <div className="hidden md:block md:col-span-3 h-full w-full">
                <Banner group={a1BannerGroup} aspectRatio="h-full" />
              </div>
            )}

          </div>
        )}
      </div>

      {/* بخش خوش‌آمدگویی کاربر */}
      <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-4 pt-8">
        <Typography variant="h1" className="font-iran-yekan">
          به یدکچی خوش آمدید
        </Typography>
        
        <Typography variant="lead" color="muted" className="font-iran-sans text-center">
          {user ? (
            `سلام ${user.shopTitle || user.fullName || 'کاربر'} عزیز`
          ) : (
            'بزرگترین مارکت‌پلیس خودرو و قطعات یدکی در ایران'
          )}
        </Typography>
        
        <div className="mt-8 flex gap-4">
          <div className="rounded-lg border p-4 text-center bg-card">
            <Typography variant="h4" className="font-iran-yekan">
              ایران‌یکان
            </Typography>
            <Typography variant="small" color="muted" className="font-iran-sans">
              برای تیترها و عناوین
            </Typography>
          </div>
          <div className="rounded-lg border p-4 text-center bg-card">
            <Typography variant="h4" className="font-iran-sans">
              ایران‌سنس
            </Typography>
            <Typography variant="small" color="muted" className="font-iran-sans">
              برای متن اصلی
            </Typography>
          </div>
        </div>
      </div>

    </div>
  );
}