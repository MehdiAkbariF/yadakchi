'use client';

import * as React from 'react';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { SelectPartModal } from './SelectPartModal';

export interface PartHeaderCardProps {
  partSlug: string;
  categorySlug: string;
  partName: string;
}

export function PartHeaderCard({ partSlug, categorySlug, partName }: PartHeaderCardProps) {
  const [isSelectPartOpen, setIsSelectPartOpen] = React.useState(false);

  return (
    <div className="w-full">
      <Card className="flex w-full flex-col justify-between gap-5 p-4 md:flex-row md:items-center shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
            <span className="text-xs font-bold text-primary">یدک‌چی</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xs font-bold text-muted-foreground md:text-xs">قطعه انتخاب شده:</span>
            <h2 className="text-sm font-bold text-foreground md:text-base">{partName}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSelectPartOpen(true)}
            className="h-10 px-5 text-xs font-bold"
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