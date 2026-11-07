'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetMegaMenu } from '@/domains/front/banner/hooks/banner.hooks';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Search, Settings, ArrowLeft, X, Package } from 'lucide-react';
import { BottomNav } from '@/components/sections/BottomNav/BottomNav';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl } from '@/core/utils/formatters';

// کامپوننت لود امن تصاویر با انکود خودکار فاصله‌ها و حروف فارسی
function PartItemIcon({ icon, name }: { icon: string | null; name: string }) {
  const [hasError, setHasError] = React.useState(false);

  const safeUrl = React.useMemo(() => {
    if (!icon) return null;
    const full = getFullUrl(icon);
    try {
      return encodeURI(full);
    } catch {
      return full;
    }
  }, [icon]);

  if (!safeUrl || hasError) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Package className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary/40 p-1">
      <img
        src={safeUrl}
        alt={name}
        onError={() => setHasError(true)}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export function CategoriesContent() {
  const router = useRouter();
  const { data: categories = [], isLoading } = useGetMegaMenu();
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  // ریدایرکت کاربران دسکتاپ به صفحه اصلی (صفحه دسته‌بندی‌ها صرفاً مختص نمای موبایل است)
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      router.replace('/');
    }
  }, [router]);

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

  // ارسال فرم جستجو به صفحه سرچ سراسری
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // فیلتر زنده و همزمان قطعات بر اساس تایپ کاربر
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  const matchedParts = isSearching
    ? categories.flatMap((cat: any) =>
        (cat.parts || [])
          .filter((part: any) => part.name?.toLowerCase().includes(trimmedQuery))
          .map((part: any) => ({
            ...part,
            categoryName: cat.name,
            categoryEnglishTitle: cat.englishTitle,
            categoryId: cat.id,
          }))
      )
    : [];

  return (
    <div className="flex h-[100dvh] w-full select-none flex-col overflow-hidden bg-card lg:hidden" dir="rtl">
      
      {/* نوار جستجوی بالای صفحه دسته‌بندی */}
      <div className="z-10 w-full shrink-0 border-b border-border/60 bg-card p-3">
        <form onSubmit={handleSearchSubmit} className="relative flex w-full items-center" role="search">
          <input
            type="text"
            placeholder="جستجو در نام قطعات یا دسته‌بندی‌ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="جستجو در دسته‌بندی"
            className="h-10 w-full rounded-xl border border-border/80 bg-secondary/30 ps-4 pe-20 text-xs text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
          />

          <div className="absolute end-1.5 flex items-center gap-1">
            {isSearching ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="پاک کردن جستجو"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}

            <button
              type="submit"
              className="flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-xs font-bold text-primary-foreground shadow-2xs transition-transform active:scale-95"
              aria-label="اجرای جستجو"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* نتایج زنده جستجو یا ساختار دو ستونه استاندارد */}
      {isSearching ? (
        /* نتایج زنده جستجو */
        <div className="h-full min-h-0 flex-1 overflow-y-auto overscroll-contain bg-card p-4 scrollbar-none pb-24">
          <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-label">
              نتایج قطعات منطبق با «{searchQuery}»:
            </span>
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              className="flex items-center gap-1 text-2xs font-bold text-primary hover:underline"
            >
              <span>جستجوی سراسری در فروشگاه</span>
              <ArrowLeft className="h-3 w-3" />
            </button>
          </div>

          {matchedParts.length > 0 ? (
            <div className="grid w-full grid-cols-2 gap-3 pb-8 sm:grid-cols-3">
              {matchedParts.map((part: any) => {
                const categorySlug = part.categoryId || part.categoryEnglishTitle;
                const partSlug = encodeURIComponent(part.englishTitle || part.id);
                const partHref = `/parts/${categorySlug}/${partSlug}`;

                return (
                  <Link
                    key={part.id}
                    href={partHref}
                    className="flex h-28 select-none flex-col items-center justify-center gap-2 rounded-xl border border-border/70 bg-card p-3 text-center shadow-2xs transition-all hover:border-primary/50"
                  >
                    <PartItemIcon icon={part.icon} name={part.name} />
                    <span className="line-clamp-2 w-full text-2xs font-semibold leading-relaxed text-foreground">
                      {part.name}
                    </span>
                    <span className="text-3xs text-muted-foreground">
                      دسته: {part.categoryName}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="mb-2 h-10 w-10 text-muted-foreground/40" />
              <p className="text-base font-semibold text-muted-foreground">
                هیچ قطعه‌ای مطابق با عبارت وارد شده پیدا نشد.
              </p>
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="mt-3 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10"
              >
                جستجو در کلیه قطعات و محصولات
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ساختار دو ستونه اپلیکیشنی متصل به نوار پایین */
        <div className="relative flex min-h-0 w-full flex-1 overflow-hidden pb-16">
          
          {/* ستون راست: منوی دسته‌بندی‌ها با اسکرول مستقل */}
          <div className="flex h-full w-24 shrink-0 flex-col overflow-y-auto overscroll-contain border-e border-border/60 bg-secondary/20 py-2 scrollbar-none sm:w-28 pb-8">
            {categories.map((cat) => {
              const isActive = activeCategory?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={cn(
                    'flex w-full flex-col items-center justify-center gap-2 border-s-4 px-2 py-3 text-center outline-none transition-all duration-fast',
                    isActive
                      ? 'border-primary bg-card font-bold text-primary shadow-2xs'
                      : 'border-transparent text-foreground/80 hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border p-1 transition-colors',
                      isActive ? 'border-primary/40 bg-primary/5' : 'border-border/70 bg-card'
                    )}
                  >
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
                  <span className="block max-w-full truncate text-2xs font-semibold leading-relaxed">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ستون چپ: قطعات دسته‌بندی متصل به صفحه قطعه (/parts) */}
          <div className="h-full min-h-0 flex-1 overflow-y-auto overscroll-contain bg-card p-4 scrollbar-none pb-8">
            {activeCategory ? (
              <div className="flex w-full flex-col gap-4">
                <div className="flex w-full items-center justify-between border-b border-border/50 pb-2">
                  <span className="text-label">
                    همه قطعات {activeCategory.name}
                  </span>
                  <Link
  href={`/part-category/${encodeURIComponent(activeCategory.englishTitle || activeCategory.id)}`}
  prefetch={false}
  className="flex items-center gap-1 text-2xs font-bold text-primary hover:underline"
>
  <span>مشاهده همه</span>
  <ArrowLeft aria-hidden="true" className="h-3 w-3" />
</Link>
                </div>

                {activeCategory.parts && activeCategory.parts.length > 0 ? (
                  <div className="grid w-full grid-cols-2 gap-3 pb-8">
                    {activeCategory.parts.map((part) => {
                      // هدایت مستقیم قطعه به صفحه /parts
                      const categorySlug = activeCategory.id;
                      const partSlug = encodeURIComponent(part.englishTitle || part.id);
                      const partHref = `/parts/${categorySlug}/${partSlug}`;

                      return (
                        <Link
                          key={part.id}
                          href={partHref}
                          prefetch={false}
                          className="flex h-28 select-none flex-col items-center justify-center gap-2 rounded-xl border border-border/70 bg-card p-3 text-center shadow-2xs transition-all duration-fast hover:border-primary/50 hover:shadow-xs active:scale-95"
                        >
                          <PartItemIcon icon={part.icon} name={part.name} />
                          <span className="line-clamp-2 w-full text-2xs font-semibold leading-relaxed text-foreground">
                            {part.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex w-full items-center justify-center py-12 text-xs text-muted-foreground">
                    قطعه‌ای برای این دسته‌بندی ثبت نشده است.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                یک دسته‌بندی را انتخاب کنید
              </div>
            )}
          </div>
        </div>
      )}

      {/* نوار پایین اپلیکیشن با تب دسته‌بندی روشن */}
      <BottomNav />
    </div>
  );
}