'use client';

import * as React from 'react';
import { Loader2, Search, SlidersHorizontal, Inbox, Car } from 'lucide-react';
import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { getHttpClient } from '@/core/http/client';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Input } from '@/components/primitives/Input/Input';
import { Card } from '@/components/composites/Card';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { getFullUrl } from '@/core/utils/formatters';

export interface SelectPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  categoryName: string;
  carSlug?: string;
}

export function SelectPartModal({ isOpen, onClose, slug, categoryName, carSlug }: SelectPartModalProps) {
  const [partSearch, setPartSearch] = React.useState('');
  const debouncedSearch = useDebounce(partSearch, 400);
  const [page, setPage] = React.useState(1);
  const [accumulatedParts, setAccumulatedParts] = React.useState<any[]>([]);

  const { data: partsResponse, isLoading, isFetching } = useTypedQuery<any>(
    ['front', 'parts', 'by-category-lazy', slug, debouncedSearch, page],
    async () => {
      const client = getHttpClient();
      const response = await client.get<any>('/api/Front/PartList', {
        params: {
          PartCategoryEnglishTitle: slug,
          Name: debouncedSearch || undefined,
          PageNumber: page,
          PageSize: 30,
        },
      });
      return response.data?.pagedParts || { items: [], totalPages: 1 };
    },
    { enabled: isOpen && !!slug, staleTime: 0, gcTime: 0 }
  );

  const hasMore = partsResponse ? page < partsResponse.totalPages : false;

  React.useEffect(() => {
    if (isOpen) {
      setPartSearch('');
      setPage(1);
      setAccumulatedParts([]);
    }
  }, [isOpen]);

  React.useEffect(() => {
    setPage(1);
    setAccumulatedParts([]);
  }, [debouncedSearch]);

  React.useEffect(() => {
    if (partsResponse?.items) {
      if (page === 1) setAccumulatedParts(partsResponse.items);
      else setAccumulatedParts((prev) => [...prev, ...partsResponse.items]);
    }
  }, [partsResponse, page]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasMore || isFetching || isLoading) return;
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= 15;
    if (isAtBottom) setPage((prev) => prev + 1);
  };

  const handleSelectPart = (part: any) => {
    let resolvedCarSlug = carSlug;
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/car/')) {
        const segments = path.split('/');
        resolvedCarSlug = segments[segments.length - 1];
      }
    }
    if (resolvedCarSlug) {
      window.location.href = `/car-parts/${part.englishTitle}/${resolvedCarSlug}`;
      return;
    }
    window.location.href = `/parts/${slug}/${part.englishTitle}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
          <SlidersHorizontal aria-hidden="true" className="h-5 w-5 text-primary" />
          انتخاب قطعه برای {categoryName}
        </ModalTitle>
      </ModalHeader>
      <ModalBody className="flex h-full flex-col gap-4 p-0 pt-4">
        <div className="px-4 md:px-0">
          <Input
            type="text"
            placeholder="جستجو در نام قطعات..."
            value={partSearch}
            onChange={(e) => setPartSearch(e.target.value)}
            leftIcon={<Search aria-hidden="true" className="h-4 w-4" />}
            className="w-full"
          />
        </div>

        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 pe-1 ps-2 scrollbar-thin md:max-h-80 md:px-0"
        >
          {accumulatedParts.length > 0 ? (
            <div className="grid w-full grid-cols-2 gap-4 py-1 sm:grid-cols-3">
              {accumulatedParts.map((part: any) => (
                <Card
                  key={part.id}
                  onClick={() => handleSelectPart(part)}
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 border border-border p-4 text-center transition-colors hover:border-primary/40"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-card p-1">
                    {part.icon ? (
                      <img src={getFullUrl(part.icon)!} alt={part.name} className="h-full w-full object-contain filter dark:invert" />
                    ) : (
                      <Car aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <span className="w-full truncate text-xs font-bold text-foreground">{part.name}</span>
                </Card>
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="flex w-full flex-col items-center justify-center gap-2 py-16 text-center">
                <Inbox aria-hidden="true" className="h-8 w-8 text-muted-foreground/60" />
                <span className="text-xs font-bold text-muted-foreground">قطعه‌ای یافت نشد.</span>
              </div>
            )
          )}

          {isFetching ? (
            <div className="flex w-full items-center justify-center py-3">
              <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : null}
        </div>
      </ModalBody>
    </Modal>
  );
}
