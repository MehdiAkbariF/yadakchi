'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/primitives/Button/Button';
import { cn } from '@/design-system/utils/cn';

interface PriceSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onApply: () => void;
}

export function PriceSlider({ min, max, value, onChange, onApply }: PriceSliderProps) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);

  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - 50000);
    setMinVal(val);
    onChange([val, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + 50000);
    setMaxVal(val);
    onChange([minVal, val]);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('fa-IR').format(val / 10);
  };

  const minPercent = ((minVal - min) / (max - min)) * 100;
  const maxPercent = ((maxVal - min) / (max - min)) * 100;

  return (
    <div className="w-full flex flex-col gap-5 pt-3 select-none">
      <div className="relative w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full">
        <div
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
          className="absolute h-full bg-primary rounded-full"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMinChange}
          className="absolute pointer-events-none appearance-none z-20 h-1 w-full opacity-0 cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          className="absolute pointer-events-none appearance-none z-20 h-1 w-full opacity-0 cursor-pointer"
        />
        <div
          style={{ left: `${minPercent}%` }}
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-primary -translate-x-1/2 -translate-y-1/3 z-30 pointer-events-none shadow-sm"
        />
        <div
          style={{ left: `${maxPercent}%` }}
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-primary -translate-x-1/2 -translate-y-1/3 z-30 pointer-events-none shadow-sm"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-iran-sans font-bold px-1 mt-1">
        <span>از {formatPrice(minVal)} تومان</span>
        <span>تا {formatPrice(maxVal)} تومان</span>
      </div>

      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={onApply}
        fullWidth
        className="rounded-xl font-iran-sans font-bold text-xs h-9 mt-1"
      >
        اعمال محدوده قیمت
      </Button>
    </div>
  );
}