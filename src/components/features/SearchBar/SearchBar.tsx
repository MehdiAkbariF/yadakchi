// src/components/features/SearchBar/SearchBar.tsx

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Input } from '@/components/primitives/Input';
import { Button } from '@/components/primitives/Button';

export interface SearchBarProps {
  placeholder?: string;
  initialValue?: string;
  onSearch?: (query: string) => void;
  className?: string;
  autoFocus?: boolean;
  suggestions?: string[];
}

export function SearchBar({
  placeholder = 'جستجوی محصولات...',
  initialValue = '',
  onSearch,
  className,
  autoFocus = false,
  suggestions = [],
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch?.(suggestion);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  return (
    <div className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          leftIcon={<Search className="h-4 w-4" />}
          rightIcon={
            query && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleClear}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            )
          }
          className="pl-10 pr-10"
        />
      </form>

      {/* Suggestions Dropdown */}
      {isFocused && suggestions.length > 0 && query && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-background shadow-lg overflow-hidden z-10">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Search className="h-3 w-3 text-muted-foreground" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}