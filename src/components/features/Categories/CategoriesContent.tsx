'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetMegaMenu } from '@/domains/front/banner/hooks/banner.hooks';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Search, Settings, ArrowLeft } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl } from '@/core/utils/formatters';

export function CategoriesContent() {
  const router = useRouter();
  const { data: categories = [], isLoading } = useGetMegaMenu();
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  if (isLoading) {
    return <PageLoading label="در حال بارگذاری لیست دسته‌بندی‌ها..." />;
  }

  const activeCategory =
    categories.find((c) => c.id === (activeCategoryId || categories[0]?.id)) || categories[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex min-h-screen w-full select-none flex-col overflow-hidden bg-card">
      <div className="z-10 w-full shrink-0 border-b border-border bg-card p-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full" role="search">
          <input
            type="text"
            placeholder="جستجو در دسته‌بندی قطعات یدک‌چی..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="جستجو در دسته‌بندی"
            className="h-10 w-full rounded-md border border-border bg-muted px-4 pe-10 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
        </form>
      </div>

      <div className="relative z-0 flex min-h-0 w-full flex-1">
        <div className="flex min-h-0 w-24 shrink-0 flex-col overflow-y-auto border-e border-border bg-muted/50 py-1 scrollbar-none sm:w-28">
          {categories.map((cat) => {
            const isActive = activeCategory?.id === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryId(cat.id)}
                className={cn(
                  'flex w-full flex-col items-center justify-center gap-2 border-s-2 px-2 py-4 text-center outline-none transition-colors',
                  isActive
                    ? 'border-primary bg-card font-bold text-primary'
                    : 'border-transparent text-foreground hover:bg-muted'
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-card p-1">
                  {cat.icon ? (
                    <img
                      src={getFullUrl(cat.icon)}
                      alt={cat.name}
                      className={cn(
                        'h-full w-full object-contain',
                        cat.icon.toLowerCase().endsWith('.svg') && 'filter dark:invert'
                      )}
                    />
                  ) : (
                    <Settings aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <span className="block max-w-full truncate text-2xs font-bold leading-relaxed md:text-xs">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-card p-4 scrollbar-none">
          {activeCategory ? (
            <div className="flex w-full flex-col gap-5">
              <div className="flex w-full items-center justify-between pb-2">
                <span className="text-xs font-bold text-foreground">
                  همه قطعات {activeCategory.name}
                </span>
                <Link
                  href={activeCategory.href}
                  prefetch={false}
                  className="flex items-center gap-0.5 text-2xs font-bold text-primary hover:underline md:text-xs"
                >
                  <span>مشاهده همه</span>
                  <ArrowLeft aria-hidden="true" className="h-3 w-3" />
                </Link>
              </div>

              {activeCategory.parts && activeCategory.parts.length > 0 ? (
                <div className="grid w-full grid-cols-2 gap-3.5">
                  {activeCategory.parts.map((part) => (
                    <Link
                      key={part.id}
                      href={part.href}
                      prefetch={false}
                      className="flex h-28 select-none flex-col items-center justify-center gap-2.5 rounded-lg border border-border bg-card p-3 text-center transition-colors hover:border-primary/40"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                        {part.icon ? (
                          <img
                            src={getFullUrl(part.icon)}
                            className={cn(
                              'h-full w-full object-contain',
                              part.icon.toLowerCase().endsWith('.svg') && 'filter dark:invert'
                            )}
                            alt=""
                          />
                        ) : (
                          <Settings aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="line-clamp-2 w-full text-2xs font-bold leading-relaxed text-foreground md:text-xs">
                        {part.name}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <span className="py-4 text-xs text-muted-foreground">
                  قطعه‌ای برای این دسته‌بندی ثبت نشده است.
                </span>
              )}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              یک دسته‌بندی را انتخاب کنید
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
