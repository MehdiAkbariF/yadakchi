'use client';

import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';

export function ProductPageSkeleton() {
  return (
    <div className="w-full flex flex-col gap-8 text-right" dir="rtl">
      <div className="w-full flex flex-col lg:flex-row items-start gap-8">
        
        <div className="flex-1 flex flex-col gap-6 w-full lg:max-w-[70%]">
          
          <div className="w-full flex flex-col gap-4 border-b pb-3">
            <Skeleton variant="text" className="w-24 h-3.5" />
            <Skeleton variant="text" className="w-3/4 h-8 mt-2" />
            <div className="flex items-center gap-2 mt-1">
              <Skeleton variant="circle" className="w-4 h-4" />
              <Skeleton variant="text" className="w-32 h-3.5" />
            </div>
          </div>

          <div className="w-full flex flex-col gap-2.5">
            <Skeleton variant="text" className="w-28 h-3.5" />
            <div className="flex gap-2">
              <Skeleton className="w-24 h-9 rounded-xl" />
              <Skeleton className="w-24 h-9 rounded-xl" />
              <Skeleton className="w-28 h-9 rounded-xl" />
            </div>
          </div>

          <div className="w-full flex flex-col gap-3.5">
            <Skeleton variant="text" className="w-28 h-3.5" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Skeleton className="w-full h-16 rounded-xl" />
              <Skeleton className="w-full h-16 rounded-xl" />
              <Skeleton className="w-full h-16 rounded-xl" />
            </div>
          </div>

          <Skeleton className="w-full h-20 rounded-xl" />

          <div className="w-full flex flex-col gap-4">
            <div className="border-b pb-2 flex gap-6">
              <Skeleton variant="text" className="w-28 h-5" />
              <Skeleton variant="text" className="w-28 h-5" />
            </div>
            <div className="flex flex-col gap-3">
              <Skeleton className="w-full h-20 rounded-xl" />
              <Skeleton className="w-full h-20 rounded-xl" />
            </div>
          </div>

        </div>

        <div className="w-full lg:w-[30%] shrink-0 flex flex-col gap-6">
          <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
          <Skeleton className="w-full h-72 rounded-xl" />
        </div>

      </div>
    </div>
  );
}