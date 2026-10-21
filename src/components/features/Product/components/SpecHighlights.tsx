'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toPersianDigits } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';

export interface SpecHighlightsProps {
  specGroups: any[];
  onSeeAll?: () => void;
}

function TruncatedSpec({ name, value }: { name: string; value: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isTruncated, setIsTruncated] = React.useState(false);
  const [tooltipPos, setTooltipPos] = React.useState({ top: 0, left: 0 });
  const textRef = React.useRef<HTMLSpanElement>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const element = textRef.current;
        setIsTruncated(element.scrollWidth > element.clientWidth);
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

  React.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = () => setIsOpen(false);
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleClickOutside, true);
    };
  }, [isOpen]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-md border border-border bg-muted/60 p-3">
      <span className="block truncate text-2xs font-bold text-muted-foreground md:text-xs">
        {toPersianDigits(name)}
      </span>

      <span
        ref={textRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'mt-0.5 block truncate text-xs font-medium text-foreground md:text-sm',
          isTruncated && 'cursor-help'
        )}
      >
        {toPersianDigits(value)}
      </span>

      {mounted && isOpen && isTruncated
        ? createPortal(
            <div
              style={{
                position: 'fixed',
                top: tooltipPos.top,
                left: tooltipPos.left,
                transform: 'translateX(-50%)',
                zIndex: 9999,
              }}
              className="pointer-events-none"
              dir="rtl"
            >
              <div className="relative max-w-xs break-words rounded-md bg-foreground px-3 py-2 text-2xs font-bold text-background shadow-lg">
                {toPersianDigits(value)}
                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-foreground" />
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export function SpecHighlights({ specGroups, onSeeAll }: SpecHighlightsProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const mainSpecs = (specGroups || []).flatMap((g) => g.specs || []).filter((s: any) => s.isMain === true);

  if (mainSpecs.length === 0) return null;

  const visibleSpecs = isExpanded ? mainSpecs : mainSpecs.slice(0, 4);
  const hasMoreThanFour = mainSpecs.length > 4;

  return (
    <div className="flex w-full select-none flex-col gap-2.5">
      <span className="me-1 text-sm font-bold text-foreground md:text-base">ویژگی‌های مهم محصول</span>

      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {visibleSpecs.map((spec: any, idx: number) => (
          <TruncatedSpec key={idx} name={spec.name} value={spec.value} />
        ))}
      </div>

      {hasMoreThanFour ? (
        <div className="mt-1 flex justify-start">
          <button
            type="button"
            onClick={() => {
              setIsExpanded(!isExpanded);
              if (!isExpanded && onSeeAll) {
                setTimeout(() => onSeeAll(), 50);
              }
            }}
            className="flex items-center gap-0.5 text-xs font-bold text-foreground outline-none hover:underline"
          >
            <span>{isExpanded ? 'بستن ویژگی‌ها' : 'مشاهده همه ویژگی‌ها'}</span>
            {isExpanded ? (
              <ChevronUp aria-hidden="true" className="h-4 w-4" />
            ) : (
              <ChevronDown aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}