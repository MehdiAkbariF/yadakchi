'use client';

import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';

export function ProductPageSkeleton() {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex w-full flex-col items-start gap-8 lg:flex-row">
        <div className="flex w-full flex-1 flex-col gap-6 lg:max-w-[70%]">
          <div className="flex w-full flex-col gap-4 border-b border-border pb-3">
            <Skeleton variant="text" className="h-3.5 w-24" />
            <Skeleton variant="text" className="mt-2 h-8 w-3/4" />
            <div className="mt-1 flex items-center gap-2">
              <Skeleton variant="circle" className="h-4 w-4" />
              <Skeleton variant="text" className="h-3.5 w-32" />
            </div>
          </div>

          <div className="flex w-full flex-col gap-2.5">
            <Skeleton variant="text" className="h-3.5 w-28" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>

          <div className="flex w-full flex-col gap-3.5">
            <Skeleton variant="text" className="h-3.5 w-28" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
          </div>

          <Skeleton className="h-20 w-full rounded-md" />

          <div className="flex w-full flex-col gap-4">
            <div className="flex gap-6 border-b border-border pb-2">
              <Skeleton variant="text" className="h-5 w-28" />
              <Skeleton variant="text" className="h-5 w-28" />
            </div>
            <div className="flex flex-col gap-3">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-6 lg:w-[30%]">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <Skeleton className="h-72 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}