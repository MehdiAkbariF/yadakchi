// src/components/sections/Header/components/SearchResults/SearchResults.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  TrendingUp, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowLeft,
  XCircle,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/design-system/utils';

const recentSearches = [
  { id: 1, label: 'ترمز' },
  { id: 2, label: 'روغن موتور' },
  { id: 3, label: 'لنت' },
  { id: 4, label: 'فیلتر هوا' },
  { id: 5, label: 'شمع' },
  { id: 6, label: 'باتری' },
];

const trendingSearches = [
  { id: 1, label: 'موتور' },
  { id: 2, label: 'گیربکس' },
  { id: 3, label: 'ترمز' },
  { id: 4, label: 'سیستم تعلیق' },
  { id: 5, label: 'باتری' },
  { id: 6, label: 'لنت' },
];

interface SearchResultsProps {
  isOpen: boolean;
  onClose: () => void;
  onRemoveRecent?: (id: number) => void;
}

export function SearchResults({ 
  isOpen, 
  onClose, 
  onRemoveRecent 
}: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState<'recent' | 'trending'>('recent');
  const [recentPage, setRecentPage] = useState(0);
  const [trendingPage, setTrendingPage] = useState(0);
  const [recentItems, setRecentItems] = useState(recentSearches);
  const [isMobile, setIsMobile] = useState(false);

  const itemsPerPage = 4;
  const recentPages = Math.ceil(recentItems.length / itemsPerPage);
  const trendingPages = Math.ceil(trendingSearches.length / itemsPerPage);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      onClose();
    };

    if (isMobile && isOpen) {
      window.history.pushState({ searchOpen: true }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (isMobile && isOpen) {
        window.history.back();
      }
    };
  }, [isOpen, onClose, isMobile]);

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isOpen]);

  const handleNext = () => {
    if (activeTab === 'recent') {
      setRecentPage((prev) => Math.min(prev + 1, recentPages - 1));
    } else {
      setTrendingPage((prev) => Math.min(prev + 1, trendingPages - 1));
    }
  };

  const handlePrev = () => {
    if (activeTab === 'recent') {
      setRecentPage((prev) => Math.max(prev - 1, 0));
    } else {
      setTrendingPage((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleRemoveRecent = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRecentItems((prev) => prev.filter(item => item.id !== id));
    onRemoveRecent?.(id);
  };

  const getCurrentItems = () => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return currentItems.slice(start, end);
  };

  const currentItems = activeTab === 'recent' ? recentItems : trendingSearches;
  const currentPage = activeTab === 'recent' ? recentPage : trendingPage;
  const totalPages = activeTab === 'recent' ? recentPages : trendingPages;

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[60] bg-background overflow-y-auto"
        >
          <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-1 -mr-1 hover:bg-muted rounded-full transition-colors"
                aria-label="بازگشت"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium">جستجوی سریع</span>
              <span className="text-xs text-muted-foreground">
                {recentItems.length} نتیجه
              </span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('recent')}
                className={cn(
                  "flex-1 px-4 py-2 text-sm rounded-md transition-all",
                  activeTab === 'recent'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Clock className="h-4 w-4 inline ml-1" />
                آخرین
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={cn(
                  "flex-1 px-4 py-2 text-sm rounded-md transition-all",
                  activeTab === 'trending'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <TrendingUp className="h-4 w-4 inline ml-1" />
                پرطرفدار
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {getCurrentItems().map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <Link
                    href={`/search?q=${encodeURIComponent(item.label)}`}
                    className="block"
                    onClick={onClose}
                  >
                    <div className="flex items-center justify-between px-3 py-3 rounded-xl border hover:border-primary/50 transition-all bg-muted/30 active:bg-muted/50">
                      <span className="text-sm font-medium text-foreground flex-1 text-center">
                        {item.label}
                      </span>
                      {activeTab === 'trending' && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          #{item.id}
                        </span>
                      )}
                    </div>
                  </Link>

                  {activeTab === 'recent' && (
                    <button
                      onClick={(e) => handleRemoveRecent(item.id, e)}
                      className="absolute -top-1.5 -right-1.5 p-0.5 bg-background rounded-full border shadow-sm"
                      aria-label={`حذف ${item.label}`}
                    >
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 py-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (activeTab === 'recent') {
                        setRecentPage(index);
                      } else {
                        setTrendingPage(index);
                      }
                    }}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      currentPage === index
                        ? 'w-8 bg-primary'
                        : 'w-2 bg-muted-foreground/30'
                    )}
                    aria-label={`صفحه ${index + 1}`}
                  />
                ))}
              </div>
            )}

            <Link href="/special" className="block" onClick={onClose}>
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 shrink-0">
                    <Image
                      src="/banner-placeholder.svg"
                      alt="بنر تبلیغاتی"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-primary">فروش ویژه</h4>
                    <p className="text-xs text-muted-foreground">تا ۵۰٪ تخفیف</p>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-primary shrink-0" />
                </div>
              </div>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full bg-background border rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">جستجوی سریع</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="بستن"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            <div className="flex gap-1 bg-muted/50 rounded-lg p-1 mb-4 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('recent')}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-1.5 text-sm rounded-md transition-all",
                  activeTab === 'recent'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Clock className="h-3.5 w-3.5 inline ml-1" />
                آخرین جستجوها
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-1.5 text-sm rounded-md transition-all",
                  activeTab === 'trending'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <TrendingUp className="h-3.5 w-3.5 inline ml-1" />
                بیشترین جستجوها
              </button>
            </div>

            <div className="relative">
              <motion.div
                key={activeTab + currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2"
              >
                {getCurrentItems().map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative group"
                  >
                    <Link
                      href={`/search?q=${encodeURIComponent(item.label)}`}
                      className="block h-full"
                      onClick={onClose}
                    >
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border hover:border-primary/50 transition-all h-full bg-muted/30 hover:bg-muted/50 gap-2">
                        <span className="text-sm font-medium text-foreground flex-1 text-center">
                          {item.label}
                        </span>
                        {activeTab === 'trending' && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            #{item.id}
                          </span>
                        )}
                      </div>
                    </Link>

                    {activeTab === 'recent' && (
                      <button
                        onClick={(e) => handleRemoveRecent(item.id, e)}
                        className="absolute -top-2 -right-2 p-0.5 bg-background rounded-full border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:border-destructive/30"
                        aria-label={`حذف ${item.label}`}
                      >
                        <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {totalPages > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-background border rounded-full p-1.5 shadow-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="قبلی"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentPage >= totalPages - 1}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-background border rounded-full p-1.5 shadow-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="بعدی"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-1.5 mt-4">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (activeTab === 'recent') {
                        setRecentPage(index);
                      } else {
                        setTrendingPage(index);
                      }
                    }}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      currentPage === index
                        ? 'w-6 bg-primary'
                        : 'w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    )}
                    aria-label={`صفحه ${index + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="mt-4">
              <Link href="/special" className="block" onClick={onClose}>
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-4 group hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 shrink-0">
                      <Image
                        src="/banner-placeholder.svg"
                        alt="بنر تبلیغاتی"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-primary">فروش ویژه قطعات</h4>
                      <p className="text-xs text-muted-foreground">تا ۵۰٪ تخفیف برای اولین خرید</p>
                    </div>
                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full group-hover:gap-2 transition-all">
                        مشاهده
                        <ArrowLeft className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}