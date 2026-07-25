'use client';

import { toPersianDigits } from '@/core/utils/formatters';

interface ProductSpecsTableProps {
  specGroups: any[];
}

export function ProductSpecsTable({ specGroups }: ProductSpecsTableProps) {
  if (!specGroups || specGroups.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-6 bg-background">
      <h3 className="text-sm md:text-base font-bold font-iran-yekan text-foreground mb-2">
        مشخصات فنی قطعه
      </h3>
      
      <div className="w-full flex flex-col gap-6">
        {specGroups.map((group, gIdx) => (
          <div 
            key={gIdx} 
            className="w-full flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-8 border-b border-zinc-100 dark:border-zinc-800/80 pb-6 last:border-none last:pb-0"
          >
            <div className="lg:w-1/4 shrink-0 flex items-center">
              <span className="text-xs md:text-sm font-black text-primary font-iran-yekan leading-relaxed">
                {group.name}
              </span>
            </div>

            <div className="flex-1 flex flex-col">
              {(group.specs || []).map((spec: any, sIdx: number) => (
                <div 
                  key={sIdx} 
                  className="w-full flex items-center text-xs md:text-sm font-iran-sans py-3 border-b border-zinc-100 dark:border-zinc-800/50 last:border-b-0"
                >
                  <div className="w-1/3 text-muted-foreground font-medium">
                    {spec.name}
                  </div>
                  <div className="w-2/3 text-foreground font-bold">
                    {toPersianDigits(spec.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}