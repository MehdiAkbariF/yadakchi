import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface SliderSkeletonProps {
  title: string;
}

export function SliderSkeleton({ title }: SliderSkeletonProps) {
  return (
    <div className="w-full flex flex-col space-y-3.5 py-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5" variant="circle" />
          <span className="font-iran-yekan font-extrabold text-foreground">{title}</span>
        </div>
        <Skeleton className="w-16 h-4" />
      </div>
      <div className="w-full bg-background rounded-xl border p-4 flex gap-4 overflow-hidden">
        <div className="w-[190px] sm:w-[250px] shrink-0">
          <ProductCardSkeleton />
        </div>
        <div className="w-[190px] sm:w-[250px] shrink-0">
          <ProductCardSkeleton />
        </div>
        <div className="w-[190px] sm:w-[250px] shrink-0">
          <ProductCardSkeleton />
        </div>
        <div className="w-[190px] sm:w-[250px] shrink-0">
          <ProductCardSkeleton />
        </div>
      </div>
    </div>
  );
}