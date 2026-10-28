'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl } from '@/core/utils/formatters';
import { useBannerImpression } from '@/shared/hooks/useBannerImpression';
import { bannerTracker } from '@/core/utils/banner-tracker';

export interface BannerItem {
  id: string;
  title: string;
  targetURL: string | null;
  image: string;
  imageAlt: string | null;
  size: 'Desktop' | 'Mobile';
}

export interface BannerGroup {
  id: string;
  name: string;
  type: string;
  banners: BannerItem[];
}

export interface BannerProps {
  group?: BannerGroup;
  className?: string;
  /**
   * نسبت ابعاد پیش‌فرض متناسب با استانداردهای وب:
   * موبایل: 2.3 به 1 | تبلت: 3 به 1 | دسکتاپ: 3.8 به 1
   */
  aspectRatio?: string;
  priority?: boolean;
}

export function Banner({
  group,
  className,
  aspectRatio = 'aspect-[2.3/1] sm:aspect-[3/1] md:aspect-[3.5/1] lg:aspect-[3.8/1]',
  priority = false,
}: BannerProps) {
  if (!group || !group.banners || group.banners.length === 0) return null;

  // تفکیک بنر نسخه دسکتاپ و موبایل با پشتیبانی از فال‌بک امن
  const desktopBanner = group.banners.find((b) => b.size === 'Desktop') || group.banners[0];
  const mobileBanner = group.banners.find((b) => b.size === 'Mobile') || desktopBanner;

  // ترکینگ مستقل مشاهده بنرها
  const desktopImpressionRef = useBannerImpression(desktopBanner.id);
  const mobileImpressionRef = useBannerImpression(mobileBanner.id);

  // رندر بنر منفرد بر اساس استانداردهای مرورگر و ریسپانسیو
// رندر بنر منفرد بر اساس استانداردهای مرورگر و ریسپانسیو
  const renderBannerImage = (
    banner: BannerItem,
    sizeVisibilityClass: string,
    ref: React.Ref<HTMLDivElement> // ✅ اصلاح تایپ جهت سازگاری کامل با React
  ) => {
    const fullSrc = getFullUrl(banner.image);
    const alt = banner.imageAlt || banner.title || 'بنر فروشگاه یدکچی';

    const rawUrl = banner.targetURL?.trim() || '';
    const isInternal = rawUrl.startsWith('/') || rawUrl.startsWith('#');
    const href = !rawUrl
      ? null
      : isInternal
      ? rawUrl
      : rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
      ? rawUrl
      : `https://${rawUrl}`;

    const imageElement = (
      <div
        ref={ref}
        className={cn(
          'group relative h-full w-full overflow-hidden rounded-2xl bg-muted/40 shadow-2xs transition-all duration-300',
          'hover:shadow-md hover:border-primary/20',
          aspectRatio === 'h-full' ? 'h-full min-h-full' : aspectRatio
        )}
      >
        <img
          src={fullSrc}
          alt={alt}
          className="h-full w-full rounded-2xl object-cover object-center transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.015]"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          // @ts-expect-error - صفت استاندارد مرورگرها
          fetchpriority={priority ? 'high' : 'auto'}
        />
      </div>
    );

    if (href) {
      return (
        <Link
          href={href}
          target={isInternal ? '_self' : '_blank'}
          rel={isInternal ? undefined : 'noopener noreferrer'}
          aria-label={banner.title || alt}
          className={cn(
            'block h-full w-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            sizeVisibilityClass
          )}
          onClick={() => bannerTracker.trackClick(banner.id)}
        >
          {imageElement}
        </Link>
      );
    }

    return <div className={cn('h-full w-full', sizeVisibilityClass)}>{imageElement}</div>;
  };

 return (
  <div className={cn('relative h-full w-full overflow-hidden', className)}>
    {renderBannerImage(desktopBanner, 'hidden md:block', desktopImpressionRef)}
    {renderBannerImage(mobileBanner, 'block md:hidden', mobileImpressionRef)}
  </div>
);
}