// src/app/loading.tsx
import { PageLoading } from '@/components/composites/Loading/PageLoading';

export default function Loading() {
  // به جای fullPage، به صورت لودینگ محتوای داخلی نمایش داده می‌شود
  // تا هدر و نویگیشن هرگز نپرد
  return (
    <div className="flex w-full min-h-[calc(100vh-160px)] items-center justify-center">
      <PageLoading fullPage={false} />
    </div>
  );
}