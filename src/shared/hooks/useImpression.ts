'use client';

import { useEffect, useRef } from 'react';
import { impressionTracker } from '@/core/utils/impression-tracker';

export function useImpression(shopProductId: string | null) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shopProductId || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // اگر حداقل ۲۰ درصد از کارت کالا در ویوپورت کاربر نمایان شد
        if (entry.isIntersecting) {
          impressionTracker.track(shopProductId);
          
          // قطع ناظر برای این کارت خاص تا در اسکرول‌های مجدد تکراری ثبت نشود
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        }
      },
      {
        threshold: 0.2, // حساسیت ورود به صفحه ۲۰٪
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [shopProductId]);

  return elementRef;
}