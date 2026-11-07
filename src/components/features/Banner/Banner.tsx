'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  aspectRatio = 'aspect-[2.3/1] sm:aspect-[3/1] md:aspect-[3.5/1] lg:aspect-[3.8/1]',
  priority = false,
}: BannerProps) {
  if (!group || !group.banners || group.banners.length === 0) return null;

  const desktopBanner = group.banners.find((b) => b.size === 'Desktop') || group.banners[0];
  const mobileBanner = group.banners.find((b) => b.size === 'Mobile') || desktopBanner;

  const desktopImpressionRef = useBannerImpression(desktopBanner.id);
  const mobileImpressionRef = useBannerImpression(mobileBanner.id);

  const renderBannerImage = (
    banner: BannerItem,
    sizeVisibilityClass: string,
    ref: React.Ref<HTMLDivElement>,
    sizes: string
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
          'group relative h-full w-full overflow-hidden rounded-2xl bg-muted/40 shadow-xs transition-all duration-300',
          'hover:shadow-md hover:border-primary/20',
          aspectRatio === 'h-full' ? 'h-full min-h-full' : aspectRatio
        )}
      >
        <Image
          src={fullSrc}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="rounded-2xl object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.015]"
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
      {renderBannerImage(desktopBanner, 'hidden md:block', desktopImpressionRef, '(max-width: 1400px) 100vw, 1400px')}
      {renderBannerImage(mobileBanner, 'block md:hidden', mobileImpressionRef, '100vw')}
    </div>
  );
}