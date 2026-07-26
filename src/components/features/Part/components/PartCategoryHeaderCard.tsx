'use client';

import { useState } from 'react';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { ChangeCategoryModal } from './ChangeCategoryModal';
import { SelectPartModal } from './SelectPartModal';

interface PartCategoryHeaderCardProps {
  slug: string;
  categoryName: string;
  thumbnail: string | null;
}

export function PartCategoryHeaderCard({ slug, categoryName, thumbnail }: PartCategoryHeaderCardProps) {
  const [isChangeCatOpen, setIsChangeCatOpen] = useState(false);
  const [isSelectPartOpen, setIsSelectPartOpen] = useState(false);

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  return (
    <div className="w-full">
      <Card className="w-full border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4 text-right">
          <div className="w-16 h-16 shrink-0 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-muted/10 flex items-center justify-center overflow-hidden">
            <img src={getFullUrl(thumbnail)} className="w-full h-full object-contain" alt="" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] md:text-xs text-muted-foreground font-bold">دسته‌بندی انتخاب شده:</span>
            <h2 className="text-sm md:text-base font-black text-foreground font-iran-yekan">{categoryName}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsChangeCatOpen(true)}
            className="rounded-xl font-iran-yekan font-bold text-xs h-10 px-5 border-zinc-200 text-foreground"
          >
            تغییر دسته‌بندی
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSelectPartOpen(true)}
            className="rounded-xl font-iran-yekan font-bold text-xs h-10 px-5 shadow-sm"
          >
            انتخاب قطعه
          </Button>
        </div>
      </Card>

      <ChangeCategoryModal
        isOpen={isChangeCatOpen}
        onClose={() => setIsChangeCatOpen(false)}
      />

      <SelectPartModal
        isOpen={isSelectPartOpen}
        onClose={() => setIsSelectPartOpen(false)}
        slug={slug}
        categoryName={categoryName}
      />
    </div>
  );
}