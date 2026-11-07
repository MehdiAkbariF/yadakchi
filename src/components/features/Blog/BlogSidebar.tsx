'use client';

import * as React from 'react';
import { Search, FolderKanban, Car, Wrench, X } from 'lucide-react';
import { BlogCategoryViewModel, BlogPostFiltersAvailable } from '@/domains/blog/types/view.types';
import { cn } from '@/design-system/utils/cn';

export interface BlogSidebarProps {
  categories: BlogCategoryViewModel[];
  availableFilters?: BlogPostFiltersAvailable;
  selectedCategory?: string;
  selectedCarTypes?: string[];
  selectedParts?: string[];
  searchQuery?: string;
  onFilterChange: (name: string, value: any) => void;
  onClearAll: () => void;
  isMobile?: boolean;
}

export function BlogSidebar({
  categories = [],
  availableFilters = { carTypes: [], parts: [] },
  selectedCategory,
  selectedCarTypes = [],
  selectedParts = [],
  searchQuery = '',
  onFilterChange,
  onClearAll,
  isMobile = false,
}: BlogSidebarProps) {
  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  React.useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange('title', localSearch.trim() || undefined);
  };

  const handleToggleCar = (id: string) => {
    const next = selectedCarTypes.includes(id)
      ? selectedCarTypes.filter((c) => c !== id)
      : [...selectedCarTypes, id];
    onFilterChange('carTypeIds', next.length ? next : undefined);
  };

  const handleTogglePart = (id: string) => {
    const next = selectedParts.includes(id)
      ? selectedParts.filter((p) => p !== id)
      : [...selectedParts, id];
    onFilterChange('partIds', next.length ? next : undefined);
  };

  const hasAnyFilter =
    Boolean(selectedCategory) || selectedCarTypes.length > 0 || selectedParts.length > 0 || Boolean(searchQuery);

  return (
    <div className={cn('flex w-full select-none flex-col gap-5', isMobile && 'gap-4')}>
      
      {/* باکس جستجوی مدرن */}
      <div className="w-full rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <label className="mb-2 block text-label">جستجوی تخصصی</label>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="مثلاً: لنت سرامیکی، توربوشارژر..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full rounded-xl border border-border/80 bg-muted/40 py-2 pe-9 ps-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button type="submit" aria-label="جستجو" className="absolute end-2.5 top-2.5 text-muted-foreground hover:text-primary">
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* دسته‌بندی‌های وبلاگ */}
      <div className="flex w-full flex-col gap-2 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="mb-1 flex items-center justify-between border-b border-border/70 pb-2.5">
          <span className="flex items-center gap-1.5 text-label">
            <FolderKanban aria-hidden="true" className="h-4 w-4 text-primary" />
            موضوعات تخصصی
          </span>
          {selectedCategory && (
            <button
              type="button"
              onClick={() => onFilterChange('blogCategoryId', undefined)}
              className="text-3xs font-bold text-destructive hover:underline"
            >
              حذف انتخاب
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onFilterChange('blogCategoryId', undefined)}
            className={cn(
              'w-full rounded-xl px-3 py-2 text-start text-xs font-bold transition-colors',
              !selectedCategory ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
            )}
          >
            همه موضوعات
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onFilterChange('blogCategoryId', cat.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-xs font-bold transition-colors',
                selectedCategory === cat.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              )}
            >
              <span>{cat.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* چیپ‌های انتخاب خودرو (Car Architecture Chips) */}
      {availableFilters.carTypes.length > 0 && (
        <div className="flex w-full flex-col gap-2 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="mb-1 flex items-center justify-between border-b border-border/70 pb-2.5">
            <span className="flex items-center gap-1.5 text-label">
              <Car aria-hidden="true" className="h-4 w-4 text-primary" />
              خودروهای مرتبط
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {availableFilters.carTypes.map((car) => {
              const active = selectedCarTypes.includes(car.id);
              return (
                <button
                  key={car.id}
                  type="button"
                  onClick={() => handleToggleCar(car.id)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-2xs font-bold transition-all',
                    active
                      ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                      : 'border-border/80 bg-muted/40 text-muted-foreground hover:border-border hover:bg-muted'
                  )}
                >
                  {car.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* چیپ‌های انتخاب قطعات مرتبط */}
      {availableFilters.parts.length > 0 && (
        <div className="flex w-full flex-col gap-2 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="mb-1 flex items-center justify-between border-b border-border/70 pb-2.5">
            <span className="flex items-center gap-1.5 text-label">
              <Wrench aria-hidden="true" className="h-4 w-4 text-primary" />
              مجموعه قطعات
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {availableFilters.parts.map((part) => {
              const active = selectedParts.includes(part.id);
              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => handleTogglePart(part.id)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-2xs font-bold transition-all',
                    active
                      ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                      : 'border-border/80 bg-muted/40 text-muted-foreground hover:border-border hover:bg-muted'
                  )}
                >
                  {part.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* دکمه پاک‌سازی فیلترها */}
      {hasAnyFilter && (
        <button
          type="button"
          onClick={onClearAll}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/5 py-2.5 text-xs font-bold text-destructive transition-colors hover:bg-destructive/10"
        >
          <X className="h-3.5 w-3.5" />
          <span>حذف تمام فیلترها</span>
        </button>
      )}
    </div>
  );
}