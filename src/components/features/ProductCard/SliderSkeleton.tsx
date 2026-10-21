import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';
import { ProductCardSkeleton } from './ProductCardSkeleton';

export interface SliderSkeletonProps {
  title: string;
}

export function SliderSkeleton({ title }: SliderSkeletonProps) {
  return (
    <div className="flex w-full flex-col space-y-3.5 py-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" variant="circle" />
          <span className="font-bold text-foreground">{title}</span>
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex w-full gap-4 overflow-hidden rounded-lg border border-border bg-card p-4">
        <div className="w-[190px] shrink-0 sm:w-[250px]">
          <ProductCardSkeleton />
        </div>
        <div className="w-[190px] shrink-0 sm:w-[250px]">
          <ProductCardSkeleton />
        </div>
        <div className="w-[190px] shrink-0 sm:w-[250px]">
          <ProductCardSkeleton />
        </div>
        <div className="w-[190px] shrink-0 sm:w-[250px]">
          <ProductCardSkeleton />
        </div>
      </div>
    </div>
  );
}
