'use client';

import * as React from 'react';

interface LottiePlayerProps {
  path: string;
  className?: string;
  loop?: boolean;
}

export function LottiePlayer({ path, className = 'w-48 h-48', loop = true }: LottiePlayerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let anim: any = null;
    let isMounted = true;
    let observer: IntersectionObserver | null = null;

    const loadLottie = async () => {
      try {
        const altPath = path.includes('/anumations/')
          ? path.replace('/anumations/', '/animations/')
          : path.replace('/animations/', '/anumations/');

        let animationData: any = null;
        for (const targetPath of [path, altPath]) {
          try {
            const res = await fetch(targetPath);
            if (res.ok) {
              animationData = await res.json();
              break;
            }
          } catch {}
        }

        if (!animationData || !isMounted || !containerRef.current) return;

        const lottieModule = await import('lottie-web');
        const lottie = lottieModule.default || lottieModule;

        if (containerRef.current && isMounted) {
          anim = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay: true,
            animationData,
          });

          // ✅ اگر لاتی در دید کاربر نبود، انیمیشن متوقف شود تا باتری و پردازنده هدر نرود
          observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
              anim?.play();
            } else {
              anim?.pause();
            }
          });

          observer.observe(containerRef.current);
        }
      } catch {}
    };

    loadLottie();

    return () => {
      isMounted = false;
      observer?.disconnect();
      anim?.destroy();
    };
  }, [path, loop]);

  return <div ref={containerRef} className={className} />;
}