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
      {/* میله اسلایدر با کانتراست قوی */}
      <div className="relative flex h-2 w-full items-center rounded-full bg-muted-foreground/20" dir="ltr">
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
          className="pointer-events-none absolute z-20 h-2 w-full cursor-pointer appearance-none opacity-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          aria-label="حداکثر قیمت"
          className="pointer-events-none absolute z-20 h-2 w-full cursor-pointer appearance-none opacity-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6"
        />

        {/* دسته‌ها: ترکیب رنگ برجسته، بوردر سفید و شادو واضح */}
        <div
          style={{ left: `${minPercent}%` }}
          className="pointer-events-none absolute z-30 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-background bg-primary shadow-md ring-2 ring-primary/40"
          aria-hidden="true"
        />
        <div
          style={{ left: `${maxPercent}%` }}
          className="pointer-events-none absolute z-30 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-background bg-primary shadow-md ring-2 ring-primary/40"
          aria-hidden="true"
        />
      </div>

      {/* نمایش ارقام با فونت خوانا و رنگ مناسب */}
      <div className="flex items-center justify-between px-0.5 text-xs font-bold text-foreground">
        <span>از {formatPrice(minVal)} <span className="text-2xs font-normal text-muted-foreground">تومان</span></span>
        <span>تا {formatPrice(maxVal)} <span className="text-2xs font-normal text-muted-foreground">تومان</span></span>
      </div>

      <Button type="button" variant="primary" size="sm" onClick={onApply} fullWidth className="font-bold">
        اعمال محدوده قیمت
      </Button>
    </div>
  );
}