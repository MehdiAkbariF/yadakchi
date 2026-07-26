'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Checkbox } from '@/components/primitives/Checkbox/Checkbox';
import { Input } from '@/components/primitives/Input/Input';
import { Search, Loader2, Inbox, X } from 'lucide-react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';

interface FilterItem {
  id: string;
  name: string;
}

interface FilterListProps {
  items: FilterItem[];
  selectedIds: string[];
  onChange: (id: string, checked: boolean) => void;
  searchPlaceholder: string;
  onSearchChange: (query: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  isLoading?: boolean;
}

export function FilterList({
  items,
  selectedIds,
  onChange,
  searchPlaceholder,
  onSearchChange,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  isLoading = false,
}: FilterListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 400);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore || !hasMore || isLoadingMore) return;
    
    const target = e.currentTarget;
    const threshold = 15;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= threshold;

    if (isAtBottom) {
      onLoadMore();
    }
  };

  useEffect(() => {
    onSearchChange(debouncedQuery);
  }, [debouncedQuery, onSearchChange]);

  const activeSelectedItems = useMemo(() => {
    return items.filter(item => selectedIds.includes(item.id));
  }, [items, selectedIds]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-3.5 pt-1 px-1">
        <Skeleton className="w-full h-9 rounded-xl" />
        <div className="flex flex-col gap-3 pr-1 pl-3.5 mt-2.5">
          <Skeleton variant="text" className="w-11/12 h-3.5 rounded" />
          <Skeleton variant="text" className="w-3/4 h-3.5 rounded" />
          <Skeleton variant="text" className="w-5/6 h-3.5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3.5 pt-1 px-1">
      <Input
        type="text"
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size="sm"
        leftIcon={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
        className="w-full text-xs h-9 rounded-xl bg-background"
      />

      {activeSelectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-dashed border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-200">
          {activeSelectedItems.map(item => (
            <div
              key={`selected-${item.id}`}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold font-iran-yekan"
            >
              <span className="truncate max-w-[80px]">{item.name}</span>
              <button
                type="button"
                onClick={() => onChange(item.id, false)}
                className="p-0.5 hover:bg-primary/20 rounded-full shrink-0"
              >
                <X className="h-2.5 w-2.5 stroke-[3]" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div 
        onScroll={handleScroll}
        className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1 pl-3.5 py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      >
        {items.length > 0 ? (
          items.map((item) => (
            <Checkbox
              key={item.id}
              label={item.name}
              checked={selectedIds.includes(item.id)}
              onChange={(checked) => onChange(item.id, checked)}
            />
          ))
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-6 text-center select-none">
            <Inbox className="h-6 w-6 text-muted-foreground/50 stroke-[1.5] mb-2" />
            <span className="text-[10px] text-muted-foreground font-iran-yekan">موردی یافت نشد</span>
          </div>
        )}

        {hasMore && (
          <div className="w-full h-8 flex items-center justify-center py-1.5 shrink-0">
            {isLoadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
          </div>
        )}
      </div>
    </div>
  );
}