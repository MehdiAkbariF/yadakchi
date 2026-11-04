// src/shared/Transitions/GlobalNavigationLoader.tsx
'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ThreeDotsLoader } from '@/components/composites/Loading/ThreeDotsLoader';

export function GlobalNavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = React.useState(false);

  // با تغییر صفحه یا پارامترهای آدرس، لودینگ غیرفعال می‌شود
  React.useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  React.useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');

      if (!anchor) return;

      const targetAttr = anchor.getAttribute('target');
      const href = anchor.getAttribute('href');

      // نادیده گرفتن لینک‌های تب جدید، کلیک راست، ایمیل، شماره تماس یا هش (#)
      if (
        event.defaultPrevented ||
        event.button !== 0 || // فقط کلیک چپ
        targetAttr === '_blank' ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        !href ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#')
      ) {
        return;
      }

      try {
        const nextUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // لینک خارجی به سایت دیگر
        if (nextUrl.origin !== currentUrl.origin) return;

        // همان صفحه فعلی بدون تغییر مسیر
        if (
          nextUrl.pathname === currentUrl.pathname &&
          nextUrl.search === currentUrl.search
        ) {
          return;
        }

        // فعال‌سازی آنی لودینگ در کسری از ثانیه
        setIsNavigating(true);
      } catch (e) {
        // نادیده گرفتن آدرس‌های نامعتبر
      }
    };

    // شنونده رویداد کلیک روی تمام لینک‌های صفحه
    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  if (!isNavigating) return null;

  return <ThreeDotsLoader size="md" fullPage />;
}