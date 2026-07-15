'use client';

import { Store } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/composites/Card';
import { BasketItemRow } from './BasketItemRow';

interface BasketMerchantGroupProps {
  sub: any;
}

export function BasketMerchantGroup({ sub }: BasketMerchantGroupProps) {
  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  return (
    <Card className="w-full overflow-hidden border rounded-xl shadow-sm bg-background">
      <CardHeader className="border-b bg-muted/20 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="h-4.5 w-4.5 text-primary shrink-0" />
          <span className="text-xs font-bold font-iran-yekan text-foreground">
            ارسال از فروشگاه: {sub.shop.title}
          </span>
        </div>
        {sub.shop.logo && (
          <div className="w-8 h-8 rounded-lg overflow-hidden border bg-background shrink-0">
            <img
              src={getFullUrl(sub.shop.logo)}
              alt={sub.shop.title}
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </CardHeader>

      <CardBody className="divide-y p-0">
        {sub.items.map((item: any) => (
          <BasketItemRow key={item.id} item={item} />
        ))}
      </CardBody>
    </Card>
  );
}