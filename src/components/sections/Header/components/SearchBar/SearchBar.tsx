// src/components/sections/Header/components/SearchBar/SearchBar.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { SearchResults } from '../SearchResults/SearchResults';
import { useRouter } from 'next/navigation';

// لیست دسته‌بندی‌های متحرک
const categories = [
  'قطعات موتور',
  'گیربکس',
  'ترمز',
  'سیستم تعلیق',
  'سیستم برق',
  'قطعات بدنه',
  'روغن و مایعات',
  'لوازم جانبی',
];

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  isMobile?: boolean;
}

export function SearchBar({ 
  placeholder = 'جستجو در', 
  className = '', 
  onSearch,
  isMobile = false 
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputWidth, setInputWidth] = useState(0);

  // اندازه‌گیری عرض input
  useEffect(() => {
    if (inputRef.current) {
      setInputWidth(inputRef.current.offsetWidth);
    }
  }, []);

  // چرخش دسته‌بندی‌ها هر 3 ثانیه
  useEffect(() => {
    if (isFocused) return;
    
    const interval = setInterval(() => {
      setCurrentCategoryIndex((prev) => (prev + 1) % categories.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isFocused]);

  // بستن نتایج با کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsResultsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    
    // در موبایل: هدایت به صفحه جستجو
    if (isMobile) {
      router.push('/search');
      setIsFocused(false);
      return;
    }
    
    // در دسکتاپ: نمایش نتایج
    setIsResultsOpen(true);
    setTimeout(() => {
      if (inputRef.current) {
        setInputWidth(inputRef.current.offsetWidth);
      }
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      }
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsResultsOpen(false);
    }
  };

  // در موبایل، فقط نمایش یک input ساده
  if (isMobile) {
    return (
      <div className="relative w-full">
        <div className={`flex items-center w-full ${className}`}>
          <div className="flex items-center gap-2 text-muted-foreground shrink-0">
            <Search className="h-4 w-4" />
            <span className="text-sm font-medium whitespace-nowrap">{placeholder}</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            placeholder="..."
            className="flex-1 min-w-[60px] h-8 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground focus:ring-0"
            aria-label="جستجو"
            dir="rtl"
          />
        </div>
      </div>
    );
  }

  // نسخه دسکتاپ (با نتایج جستجو)
  return (
    <div ref={containerRef} className="relative w-full">
      <div className={`flex items-center w-full ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground shrink-0">
          <Search className="h-4 w-4" />
          <span className="text-sm font-medium whitespace-nowrap">{placeholder}</span>
        </div>

        <div className="relative mx-2 min-w-[100px] h-6 overflow-hidden shrink-0">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentCategoryIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute top-0 left-0 text-sm font-medium text-primary whitespace-nowrap"
            >
              {categories[currentCategoryIndex]}
            </motion.span>
          </AnimatePresence>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder="..."
          className="flex-1 min-w-[60px] h-8 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground focus:ring-0"
          aria-label="جستجو"
          dir="rtl"
        />
      </div>

      {/* نتایج جستجو (فقط دسکتاپ) */}
      {isResultsOpen && (
        <div 
          className="absolute top-full left-0 mt-1 z-50"
          style={{ width: inputWidth > 0 ? inputWidth : '100%' }}
        >
          <SearchResults 
            isOpen={isResultsOpen} 
            onClose={() => {
              setIsResultsOpen(false);
              setIsFocused(false);
            }}
            searchQuery={query}
          />
        </div>
      )}
    </div>
  );
}