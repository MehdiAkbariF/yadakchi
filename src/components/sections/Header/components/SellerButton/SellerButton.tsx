// src/components/sections/Header/components/SellerButton/SellerButton.tsx

import Link from 'next/link';
import { Button } from '@/components/primitives/Button';
import { cn } from '@/design-system/utils/cn';

interface SellerButtonProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function SellerButton({ className, size = 'sm' }: SellerButtonProps) {
  return (
    <Link href="/seller/register">
      <Button 
        variant="primary" 
        size={size} 
        className={cn(
          "font-yekan",
          size === 'sm' && "text-xs px-3 h-8",
          className
        )}
      >
        فروشنده شو
      </Button>
    </Link>
  );
}