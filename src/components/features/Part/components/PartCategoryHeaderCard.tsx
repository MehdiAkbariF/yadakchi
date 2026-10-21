'use client';

import * as React from 'react';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { ChangeCategoryModal } from './ChangeCategoryModal';
import { SelectPartModal } from './SelectPartModal';
import { getFullUrl } from '@/core/utils/formatters';

export interface PartCategoryHeaderCardProps {
  slug: string;
  categoryName: string;
  thumbnail: string | null;
}

export function PartCategoryHeaderCard({ slug, categoryName, thumbnail }: PartCategoryHeaderCardProps) {
  const [isChangeCatOpen, setIsChangeCatOpen] = React.useState(false);
  const [isSelectPartOpen, setIsSelectPartOpen] = React.useState(false);

  return (
    <div className="w-full">
      <Card className="flex w-full flex-col justify-between gap-5 p-4 md:flex-row md:items-center shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
            <img src={getFullUrl(thumbnail)} className="h-full w-full object-contain" alt="" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xs font-bold text-muted-foreground md:text-xs">دسته‌بندی انتخاب شده:</span>
            <h2 className="text-sm font-bold text-foreground md:text-base">{categoryName}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsChangeCatOpen(true)}
            className="h-10 px-5 text-xs font-bold"
          >
            تغییر دسته‌بندی
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSelectPartOpen(true)}
            className="h-10 px-5 text-xs font-bold shadow-xs"
          >
            انتخاب قطعه
          </Button>
        </div>
      </Card>

      <ChangeCategoryModal isOpen={isChangeCatOpen} onClose={() => setIsChangeCatOpen(false)} />

      <SelectPartModal
        isOpen={isSelectPartOpen}
        onClose={() => setIsSelectPartOpen(false)}
        slug={slug}
        categoryName={categoryName}
      />
    </div>
  );
}