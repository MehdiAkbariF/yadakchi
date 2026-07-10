// src/components/features/ProductGrid/ProductGrid.tsx

import { cn } from '@/design-system/utils/cn';
import { ProductCard } from '../ProductCard';
import { ProductViewModel } from '@/domains/front/product/types/view.types';
import { Typography } from '@/components/primitives/Typography';

export interface ProductGridProps {
  products: ProductViewModel[];
  title?: string;
  columns?: 1 | 2 | 3 | 4 | 5;
  loading?: boolean;
  onFavoriteToggle?: (productId: string) => void;
  onAddToBasket?: (productId: string) => void;
  className?: string;
}

const columnClasses: Record<NonNullable<ProductGridProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
};

export function ProductGrid({
  products,
  title,
  columns = 4,
  loading = false,
  onFavoriteToggle,
  onAddToBasket,
  className,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {title && <Typography variant="h2">{title}</Typography>}
        <div className={cn('grid gap-4', columnClasses[columns])}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Typography variant="h3" color="muted">
          محصولی یافت نشد
        </Typography>
        <Typography variant="muted">
          سعی کنید با کلمات دیگری جستجو کنید
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <Typography variant="h2" className="mb-4">
          {title}
        </Typography>
      )}
      <div className={cn('grid gap-4', columnClasses[columns], className)}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onFavoriteToggle={onFavoriteToggle}
            onAddToBasket={onAddToBasket}
          />
        ))}
      </div>
    </div>
  );
}