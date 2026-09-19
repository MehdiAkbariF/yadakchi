// src/shared/hooks/useBannerImpression.ts
'use client';

import { useEffect, useRef } from 'react';
import { bannerTracker } from '@/core/utils/banner-tracker';

export function useBannerImpression(bannerId?: string | null, shopProductId?: string | null) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // اصلاح: حداقل یکی از bannerId یا shopProductId باید وجود داشته باشد
    if ((!bannerId && !shopProductId) || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          bannerTracker.track(bannerId, shopProductId);
          
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [bannerId, shopProductId]);

  return elementRef;
}