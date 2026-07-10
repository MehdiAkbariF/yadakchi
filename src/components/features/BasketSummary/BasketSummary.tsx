// src/components/features/BasketSummary/BasketSummary.tsx

'use client';

import Link from 'next/link';
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button';
import { Typography } from '@/components/primitives/Typography';
import { Badge } from '@/components/primitives/Badge';
import { BasketViewModel } from '@/domains/front/basket/types/view.types';

export interface BasketSummaryProps {
  basket: BasketViewModel;
  onUpdateQuantity?: (shopProductId: string, quantity: number) => void;
  onRemove?: (shopProductId: string) => void;
  onCheckout?: () => void;
  className?: string;
}

export function BasketSummary({
  basket,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  className,
}: BasketSummaryProps) {
  if (basket.isEmpty) {
    return (
      <Card className={className}>
        <CardBody className="flex flex-col items-center justify-center py-12">
          <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          <Typography variant="h4" color="muted" className="mt-4">
            سبد خرید خالی است
          </Typography>
          <Link href="/products">
            <Button variant="primary" className="mt-4">
              شروع خرید
            </Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>سبد خرید</span>
          <Badge variant="secondary">
            {basket.summary.itemCount} کالا
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardBody className="space-y-4">
        {basket.items.map((item) => (
          <div
            key={item.shopProductId}
            className="flex items-start gap-4 border-b pb-4 last:border-0"
          >
            {/* Product Image */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <Typography variant="small" className="line-clamp-2">
                {item.product.name}
              </Typography>
              <Typography variant="small" color="muted">
                {item.shop.name}
              </Typography>
              <div className="flex items-center gap-2 mt-1">
                <Typography variant="small" className="font-medium">
                  {item.price.finalPrice}
                </Typography>
                {item.price.hasDiscount && (
                  <Typography variant="small" color="muted" className="line-through">
                    {item.price.totalPrice}
                  </Typography>
                )}
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onUpdateQuantity?.(item.shopProductId, item.quantity - 1)}
                disabled={!item.canDecrease}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onUpdateQuantity?.(item.shopProductId, item.quantity + 1)}
                disabled={!item.canIncrease}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onRemove?.(item.shopProductId)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardBody>

      <CardFooter className="flex flex-col gap-4">
        {/* Total */}
        <div className="flex w-full items-center justify-between">
          <Typography variant="small" color="muted">
            مجموع سبد خرید
          </Typography>
          <Typography variant="h4">
            {basket.total.finalPrice}
          </Typography>
        </div>

        {basket.total.totalDiscountRaw > 0 && (
          <div className="flex w-full items-center justify-between text-sm text-success-500">
            <span>تخفیف</span>
            <span>- {basket.total.totalDiscount}</span>
          </div>
        )}

        {/* Checkout Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onCheckout}
        >
          ادامه فرآیند خرید
        </Button>
      </CardFooter>
    </Card>
  );
}