// src/components/primitives/OtpInput/OtpInput.tsx

'use client';

import { useRef } from 'react';
import { cn } from '@/design-system/utils/cn';

export interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export const OtpInput = ({
  length = 5,
  value,
  onChange,
  className
}: OtpInputProps) => {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;

    const newValue = [...value];
    newValue[index] = val;
    onChange(newValue);

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={cn('flex items-center justify-center gap-3', className)} dir="ltr">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { if (el) inputRefs.current[index] = el; }}
          type="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-bold rounded-xl border border-input bg-background text-foreground transition-all duration-150 focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm focus:bg-primary/5 focus:scale-105"
        />
      ))}
    </div>
  );
};