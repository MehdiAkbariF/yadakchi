'use client';

import { useState } from 'react';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { SelectPartModal } from './SelectPartModal';

interface PartHeaderCardProps {
  partSlug: string;
  categorySlug: string;
  partName: string;
}

export function PartHeaderCard({ partSlug, categorySlug, partName }: PartHeaderCardProps) {
  const [isSelectPartOpen, setIsSelectPartOpen] = useState(false);

  return (
    <div className="w-full">
      <Card className="w-full border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4 text-right">
          <div className="w-16 h-16 shrink-0 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-muted/10 flex items-center justify-center overflow-hidden">
            <span className="text-xs font-black text-primary font-iran-sans">یدک‌چی</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] md:text-xs text-muted-foreground font-bold">قطعه انتخاب شده:</span>
            <h2 className="text-sm md:text-base font-black text-foreground font-iran-yekan">{partName}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSelectPartOpen(true)}
            className="rounded-xl font-iran-sans font-bold text-xs h-10 px-5 border-zinc-200 text-foreground"
          >
            تغییر قطعه
          </Button>
        </div>
      </Card>

      <SelectPartModal
        isOpen={isSelectPartOpen}
        onClose={() => setIsSelectPartOpen(false)}
        slug={categorySlug}
        categoryName={partName}
      />
    </div>
  );
}