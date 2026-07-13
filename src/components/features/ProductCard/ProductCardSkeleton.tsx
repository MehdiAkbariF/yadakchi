import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="w-full bg-background rounded-xl border p-3.5 flex flex-col items-center gap-3">
      <Skeleton className="w-full aspect-[4/3]" />
      <div className="w-full space-y-2.5">
        <Skeleton variant="text" className="w-11/12 h-4" />
        <Skeleton variant="text" className="w-3/4 h-3.5" />
      </div>
      <div className="w-full flex items-center justify-between mt-4">
        <Skeleton className="w-8 h-6 rounded-lg" />
        <div className="flex flex-col items-end gap-1">
          <Skeleton className="w-16 h-3" />
          <Skeleton className="w-24 h-5" />
        </div>
      </div>
    </div>
  );
}