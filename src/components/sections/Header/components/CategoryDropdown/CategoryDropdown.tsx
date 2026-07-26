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
  Sparkles
} from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

interface CategoryDropdownProps {
  isOpen: boolean;
}

function getFallbackIcon(categoryName: string) {
  const name = categoryName || '';
  if (name.includes('سوخت') || name.includes('بنزین')) return Fuel;
  if (name.includes('برق') || name.includes('باتری') || name.includes('الکترونیک')) return Zap;
  if (name.includes('ترمز') || name.includes('لنت')) return Activity;
  if (name.includes('موتور') || name.includes('سیلندر')) return Settings;
  if (name.includes('گیربکس') || name.includes('جعبه دنده') || name.includes('کلاچ')) return Gauge;
  if (name.includes('بدنه') || name.includes('چراغ')) return Sparkles;
  return Wrench;
}

export function CategoryDropdown({ isOpen }: CategoryDropdownProps) {
  const { data: categories = [], isLoading, isError } = useGetMegaMenu();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const activeCategory = categories.find(c => c.id === (activeCategoryId || categories[0]?.id)) || categories[0];

  const handleImageError = (id: string) => {
    setFailedImages(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="absolute top-full right-0 w-[800px] bg-background border rounded-xl shadow-2xl overflow-hidden z-50 flex h-[450px]">
      
      {isLoading && (
        <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium font-iran-yekan">در حال بارگذاری دسته‌بندی‌ها...</span>
        </div>
      )}

      {isError && (
        <div className="flex flex-1 items-center justify-center gap-2 text-destructive p-4">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium font-iran-yekan">خطا در بارگذاری اطلاعات. لطفاً دوباره تلاش کنید.</span>
        </div>
      )}

      {!isLoading && !isError && categories.length > 0 && (
        <>
          <div className="w-[240px] bg-muted/20 border-l overflow-y-auto py-2 shrink-0">
            {categories.map((category) => {
              const isActive = activeCategory?.id === category.id;
              const hasImageFailed = failedImages[category.id] || !category.icon;
              const FallbackIconComponent = getFallbackIcon(category.name);

              return (
                <button
                  key={category.id}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-3 text-right text-sm transition-colors font-iran-yekan font-medium",
                    isActive 
                      ? "bg-background text-primary" 
                      : "text-foreground hover:bg-muted/50"
                  )}
                  onMouseEnter={() => setActiveCategoryId(category.id)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {hasImageFailed ? (
                      <FallbackIconComponent className="h-5 w-5 shrink-0 text-muted-foreground/80" />
                    ) : (
                      <img 
                        src={category.icon!} 
                        alt={category.name} 
                        className="h-5 w-5 object-contain shrink-0 filter dark:invert"
                        onError={() => handleImageError(category.id)}
                      />
                    )}
                    <span className="truncate">{category.name}</span>
                  </div>
                  <ChevronLeft className={cn("h-4 w-4 shrink-0 transition-transform", isActive ? "text-primary translate-x-1" : "text-muted-foreground")} />
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-background">
            {activeCategory ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-bold text-foreground font-iran-yekan flex items-center gap-2">
                    {failedImages[activeCategory.id] || !activeCategory.icon ? (
                      (() => {
                        const FallbackIcon = getFallbackIcon(activeCategory.name);
                        return <FallbackIcon className="h-5 w-5 text-primary shrink-0" />;
                      })()
                    ) : (
                      <img 
                        src={activeCategory.icon!} 
                        alt={activeCategory.name} 
                        className="h-5 w-5 object-contain filter dark:invert"
                        onError={() => handleImageError(activeCategory.id)}
                      />
                    )}
                    همه قطعات {activeCategory.name}
                  </span>
                  <Link 
                    href={activeCategory.href}
                    className="text-xs text-primary hover:underline font-iran-yekan flex items-center gap-1"
                  >
                    مشاهده همه قطعات این گروه
                    <ChevronLeft className="h-3 w-3" />
                  </Link>
                </div>

                {activeCategory.parts && activeCategory.parts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {activeCategory.parts.map((part) => (
                      <Link
                        key={part.id}
                        href={part.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors py-1 truncate font-iran-yekan font-medium hover:translate-x-1 duration-150 inline-block"
                      >
                        {part.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground font-iran-yekan py-4">
                    هیچ قطعه‌ای برای این دسته‌بندی یافت نشد.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm font-iran-yekan">
                یک دسته‌بندی را از سمت راست انتخاب کنید.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}