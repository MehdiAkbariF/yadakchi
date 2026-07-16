'use client';

import { Share2, Scale, Star, Heart, Loader2 } from 'lucide-react';
import { Typography } from '@/components/primitives/Typography';
import { ProductDetailsViewModel } from '@/domains/front/product/types/view.types';
import { useIsUserFavoriteProduct, useAddFavorite, useDeleteFavorite } from '@/domains/front/product/hooks/product.hooks';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

interface ProductHeaderProps {
  product: ProductDetailsViewModel;
  onScrollToComments: () => void;
  onScrollToInquiries: () => void;
}

export function ProductHeader({ product, onScrollToComments, onScrollToInquiries }: ProductHeaderProps) {
  const { data: isFavorite, isLoading: isFavLoading } = useIsUserFavoriteProduct(product.code);
  const addFavorite = useAddFavorite();
  const deleteFavorite = useDeleteFavorite();

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await deleteFavorite.mutateAsync(product.id);
        showToast.success('از علاقه‌مندی‌ها حذف شد');
      } else {
        await addFavorite.mutateAsync(product.id);
        showToast.success('به علاقه‌مندی‌ها اضافه شد');
      }
    } catch (err: any) {
      showToast.error('خطا در انجام عملیات علاقه‌مندی');
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: product.title,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast.success('لینک صفحه کپی شد');
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 text-right">
      
      <div className="flex items-center justify-between w-full border-b pb-3">
        <span className="text-[10px] font-bold text-muted-foreground font-iran-sans">کد کالا: {product.code}</span>
        <div className="flex items-center gap-3">
          <button onClick={handleShare} className="p-2 border rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="p-2 border rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all">
            <Scale className="h-4 w-4" />
          </button>
          <button 
            onClick={handleFavoriteToggle} 
            disabled={isFavLoading || addFavorite.isPending || deleteFavorite.isPending}
            className="p-2 border rounded-xl hover:bg-muted text-muted-foreground hover:text-destructive transition-all disabled:opacity-40"
          >
            {isFavLoading || addFavorite.isPending || deleteFavorite.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Heart className={cn("h-4 w-4", isFavorite ? "fill-destructive text-destructive" : "")} />
            )}
          </button>
        </div>
      </div>

      <Typography variant="h3"
       className="font-iran-yekan font-extrabold text-foreground leading-relaxed text-right">
        {product.title}
      </Typography>

      <div className="flex flex-wrap items-center gap-4 text-xs font-iran-sans text-muted-foreground mt-1">
        <div className="flex items-center gap-1 cursor-pointer" onClick={onScrollToComments}>
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0" />
          <span className="font-bold text-foreground">{product.averageRate.toFixed(1)}</span>
          <span>از {product.rateCount} نظر</span>
        </div>
        <span className="text-zinc-300">|</span>
        <button onClick={onScrollToInquiries} className="hover:text-primary hover:underline">تبادل پرسش و پاسخ</button>
      </div>

    </div>
  );
}