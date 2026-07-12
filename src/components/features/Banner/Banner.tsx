// src/components/features/Banner/Banner.tsx

'use client';

import Link from 'next/link';
import { cn } from '@/design-system/utils/cn';

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

interface BannerProps {
  group?: BannerGroup;
  className?: string;
  aspectRatio?: string;
}

export function Banner({ group, className, aspectRatio = 'aspect-[16/9] lg:aspect-[16/10]' }: BannerProps) {
  if (!group || !group.banners || group.banners.length === 0) return null;

  const desktopBanner = group.banners.find((b) => b.size === 'Desktop') || group.banners[0];
  const mobileBanner = group.banners.find((b) => b.size === 'Mobile') || desktopBanner;

  const getFullUrl = (path: string) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const renderBannerImage = (banner: BannerItem, sizeClass: string) => {
    const fullSrc = getFullUrl(banner.image);
    const alt = banner.imageAlt || banner.title || 'Yadakchi Banner';

    const imageElement = (
      <div className={cn(
        'relative w-full h-full overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-300',
        aspectRatio === 'h-full' ? 'h-full min-h-full' : aspectRatio
      )}>
        <img
          src={fullSrc}
          alt={alt}
          // استفاده از absolute inset-0 برای غلبه بر هرگونه فروپاشی ارتفاع در ساختار CSS
          className="w-full h-full object-cover rounded-2xl hover:scale-[1.01] transition-transform duration-500 absolute inset-0"
          loading="lazy"
        />
      </div>
    );

    if (banner.targetURL) {
      const href = banner.targetURL.startsWith('http') ? banner.targetURL : `https://${banner.targetURL}`;
      return (
        <Link href={href} target="_blank" rel="noopener noreferrer" className={cn("block w-full h-full", sizeClass)}>
          {imageElement}
        </Link>
      );
    }

    return <div className={cn("w-full h-full", sizeClass)}>{imageElement}</div>;
  };

  return (
    <div className={cn('w-full h-full flex flex-col', className)}>
      {/* رندر هوشمند بر اساس سیستم واکنش‌گرا بدون تداخل در ارتفاع والد */}
      {renderBannerImage(desktopBanner, 'hidden md:block')}
      {renderBannerImage(mobileBanner, 'block md:hidden')}
    </div>
  );
}