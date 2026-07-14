'use client';

import { cn } from '@/design-system/utils/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function Switch({ checked, onChange, className }: SwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none select-none border border-transparent shadow-inner",
        checked ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-800",
        className
      )}
      dir="ltr"
    >
      <span
        style={{
          transform: checked ? 'translateX(20px)' : 'translateX(0px)'
        }}
        className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out"
      />
    </button>
  );
}