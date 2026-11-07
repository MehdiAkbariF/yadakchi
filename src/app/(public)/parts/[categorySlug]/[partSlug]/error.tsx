// src/app/(public)/parts/[categorySlug]/[partSlug]/error.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PartPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string; status?: number };
  reset: () => void;
}) {
  useEffect(() => {
    // 🐛 دیباگ
    console.error('🐛 [PartPageError]', error);
  }, [error]);

  return (
    <div
      dir="rtl"
      className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.74-3l-7.07-12a2 2 0 00-3.48 0l-7.07 12a2 2 0 001.74 3z"
          />
        </svg>
      </div>

      <h1 className="text-lg font-bold text-foreground">
        خطایی در بارگذاری صفحه رخ داد
      </h1>
      <p className="text-base text-muted-foreground">
        {error?.message || 'لطفاً دوباره تلاش کنید یا به صفحه اصلی بازگردید.'}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          تلاش مجدد
        </button>
        <Link
          href="/"
          className="rounded-md border border-border px-4 py-2 text-title-sm transition-colors hover:bg-muted"
        >
          بازگشت به خانه
        </Link>
      </div>
    </div>
  );
}