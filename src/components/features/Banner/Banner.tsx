'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  priority?: boolean; // پروپ اختصاصی جهت اولویت لود در بالای صفحه (بنرهای LCP)
}

export function Banner({ 
  group, 
  className, 
  aspectRatio = 'aspect-[16/9] lg:aspect-[16/10]',
  priority = false 
}: BannerProps) {
  if (!group || !group.banners || group.banners.length === 0) return null;

  // تفکیک بنرها بر اساس سایز دسکتاپ و موبایل از پاسخ API
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
        <Image
          src={fullSrc}
          alt={alt}
          fill
          priority={priority} // لود پرسرعت بدون تأخیر در رندر اولیه بنر
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover rounded-2xl hover:scale-[1.01] transition-transform duration-500"
          unoptimized={fullSrc.endsWith('.gif')}
        />
      </div>
    );

    if (banner.targetURL) {
      const href = banner.targetURL.startsWith('http') ? banner.targetURL : `https://${banner.targetURL}`;
      return (
        <Link 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label={banner.title || alt} // بهبود دسترسی‌پذیری و دسترسی سریع صفحه‌خوان‌ها
          className={cn("block w-full h-full", sizeClass)}
        >
          {imageElement}
        </Link>
      );
    }

    return <div className={cn("w-full h-full", sizeClass)}>{imageElement}</div>;
  };

  return (
    <div className={cn('w-full h-full flex flex-col', className)}>
      {/* نمایش بنر دسکتاپ بر روی دسکتاپ و مخفی‌سازی در موبایل */}
      {renderBannerImage(desktopBanner, 'hidden md:block')}
      
      {/* نمایش بنر موبایل بر روی موبایل و مخفی‌سازی در دسکتاپ */}
      {renderBannerImage(mobileBanner, 'block md:hidden')}
    </div>
  );
}