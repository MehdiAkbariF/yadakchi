'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Search,
  X,
  Clock,
  Trash2,
  ArrowRight,
  Loader2,
  Sparkles,
  FolderKanban,
  Car,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';
import { Input } from '@/components/primitives/Input/Input';
import { Modal } from '@/components/composites/Modal/Modal';
import {
  useGetSearchHistory,
  useGetSearchSuggestions,
  useGetSearchKeywords,
  useRemoveSearchHistory,
} from '@/domains/front/product/hooks/product.hooks';
import { useGetBanners } from '@/domains/front/banner/hooks/banner.hooks';
import { useGetCarsName } from '@/domains/front/reference/car/hooks/car.hooks';
import { useGetBrandsName } from '@/domains/front/reference/brand/hooks/brand.hooks';
import { useGetPartCategoriesFlat } from '@/domains/front/part/hooks/part.hooks';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { getFullUrl } from '@/core/utils/formatters';

const DEFAULT_ROTATING_KEYWORDS = [
  'قطعه موتور خودرو',
  'قطعه گیربکس خودرو',
  'روغن و مایعات خودرو',
  'قطعه بدنه خودرو',
  'دستگیره درب خودرو',
  'چراغ جلو خودرو',
  'فیلتر هوای خودرو',
  'کمک فنر خودرو',
];

export interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  isMobile?: boolean;
}

