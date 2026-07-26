'use client';

import { useState, useEffect, useRef } from 'react';
import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { getHttpClient } from '@/core/http/client';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Input } from '@/components/primitives/Input/Input';
import { Card } from '@/components/composites/Card';
import { Loader2, Search, SlidersHorizontal, ChevronLeft, Inbox, Car } from 'lucide-react';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface SelectPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  categoryName: string;
}

export function SelectPartModal({ isOpen, onClose, slug, categoryName }: SelectPartModalProps) {
  const [partSearch, setPartSearch] = useState('');
  const debouncedSearch = useDebounce(partSearch, 400);
  const [page, setPage] = useState(1);
  const [accumulatedParts, setAccumulatedParts] = useState<any[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: partsResponse, isLoading, isFetching } = useTypedQuery<any>(
    ['front', 'parts', 'by-category-lazy', slug, debouncedSearch, page],
    async () => {
      const client = getHttpClient();
      const response = await client.get<any>('/api/Front/PartList', {
        params: {
          PartCategoryEnglishTitle: slug,
          Name: debouncedSearch || undefined,
          PageNumber: page,
          PageSize: 30
        }
      });
      return response.data?.pagedParts || { items: [], totalPages: 1 };
    },
    {
      enabled: isOpen && !!slug,
      staleTime: 0,
      gcTime: 0
    }
  );

  const hasMore = partsResponse ? page < partsResponse.totalPages : false;

  useEffect(() => {
    if (isOpen) {
      setPartSearch('');
      setPage(1);
      setAccumulatedParts([]);
    }
  }, [isOpen]);

  useEffect(() => {
    setPage(1);
    setAccumulatedParts([]);
  }, [debouncedSearch]);

  useEffect(() => {
    if (partsResponse?.items) {
      if (page === 1) {
        setAccumulatedParts(partsResponse.items);
      } else {
        setAccumulatedParts((prev) => [...prev, ...partsResponse.items]);
      }
    }
  }, [partsResponse, page]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasMore || isFetching || isLoading) return;
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= 15;
    if (isAtBottom) {
      setPage(prev => prev + 1);
    }
  };

  const handleSelectPart = (part: any) => {
    window.location.href = `/parts/${slug}/${part.englishTitle}`;
  };

  const getFullUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          انتخاب قطعه برای {categoryName}
        </ModalTitle>
      </ModalHeader>
      <ModalBody className="p-0 pt-4 text-right flex flex-col gap-4 h-full">
        <div className="px-4 md:px-0">
          <Input
            type="text"
            placeholder="جستجو در نام قطعات..."
            value={partSearch}
            onChange={(e) => setPartSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-zinc-400" />}
            className="w-full font-iran-yekan"
          />
        </div>

        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 md:max-h-80 overflow-y-auto px-4 md:px-0 pr-1 pl-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        >
          {accumulatedParts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full py-1">
              {accumulatedParts.map((part: any) => (
                <Card
                  key={part.id}
                  onClick={() => handleSelectPart(part)}
                  className="border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:border-primary/40 hover:scale-[1.02] bg-card text-center flex flex-col items-center justify-center p-4 gap-3 shadow-sm transition-all"
                >
                  <div className="w-12 h-12 shrink-0 rounded-full bg-background border p-1 flex items-center justify-center overflow-hidden">
                    {part.icon ? (
                      <img src={getFullUrl(part.icon)!} alt={part.name} className="w-full h-full object-contain filter dark:invert" />
                    ) : (
                      <Car className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-xs font-bold font-iran-yekan text-foreground truncate w-full">{part.name}</span>
                </Card>
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="w-full py-16 text-center flex flex-col items-center justify-center gap-2">
                <Inbox className="h-8 w-8 text-muted-foreground/60" />
                <span className="text-xs font-bold font-iran-yekan text-muted-foreground">قطعه‌ای یافت نشد.</span>
              </div>
            )
          )}

          {isFetching && (
            <div className="w-full py-3 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}