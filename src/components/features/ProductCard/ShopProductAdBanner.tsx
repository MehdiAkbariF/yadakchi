'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useGetShopProductBanners } from '@/domains/front/banner/hooks/banner.hooks';
import { useBannerImpression } from '@/shared/hooks/useBannerImpression'; // استفاده از هوک بنر به جای هوک کالا
import { bannerTracker } from '@/core/utils/banner-tracker'; // وارد کردن ترکر کلیک بنرها
import { Star, Store } from 'lucide-react';
import { toPersianDigits, getProductUrl } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';

interface ShopProductAdBannerProps {
  partCategoryId?: string;
  partId?: string;
  carId?: string;
  className?: string;
}

export function ShopProductAdBanner({ 
  partCategoryId, 
  partId, 
  carId, 
  className 
}: ShopProductAdBannerProps) {
  // لود خودکار تبلیغات بر اساس آیدی صفحه جاری
  const { data: banners = [], isLoading } = useGetShopProductBanners({
    partCategoryId,
    partId,
    carId,
  });

  const ad = banners[0]; // دریافت اولین بنر تبلیغاتی منتخب کالا

  // استفاده از هوک بازدید بنرها (ارسال همزمان آیدی بنر و آیدی کالا به اندپوینت متمرکز)
  const impressionRef = useBannerImpression(ad?.id || null, ad?.product?.id || null);

  if (isLoading || !ad) return null;

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const adProductUrl = getProductUrl(ad.product.code, ad.product.name);

  return (
    <div className={cn("w-full relative select-none", className)}>
      
      {/* ۱. رندر دسکتاپ (کارت عمودی و عریض کلاسیک در سایدبار راست) */}
      <Link 
        href={adProductUrl}
        className="hidden md:block w-full h-full select-none"
        onClick={() => bannerTracker.trackClick(ad.id, ad.product.id)} // ثبت رویداد کلیک روی تبلیغ کالا روی سرور
      >
        <div 
          ref={impressionRef} // رفرنس لود بازدید بنر دسکتاپ
          className="w-full relative border border-primary/20 rounded-2xl p-4 bg-primary/5 hover:border-primary/50 transition-all duration-300 flex flex-col gap-3 shadow-sm group"
        >
          <div className="absolute top-3 left-3 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-sm z-10 select-none">
            منتخب
          </div>

          <div className="w-full aspect-[4/3] relative rounded-xl overflow-hidden bg-background border p-2 flex items-center justify-center">
            <Image
              src={getFullUrl(ad.imageUrl)}
              alt={ad.title}
              fill
              sizes="250px"
              className="object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-right w-full">
            <h4 className="text-xs font-black text-foreground font-iran-sans line-clamp-2 leading-relaxed">
              {ad.product.name}
            </h4>

            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-iran-sans">
              <Store className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
              <span>فروشگاه: {ad.product.shopName}</span>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5 justify-start">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
              <span className="text-[10px] font-bold text-foreground font-iran-sans">امتیاز: {toPersianDigits(5)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-primary/20 pt-3 mt-1 flex items-center justify-between w-full">
            <div className={cn(
              "bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-lg shrink-0",
              ad.product.discount.hasDiscount ? "opacity-100" : "opacity-0"
            )}>
              ٪{toPersianDigits(ad.product.discount.discountPercent || 0)}
            </div>

            <div className="flex flex-col items-end text-right min-w-0">
              {ad.product.discount.hasDiscount && ad.product.discount.discountPrice && (
                <span className="text-[9px] text-zinc-400 line-through leading-none font-iran-sans">
                  {ad.product.price.toman}
                </span>
              )}
              <span className="text-xs font-black text-foreground font-iran-sans leading-none mt-1">
                {ad.product.discount.hasDiscount ? ad.product.discount.discountPrice : ad.product.price.toman}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* ۲. رندر موبایل (کارت افقی خطی، فوق‌العاده باریک و بدون دکمه ضربدر) */}
      <Link 
        href={adProductUrl}
        className="block md:hidden w-full select-none"
        onClick={() => bannerTracker.trackClick(ad.id, ad.product.id)} // ثبت رویداد کلیک روی تبلیغ کالا روی سرور
      >
        <div 
          ref={impressionRef} // رفرنس لود بازدید بنر موبایل
          className="w-full relative border border-primary/25 rounded-2xl p-2.5 bg-primary/5 hover:border-primary/40 transition-all duration-300 flex items-center justify-between gap-3 shadow-sm group h-22"
        >
          
          <div className="absolute top-2.5 right-2.5 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm z-10 select-none">
            منتخب
          </div>

          <div className="w-16 h-16 shrink-0 relative rounded-xl overflow-hidden bg-background border p-1 flex items-center justify-center">
            <Image
              src={getFullUrl(ad.imageUrl)}
              alt={ad.title}
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>

          <div className="flex-1 min-w-0 text-right flex flex-col gap-1 justify-center pr-1.5 pt-2">
            <h4 className="text-[11px] font-extrabold text-foreground font-iran-sans line-clamp-2 leading-relaxed pl-4">
              {ad.product.name}
            </h4>
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-iran-sans">
              <Store className="h-3 w-3 text-muted-foreground/75 shrink-0" />
              <span className="truncate">فروشگاه: {ad.product.shopName}</span>
            </div>
          </div>

          <div className="flex flex-col items-end justify-center shrink-0 pl-7 text-left gap-1">
            {ad.product.discount.hasDiscount && (
              <div className="bg-primary text-white text-[8px] font-black px-1 py-0.5 rounded-md shrink-0">
                ٪{toPersianDigits(ad.product.discount.discountPercent || 0)}
              </div>
            )}
            
            <div className="flex flex-col items-end text-left">
              {ad.product.discount.hasDiscount && ad.product.discount.discountPrice && (
                <span className="text-[8px] text-zinc-400 line-through leading-none font-iran-sans">
                  {ad.product.price.toman}
                </span>
              )}
              <span className="text-[11px] font-black text-foreground font-iran-sans leading-none mt-0.5">
                {ad.product.discount.hasDiscount ? ad.product.discount.discountPrice : ad.product.price.toman}
              </span>
            </div>
          </div>

        </div>
      </Link>

    </div>
  );
}