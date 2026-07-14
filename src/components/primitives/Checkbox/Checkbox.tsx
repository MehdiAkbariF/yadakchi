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
    <label className={cn("flex items-center justify-between w-full cursor-pointer select-none py-1", className)}>
      {label && <span className="text-xs font-medium font-iran-sans text-muted-foreground hover:text-foreground truncate pl-2">{label}</span>}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "h-4.5 w-4.5 shrink-0 rounded-lg border flex items-center justify-center transition-all duration-150 outline-none",
          checked ? "border-primary bg-primary text-white" : "border-gray-300 dark:border-zinc-700 bg-background"
        )}
      >
        {checked && <Check className="h-3 w-3 stroke-[3]" />}
      </button>
    </label>
  );
}