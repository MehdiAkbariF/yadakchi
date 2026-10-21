import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-lg border border-border bg-card p-3.5">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="w-full space-y-2.5">
        <Skeleton variant="text" className="h-4 w-11/12" />
        <Skeleton variant="text" className="h-3.5 w-3/4" />
      </div>
      <div className="mt-4 flex w-full items-center justify-between">
        <Skeleton className="h-6 w-8 rounded-sm" />
        <div className="flex flex-col items-end gap-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
}
