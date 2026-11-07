'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react';
import { toPersianDigits } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';
import { BottomSheet } from '@/components/composites/BottomSheet/BottomSheet';

export interface SpecHighlightsProps {
  specGroups: any[];
  onSeeAll?: () => void;
  /** HTML توضیحات محصول برای تب «معرفی کالا» در مودال */
  productDescription?: string;
}

/** Tooltip برای ویژگی‌های truncate شده در دسکتاپ */
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
      <span className="block truncate text-label-2xs md:text-xs">
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

/** چیپ مینیمال مخصوص موبایل — کلیک‌پذیر برای باز کردن مودال */
function MobileSpecChip({
  name,
  value,
  onClick,
}: {
  name: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 flex-col gap-0.5 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1.5 text-start outline-none transition-colors active:bg-muted/70"
    >
      <span className="whitespace-nowrap text-3xs font-bold text-muted-foreground">
        {toPersianDigits(name)}
      </span>
      <span className="max-w-[8.125rem] truncate whitespace-nowrap text-2xs font-bold text-foreground">
        {toPersianDigits(value)}
      </span>
    </button>
  );
}

/** ردیف ویژگی در Bottom Sheet */
function SheetSpecRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2.5 last:border-b-0">
      <span className="shrink-0 text-label-2xs">
        {toPersianDigits(name)}
      </span>
      <span className="text-end text-xs font-medium text-foreground">
        {toPersianDigits(value)}
      </span>
    </div>
  );
}

export function SpecHighlights({ specGroups, onSeeAll, productDescription }: SpecHighlightsProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'specs' | 'intro'>('specs');

  // همه ویژگی‌ها (برای مودال)
  const allSpecs = React.useMemo(
    () => (specGroups || []).flatMap((g) => g.specs || []),
    [specGroups]
  );

  // ویژگی‌های مهم (برای نمایش خلاصه)
  const mainSpecs = React.useMemo(
    () => allSpecs.filter((s: any) => s.isMain === true),
    [allSpecs]
  );

  if (allSpecs.length === 0) return null;

  const visibleSpecs = isExpanded ? mainSpecs : mainSpecs.slice(0, 4);
  const mobileVisibleSpecs = mainSpecs.slice(0, 4);
  const hasMoreThanFour = mainSpecs.length > 4;

  const openSheet = (tab: 'specs' | 'intro' = 'specs') => {
    setActiveTab(tab);
    setIsSheetOpen(true);
  };

  return (
    <div className="flex w-full select-none flex-col gap-2.5">
      {/* ============ هدر: تایتل + دکمه ساده «مشاهده همه» ============ */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-title-sm md:text-base">
          ویژگی‌های مهم محصول
        </span>
      <button
  type="button"
  onClick={() => openSheet('specs')}
  className="group flex shrink-0 items-center gap-0.5 text-xs font-bold text-info/90 outline-none transition-opacity hover:opacity-80 dark:text-info/90"
>
  <span>مشاهده همه</span>
  <ChevronLeft
    aria-hidden="true"
    className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
  />
</button>
      </div>

      {/* ============ دسکتاپ: گرید دو ستونه ============ */}
      <div className="hidden w-full grid-cols-1 gap-2.5 sm:grid sm:grid-cols-2">
        {visibleSpecs.map((spec: any, idx: number) => (
          <TruncatedSpec key={idx} name={spec.name} value={spec.value} />
        ))}
      </div>

      {hasMoreThanFour && (
        <div className="mt-1 hidden justify-start sm:flex">
          <button
            type="button"
            onClick={() => {
              setIsExpanded(!isExpanded);
              if (!isExpanded && onSeeAll) {
                setTimeout(() => onSeeAll(), 50);
              }
            }}
            className="flex items-center gap-0.5 text-label outline-none hover:underline"
          >
            <span>{isExpanded ? 'بستن ویژگی‌ها' : 'مشاهده همه ویژگی‌ها'}</span>
            {isExpanded ? (
              <ChevronUp aria-hidden="true" className="h-4 w-4" />
            ) : (
              <ChevronDown aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      {/* ============ موبایل: ردیف افقی چیپ‌ها ============ */}
      <div className="flex flex-col gap-2 sm:hidden">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
          {mobileVisibleSpecs.map((spec: any, idx: number) => (
            <MobileSpecChip
              key={idx}
              name={spec.name}
              value={spec.value}
              onClick={() => openSheet('specs')}
            />
          ))}
        </div>
      </div>

      {/* ============ Bottom Sheet با دو تب ============ */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="مشخصات و معرفی کالا"
        size="auto"
        maxWidth="max-w-lg"
      >
        {/* تب‌ها */}
        <div className="mb-3 flex w-full items-center gap-1 border-b border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={cn(
              'relative flex-1 border-b-2 px-2 pb-2.5 pt-1 text-xs font-bold outline-none transition-colors',
              activeTab === 'specs'
                ? 'border-primary text-primary font-black'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            ویژگی‌های محصول
            <span className="mr-1 text-3xs font-normal text-muted-foreground">
              ({toPersianDigits(allSpecs.length)})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('intro')}
            className={cn(
              'relative flex-1 border-b-2 px-2 pb-2.5 pt-1 text-xs font-bold outline-none transition-colors',
              activeTab === 'intro'
                ? 'border-primary text-primary font-black'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            معرفی کالا
          </button>
        </div>

        {/* محتوای تب */}
        {activeTab === 'specs' ? (
          <div className="flex flex-col">
            {allSpecs.map((spec: any, idx: number) => (
              <SheetSpecRow key={idx} name={spec.name} value={spec.value} />
            ))}
          </div>
        ) : (
          <div className="pb-2">
            {productDescription ? (
              <div
                className="text-justify text-xs leading-reading text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: productDescription }}
              />
            ) : (
              <p className="py-8 text-center text-base text-muted-foreground">
                توضیحی برای این کالا ثبت نشده است.
              </p>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}