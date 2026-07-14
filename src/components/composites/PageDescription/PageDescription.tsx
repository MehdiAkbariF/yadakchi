'use client';

import { useState } from 'react';
import { cn } from '@/design-system/utils/cn';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PageDescriptionProps {
  htmlContent: string;
  title?: string;
  collapsedHeight?: number;
  className?: string;
}

export function PageDescription({
  htmlContent,
  title,
  collapsedHeight = 160,
  className,
}: PageDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!htmlContent) return null;

  return (
    <div className={cn("w-full bg-background  rounded-xl p-4 md:p-6 mt-6 relative overflow-hidden", className)}>
      {title && (
        <h2 className="text-base sm:text-lg font-bold font-iran-yekan text-foreground mb-4">
          {title}
        </h2>
      )}

      <div
        style={{
          maxHeight: isExpanded ? 'none' : `${collapsedHeight}px`,
        }}
        className={cn(
          "max-w-none text-justify text-sm leading-relaxed overflow-hidden transition-all duration-300",
          "[&_h2]:text-base [&_h2]:sm:text-lg [&_h2]:font-extrabold [&_h2]:font-iran-yekan [&_h2]:text-foreground [&_h2]:mb-4 [&_h2]:mt-2",
          "[&_p]:text-muted-foreground [&_p]:mb-4 [&_p]:leading-relaxed",
          "[&_strong]:text-foreground [&_strong]:font-bold [&_strong]:block [&_strong]:mt-5 [&_strong]:mb-2 [&_strong]:text-sm [&_strong]:sm:text-base"
        )}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {!isExpanded && (
        <div className="absolute bottom-12 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      )}

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          {isExpanded ? (
            <>
              <span>نمایش کمتر</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>نمایش بیشتر</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}