// src/components/sections/Header/components/SearchResults/SearchResults.tsx

'use client';

import Link from 'next/link';
import { Search, FolderKanban, X, ArrowRight } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

interface KeywordItem {
  suggestion: string;
  partId?: string;
  partName?: string;
  partEnglishTitle?: string;
  partCategoryId?: string;
  partCategoryName?: string;
  partCategoryEnglishTitle?: string;
}

interface SearchResultsProps {
  isOpen: boolean;
  onClose: () => void;
  keywords: KeywordItem[];
  isMobile: boolean;
}

export function SearchResults({ isOpen, onClose, keywords, isMobile }: SearchResultsProps) {
  if (!isOpen) return null;

  // استخراج دسته‌بندی‌های یکتا از بین نتایج
  const uniqueCategories = Array.from(
    new Map(keywords.map(k => [k.partCategoryId, k])).values()
  ).filter(k => k.partCategoryId && k.partCategoryName);

  return (
    <div className={cn(
      "bg-background border rounded-xl shadow-2xl overflow-hidden flex flex-col",
      isMobile ? "w-full h-full fixed inset-0 z-50 rounded-none" : "max-h-[70vh] w-full"
    )}>
      {/* هدر مینیمال */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">نتایج جستجو</span>
        </div>
        {!isMobile && (
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* بخش ۱: نمایش دسته‌بندی‌های مرتبط (در بالا) */}
        {uniqueCategories.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground block">دسته‌بندی‌های مرتبط</span>
            <div className="flex flex-wrap gap-2">
              {uniqueCategories.map((cat) => (
                <Link
                  key={cat.partCategoryId}
                  href={`/part-category/${cat.partCategoryEnglishTitle}`}
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/10 transition-colors"
                >
                  <FolderKanban className="h-3.5 w-3.5" />
                  {cat.partCategoryName}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* بخش ۲: نمایش کلمات پیشنهادی کالا (مینیمال) */}
        {keywords.length > 0 ? (
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground block pb-1">کلمات پیشنهادی</span>
            {keywords.map((kw, index) => (
              <button
                key={index}
                onClick={() => {
                  // هدایت مستقیم به صفحه سرچ با کلمه کلیدی
                  window.location.href = `/search?q=${encodeURIComponent(kw.suggestion)}`;
                }}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/50 transition-colors text-right group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{kw.suggestion}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            نتیجه‌ای یافت نشد
          </div>
        )}
      </div>
    </div>
  );
}