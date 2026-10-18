'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toPersianDigits } from '@/core/utils/formatters';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

interface SpecHighlightsProps {
  specGroups: any[];
  onSeeAll?: () => void;
}

function TruncatedSpec({ name, value }: { name: string; value: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const textRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const element = textRef.current;
        const truncated = element.scrollWidth > element.clientWidth;
        setIsTruncated(truncated);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [value]);

  const updateTooltipPosition = () => {
    if (textRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      setTooltipPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
    }
  };

  const handleMouseEnter = () => {
    if (!isTruncated) return;
    updateTooltipPosition();
    timerRef.current = setTimeout(() => setIsOpen(true), 250);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isTruncated) return;
    e.stopPropagation();
    updateTooltipPosition();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = () => setIsOpen(false);
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleClickOutside, true);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="rounded-xl p-3 bg-muted/40 dark:bg-zinc-900/50 flex flex-col gap-1 text-right border border-zinc-100 dark:border-zinc-800 animate-in fade-in duration-200 min-w-0">
      <span className="text-[11px] md:text-xs font-bold text-muted-foreground font-iran-yekan truncate block">
        {toPersianDigits(name)}
      </span>

      <span
        ref={textRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "text-xs md:text-sm font-medium text-foreground mt-0.5 truncate block",
          isTruncated && "cursor-help"
        )}
      >
        {toPersianDigits(value)}
      </span>

      {mounted && isOpen && isTruncated &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: 'translateX(-50%)',
              zIndex: 9999,
            }}
            className="pointer-events-none animate-in fade-in zoom-in-95 duration-150"
            dir="rtl"
          >
            <div className="relative bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] font-iran-yekan font-bold px-3 py-2 rounded-lg shadow-xl max-w-xs break-words">
              {toPersianDigits(value)}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 dark:bg-zinc-100 rotate-45" />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export function SpecHighlights({ specGroups, onSeeAll }: SpecHighlightsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const mainSpecs = (specGroups || [])
    .flatMap((g) => g.specs || [])
    .filter((s: any) => s.isMain === true);

  if (mainSpecs.length === 0) return null;

  const visibleSpecs = isExpanded ? mainSpecs : mainSpecs.slice(0, 4);
  const hasMoreThanFour = mainSpecs.length > 4;

  return (
    <div className="w-full flex flex-col gap-2.5 text-right select-none">
      <span className="text-sm md:text-base font-bold text-foreground mr-1">
        ویژگی‌های مهم محصول
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
        {visibleSpecs.map((spec: any, idx: number) => (
          <TruncatedSpec key={idx} name={spec.name} value={spec.value} />
        ))}
      </div>

      {hasMoreThanFour && (
        <div className="flex justify-start mt-1">
          <button
            type="button"
            onClick={() => {
              setIsExpanded(!isExpanded);
              if (!isExpanded && onSeeAll) {
                // بعد از بزرگ شدن به لیست ویژگی‌ها اسکرول شود
                setTimeout(() => onSeeAll(), 50);
              }
            }}
            className="flex items-center gap-0.5 text-xs font-bold text-foreground hover:underline outline-none"
          >
            <span>{isExpanded ? 'بستن ویژگی‌ها' : 'مشاهده همه ویژگی‌ها'}</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}