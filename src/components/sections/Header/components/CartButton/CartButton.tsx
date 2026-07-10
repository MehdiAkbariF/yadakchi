// src/components/sections/Header/components/CartButton/CartButton.tsx

'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { useGetBasket } from '@/domains/front/basket/hooks/basket.hooks';

export function CartButton() {
  const { data: basket } = useGetBasket();
  const itemCount = basket?.summary?.itemCount || 0;

  return (
    <Link href="/basket">
      <Button variant="ghost" size="icon" className="relative" aria-label="سبد خرید">
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge variant="destructive" size="sm" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {itemCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
}