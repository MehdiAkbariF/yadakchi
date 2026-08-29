// src/components/features/Blog/components/BlogSidebar.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FolderKanban, Car, Wrench, X } from 'lucide-react';
import { Input } from '@/components/primitives/Input/Input';
import { BlogCategoryViewModel, BlogPostFiltersAvailable } from '@/domains/blog/types/view.types';
import { cn } from '@/design-system/utils/cn';

interface BlogSidebarProps {
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
  const [localSearch, setLocalSearch] = useState(searchQuery);

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

  const hasAnyFilter = !!selectedCategory || selectedCarTypes.length > 0 || selectedParts.length > 0 || !!searchQuery;

  return (
    <div className="w-full flex flex-col gap-6 text-right select-none" dir="rtl">
      
      {/* جستجو در مقالات */}
      <div className="w-full bg-card border rounded-2xl p-4 shadow-sm">
        <span className="text-xs font-black text-foreground font-iran-yekan block mb-3">جستجو در مقالات</span>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Input
            placeholder="عنوان مقاله یا کلمه کلیدی..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            className="text-xs font-iran-yekan"
          />
        </form>
      </div>

      {/* دسته‌بندی‌ها */}
      <div className="w-full bg-card border rounded-2xl p-4 shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between border-b pb-2 mb-1">
          <span className="text-xs font-black text-foreground font-iran-yekan flex items-center gap-1.5">
            <FolderKanban className="h-4 w-4 text-primary" />
            دسته‌بندی‌های وبلاگ
          </span>
          {selectedCategory && (
            <button 
              onClick={() => onFilterChange('blogCategoryId', undefined)} 
              className="text-[10px] text-destructive hover:underline font-bold"
            >
              پاک کردن
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <button
            onClick={() => onFilterChange('blogCategoryId', undefined)}
            className={cn(
              "w-full text-right px-3 py-2 rounded-xl text-xs font-bold font-iran-yekan transition-all",
              !selectedCategory ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
            )}
          >
            همه مقالات
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange('blogCategoryId', cat.id)}
              className={cn(
                "w-full text-right px-3 py-2 rounded-xl text-xs font-bold font-iran-yekan transition-all flex items-center justify-between",
                selectedCategory === cat.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <span>{cat.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* فیلتر خودروها */}
      {availableFilters.carTypes.length > 0 && (
        <div className="w-full bg-card border rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between border-b pb-2 mb-1">
            <span className="text-xs font-black text-foreground font-iran-yekan flex items-center gap-1.5">
              <Car className="h-4 w-4 text-primary" />
              خودروهای مرتبط
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {availableFilters.carTypes.map((car) => {
              const active = selectedCarTypes.includes(car.id);
              return (
                <button
                  key={car.id}
                  onClick={() => handleToggleCar(car.id)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-xl border font-bold font-iran-yekan transition-all",
                    active ? "bg-primary text-white border-primary shadow-sm" : "bg-background text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {car.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* فیلتر قطعات */}
      {availableFilters.parts.length > 0 && (
        <div className="w-full bg-card border rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between border-b pb-2 mb-1">
            <span className="text-xs font-black text-foreground font-iran-yekan flex items-center gap-1.5">
              <Wrench className="h-4 w-4 text-primary" />
              قطعات مرتبط
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {availableFilters.parts.map((part) => {
              const active = selectedParts.includes(part.id);
              return (
                <button
                  key={part.id}
                  onClick={() => handleTogglePart(part.id)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-xl border font-bold font-iran-yekan transition-all",
                    active ? "bg-primary text-white border-primary shadow-sm" : "bg-background text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {part.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasAnyFilter && (
        <button
          onClick={onClearAll}
          className="w-full text-center py-2.5 rounded-xl border border-destructive/20 text-destructive text-xs font-bold font-iran-yekan hover:bg-destructive/5 transition-all"
        >
          حذف تمام فیلترها
        </button>
      )}

    </div>
  );
}