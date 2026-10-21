'use client';

import * as React from 'react';
import { Checkbox } from '@/components/primitives/Checkbox/Checkbox';
import { Input } from '@/components/primitives/Input/Input';
import { Skeleton } from '@/components/primitives/Skeleton/Skeleton';
import { Search, Loader2, Inbox, X } from 'lucide-react';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface FilterItem {
  id: string;
  name: string;
}

export interface FilterListProps {
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
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedQuery = useDebounce(searchQuery, 400);

  React.useEffect(() => {
    onSearchChange(debouncedQuery);
  }, [debouncedQuery, onSearchChange]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore || !hasMore || isLoadingMore) return;
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= 15;
    if (isAtBottom) onLoadMore();
  };

  const activeSelectedItems = React.useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-3.5 pt-1 px-1">
        <Skeleton className="w-full h-9 rounded-md" />
        <div className="flex flex-col gap-3 ps-1 pe-3.5 mt-2.5">
          <Skeleton variant="text" className="w-11/12" />
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-5/6" />
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
        leftIcon={<Search className="h-3.5 w-3.5" />}
        className="w-full"
      />

      {activeSelectedItems.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-dashed border-border animate-fade-in">
          {activeSelectedItems.map((item) => (
            <div
              key={`selected-${item.id}`}
              className="flex items-center gap-1 rounded-sm bg-accent px-2 py-1 text-2xs font-medium text-accent-foreground"
            >
              <span className="truncate max-w-[80px]">{item.name}</span>
              <button
                type="button"
                onClick={() => onChange(item.id, false)}
                className="shrink-0 rounded-full p-0.5 hover:bg-accent-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`حذف ${item.name}`}
              >
                <X aria-hidden="true" className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div
        onScroll={handleScroll}
        className="flex flex-col gap-2.5 max-h-48 overflow-y-auto ps-1 pe-3.5 py-1 scrollbar-thin"
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
            <Inbox aria-hidden="true" className="mb-2 h-6 w-6 text-muted-foreground/50" />
            <span className="text-2xs text-muted-foreground">موردی یافت نشد</span>
          </div>
        )}

        {hasMore ? (
          <div className="flex h-8 w-full shrink-0 items-center justify-center py-1.5">
            {isLoadingMore ? <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin text-primary" /> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}