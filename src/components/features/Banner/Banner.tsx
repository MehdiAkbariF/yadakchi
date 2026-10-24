'use client';

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
  aspectRatio?: string;
  priority?: boolean;
}

export function Banner({
  group,
  className,
  aspectRatio = 'aspect-[16/9] lg:aspect-[16/10]',
  priority = false,
}: BannerProps) {
  if (!group || !group.banners || group.banners.length === 0) return null;

  const desktopBanner = group.banners.find((b) => b.size === 'Desktop') || group.banners[0];
  const mobileBanner = group.banners.find((b) => b.size === 'Mobile') || desktopBanner;

  const desktopImpressionRef = useBannerImpression(desktopBanner.id);
  const mobileImpressionRef = useBannerImpression(mobileBanner.id);

  const renderBannerImage = (banner: BannerItem, sizeClass: string, ref: React.RefObject<HTMLDivElement>) => {
    const fullSrc = getFullUrl(banner.image);
    const alt = banner.imageAlt || banner.title || 'Yadakchi Banner';

    const imageElement = (
      <div
        ref={ref}
        className={cn(
          'relative h-full w-full overflow-hidden rounded-lg shadow-xs transition-shadow duration-normal hover:shadow-sm',
          aspectRatio === 'h-full' ? 'h-full min-h-full' : aspectRatio
        )}
      >
        {/* ✅ استفاده از img معمولی به جای next/image */}
        <img
          src={fullSrc}
          alt={alt}
          className="h-full w-full rounded-lg object-cover"
          loading={priority ? 'eager' : 'lazy'}
        />
      </div>
    );

    if (banner.targetURL) {
      const href = banner.targetURL.startsWith('http')
        ? banner.targetURL
        : `https://${banner.targetURL}`;
      return (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={banner.title || alt}
          className={cn('block h-full w-full', sizeClass)}
          onClick={() => bannerTracker.trackClick(banner.id)}
        >
          {imageElement}
        </Link>
      );
    }

    return <div className={cn('h-full w-full', sizeClass)}>{imageElement}</div>;
  };

  return (
    <div className={cn('flex h-full w-full flex-col', className)}>
      {renderBannerImage(desktopBanner, 'hidden md:block', desktopImpressionRef)}
      {renderBannerImage(mobileBanner, 'block md:hidden', mobileImpressionRef)}
    </div>
  );
}