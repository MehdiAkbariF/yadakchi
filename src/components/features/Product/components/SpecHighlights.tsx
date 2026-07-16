'use client';

interface SpecHighlightsProps {
  specGroups: any[];
}

export function SpecHighlights({ specGroups }: SpecHighlightsProps) {
  const mainSpecs = (specGroups || [])
    .flatMap(g => g.specs || [])
    .filter((s: any) => s.isMain === true);

  if (mainSpecs.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-3.5 text-right mt-3">
      <span className="text-xs font-bold font-iran-yekan text-muted-foreground">ویژگی مهم محصول</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {mainSpecs.map((spec: any, idx: number) => (
          <div key={idx} className="border rounded-xl p-3.5 bg-muted/10 flex flex-col gap-1 text-right">
            <span className="text-[10px] font-bold text-muted-foreground font-iran-sans">{spec.name}</span>
            <span className="text-xs font-black text-foreground font-iran-sans mt-0.5">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}