'use client';

import { useState } from 'react';
import { toPersianDigits } from '@/core/utils/formatters';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SpecHighlightsProps {
  specGroups: any[];
}

export function SpecHighlights({ specGroups }: SpecHighlightsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const mainSpecs = (specGroups || [])
    .flatMap(g => g.specs || [])
    .filter((s: any) => s.isMain === true);

  if (mainSpecs.length === 0) return null;

  const visibleSpecs = isExpanded ? mainSpecs : mainSpecs.slice(0, 4);
  const hasMoreThanFour = mainSpecs.length > 4;

  return (
    <div className="w-full flex flex-col gap-2.5 text-right select-none">
      <span className="text-xs font-bold text-muted-foreground mr-1">ویژگی‌های مهم محصول</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
        {visibleSpecs.map((spec: any, idx: number) => (
          <div key={idx} className="rounded-xl p-3 bg-muted/40 dark:bg-zinc-900/50 flex flex-col gap-1 text-right border border-zinc-100 dark:border-zinc-800 animate-in fade-in duration-200">
            <span className="text-[10px] font-bold text-muted-foreground font-iran-sans">{spec.name}</span>
            <span className="text-xs font-black text-foreground mt-0.5">{toPersianDigits(spec.value)}</span>
          </div>
        ))}
      </div>

      {hasMoreThanFour && (
        <div className="flex justify-center mt-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-0.5 text-xs font-bold text-primary hover:underline outline-none"
          >
            <span>{isExpanded ? 'بستن ویژگی‌ها' : 'مشاهده همه ویژگی‌ها'}</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}