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
        
        if (entry.isIntersecting) {
          impressionTracker.track(shopProductId);
          
          
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        }
      },
      {
        threshold: 0.2, 
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