export function SearchBar({
  placeholder = 'جستجو در یدک‌چی...',
  className = '',
  onSearch,
  isMobile = false,
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = React.useTransition();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isGlobalSearching = isPending || isSubmitting;

  const urlQuery = searchParams.get('q') || '';
  const urlCarId = searchParams.get('carIds') || searchParams.get('carId') || '';
  const urlBrandId = searchParams.get('brandIds') || searchParams.get('brandId') || '';

  const { data: cars = [] } = useGetCarsName();
  const { data: brands = [] } = useGetBrandsName();
  const { data: categories = [] } = useGetPartCategoriesFlat();

  const activeCar = cars.find((c: any) => c.id === urlCarId)?.model || '';
  const activeBrand = brands.find((b: any) => b.id === urlBrandId)?.name || '';

  const isCategoryPage = pathname.startsWith('/part-category/');
  const catSlug = isCategoryPage ? pathname.split('/').pop() : '';
  const activeCategory = categories.find((c: any) => c.englishTitle === catSlug)?.name || '';

  const resolvedText = urlQuery || activeCar || activeBrand || activeCategory || '';

  const [query, setQuery] = React.useState(resolvedText);
  const [isFocused, setIsFocused] = React.useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = React.useState(false);
  const [keywordIndex, setKeywordIndex] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const desktopInputRef = React.useRef<HTMLInputElement>(null);
  const mobileInputRef = React.useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 500);

  const { data: history = [], refetch: refetchHistory } = useGetSearchHistory();
  const { data: suggestions = [] } = useGetSearchSuggestions();
  const { data: keywordsData, isLoading: isKeywordsLoading } = useGetSearchKeywords(debouncedQuery);
  const { data: searchBanners = [] } = useGetBanners('SearchResult');
  const removeHistoryMutation = useRemoveSearchHistory();

  // ✅ اصلاح ساختار داده‌های بنر
  const searchBannerGroup = searchBanners.find(
    (b: any) => b.name === 'Search-Suggest'
  );

  const desktopBanner = searchBannerGroup?.banners?.find(
    (b: any) => b.size === 'Desktop'
  ) || searchBannerGroup?.banners?.[0];

  const mobileBanner = searchBannerGroup?.banners?.find(
    (b: any) => b.size === 'Mobile'
  ) || searchBannerGroup?.banners?.[0];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setKeywordIndex((prev) => (prev + 1) % DEFAULT_ROTATING_KEYWORDS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    setQuery(resolvedText);
    setIsSubmitting(false);
  }, [resolvedText, pathname, searchParams]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!isMobileModalOpen) return;
    const handlePopState = () => setIsMobileModalOpen(false);
    window.history.pushState({ modalOpen: 'search-modal' }, '');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMobileModalOpen]);

  const handleSearchSubmit = (searchWord: string) => {
    const trimmed = searchWord.trim();
    if (!trimmed || isGlobalSearching) return;
    setIsSubmitting(true);
    setQuery(trimmed);
    if (onSearch) onSearch(trimmed);
    setIsFocused(false);
    setIsMobileModalOpen(false);
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    });
  };

  const handleRemoveHistoryItem = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeHistoryMutation.mutate(word);
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeHistoryMutation.mutate(undefined);
  };

  const handleOpenMobileSearch = () => {
    setIsMobileModalOpen(true);
    refetchHistory();
    setTimeout(() => mobileInputRef.current?.focus(), 150);
  };

  const handleCloseMobileSearch = () => {
    setIsMobileModalOpen(false);
    if (window.history.state?.modalOpen === 'search-modal') window.history.back();
  };

  const renderAnimatedPlaceholder = () => {
    if (query) return null;
    const currentWord = DEFAULT_ROTATING_KEYWORDS[keywordIndex];
    return (
      <div className="pointer-events-none flex h-5 select-none items-center overflow-hidden text-xs" dir="rtl">
        <span className="ms-1 shrink-0 text-muted-foreground">جستجو در</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={currentWord}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="inline-block max-w-[210px] truncate font-bold text-primary"
          >
            {currentWord}
          </motion.span>
        </AnimatePresence>
      </div>
    );
  };

  const renderSuggestionsPanel = () => {
    const showKeywords = debouncedQuery.trim().length >= 2;
    const keywordsList = (keywordsData as any)?.keywords || [];
    const carsList = (keywordsData as any)?.cars || [];

    const uniqueCategories = Array.from(
      new Map(
        keywordsList
          .filter((kw: any) => kw.partCategoryId && kw.partCategoryName)
          .map((kw: any) => [kw.partCategoryId, kw])
      ).values()
    );

    return (
      <div className="flex flex-1 flex-col overflow-y-auto bg-card" dir="rtl">
        {showKeywords ? (
          <div className="flex h-full flex-col space-y-4 p-4">
            {carsList.length > 0 ? (
              <div className="shrink-0 space-y-2">
                <span className="block border-b border-border pb-2 text-2xs font-bold text-muted-foreground">
                  خودروها
                </span>
                <div className="flex flex-wrap justify-start gap-2">
                  {carsList.map((car: any) => (
                    <button
                      key={car.id}
                      type="button"
                      disabled={isGlobalSearching}
                      onClick={() => {
                        setQuery(car.model);
                        setIsFocused(false);
                        setIsMobileModalOpen(false);
                        setIsSubmitting(true);
                        startTransition(() => {
                          router.push(`/search?carId=${car.id}`);
                        });
                      }}
                      className="flex items-center gap-1.5 rounded-md border border-accent bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/80 disabled:opacity-50"
                    >
                      <Car aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                      <span>قطعات خودرو {car.model}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {uniqueCategories.length > 0 ? (
              <div className="shrink-0 space-y-2">
                <span className="block border-b border-border pb-2 text-2xs font-bold text-muted-foreground">
                  دسته‌بندی‌های مرتبط
                </span>
                <div className="flex flex-wrap justify-start gap-2">
                  {uniqueCategories.map((cat: any) => (
                    <button
                      key={cat.partCategoryId}
                      type="button"
                      disabled={isGlobalSearching}
                      onClick={() => {
                        setQuery(cat.partCategoryName);
                        setIsFocused(false);
                        setIsMobileModalOpen(false);
                        setIsSubmitting(true);
                        startTransition(() => {
                          router.push(`/part-category/${cat.partCategoryEnglishTitle}`);
                        });
                      }}
                      className="flex items-center gap-1.5 rounded-md border border-accent bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/80 disabled:opacity-50"
                    >
                      <FolderKanban aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                      <span>قطعات دسته {cat.partCategoryName}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="shrink-0 space-y-2">
              <span className="block border-b border-border pb-2 text-2xs font-bold text-muted-foreground">
                جستجوهای پیشنهادی
              </span>

              {isKeywordsLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                  <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-xs">در حال جستجوی پیشنهادات...</span>
                </div>
              ) : keywordsList.length > 0 ? (
                <div className="space-y-1">
                  {keywordsList.map((kw: any, index: number) => (
                    <button
                      key={index}
                      type="button"
                      disabled={isGlobalSearching}
                      onClick={() => handleSearchSubmit(kw.suggestion)}
                      className="flex w-full items-center justify-between rounded-md p-2.5 transition-colors hover:bg-muted/60 disabled:opacity-50"
                    >
                      <div className="flex min-w-0 flex-col text-right">
                        <span className="truncate text-sm font-medium text-foreground">{kw.suggestion}</span>
                        {kw.partCategoryName ? (
                          <span className="mt-0.5 truncate text-2xs text-muted-foreground">
                            در دسته {kw.partCategoryName}
                          </span>
                        ) : null}
                      </div>
                      <Search aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  پیشنهادی یافت نشد.
                </div>
              )}
            </div>

            <div className="mt-auto shrink-0 pt-4">
              {isMobile
                ? mobileBanner && (
                    <Link
                      href={mobileBanner.targetURL || '#'}
                      onClick={handleCloseMobileSearch}
                      className="block w-full overflow-hidden rounded-lg border border-border"
                    >
                      <div className="relative w-full aspect-[3/1]">
                        <img
                          src={getFullUrl(mobileBanner.image)}
                          alt={mobileBanner.imageAlt || mobileBanner.title}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </Link>
                  )
                : desktopBanner && (
                    <Link
                      href={desktopBanner.targetURL || '#'}
                      className="block w-full overflow-hidden rounded-lg border border-border"
                    >
                      <div className="relative w-full aspect-[3/1]">
                        <img
                          src={getFullUrl(desktopBanner.image)}
                          alt={desktopBanner.imageAlt || desktopBanner.title}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </Link>
                  )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col space-y-5 p-4">
            {history.length > 0 ? (
              <div className="shrink-0 space-y-2">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                    جستجوهای اخیر شما
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="flex items-center gap-1 text-xs text-destructive transition-colors hover:underline"
                  >
                    <Trash2 aria-hidden="true" className="h-3 w-3" />
                    پاک کردن همه
                  </button>
                </div>
                <div className="flex flex-wrap justify-start gap-2 pt-1">
                  {history.map((item: any, idx: number) => {
                    const isObject = typeof item === 'object' && item !== null;
                    const wordValue = isObject ? (item as any).value : String(item);
                    const itemId = isObject ? (item as any).id : String(idx);
                    return (
                      <div
                        key={itemId}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSearchSubmit(wordValue)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSearchSubmit(wordValue);
                        }}
                        className={cn(
                          'flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-muted',
                          isGlobalSearching && 'pointer-events-none opacity-50'
                        )}
                      >
                        <span>{wordValue}</span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveHistoryItem(wordValue, e)}
                          aria-label={`حذف ${wordValue}`}
                          className="flex items-center justify-center rounded-full p-0.5 transition-colors hover:bg-muted-foreground/20"
                        >
                          <X aria-hidden="true" className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {suggestions.length > 0 ? (
              <div className="shrink-0 space-y-2">
                <span className="flex items-center justify-start gap-1.5 border-b border-border pb-2 text-xs font-bold text-muted-foreground">
                  <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
                  جستجوهای پرطرفدار
                </span>
                <div className="flex flex-wrap justify-start gap-2 pt-1">
                  {suggestions.map((suggest: any, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isGlobalSearching}
                      onClick={() => handleSearchSubmit(suggest)}
                      className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent/40 hover:text-primary disabled:opacity-50"
                    >
                      {suggest}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-auto shrink-0 pt-4">
              {isMobile
                ? mobileBanner && (
                    <Link
                      href={mobileBanner.targetURL || '#'}
                      onClick={handleCloseMobileSearch}
                      className="block w-full overflow-hidden rounded-lg border border-border"
                    >
                      <div className="relative w-full aspect-[3/1]">
                        <img
                          src={getFullUrl(mobileBanner.image)}
                          alt={mobileBanner.imageAlt || mobileBanner.title}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </Link>
                  )
                : desktopBanner && (
                    <Link
                      href={desktopBanner.targetURL || '#'}
                      className="block w-full overflow-hidden rounded-lg border border-border"
                    >
                      <div className="relative w-full aspect-[3/1]">
                        <img
                          src={getFullUrl(desktopBanner.image)}
                          alt={desktopBanner.imageAlt || desktopBanner.title}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </Link>
                  )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className={cn('relative w-full', className)} dir="rtl">
        <div
          onClick={handleOpenMobileSearch}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleOpenMobileSearch();
          }}
          className="relative flex h-10 w-full min-w-0 cursor-pointer items-center overflow-hidden rounded-md border border-border bg-card px-3 py-1.5 text-muted-foreground transition-colors hover:border-primary/50 shadow-xs"
        >
          {isGlobalSearching ? (
            <Loader2 aria-hidden="true" className="z-10 h-4 w-4 shrink-0 animate-spin text-primary" />
          ) : (
            <Search aria-hidden="true" className="z-10 h-4 w-4 shrink-0 text-muted-foreground" />
          )}

          {query ? (
            <span className="ms-2.5 flex-1 truncate text-sm font-medium text-foreground">{query}</span>
          ) : (
            <div className="ms-2.5 flex flex-1 items-center">{renderAnimatedPlaceholder()}</div>
          )}
        </div>

        <Modal
          isOpen={isMobileModalOpen}
          onClose={handleCloseMobileSearch}
          className="fixed inset-0 z-modal flex h-full max-h-full w-full max-w-none flex-col rounded-none bg-card p-0"
          overlayClassName="bg-black/40 backdrop-blur-sm"
        >
          <div className="flex shrink-0 items-center gap-3 border-b border-border bg-muted/20 px-4 py-3.5" dir="rtl">
            <button
              type="button"
              onClick={handleCloseMobileSearch}
              aria-label="بازگشت"
              className="rounded-full p-1.5 transition-colors hover:bg-muted"
            >
              <ArrowRight aria-hidden="true" className="h-5 w-5 text-foreground" />
            </button>
            <div className="relative flex-1">
              <Input
                ref={mobileInputRef}
                type="text"
                placeholder=""
                value={query}
                disabled={isGlobalSearching}
                onChange={(e) => setQuery(e.target.value)}
                leftIcon={
                  isGlobalSearching ? (
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <Search aria-hidden="true" className="h-4 w-4" />
                  )
                }
                rightIcon={
                  query && !isGlobalSearching ? (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      aria-label="پاک کردن"
                      className="flex items-center justify-center rounded-full p-1 hover:bg-muted transition-colors"
                    >
                      <X aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  ) : undefined
                }
                className="w-full border-border bg-card"
                dir="rtl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit(query);
                  }
                }}
              />
              {!query ? (
                <div className="pointer-events-none absolute start-10 top-1/2 -translate-y-1/2">
                  {renderAnimatedPlaceholder()}
                </div>
              ) : null}
            </div>
          </div>

          {renderSuggestionsPanel()}
        </Modal>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)} dir="rtl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit(query);
        }}
        className="relative"
        role="search"
      >
        <Input
          ref={desktopInputRef}
          type="text"
          value={query}
          disabled={isGlobalSearching}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            refetchHistory();
          }}
          placeholder=""
          aria-label="جستجو"
          dir="rtl"
          leftIcon={
            isGlobalSearching ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Search aria-hidden="true" className="h-4 w-4" />
            )
          }
          rightIcon={
            query && !isGlobalSearching ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="پاک کردن"
                className="flex items-center justify-center rounded-full p-1 transition-colors hover:bg-muted"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ) : undefined
          }
          className="w-full border-border bg-card transition-colors focus-visible:border-primary"
        />

        {!query ? (
          <div
            onClick={() => desktopInputRef.current?.focus()}
            className="pointer-events-none absolute start-10 top-1/2 flex -translate-y-1/2 cursor-text items-center"
          >
            {renderAnimatedPlaceholder()}
          </div>
        ) : null}
      </form>

      {isFocused ? (
        <div className="absolute inset-x-0 top-full z-dropdown mt-1.5 flex max-h-[480px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {renderSuggestionsPanel()}
        </div>
      ) : null}
    </div>
  );
}