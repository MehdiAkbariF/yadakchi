'use client';

interface ProductSpecsTableProps {
  specGroups: any[];
}

export function ProductSpecsTable({ specGroups }: ProductSpecsTableProps) {
  if (!specGroups || specGroups.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-5 text-right mt-6">
      <h3 className="text-sm md:text-base font-bold font-iran-yekan text-foreground">مشخصات فنی قطعه</h3>
      
      <div className="w-full border rounded-xl overflow-hidden divide-y">
        {specGroups.map((group, gIdx) => (
          <div key={gIdx} className="w-full flex flex-col divide-y bg-background">
            <div className="px-4 py-3.5 bg-muted/20 text-xs md:text-sm font-bold font-iran-yekan text-foreground">
              {group.name}
            </div>
            {(group.specs || []).map((spec: any, sIdx: number) => (
              <div key={sIdx} className="w-full flex items-stretch text-xs md:text-sm font-iran-sans">
                <div className="w-1/3 px-4 py-3 bg-muted/5 text-muted-foreground font-medium border-l">
                  {spec.name}
                </div>
                <div className="w-2/3 px-4 py-3 text-foreground font-bold">
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}