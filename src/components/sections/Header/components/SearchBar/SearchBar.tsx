'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Clock, Trash2, ArrowRight, Loader2, Sparkles, FolderKanban, Car } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Input } from '@/components/primitives/Input/Input';
import { Modal } from '@/components/composites/Modal/Modal';
import { 
  useGetSearchHistory, 
  useGetSearchSuggestions, 
  useGetSearchKeywords, 
  useRemoveSearchHistory 
} from '@/domains/front/product/hooks/product.hooks';
import { useGetBanners } from '@/domains/front/banner/hooks/banner.hooks';
import { useGetCarsName } from '@/domains/front/reference/car/hooks/car.hooks';
import { useGetBrandsName } from '@/domains/front/reference/brand/hooks/brand.hooks';
import { useGetPartCategoriesFlat } from '@/domains/front/part/hooks/part.hooks';
import { useDebounce } from '@/shared/hooks/useDebounce';
import Link from 'next/link';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  isMobile?: boolean;
}

export function SearchBar({ 
  placeholder = 'جستجو در یدکچی...', 
  className = '', 
  onSearch,
  isMobile = false 
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const [query, setQuery] = useState(resolvedText);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 500);

  const { data: history = [], refetch: refetchHistory } = useGetSearchHistory();
  const { data: suggestions = [] } = useGetSearchSuggestions();
  const { data: keywordsData, isLoading: isKeywordsLoading } = useGetSearchKeywords(debouncedQuery);
  const { data: searchBanners = [] } = useGetBanners('SearchResult');
  const removeHistoryMutation = useRemoveSearchHistory();

  const desktopBanner = searchBanners.find(b => (b as any).groupName === 'Search-Suggest' && (b as any).size === 'Desktop');
  const mobileBanner = searchBanners.find(b => (b as any).groupName === 'Search-Suggest' && (b as any).size === 'Mobile');

  useEffect(() => {
    setQuery(resolvedText);
  }, [resolvedText]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isMobileModalOpen) return;

    const handlePopState = () => {
      setIsMobileModalOpen(false);
    };

    window.history.pushState({ modalOpen: 'search-modal' }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isMobileModalOpen]);

  const handleSearchSubmit = (searchWord: string) => {
    if (!searchWord.trim()) return;
    
    setQuery(searchWord);
    
    if (onSearch) onSearch(searchWord);
    
    setIsFocused(false);
    setIsMobileModalOpen(false);
    
    router.push(`/search?q=${encodeURIComponent(searchWord)}`);
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
    setTimeout(() => {
      mobileInputRef.current?.focus();
    }, 150);
  };

  const handleCloseMobileSearch = () => {
    setIsMobileModalOpen(false);
    if (window.history.state?.modalOpen === 'search-modal') {
      window.history.back();
    }
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
      <div className="flex flex-col flex-1 overflow-y-auto">
        {showKeywords ? (
          <div className="p-4 space-y-4 flex flex-col h-full text-right">
            
            {carsList.length > 0 && (
              <div className="space-y-2 shrink-0">
                <span className="text-[11px] text-muted-foreground font-iran-yekan font-bold block pb-2 border-b text-right">
                  خودروها
                </span>
                <div className="flex flex-wrap gap-2 justify-start">
                  {carsList.map((car: any) => (
                    <Link
                      key={car.id}
                      href={`/search?carId=${car.id}`}
                      onClick={() => {
                        setQuery(car.model);
                        setIsFocused(false);
                        setIsMobileModalOpen(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-medium font-iran-yekan hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <Car className="h-3.5 w-3.5" />
                      همه کالا‌های خودرو {car.model}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {uniqueCategories.length > 0 && (
              <div className="space-y-2 shrink-0">
                <span className="text-[11px] text-muted-foreground font-iran-yekan font-bold block pb-2 border-b text-right">
                  دسته‌بندی‌های مرتبط
                </span>
                <div className="flex flex-wrap gap-2 justify-start">
                  {uniqueCategories.map((cat: any) => (
                    <Link
                      key={cat.partCategoryId}
                      href={`/part-category/${cat.partCategoryEnglishTitle}`}
                      onClick={() => {
                        setQuery(cat.partCategoryName);
                        setIsFocused(false);
                        setIsMobileModalOpen(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20 text-primary text-xs font-medium font-iran-yekan hover:bg-primary/10 transition-colors"
                    >
                      <FolderKanban className="h-3.5 w-3.5" />
                      همه کالا‌های دسته {cat.partCategoryName}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 shrink-0">
              <span className="text-[11px] text-muted-foreground font-iran-yekan font-bold block pb-2 border-b text-right">
                عبارات پیشنهادی
              </span>
              
              {isKeywordsLoading ? (
                <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-xs font-iran-yekan">در حال لود عبارات کلیدی...</span>
                </div>
              ) : keywordsList.length > 0 ? (
                <div className="space-y-1">
                  {keywordsList.map((kw: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleSearchSubmit(kw.suggestion)}
                      className="flex items-center justify-between w-full text-right p-2 rounded-md hover:bg-muted/50 transition-colors font-iran-yekan"
                    >
                      <div className="flex flex-col min-w-0 text-right">
                        <span className="text-sm text-foreground truncate">
                          {kw.suggestion}
                        </span>
                        {kw.partCategoryName && (
                          <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            در دسته {kw.partCategoryName}
                          </span>
                        )}
                      </div>
                      <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground font-iran-yekan py-4 text-center">
                  نتیجه مناسبی یافت نشد.
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 shrink-0">
              {isMobile ? (
                mobileBanner && (
                  <Link href={mobileBanner.link || '#'} onClick={handleCloseMobileSearch} className="block overflow-hidden rounded-xl">
                    <img src={mobileBanner.imageUrl} alt={mobileBanner.title} className="w-full object-cover h-24 hover:scale-[1.01] transition-transform duration-200" />
                  </Link>
                )
              ) : (
                desktopBanner && (
                  <Link href={desktopBanner.link || '#'} className="block overflow-hidden rounded-xl">
                    <img src={desktopBanner.imageUrl} alt={desktopBanner.title} className="w-full object-cover h-24 hover:scale-[1.01] transition-transform duration-200" />
                  </Link>
                )
              )}
            </div>

          </div>
        ) : (
          <div className="p-4 space-y-5 flex-1 flex flex-col text-right">
            {history.length > 0 && (
              <div className="space-y-2 shrink-0">
                <div className="flex items-center justify-between pb-1 border-b">
                  <span className="text-xs text-muted-foreground font-iran-yekan font-bold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    جستجو‌های اخیر شما
                  </span>
                  <button onClick={handleClearAllHistory} className="text-xs text-destructive hover:underline font-iran-yekan flex items-center gap-0.5">
                    <Trash2 className="h-3 w-3" />
                    پاک کردن همه
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1 justify-start">
                  {history.map((item: any, idx: number) => {
                    const isObject = typeof item === 'object' && item !== null;
                    const wordValue = isObject ? (item as any).value : String(item);
                    const itemId = isObject ? (item as any).id : String(idx);

                    return (
                      <div key={itemId} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium font-iran-yekan text-foreground border hover:border-primary/20 transition-all cursor-pointer" onClick={() => handleSearchSubmit(wordValue)}>
                        <span>{wordValue}</span>
                        <button onClick={(e) => handleRemoveHistoryItem(wordValue, e)} className="p-0.5 hover:bg-muted-foreground/20 rounded-full flex items-center justify-center transition-colors" aria-label="Remove">
                          <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-2 shrink-0">
                <span className="text-xs text-muted-foreground font-iran-yekan font-bold flex items-center gap-1.5 pb-1 border-b justify-start">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  جستجو‌های پرطرفدار
                </span>
                <div className="flex flex-wrap gap-2 pt-1 justify-start">
                  {suggestions.map((suggest: any, idx: number) => (
                    <button key={idx} onClick={() => handleSearchSubmit(suggest)} className="px-3 py-1.5 rounded-lg border border-input hover:border-primary/40 hover:bg-primary/5 text-xs font-medium font-iran-yekan text-foreground transition-all">
                      {suggest}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-4 shrink-0">
              {isMobile ? (
                mobileBanner && (
                  <Link href={mobileBanner.link || '#'} onClick={handleCloseMobileSearch} className="block overflow-hidden rounded-xl">
                    <img src={mobileBanner.imageUrl} alt={mobileBanner.title} className="w-full object-cover h-24 hover:scale-[1.01] transition-transform duration-200" />
                  </Link>
                )
              ) : (
                desktopBanner && (
                  <Link href={desktopBanner.link || '#'} className="block overflow-hidden rounded-xl">
                    <img src={desktopBanner.imageUrl} alt={desktopBanner.title} className="w-full object-cover h-24 hover:scale-[1.01] transition-transform duration-200" />
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className={cn("relative w-full", className)}>
        <div onClick={handleOpenMobileSearch} className="flex items-center w-full border border-input rounded-md px-3 py-1.5 bg-background cursor-pointer h-9 text-muted-foreground min-w-0">
          <Search className="h-4 w-4 shrink-0" />
          <span className="text-sm font-iran-yekan font-medium mr-2 truncate whitespace-nowrap flex-1 text-right">
            {query || placeholder}
          </span>
        </div>

        <Modal isOpen={isMobileModalOpen} onClose={handleCloseMobileSearch} className="w-full h-full max-h-full max-w-none p-0 rounded-none flex flex-col fixed inset-0 z-50 bg-background" overlayClassName="bg-black/40">
          <div className="flex items-center gap-3 px-4 py-4 border-b shrink-0 bg-muted/20">
            <button onClick={handleCloseMobileSearch} className="p-1 -mr-1 hover:bg-muted rounded-full" aria-label="Back">
              <ArrowRight className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <Input
                ref={mobileInputRef}
                type="text"
                placeholder="چی لازم داری؟"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
                rightIcon={query && (
                  <button onClick={() => setQuery('')} className="p-1 hover:bg-muted rounded-full flex items-center justify-center" type="button">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
                className="w-full font-iran-yekan"
                dir="rtl"
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(query)}
              />
            </div>
          </div>

          {renderSuggestionsPanel()}
        </Modal>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(query); }}>
        <Input
          ref={desktopInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setIsFocused(true); refetchHistory(); }}
          placeholder={placeholder}
          leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
          rightIcon={query && (
            <button type="button" onClick={() => setQuery('')} className="p-1 hover:bg-muted rounded-full flex items-center justify-center transition-colors">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          className="w-full font-iran-yekan"
          dir="rtl"
        />
      </form>

      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-background border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[480px]">
          {renderSuggestionsPanel()}
        </div>
      )}
    </div>
  );
}