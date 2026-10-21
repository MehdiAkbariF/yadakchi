'use client';

import * as React from 'react';
import { Search, FolderKanban, Car, Wrench } from 'lucide-react';
import { Input } from '@/components/primitives/Input/Input';
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
    <div className={cn('flex w-full select-none flex-col gap-6', isMobile && 'gap-4')}>
      <div className="w-full rounded-lg border border-border bg-card p-4 shadow-xs">
        <span className="mb-3 block text-xs font-bold text-foreground">جستجو در مقالات</span>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Input
            placeholder="عنوان مقاله یا کلمه کلیدی..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            leftIcon={<Search aria-hidden="true" className="h-4 w-4" />}
          />
        </form>
      </div>

      <div className="flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-xs">
        <div className="mb-1 flex items-center justify-between border-b border-border pb-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <FolderKanban aria-hidden="true" className="h-4 w-4 text-primary" />
            دسته‌بندی‌های وبلاگ
          </span>
          {selectedCategory ? (
            <button
              type="button"
              onClick={() => onFilterChange('blogCategoryId', undefined)}
              className="text-2xs font-bold text-destructive hover:underline"
            >
              پاک کردن
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onFilterChange('blogCategoryId', undefined)}
            className={cn(
              'w-full rounded-md px-3 py-2 text-start text-xs font-bold transition-colors',
              !selectedCategory ? 'bg-muted text-foreground font-bold' : 'text-muted-foreground hover:bg-muted'
            )}
          >
            همه مقالات
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onFilterChange('blogCategoryId', cat.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-3 py-2 text-start text-xs font-bold transition-colors',
                selectedCategory === cat.id
                  ? 'bg-muted text-foreground font-bold'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <span>{cat.title}</span>
            </button>
          ))}
        </div>
      </div>

      {availableFilters.carTypes.length > 0 ? (
        <div className="flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-xs">
          <div className="mb-1 flex items-center justify-between border-b border-border pb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
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
                    'rounded-md border px-3 py-1.5 text-xs font-bold transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                  )}
                >
                  {car.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {availableFilters.parts.length > 0 ? (
        <div className="flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-xs">
          <div className="mb-1 flex items-center justify-between border-b border-border pb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Wrench aria-hidden="true" className="h-4 w-4 text-primary" />
              قطعات مرتبط
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
                    'rounded-md border px-3 py-1.5 text-xs font-bold transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                  )}
                >
                  {part.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {hasAnyFilter ? (
        <button
          type="button"
          onClick={onClearAll}
          className="w-full rounded-md border border-destructive/30 py-2.5 text-center text-xs font-bold text-destructive transition-colors hover:bg-destructive/5"
        >
          حذف تمام فیلترها
        </button>
      ) : null}
    </div>
  );
}
