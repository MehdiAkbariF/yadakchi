// src/components/features/Home/HomeContent.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Settings, Fuel, Zap, Activity, Gauge, Sparkles, Wrench } from 'lucide-react';
import { useGetBanners } from '@/domains/front/banner/hooks/banner.hooks';
import { useGetPartCategories } from '@/domains/front/part/hooks/part.hooks';
import { useGetNominatedProductsByCategory } from '@/domains/front/product/hooks/product.hooks';
import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { getHttpClient } from '@/core/http/client';
import { BannerSlider } from '@/components/features/Banner/BannerSlider';
import { Banner, BannerGroup } from '@/components/features/Banner/Banner';
import { ShopByCar } from '@/components/features/Car/ShopByCar';
import { HomeCategories } from '@/components/features/Part/HomeCategories';
import { DealsSlider } from '@/components/features/ProductCard/DealsSlider';
import { ProductSlider } from '@/components/features/ProductCard/ProductSlider';
import { BrandSlider } from '@/components/features/Brand/BrandSlider';
import { ShopSlider } from '@/components/features/Shop/ShopSlider';
import { PageDescription } from '@/components/composites/PageDescription/PageDescription';
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';
import { getFullUrl } from '@/core/utils/formatters';

// آیکون‌های متناسب با نام دسته‌بندی
function getCategoryIcon(name: string) {
  const n = name || '';
  if (n.includes('سوخت') || n.includes('بنزین') || n.includes('پمپ')) return Fuel;
  if (n.includes('برق') || n.includes('باتری') || n.includes('شمع') || n.includes('کوئل') || n.includes('دینام')) return Zap;
  if (n.includes('ترمز') || n.includes('لنت') || n.includes('دیسک')) return Activity;
  if (n.includes('موتور') || n.includes('روغن') || n.includes('سیلندر')) return Settings;
  if (n.includes('گیربکس') || n.includes('کلاچ')) return Gauge;
  if (n.includes('بدنه') || n.includes('چراغ') || n.includes('سپر')) return Sparkles;
  return Wrench;
}

// کامپوننت اختصاصی برای اسلایدر هر دسته (با واکشی مستقل و آیکون هماهنگ)
function DynamicCategorySlider({ category }: { category: any }) {
  const slug = category.englishTitle || category.id;
  const { data, isLoading, isError } = useGetNominatedProductsByCategory(slug);
  const [imgFailed, setImgFailed] = React.useState(false);

  const products = data?.products?.items || [];
  const totalCount = data?.products?.totalCount || 0;

  // اگر کالایی در این دسته موجود نبود، اسلایدر پنهان می‌شود
  if (!isLoading && products.length === 0) return null;

  const FallbackIcon = getCategoryIcon(category.name);
  const iconUrl = category.icon || category.thumbnail;

  const customIcon = (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary p-1">
      {iconUrl && !imgFailed ? (
        <span className="relative h-5 w-5 block">
          <Image
            src={getFullUrl(iconUrl)}
            alt=""
            fill
            sizes="20px"
            className="object-contain filter dark:invert"
            onError={() => setImgFailed(true)}
          />
        </span>
      ) : (
        <FallbackIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      )}
    </div>
  );

  return (
    <ProductSlider
      title={category.name}
      products={products}
      isLoading={isLoading}
      isError={isError}
      viewAllLink={`/part-category/${category.englishTitle}`}
      totalSalesCount={totalCount}
      customIcon={customIcon}
    />
  );
}

