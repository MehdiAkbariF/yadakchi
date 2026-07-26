'use client';

import { useEffect, useRef } from 'react';
import { bannerTracker } from '@/core/utils/banner-tracker';

export function useBannerImpression(bannerId: string | null, shopProductId?: string | null) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerId || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // ورود حداقل ۱۰ درصد بنر به ویوپورت جهت ثبت بازدید کافیست
        if (entry.isIntersecting) {
          bannerTracker.track(bannerId, shopProductId);
          
          // قطع موقت ناظر بر روی المان جاری جهت ممانعت از ثبت تکراری در همان اسکرول
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