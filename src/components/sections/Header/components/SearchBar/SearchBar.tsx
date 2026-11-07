// src/components/sections/Header/components/SearchBar/SearchBar.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ChevronRight,
  ChevronLeft,
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
import { useGetPartCategoriesFlat, useGetPartsName } from '@/domains/front/part/hooks/part.hooks';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { getFullUrl } from '@/core/utils/formatters';

// کلمات پشتیبان در صورت عدم دسترسی به سرور یا در زمان لودینگ اولیه
const DEFAULT_ROTATING_KEYWORDS = [
  'لنت ترمز',
  'شمع خودرو',
  'تسمه تایم',
  'کمک فنر',
  'فیلتر روغن',
  'دیسک و صفحه کلاچ',
  'پمپ بنزین',
  'سنسور اکسیژن',
];

export interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  isMobile?: boolean;
}

export function SearchBar({
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

  // ✅ واکشی اسامی قطعات زنده و واقعی از API برای پلیس‌هولدر چرخان
  const { data: dynamicPartsData } = useGetPartsName({ pageNumber: 1, pageSize: 50 });

  const rotatingKeywords = React.useMemo(() => {
    const apiNames = (dynamicPartsData?.items || [])
      .map((item: any) => item.name?.trim())
      .filter((name: string) => !!name && name.length > 1);

    return apiNames.length > 0 ? apiNames : DEFAULT_ROTATING_KEYWORDS;
  }, [dynamicPartsData]);

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

  const historySliderRef = React.useRef<HTMLDivElement>(null);
  const carsSliderRef = React.useRef<HTMLDivElement>(null);
  const catsSliderRef = React.useRef<HTMLDivElement>(null);
  const suggestionsSliderRef = React.useRef<HTMLDivElement>(null);

  const scrollSlider = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const debouncedQuery = useDebounce(query, 500);

  const { data: history = [], refetch: refetchHistory } = useGetSearchHistory();
  const { data: suggestions = [] } = useGetSearchSuggestions();
  const { data: keywordsData, isLoading: isKeywordsLoading } = useGetSearchKeywords(debouncedQuery);
  const { data: searchBanners = [] } = useGetBanners('SearchResult');
  const removeHistoryMutation = useRemoveSearchHistory();

  const searchBannerGroup = searchBanners.find((b: any) => b.name === 'Search-Suggest');
  const desktopBanner = searchBannerGroup?.banners?.find((b: any) => b.size === 'Desktop') || searchBannerGroup?.banners?.[0];
  const mobileBanner = searchBannerGroup?.banners?.find((b: any) => b.size === 'Mobile') || searchBannerGroup?.banners?.[0];

  // تایمر چرخش پلیس‌هولدر بر اساس لیست داینامیک API
  React.useEffect(() => {
    if (rotatingKeywords.length === 0) return;
    const interval = setInterval(() => {
      setKeywordIndex((prev) => (prev + 1) % rotatingKeywords.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [rotatingKeywords.length]);

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

  // رندر متن متحرک پلیس‌هولدر از دیتای زنده قطعات
  const renderAnimatedPlaceholder = () => {
    if (query) return null;
    const currentWord = rotatingKeywords[keywordIndex] || rotatingKeywords[0];
    return (
      <div className="pointer-events-none flex h-5 select-none items-center overflow-hidden text-xs" dir="rtl">
        <span className="ms-1 shrink-0 text-muted-foreground ml-1">جستجو در</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={currentWord}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="inline-block max-w-[13rem] truncate font-bold text-primary"
          >
            {currentWord}
          </motion.span>
        </AnimatePresence>
      </div>
    );
  };

  const renderTextContent = (showKeywords: boolean) => {
    const keywordsList = (keywordsData as any)?.keywords || [];
    const carsList = (keywordsData as any)?.cars || [];

    const uniqueCategories = Array.from(
      new Map(
        keywordsList
          .filter((kw: any) => kw.partCategoryId && kw.partCategoryName)
          .map((kw: any) => [kw.partCategoryId, kw])
      ).values()
    );

    if (showKeywords) {
      return (
        <div className="flex flex-col space-y-4">
          {carsList.length > 0 ? (
            <div className="shrink-0 space-y-2">
              <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                <span className="text-2xs font-bold text-muted-foreground">خودروها</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollSlider(carsSliderRef, 'right')}
                    aria-label="اسکرول به راست"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted"
                  >
                    <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollSlider(carsSliderRef, 'left')}
                    aria-label="اسکرول به چپ"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted"
                  >
                    <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div ref={carsSliderRef} className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
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
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-accent bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground hover:bg-accent/80 active:scale-95"
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
              <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                <span className="text-2xs font-bold text-muted-foreground">دسته‌بندی‌های مرتبط</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollSlider(catsSliderRef, 'right')}
                    aria-label="اسکرول به راست"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted"
                  >
                    <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollSlider(catsSliderRef, 'left')}
                    aria-label="اسکرول به چپ"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted"
                  >
                    <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div ref={catsSliderRef} className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
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
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-accent bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground hover:bg-accent/80 active:scale-95"
                  >
                    <FolderKanban aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                    <span>قطعات دسته {cat.partCategoryName}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="shrink-0 space-y-1.5">
            <span className="block border-b border-border/60 pb-1.5 text-2xs font-bold text-muted-foreground">
              جستجوهای پیشنهادی
            </span>

            {isKeywordsLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs">در حال جستجوی پیشنهادات...</span>
              </div>
            ) : keywordsList.length > 0 ? (
              <div className="space-y-0.5">
                {keywordsList.map((kw: any, index: number) => (
                  <button
                    key={index}
                    type="button"
                    disabled={isGlobalSearching}
                    onClick={() => handleSearchSubmit(kw.suggestion)}
                    className="flex w-full items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex min-w-0 flex-col text-right">
                      <span className="truncate text-xs font-medium text-foreground">{kw.suggestion}</span>
                      {kw.partCategoryName && (
                        <span className="mt-0.5 truncate text-3xs text-muted-foreground">
                          در دسته {kw.partCategoryName}
                        </span>
                      )}
                    </div>
                    <Search aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground">
                پیشنهادی یافت نشد.
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col space-y-4">
        {history.length > 0 ? (
          <div className="shrink-0 space-y-2">
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <Clock aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
                جستجوهای اخیر شما
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  className="flex items-center gap-1 text-2xs font-bold text-destructive hover:underline"
                >
                  <Trash2 aria-hidden="true" className="h-3 w-3" />
                  پاک کردن
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollSlider(historySliderRef, 'right')}
                    aria-label="اسکرول به راست"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted"
                  >
                    <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollSlider(historySliderRef, 'left')}
                    aria-label="اسکرول به چپ"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted"
                  >
                    <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div ref={historySliderRef} className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              {history.map((item: any, idx: number) => {
                const isObject = typeof item === 'object' && item !== null;
                const wordValue = isObject ? (item as any).value : String(item);
                const itemId = isObject ? (item as any).id : String(idx);
                return (
                  <div
                    key={itemId}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleSearchSubmit(wordValue)}
                      className="hover:text-primary transition-colors focus-visible:outline-none"
                    >
                      {wordValue}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveHistoryItem(wordValue, e)}
                      aria-label={`حذف ${wordValue} از تاریخچه`}
                      className="flex items-center justify-center rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <X aria-hidden="true" className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {suggestions.length > 0 ? (
          <div className="shrink-0 space-y-2">
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-warning" />
                جستجوهای پرطرفدار
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollSlider(suggestionsSliderRef, 'right')}
                  aria-label="اسکرول به راست"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted"
                >
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider(suggestionsSliderRef, 'left')}
                  aria-label="اسکرول به چپ"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted"
                >
                  <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div ref={suggestionsSliderRef} className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              {suggestions.map((suggest: any, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isGlobalSearching}
                  onClick={() => handleSearchSubmit(suggest)}
                  className="shrink-0 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-accent/40 hover:text-primary active:scale-95 shadow-xs"
                >
                  {suggest}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const renderSuggestionsPanel = () => {
    const showKeywords = debouncedQuery.trim().length >= 2;

    if (isMobile) {
      return (
        <div className="flex flex-1 flex-col overflow-y-auto bg-card p-4 gap-4" dir="rtl">
          {mobileBanner && (
            <Link
              href={mobileBanner.targetURL || '#'}
              onClick={handleCloseMobileSearch}
              className="block w-full overflow-hidden rounded-xl border border-border/80 shadow-xs shrink-0"
              aria-label={mobileBanner.title || 'بنر جستجو'}
            >
              <div className="relative w-full aspect-[3/1]">
                <Image
                  src={getFullUrl(mobileBanner.image)}
                  alt={mobileBanner.imageAlt || mobileBanner.title || 'بنر پیشنهادی'}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </Link>
          )}

          {renderTextContent(showKeywords)}
        </div>
      );
    }

    return (
      <div className="flex w-full flex-row items-stretch overflow-hidden bg-card divide-x divide-x-reverse divide-border/60" dir="rtl">
        <div className="flex-1 min-w-0 overflow-y-auto p-4 max-h-[28rem] scrollbar-thin">
          {renderTextContent(showKeywords)}
        </div>

        {desktopBanner && (
          <div className="w-[17.5rem] shrink-0 p-4 bg-muted/20 flex flex-col justify-center items-center">
            <Link
              href={desktopBanner.targetURL || '#'}
              onClick={() => setIsFocused(false)}
              className="block w-full overflow-hidden rounded-xl border border-border/80 shadow-xs hover:opacity-95 transition-all"
              aria-label={desktopBanner.title || 'بنر پیشنهادی'}
            >
              <div className="relative w-full aspect-[4/5] flex items-center justify-center bg-card">
                <Image
                  src={getFullUrl(desktopBanner.image)}
                  alt={desktopBanner.imageAlt || desktopBanner.title || 'بنر پیشنهادی'}
                  fill
                  sizes="280px"
                  className="object-cover"
                />
              </div>
            </Link>
          </div>
        )}
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className={cn('relative w-full', className)} dir="rtl">
        <button
          type="button"
          onClick={handleOpenMobileSearch}
          aria-label="باز کردن پنجره جستجو در یدکچی"
          className="relative flex h-10 w-full min-w-0 cursor-pointer items-center overflow-hidden rounded-lg border border-border bg-card px-3 text-muted-foreground transition-colors hover:border-primary/50 shadow-xs text-right"
        >
          {isGlobalSearching ? (
            <Loader2 aria-hidden="true" className="z-10 h-4 w-4 shrink-0 animate-spin text-primary" />
          ) : (
            <Search aria-hidden="true" className="z-10 h-4 w-4 shrink-0 text-muted-foreground" />
          )}

          {query ? (
            <span className="ms-2.5 flex-1 truncate text-xs font-semibold text-foreground">{query}</span>
          ) : (
            <div className="ms-2.5 flex flex-1 items-center">{renderAnimatedPlaceholder()}</div>
          )}
        </button>

        <Modal
          isOpen={isMobileModalOpen}
          onClose={handleCloseMobileSearch}
          className="fixed inset-0 z-modal flex h-full max-h-full w-full max-w-none flex-col rounded-none bg-card p-0"
          overlayClassName="bg-black/50 backdrop-blur-xs"
        >
          <div className="flex shrink-0 items-center gap-3 border-b border-border/80 bg-muted/30 px-4 py-3" dir="rtl">
            <button
              type="button"
              onClick={handleCloseMobileSearch}
              aria-label="بازگشت"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 text-foreground transition-transform active:scale-90"
            >
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </button>
            <div className="relative flex-1">
              <label htmlFor="mobile-search-input" className="sr-only">جستجو در یدکچی</label>
              <Input
                id="mobile-search-input"
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
                      aria-label="پاک کردن متن جستجو"
                      className="flex items-center justify-center rounded-full p-1 hover:bg-muted"
                    >
                      <X aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  ) : undefined
                }
                className="w-full border-border bg-card rounded-lg text-xs font-bold"
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
        <label htmlFor="desktop-search-input" className="sr-only">جستجو در یدکچی</label>
        <Input
          id="desktop-search-input"
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
          aria-label="جستجو در یدکچی"
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
                aria-label="پاک کردن متن جستجو"
                className="flex items-center justify-center rounded-full p-1 transition-colors hover:bg-muted"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ) : undefined
          }
          className="w-full border-border bg-card rounded-lg text-xs font-bold transition-colors focus-visible:border-primary"
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
        <div className="absolute inset-x-0 top-full z-dropdown mt-2 flex max-h-[30rem] w-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-lg backdrop-blur-md">
          {renderSuggestionsPanel()}
        </div>
      ) : null}
    </div>
  );
}