export function HomeContent() {
  const { data: rawBanners = [], isLoading: isBannersLoading } = useGetBanners('Home');

  // دریافت دسته‌بندی‌های اصلی (همان دسته‌بندی‌های کامپوننت HomeCategories)
  const { data: rawCategories = [], isLoading: isCategoriesLoading } = useGetPartCategories(undefined, true);

  const categories = React.useMemo(() => {
    return (rawCategories as any[]).filter(
      (cat) => cat.name && cat.name.trim() !== '' && cat.englishTitle !== 'asd'
    );
  }, [rawCategories]);

  // متن سئو و توضیحات فوتر
  const { data: homePageData } = useTypedQuery<any>(
    ['front', 'get-home-page'],
    async () => {
      const client = getHttpClient();
      const response = await client.get<any>('/api/Front/GetHomePage');
      return response.data;
    },
    { staleTime: 30 * 60 * 1000, retry: 2 }
  );

  // دیکشنری بنرها جهت دسترسی O(1)
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

  // دسته‌های تقسیم‌شده برای قرارگیری منظم بین بنرها
  const cat1 = categories[0];
  const cat2 = categories[1];
  const cat3 = categories[2];
  const cat4 = categories[3];
  const cat5 = categories[4];
  const remainingCategories = categories.slice(5);

  return (
    <div className="w-full space-y-6 sm:space-y-8 mt-3">
      {/* تیتر سمانتیک h1 برای رفع خطای الزامی ساختار تیترها در سئو و دسترس‌پذیری */}
      <h1 className="sr-only">یدکچی | بازارگاه تخصصی لوازم یدکی و قطعات خودرو</h1>

      {/* ================= 1. اسلایدر بالای صفحه + بنر کناری ================= */}
      <section aria-label="اسلایدر و بنرهای برگزیده" className="w-full">
        <div className="grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-10 md:gap-6">
          <div className={hasLeftBanner ? 'md:col-span-7' : 'md:col-span-10'}>
            <div className="relative w-full h-[12.5rem] sm:h-[18.75rem] md:h-[350px] lg:h-[25rem] xl:h-[28.125rem] overflow-hidden rounded-2xl">
              {isBannersLoading ? (
                <Skeleton className="h-full w-full rounded-2xl" />
              ) : (
                <BannerSlider group={sliderGroup} aspectRatio="h-full" />
              )}
            </div>
          </div>

          {hasLeftBanner && (
            <div className="hidden h-full w-full md:col-span-3 md:block">
              <div className="relative w-full h-[12.5rem] sm:h-[18.75rem] md:h-[350px] lg:h-[25rem] xl:h-[28.125rem] overflow-hidden rounded-2xl">
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
        {bannersMap['A2-Banner'] && (
          <div className="w-full overflow-hidden rounded-2xl">
            <Banner
              group={bannersMap['A2-Banner']}
              aspectRatio="aspect-[21/9] sm:aspect-[24/8] md:aspect-[32/7] lg:aspect-[40/7]"
            />
          </div>
        )}

        {/* اسلایدر دسته اول */}
        {cat1 && <DynamicCategorySlider key={cat1.id} category={cat1} />}

        {/* چهار بنر کنار هم (A3 تا A6) */}
        {(bannersMap['A3-Banner'] || bannersMap['A4-Banner'] || bannersMap['A5-Banner'] || bannersMap['A6-Banner']) && (
          <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
            {bannersMap['A3-Banner'] && <Banner group={bannersMap['A3-Banner']} aspectRatio="aspect-[16/10]" />}
            {bannersMap['A4-Banner'] && <Banner group={bannersMap['A4-Banner']} aspectRatio="aspect-[16/10]" />}
            {bannersMap['A5-Banner'] && <Banner group={bannersMap['A5-Banner']} aspectRatio="aspect-[16/10]" />}
            {bannersMap['A6-Banner'] && <Banner group={bannersMap['A6-Banner']} aspectRatio="aspect-[16/10]" />}
          </div>
        )}

        {/* اسلایدر دسته دوم */}
        {cat2 && <DynamicCategorySlider key={cat2.id} category={cat2} />}

        {/* دو بنر دوتایی (A7 و A8) */}
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

        {/* برندهای برگزیده */}
        <BrandSlider />

        {/* اسلایدر دسته سوم */}
        {cat3 && <DynamicCategorySlider key={cat3.id} category={cat3} />}

        {/* بنرهای ترکیبی (A9, A10, A11) */}
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

        {/* فروشندگان برگزیده */}
        <ShopSlider />

        {/* بنر تکی عرضی A12 */}
        {bannersMap['A12-Banner'] && (
          <div className="w-full overflow-hidden rounded-2xl">
            <Banner
              group={bannersMap['A12-Banner']}
              aspectRatio="aspect-[21/9] sm:aspect-[24/8] md:aspect-[32/7] lg:aspect-[40/7]"
            />
          </div>
        )}

        {/* اسلایدر دسته چهارم */}
        {cat4 && <DynamicCategorySlider key={cat4.id} category={cat4} />}

        {/* بنر تکی عرضی A13 */}
        {bannersMap['A13-Banner'] && (
          <div className="w-full overflow-hidden rounded-2xl">
            <Banner
              group={bannersMap['A13-Banner']}
              aspectRatio="aspect-[21/9] sm:aspect-[24/8] md:aspect-[32/7] lg:aspect-[40/7]"
            />
          </div>
        )}

        {/* اسلایدر دسته پنجم */}
        {cat5 && <DynamicCategorySlider key={cat5.id} category={cat5} />}

        {/* سایر دسته‌های باقی‌مانده (در صورت وجود) */}
        {remainingCategories.map((category) => (
          <DynamicCategorySlider key={category.id} category={category} />
        ))}

        {/* متن سئو و توضیحات انتهای صفحه */}
        <PageDescription htmlContent={homePageData?.description} />
      </div>
    </div>
  );
}