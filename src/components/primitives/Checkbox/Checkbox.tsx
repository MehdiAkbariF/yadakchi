'use client';

import { cn } from '@/design-system/utils/cn';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <label className={cn("flex items-center justify-between w-full cursor-pointer select-none py-1.5 group", className)}>
      {label && (
        <span className="text-xs font-medium font-iran-sans text-muted-foreground group-hover:text-foreground transition-colors truncate pl-2">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "h-5 w-5 shrink-0 rounded-lg border-2 flex items-center justify-center transition-all duration-200 outline-none shadow-sm",
          checked 
            ? "border-primary bg-primary text-white scale-105" 
            : "border-zinc-300 dark:border-zinc-700 bg-background group-hover:border-primary/40"
        )}
      >
        {checked && <Check className="h-3 w-3 stroke-[3.5] animate-in zoom-in duration-150" />}
      </button>
    </label>
  );
}