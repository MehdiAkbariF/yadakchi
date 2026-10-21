'use client';

import { toPersianDigits } from '@/core/utils/formatters';

export interface ProductSpecsTableProps {
  specGroups: any[];
}

export function ProductSpecsTable({ specGroups }: ProductSpecsTableProps) {
  if (!specGroups || specGroups.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-6 bg-inherit">
      <h3 className="mb-2 text-sm font-bold text-foreground md:text-base">مشخصات فنی قطعه</h3>

      <div className="flex w-full flex-col gap-6">
        {specGroups.map((group, gIdx) => (
          <div
            key={gIdx}
            className="flex w-full flex-col items-stretch gap-4 border-b border-border pb-6 last:border-none last:pb-0 lg:flex-row lg:items-center lg:gap-8"
          >
            <div className="flex shrink-0 items-center lg:w-1/4">
              <span className="text-xs font-medium leading-relaxed text-foreground md:text-sm">
                {group.name}
              </span>
            </div>

            <div className="flex flex-1 flex-col">
              {(group.specs || []).map((spec: any, sIdx: number) => (
                <div
                  key={sIdx}
                  className="flex w-full items-center border-b border-border py-3 text-xs last:border-b-0 md:text-sm"
                >
                  <div className="w-1/3 font-medium text-muted-foreground">{spec.name}</div>
                  <div className="w-2/3 font-bold text-foreground">{toPersianDigits(spec.value)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}