'use client';

import { Store } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/composites/Card';
import { BasketItemRow } from './BasketItemRow';
import { getFullUrl } from '@/core/utils/formatters';

export interface BasketMerchantGroupProps {
  sub: any;
}

export function BasketMerchantGroup({ sub }: BasketMerchantGroupProps) {
  return (
    <Card className="w-full overflow-hidden shadow-xs">
      <CardHeader className="flex items-center justify-between border-b border-border bg-muted px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Store aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-xs font-bold text-foreground">ارسال از فروشگاه: {sub.shop.title}</span>
        </div>
        {sub.shop.logo ? (
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md border border-border bg-card">
            <img
              src={getFullUrl(sub.shop.logo)}
              alt={sub.shop.title}
              className="h-full w-full object-contain"
            />
          </div>
        ) : null}
      </CardHeader>

      <CardBody className="divide-y divide-border p-0">
        {sub.items.map((item: any) => (
          <BasketItemRow key={item.id} item={item} />
        ))}
      </CardBody>
    </Card>
  );
}
