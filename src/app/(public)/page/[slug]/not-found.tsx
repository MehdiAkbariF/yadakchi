// src/app/(public)/page/[slug]/not-found.tsx

import Link from 'next/link';
import { Button } from '@/components/primitives/Button/Button';
import { FileQuestion } from 'lucide-react';

export default function StaticPageNotFound() {
  return (
    <div
      className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4"
      dir="rtl"
    >
      <div className="p-4 bg-muted rounded-full">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>

      <h1 className="text-lg md:text-xl font-black font-iran-yekan text-foreground">
        صفحه مورد نظر یافت نشد
      </h1>

      <p className="text-xs md:text-sm text-muted-foreground font-iran-yekan max-w-md leading-relaxed">
        صفحه‌ای که به دنبال آن هستید حذف شده یا آدرس آن تغییر کرده است.
      </p>

      <Link href="/" className="mt-2">
        <Button
          variant="primary"
          className="rounded-xl font-iran-yekan font-bold text-xs h-10 px-6"
        >
          بازگشت به صفحه اصلی
        </Button>
      </Link>
    </div>
  );
}