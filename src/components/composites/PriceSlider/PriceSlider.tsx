'use client';

import * as React from 'react';
import { Button } from '@/components/primitives/Button';

export interface PriceSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onApply: () => void;
}

export function PriceSlider({ min, max, value, onChange, onApply }: PriceSliderProps) {
  const [minVal, setMinVal] = React.useState(value[0]);
  const [maxVal, setMaxVal] = React.useState(value[1]);

  React.useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.min(Number(e.target.value), maxVal - 50000);
    setMinVal(next);
    onChange([next, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.max(Number(e.target.value), minVal + 50000);
    setMaxVal(next);
    onChange([minVal, next]);
  };

  const formatPrice = (val: number) => new Intl.NumberFormat('fa-IR').format(val / 10);

  const minPercent = ((minVal - min) / (max - min)) * 100;
  const maxPercent = ((maxVal - min) / (max - min)) * 100;

  return (
    <div className="flex w-full flex-col gap-5 pt-3 select-none">
      <div className="relative flex h-1.5 w-full items-center rounded-full bg-border" dir="ltr">
        <div
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
          className="absolute h-full rounded-full bg-primary"
        />

        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMinChange}
          aria-label="حداقل قیمت"
          className="pointer-events-none absolute z-20 h-1.5 w-full cursor-pointer appearance-none opacity-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          aria-label="حداکثر قیمت"
          className="pointer-events-none absolute z-20 h-1.5 w-full cursor-pointer appearance-none opacity-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5"
        />

        <div
          style={{ left: `${minPercent}%` }}
          className="pointer-events-none absolute z-30 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-primary bg-card shadow-sm"
          aria-hidden="true"
        />
        <div
          style={{ left: `${maxPercent}%` }}
          className="pointer-events-none absolute z-30 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-primary bg-card shadow-sm"
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center justify-between px-1 text-2xs font-semibold text-muted-foreground">
        <span>از {formatPrice(minVal)} تومان</span>
        <span>تا {formatPrice(maxVal)} تومان</span>
      </div>

      <Button type="button" variant="primary" size="sm" onClick={onApply} fullWidth>
        اعمال محدوده قیمت
      </Button>
    </div>
  );
}
