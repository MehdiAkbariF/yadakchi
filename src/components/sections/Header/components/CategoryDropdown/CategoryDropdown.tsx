'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Typography } from '@/components/primitives/Typography';

// ============================================================
// Types
// ============================================================
interface CategoryDropdownProps {
  isOpen: boolean;
}

interface CategoryPart {
  id: string;
  name: string;
  englishTitle?: string;
}

interface Category {
  id: string;
  name: string;
  englishTitle?: string;
  icon?: string;
  parts?: CategoryPart[];
}

// ============================================================
// Helpers
// ============================================================
function getFallbackIcon(categoryName: string) {
  const name = categoryName || '';
  if (
    name.includes('سوخت') ||
    name.includes('بنزین') ||
    name.includes('کنیستر') ||
    name.includes('باک') ||
    name.includes('پمپ')
  )
    return Fuel;
  if (
    name.includes('برق') ||
    name.includes('باتری') ||
    name.includes('الکترونیک') ||
    name.includes('شمع') ||
    name.includes('کوئل') ||
    name.includes('دینام')
  )
    return Zap;
  if (name.includes('ترمز') || name.includes('لنت') || name.includes('دیسک')) return Activity;
  if (
    name.includes('موتور') ||
    name.includes('سیلندر') ||
    name.includes('پیستون') ||
    name.includes('روغن')
  )
    return Settings;
  if (name.includes('گیربکس') || name.includes('جعبه دنده') || name.includes('کلاچ')) return Gauge;
  if (name.includes('بدنه') || name.includes('چراغ') || name.includes('سپر')) return Sparkles;
  return Wrench;
}

function getMainCategoryUrl(cat: Category): string {
  if (!cat) return '#';
  const targetSlug = encodeURIComponent(cat.englishTitle || cat.id);
  return `/part-category/${targetSlug}`;
}

function getSubCategoryUrl(cat: Category, part: CategoryPart): string {
  if (!cat || !part) return '#';
  const categorySlug = cat.id;
  const partSlug = encodeURIComponent(part.englishTitle || '');
  return `/parts/${categorySlug}/${partSlug}`;
}

