// src/shared/hooks/useBannerImpression.ts

'use client';

import { useEffect, useRef } from 'react';
import { bannerTracker } from '@/core/utils/banner-tracker';

export function useBannerImpression(bannerId?: string | null, shopProductId?: string | null) {
  const elementRef = useRef<HTMLDivElement>(null);
  const hasTrackedRef = useRef(false); // ✅ جلوگیری از ثبت تکراری

  useEffect(() => {
    if ((!bannerId && !shopProductId) || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    // ✅ ریست کردن وضعیت در صورت تغییر شناسه‌ها
    hasTrackedRef.current = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedRef.current) {
          hasTrackedRef.current = true; // ✅ علامت‌گذاری به عنوان ثبت شده
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