// src/components/features/ProductGrid/PriceSlider.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/primitives/Button';

export interface PriceSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onApply: () => void;
  step?: number;
}

export function PriceSlider({
  min = 0,
  max = 100000000,
  value,
  onChange,
  onApply,
  step,
}: PriceSliderProps) {
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) && max > safeMin ? max : safeMin + 10000000;

  const [minVal, setMinVal] = React.useState(value?.[0] ?? safeMin);
  const [maxVal, setMaxVal] = React.useState(value?.[1] ?? safeMax);
  const [activeThumb, setActiveThumb] = React.useState<'min' | 'max' | null>(null);

  const calculatedStep = React.useMemo(() => {
    if (step && step > 0) return step;
    const diff = safeMax - safeMin;
    if (diff > 50000000) return 500000;
    if (diff > 10000000) return 100000;
    if (diff > 1000000) return 50000;
    return 10000;
  }, [step, safeMin, safeMax]);

  const minGap = calculatedStep * 2;

  React.useEffect(() => {
    if (Array.isArray(value) && value.length === 2) {
      setMinVal(Math.max(safeMin, Math.min(value[0], safeMax)));
      setMaxVal(Math.min(safeMax, Math.max(value[1], safeMin)));
    }
  }, [value, safeMin, safeMax]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextMin = Math.min(Number(e.target.value), maxVal - minGap);
    setMinVal(nextMin);
    onChange([nextMin, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextMax = Math.max(Number(e.target.value), minVal + minGap);
    setMaxVal(nextMax);
    onChange([minVal, nextMax]);
  };

  const toToman = (val: number) => {
    const toman = val > 10000 ? Math.round(val / 10) : val;
    return new Intl.NumberFormat('fa-IR').format(toman);
  };

  const rangeDiff = Math.max(1, safeMax - safeMin);
  const minPercent = Math.min(100, Math.max(0, ((minVal - safeMin) / rangeDiff) * 100));
  const maxPercent = Math.min(100, Math.max(0, ((maxVal - safeMin) / rangeDiff) * 100));

  return (
    <div className="flex w-full flex-col gap-4 py-2 select-none" dir="rtl">
      <div className="relative flex h-7 w-full items-center" dir="ltr">
        <div className="relative h-1.5 w-full rounded-full bg-muted border border-border/60 overflow-hidden">
          <div
            style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
            className="absolute top-0 bottom-0 rounded-full bg-primary"
          />
        </div>

        <input
          type="range"
          min={safeMin}
          max={safeMax}
          step={calculatedStep}
          value={minVal}
          onFocus={() => setActiveThumb('min')}
          onChange={handleMinChange}
          aria-label="حداقل قیمت"
          className={`pointer-events-none absolute h-7 w-full appearance-none bg-transparent opacity-0 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 ${
            activeThumb === 'min' || minPercent > 80 ? 'z-30' : 'z-20'
          }`}
        />

        <input
          type="range"
          min={safeMin}
          max={safeMax}
          step={calculatedStep}
          value={maxVal}
          onFocus={() => setActiveThumb('max')}
          onChange={handleMaxChange}
          aria-label="حداکثر قیمت"
          className={`pointer-events-none absolute h-7 w-full appearance-none bg-transparent opacity-0 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 ${
            activeThumb === 'max' ? 'z-30' : 'z-20'
          }`}
        />

        <div
          style={{ left: `${minPercent}%` }}
          className="pointer-events-none absolute z-25 h-4.5 w-4.5 -translate-x-1/2 rounded-full border-2 border-background bg-primary shadow-sm ring-2 ring-primary/25 transition-transform duration-75 active:scale-110"
          aria-hidden="true"
        />

        <div
          style={{ left: `${maxPercent}%` }}
          className="pointer-events-none absolute z-25 h-4.5 w-4.5 -translate-x-1/2 rounded-full border-2 border-background bg-primary shadow-sm ring-2 ring-primary/25 transition-transform duration-75 active:scale-110"
          aria-hidden="true"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-right">
        <div className="flex flex-col gap-0.5 rounded-xl border border-border/80 bg-muted/30 px-2.5 py-1.5">
          <span className="text-[0.625rem] font-bold text-muted-foreground">از</span>
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xs font-bold text-foreground">{toToman(minVal)}</span>
            <span className="text-[0.625rem] text-muted-foreground">تومان</span>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 rounded-xl border border-border/80 bg-muted/30 px-2.5 py-1.5">
          <span className="text-[0.625rem] font-bold text-muted-foreground">تا</span>
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xs font-bold text-foreground">{toToman(maxVal)}</span>
            <span className="text-[0.625rem] text-muted-foreground">تومان</span>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={onApply}
        fullWidth
        className="h-9 rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all"
      >
        اعمال فیلتر قیمت
      </Button>
    </div>
  );
}