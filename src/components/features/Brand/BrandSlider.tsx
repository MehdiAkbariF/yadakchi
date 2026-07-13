'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useGetMainBrands } from '@/domains/front/reference/brand/hooks/brand.hooks';
import { Typography } from '@/components/primitives/Typography';
import { ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';

export function BrandSlider() {
  const { data: brands = [], isLoading, isError } = useGetMainBrands();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setWidth] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [brands]);

  const handleScroll = (direction: 'left' | 'right') => {
    const step = 350;
    let newX = x.get() + (direction === 'right' ? -step : step);
    if (newX < 0) newX = 0;
    if (newX > dragWidth) newX = dragWidth;
    animate(x, newX, { type: 'spring', stiffness: 200, damping: 30 });
  };

  const handleDragClickCapture = (e: React.MouseEvent) => {
    if (Math.abs(x.getVelocity()) > 15) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4 py-4">
        <div className="flex items-center gap-2 px-1">
          <Skeleton className="w-5 h-5" variant="circle" />
          <Skeleton className="w-32 h-5" />
        </div>
        <div className="w-full bg-background rounded-xl border p-4 flex gap-4 overflow-hidden justify-center">
          {[...Array(8)].map((_, index) => (
            <Skeleton key={index} className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || brands.length === 0) return null;

  return (
    <div className="w-full flex flex-col space-y-3.5 py-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary shrink-0" />
          <Typography variant="h4" className="font-iran-yekan font-extrabold text-foreground">
            برندهای محبوب
          </Typography>
        </div>
      </div>

      <div className="w-full bg-background rounded-xl  p-4 relative group overflow-hidden">
        {brands.length > 6 && (
          <>
            <button
              onClick={() => handleScroll('right')}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border bg-background hover:bg-muted text-foreground transition-all shadow-md outline-none cursor-pointer"
              aria-label="Previous"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleScroll('left')}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border bg-background hover:bg-muted text-foreground transition-all shadow-md outline-none cursor-pointer"
              aria-label="Next"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}

        <div 
          ref={carouselRef}
          className="w-full overflow-hidden relative z-10 select-none"
        >
          <motion.div 
            drag="x"
            style={{ x }}
            dragConstraints={{ left: 0, right: dragWidth }}
            dragElastic={0.12}
            onClickCapture={handleDragClickCapture}
            className="flex gap-4 py-1 cursor-grab active:cursor-grabbing"
          >
            {brands.map((brand: any) => (
              <Link
                key={brand.id}
                href={`/search?brandIds=${brand.id}`}
                className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl border bg-background hover:border-primary/40 p-2 flex items-center justify-center transition-all select-none hover:scale-[1.02]"
              >
                <img
                  src={getFullUrl(brand.image)}
                  alt={brand.imageAlt || brand.name}
                  draggable={false}
                  className="w-full h-full object-contain rounded-lg select-none"
                />
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}