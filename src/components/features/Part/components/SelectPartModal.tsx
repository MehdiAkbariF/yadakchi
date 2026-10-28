'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, SlidersHorizontal, Inbox, Package } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getHttpClient } from '@/core/http/client';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Input } from '@/components/primitives/Input/Input';
import { Card } from '@/components/composites/Card';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { getFullUrl } from '@/core/utils/formatters';

export interface SelectPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string; // PartCategoryEnglishTitle یا PartCategoryId
  categoryName: string;
  carSlug?: string;
  categoryId?: string;
}

export function SelectPartModal({
  isOpen,
  onClose,
  slug,
  categoryName,
  carSlug,
  categoryId,
}: SelectPartModalProps) {
  const router = useRouter();
  const [partSearch, setPartSearch] = React.useState('');
  const debouncedSearch = useDebounce(partSearch, 300);

  // تشخیص هوشمند شناسه (GUID) یا عنوان انگلیسی اسلاگ
  const isGuid = /^[0-9a-fA-F-]{36}$/.test(slug || '');
  const resolvedCategoryId = categoryId || (isGuid ? slug : undefined);
  const resolvedCategorySlug = !isGuid && slug ? slug : undefined;

  // بازنشانی مقدار اینپوت سرچ با باز شدن مجدد مودال
  React.useEffect(() => {
    if (isOpen) {
      setPartSearch('');
    }
  }, [isOpen]);

  // ✅ استفاده از useInfiniteQuery پایدار: مشکل خالی شدن در دفعات بعدی را ۱۰۰٪ حل می‌کند
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [
      'front',
      'parts',
      'by-category-infinite',
      resolvedCategoryId,
      resolvedCategorySlug,
      debouncedSearch,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const client = getHttpClient();
      const params: Record<string, any> = {
        Name: debouncedSearch ? debouncedSearch.trim() : undefined,
        PageNumber: pageParam,
        PageSize: 30,
      };

      if (resolvedCategoryId) {
        params.PartCategoryId = resolvedCategoryId;
      }
      if (resolvedCategorySlug) {
        params.PartCategoryEnglishTitle = resolvedCategorySlug;
      }

      const response = await client.get<any>('/api/Front/PartList', { params });
      return response.data?.pagedParts || response.data || { items: [], totalPages: 1 };
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage?.totalPages || 1;
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
    enabled: isOpen && !!(resolvedCategoryId || resolvedCategorySlug),
    staleTime: 5 * 60 * 1000, // ۵ دقیقه کش پایدار در مرورگر
  });

  // تجمیع مستقیم آیتم‌ها از کش بدون وابستگی به useEffect
  const allParts = React.useMemo(() => {
    return data?.pages?.flatMap((page) => page.items || []) || [];
  }, [data]);

  // اسکرول بی‌نهایت برای لود صفحات بعدی
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasNextPage || isFetchingNextPage || isLoading) return;
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= 40;
    if (isAtBottom) {
      fetchNextPage();
    }
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
      router.push(
        `/car-parts/${encodeURIComponent(part.englishTitle || part.id)}/${encodeURIComponent(resolvedCarSlug)}?partId=${part.id}`
      );
      onClose();
      return;
    }

    // هدایت مستقیم و تمیز به صفحه خود قطعه
    const targetCategorySlug =
      resolvedCategorySlug ||
      part.categoryEnglishTitle ||
      resolvedCategoryId ||
      part.categoryId ||
      part.partCategoryId ||
      'category';

    const targetPartSlug = encodeURIComponent(part.englishTitle || part.id);

    router.push(`/parts/${targetCategorySlug}/${targetPartSlug}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-lg">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
          <SlidersHorizontal aria-hidden="true" className="h-5 w-5 text-primary" />
          <span>انتخاب قطعه برای {categoryName}</span>
        </ModalTitle>
      </ModalHeader>

      <ModalBody className="flex h-full flex-col gap-4 p-4 pt-2">
        <Input
          type="text"
          placeholder="جستجو در نام قطعات..."
          value={partSearch}
          onChange={(e) => setPartSearch(e.target.value)}
          leftIcon={<Search aria-hidden="true" className="h-4 w-4" />}
          className="w-full"
        />

        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto pe-1 ps-1 scrollbar-thin md:max-h-80"
        >
          {allParts.length > 0 ? (
            <div className="grid w-full grid-cols-2 gap-3 py-1 sm:grid-cols-3">
              {allParts.map((part: any) => (
                <Card
                  key={part.id}
                  onClick={() => handleSelectPart(part)}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border border-border/80 bg-card p-3 text-center transition-all hover:border-primary/50 hover:bg-accent/30 active:scale-95"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/40 p-1">
                    {part.icon ? (
                      <img
                        src={getFullUrl(part.icon)!}
                        alt={part.name}
                        className="h-full w-full object-contain filter dark:invert"
                      />
                    ) : (
                      <Package aria-hidden="true" className="h-6 w-6 text-primary/70" />
                    )}
                  </div>
                  <span className="w-full truncate text-xs font-bold text-foreground">
                    {part.name}
                  </span>
                </Card>
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
                <Inbox aria-hidden="true" className="h-8 w-8 text-muted-foreground/60" />
                <span className="text-xs font-bold text-muted-foreground">قطعه‌ای یافت نشد.</span>
              </div>
            )
          )}

          {(isFetchingNextPage || (isLoading && allParts.length === 0)) && (
            <div className="flex w-full items-center justify-center py-4">
              <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}