// ============================================================
// Component
// ============================================================
export function CategoryDropdown({ isOpen }: CategoryDropdownProps) {
  const { data: rawData = [], isLoading, isError } = useGetMegaMenu();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const categories: Category[] = Array.isArray(rawData)
    ? rawData
    : ((rawData as any)?.partCategories as Category[]) || [];

  const activeCategory =
    categories.find((c) => c.id === (activeCategoryId || categories[0]?.id)) || categories[0];

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div
      dir="rtl"
      className={cn(
        'absolute top-full right-0 z-dropdown flex h-[32rem] w-[64rem] overflow-hidden',
        'rounded-b-2xl rounded-t-none border-x border-b border-border/80 bg-card shadow-2xl backdrop-blur-md',
        'before:absolute before:-top-3 before:inset-x-0 before:h-3 before:bg-transparent',
        'animate-in fade-in-50 zoom-in-95 duration-150'
      )}
    >
      {/* Loading */}
      {isLoading && (
        <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          <Typography variant="small" weight="medium">
            در حال بارگذاری دسته‌بندی قطعات...
          </Typography>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-1 items-center justify-center gap-2 p-4 text-destructive">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
          <Typography variant="small" weight="medium">
            خطا در بارگذاری اطلاعات. لطفاً دوباره تلاش کنید.
          </Typography>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && categories.length > 0 && (
        <>
          {/* ستون راست: هر گزینه اکنون یک Link معتبر است که با هاور سوییچ می‌کند و با کلیک هدایت می‌شود */}
          <div className="w-[16.5rem] shrink-0 overflow-y-auto border-l border-border/70 bg-muted/25 py-2 scrollbar-thin">
            {categories.map((category) => {
              const isActive = activeCategory?.id === category.id;
              const hasImageFailed = failedImages[category.id] || !category.icon;
              const FallbackIconComponent = getFallbackIcon(category.name);
              const categoryUrl = getMainCategoryUrl(category);

              return (
                <Link
                  key={category.id}
                  href={categoryUrl}
                  onMouseEnter={() => setActiveCategoryId(category.id)}
                  className={cn(
                    'relative flex w-full items-center justify-between px-4 py-3 text-xs font-semibold transition-all text-right select-none',
                    isActive
                      ? 'bg-card text-primary font-bold shadow-xs'
                      : 'text-foreground/85 hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  {/* خط نشانگر عمودی نارنجی برای دسته‌بندی انتخابی */}
                  {isActive && (
                    <span className="absolute inset-y-0 right-0 w-1 bg-primary rounded-l" />
                  )}

                  <div className="flex min-w-0 items-center gap-3">
                    {hasImageFailed ? (
                      <FallbackIconComponent
                        className={cn('h-4.5 w-4.5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
                        aria-hidden="true"
                      />
                    ) : (
                      <span className="relative inline-flex h-4.5 w-4.5 shrink-0">
                        <Image
                          src={category.icon!}
                          alt=""
                          fill
                          sizes="20px"
                          className={cn('object-contain filter dark:invert', isActive && 'brightness-110')}
                          onError={() => handleImageError(category.id)}
                        />
                      </span>
                    )}
                    <span className="truncate">{category.name}</span>
                  </div>

                  <ChevronLeft
                    aria-hidden="true"
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform duration-fast',
                      isActive ? '-translate-x-0.5 text-primary' : 'text-muted-foreground/40'
                    )}
                  />
                </Link>
              );
            })}
          </div>

          {/* ستون چپ: نمایش زیردسته‌ها با گرید ۳ ستونه */}
          <div className="flex-1 overflow-y-auto p-6 bg-card scrollbar-thin">
            {activeCategory ? (
              <div className="flex flex-col h-full space-y-5">
                {/* نوار بالای زیردسته‌ها */}
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <Link
                    href={getMainCategoryUrl(activeCategory)}
                    className="group/title flex items-center gap-2.5 transition-colors hover:text-primary"
                  >
                    {failedImages[activeCategory.id] || !activeCategory.icon ? (
                      (() => {
                        const FallbackIcon = getFallbackIcon(activeCategory.name);
                        return <FallbackIcon className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />;
                      })()
                    ) : (
                      <span className="relative inline-flex h-5 w-5 shrink-0">
                        <Image
                          src={activeCategory.icon}
                          alt=""
                          fill
                          sizes="24px"
                          className="object-contain filter dark:invert"
                          onError={() => handleImageError(activeCategory.id)}
                        />
                      </span>
                    )}
                    <span className="text-sm font-bold text-foreground group-hover/title:text-primary transition-colors">
                      قطعات و لوازم {activeCategory.name}
                    </span>
                  </Link>

                  <Link
                    href={getMainCategoryUrl(activeCategory)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary transition-colors hover:text-primary-hover hover:underline"
                  >
                    <span>مشاهده تمام قطعات این گروه</span>
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>

                {/* گرید ۳ ستونه قطعات و قطعات فرعی */}
                {activeCategory.parts && activeCategory.parts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-x-6 gap-y-3.5">
                    {activeCategory.parts.map((part) => {
                      const partHref = getSubCategoryUrl(activeCategory, part);

                      return (
                        <Link
                          key={part.id}
                          href={partHref}
                          className="group/part flex items-center gap-1.5 py-1 text-xs font-medium text-muted-foreground transition-all duration-150 hover:text-primary hover:-translate-x-1"
                        >
                          <span className="h-1 w-1 rounded-full bg-border transition-colors group-hover/part:bg-primary shrink-0" />
                          <span className="truncate">{part.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center py-12 text-center text-xs text-muted-foreground">
                    هیچ قطعه‌ای برای این دسته‌بندی یافت نشد.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                یک دسته‌بندی را از ستون راست انتخاب کنید.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}