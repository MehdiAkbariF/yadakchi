// src/components/features/ProductCard/ProductCard.tsx

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { Typography } from '@/components/primitives/Typography';
import { ProductViewModel } from '@/domains/front/product/types/view.types';

export interface ProductCardProps {
  product: ProductViewModel;
  variant?: 'default' | 'compact' | 'horizontal';
  onFavoriteToggle?: (productId: string) => void;
  onAddToBasket?: (productId: string) => void;
  className?: string;
}

export function ProductCard({
  product,
  variant = 'default',
  onFavoriteToggle,
  onAddToBasket,
  className,
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(product.isFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    onFavoriteToggle?.(product.id);
  };

  const handleAddToBasket = () => {
    setIsLoading(true);
    onAddToBasket?.(product.id);
    setTimeout(() => setIsLoading(false), 500);
  };

  const isCompact = variant === 'compact';
  const isHorizontal = variant === 'horizontal';

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all hover:shadow-lg',
        isHorizontal && 'flex flex-row',
        className
      )}
    >
      {/* Image Section */}
      <div className={cn(
        'relative',
        isHorizontal ? 'w-1/3' : 'aspect-square w-full'
      )}>
        <Link href={`/products/${product.code}`}>
          <Image
            src={product.images[0]?.medium || '/placeholder.png'}
            alt={product.name}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount.hasDiscount && (
            <Badge variant="warning" size="sm">
              {product.discount.percent}% تخفیف
            </Badge>
          )}
          {product.metadata.isNew && (
            <Badge variant="success" size="sm">
              جدید
            </Badge>
          )}
          {!product.inventory.isInStock && (
            <Badge variant="destructive" size="sm">
              ناموجود
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={handleFavoriteToggle}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            )}
          />
        </Button>
      </div>

      {/* Content Section */}
      <CardBody className={cn(
        'flex flex-col gap-2',
        isHorizontal ? 'w-2/3' : 'p-4'
      )}>
        {/* Shop Name */}
        <Link
          href={`/shops/${product.shop.id}`}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {product.shop.name}
        </Link>

        {/* Product Name */}
        <Link href={`/products/${product.code}`}>
          <Typography
            variant={isCompact ? 'small' : 'h4'}
            className={cn(
              'line-clamp-2 hover:text-primary transition-colors',
              isCompact && 'text-sm'
            )}
          >
            {product.name}
          </Typography>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3',
                  i < product.rating.stars
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.rating.count})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mt-auto">
          {product.discount.hasDiscount ? (
            <>
              <Typography variant="h4" color="destructive">
                {product.discount.discountedPrice}
              </Typography>
              <Typography variant="small" color="muted" className="line-through">
                {product.discount.originalPrice}
              </Typography>
            </>
          ) : (
            <Typography variant="h4">
              {product.price.formattedToman}
            </Typography>
          )}
        </div>

        {/* Actions */}
        {!isCompact && (
          <Button
            variant="primary"
            size="sm"
            className="w-full mt-2"
            onClick={handleAddToBasket}
            isLoading={isLoading}
            disabled={!product.inventory.isInStock}
          >
            <ShoppingCart className="ml-2 h-4 w-4" />
            {product.inventory.isInStock ? 'افزودن به سبد' : 'ناموجود'}
          </Button>
        )}
      </CardBody>
    </Card>
  );
}