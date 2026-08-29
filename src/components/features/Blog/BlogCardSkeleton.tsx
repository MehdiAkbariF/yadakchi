// src/components/features/Blog/components/BlogCardSkeleton.tsx

import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';

export function BlogCardSkeleton() {
  return (
    <div className="w-full bg-card rounded-2xl border p-4 flex flex-col gap-3.5 shadow-sm">
      <Skeleton className="w-full aspect-[16/10] rounded-xl" />
      <div className="flex items-center justify-between w-full mt-1">
        <Skeleton variant="text" className="w-20 h-4 rounded-md" />
        <Skeleton variant="text" className="w-16 h-4 rounded-md" />
      </div>
      <Skeleton variant="text" className="w-full h-5 rounded-md" />
      <Skeleton variant="text" className="w-4/5 h-5 rounded-md" />
      <div className="flex items-center justify-between border-t border-dashed pt-3 mt-2">
        <Skeleton variant="text" className="w-24 h-4 rounded-md" />
        <Skeleton variant="text" className="w-16 h-4 rounded-md" />
      </div>
    </div>
  );
}