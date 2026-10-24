'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetMegaMenu } from '@/domains/front/banner/hooks/banner.hooks';
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  Fuel,
  Zap,
  Activity,
  Settings,
  Gauge,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

interface CategoryDropdownProps {
  isOpen: boolean;
}

function getFallbackIcon(categoryName: string) {
  const name = categoryName || '';
  if (name.includes('سوخت') || name.includes('بنزین') || name.includes('کنیستر') || name.includes('باک') || name.includes('پمپ')) return Fuel;
  if (name.includes('برق') || name.includes('باتری') || name.includes('الکترونیک') || name.includes('شمع') || name.includes('کوئل') || name.includes('دینام')) return Zap;
  if (name.includes('ترمز') || name.includes('لنت') || name.includes('دیسک')) return Activity;
  if (name.includes('موتور') || name.includes('سیلندر') || name.includes('پیستون') || name.includes('روغن')) return Settings;
  if (name.includes('گیربکس') || name.includes('جعبه دنده') || name.includes('کلاچ')) return Gauge;
  if (name.includes('بدنه') || name.includes('چراغ') || name.includes('سپر')) return Sparkles;
  return Wrench;
}

export function CategoryDropdown({ isOpen }: CategoryDropdownProps) {
  const { data: rawData = [], isLoading, isError } = useGetMegaMenu();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // استخراج آرایه دسته‌بندی‌ها
  const categories: any[] = Array.isArray(rawData)
    ? rawData
    : (rawData as any)?.partCategories || [];

  const activeCategory =
    categories.find((c) => c.id === (activeCategoryId || categories[0]?.id)) || categories[0];

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  /**
   * تولید آدرس دقیق برای دسته‌بندی اصلی:
   * اگر صفحه روی search سوار است یا part-category، پارامترهای ضروری فرستاده می‌شوند.
   */
  const getMainCategoryUrl = (cat: any) => {
    if (!cat) return '#';
    // در صورتی که صفحه با id کار کند:
    // return `/part-category/${cat.id}`;
    // در ساختار فعلی:
    const targetSlug = cat.englishTitle || cat.id;
    return `/part-category/${targetSlug}?categoryId=${cat.id}`;
  };

  /**
   * تولید آدرس دقیق برای زیر دسته (قطعه):
   * ارسال شناسه قطعه (partId) و شناسه دسته‌بندی اصلی (categoryId)
   */
  const getSubCategoryUrl = (cat: any, part: any) => {
    if (!cat || !part) return '#';
    const targetSlug = cat.englishTitle || cat.id;
    return `/part-category/${targetSlug}?partId=${part.id}&categoryId=${cat.id}`;
  };

  return (
    <div
      dir="rtl"
      className="absolute top-full right-0 z-dropdown flex h-[450px] w-[800px] overflow-hidden rounded-lg border border-border bg-card shadow-lg"
    >
      {isLoading && (
        <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium">در حال بارگذاری دسته‌بندی‌ها...</span>
        </div>
      )}

      {isError && (
        <div className="flex flex-1 items-center justify-center gap-2 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">خطا در بارگذاری اطلاعات. لطفاً دوباره تلاش کنید.</span>
        </div>
      )}

      {!isLoading && !isError && categories.length > 0 && (
        <>
          {/* ستون راست: لیست دسته‌بندی‌های اصلی */}
          <div className="w-[240px] shrink-0 overflow-y-auto border-l border-border bg-muted/20 py-2">
            {categories.map((category) => {
              const isActive = activeCategory?.id === category.id;
              const hasImageFailed = failedImages[category.id] || !category.icon;
              const FallbackIconComponent = getFallbackIcon(category.name);

              return (
                <button
                  key={category.id}
                  type="button"
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors text-right',
                    isActive
                      ? 'bg-card text-primary font-bold border-r-2 border-primary'
                      : 'text-foreground hover:bg-muted/50'
                  )}
                  onMouseEnter={() => setActiveCategoryId(category.id)}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {hasImageFailed ? (
                      <FallbackIconComponent className="h-5 w-5 shrink-0 text-muted-foreground/80" />
                    ) : (
                      <img
                        src={category.icon}
                        alt={category.name}
                        className="h-5 w-5 shrink-0 object-contain filter dark:invert"
                        onError={() => handleImageError(category.id)}
                      />
                    )}
                    <span className="truncate">{category.name}</span>
                  </div>
                  <ChevronLeft
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform',
                      isActive ? 'translate-x-1 text-primary' : 'text-muted-foreground'
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* ستون چپ: زیردسته‌ها */}
          <div className="flex-1 overflow-y-auto p-6 bg-card">
            {activeCategory ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                    {failedImages[activeCategory.id] || !activeCategory.icon ? (
                      (() => {
                        const FallbackIcon = getFallbackIcon(activeCategory.name);
                        return <FallbackIcon className="h-5 w-5 text-primary shrink-0" />;
                      })()
                    ) : (
                      <img
                        src={activeCategory.icon}
                        alt={activeCategory.name}
                        className="h-5 w-5 object-contain filter dark:invert"
                        onError={() => handleImageError(activeCategory.id)}
                      />
                    )}
                    همه قطعات {activeCategory.name}
                  </span>

                  <Link
                    href={getMainCategoryUrl(activeCategory)}
                    onClick={() => {
                      console.log('[MegaMenu] Clicked Main Category URL:', getMainCategoryUrl(activeCategory));
                    }}
                    className="flex items-center gap-1 text-xs text-primary transition-colors hover:underline"
                  >
                    مشاهده همه قطعات این گروه
                    <ChevronLeft className="h-3 w-3" />
                  </Link>
                </div>

                {activeCategory.parts && activeCategory.parts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {activeCategory.parts.map((part: any) => {
                      const hasPartImageFailed = failedImages[part.id] || !part.icon;
                      const PartFallbackIcon = getFallbackIcon(part.name);
                      const partHref = getSubCategoryUrl(activeCategory, part);

                      return (
                        <Link
                          key={part.id}
                          href={partHref}
                          onClick={() => {
                            console.log('[MegaMenu] Clicked Subpart URL:', partHref, {
                              categoryId: activeCategory.id,
                              partId: part.id,
                              partName: part.name,
                            });
                          }}
                          className="flex items-center gap-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 truncate"
                        >
                          {!hasPartImageFailed ? (
                            <img
                              src={part.icon}
                              alt={part.iconAlt || part.name}
                              className="h-5 w-5 shrink-0 object-contain rounded"
                              onError={() => handleImageError(part.id)}
                              loading="lazy"
                            />
                          ) : (
                            <PartFallbackIcon className="h-4 w-4 shrink-0 text-muted-foreground/80" />
                          )}
                          <span className="truncate">{part.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-4 text-sm text-muted-foreground">
                    هیچ قطعه‌ای برای این دسته‌بندی یافت نشد.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                یک دسته‌بندی را از سمت راست انتخاب کنید.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}