'use client';

import { useEffect, useRef } from 'react';
import { impressionTracker } from '@/core/utils/impression-tracker';

// ✅ آبزرور مشترک سراسری برای جلوگیری از درگیر شدن CPU
let sharedObserver: IntersectionObserver | null = null;
const callbacks = new Map<Element, () => void>();

function getSharedObserver() {
  if (typeof window === 'undefined') return null;
  if (!sharedObserver && 'IntersectionObserver' in window) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cb = callbacks.get(entry.target);
            if (cb) {
              cb();
              callbacks.delete(entry.target);
              sharedObserver?.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.15 }
    );
  }
  return sharedObserver;
}

export function useImpression(shopProductId: string | null) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shopProductId) return;
    const el = elementRef.current;
    if (!el) return;

    const observer = getSharedObserver();
    if (!observer) return;

    callbacks.set(el, () => {
      impressionTracker.track(shopProductId);
    });

    observer.observe(el);

    return () => {
      callbacks.delete(el);
      observer.unobserve(el);
    };
  }, [shopProductId]);

  return elementRef;
}