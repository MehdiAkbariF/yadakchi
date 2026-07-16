'use client';

import { useState } from 'react';
import { useGetProductComments, useGetProductCommentsAverage } from '@/domains/front/product/hooks/product.hooks';
import { Star, ThumbsUp, ThumbsDown, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/primitives/Button/Button';
import { cn } from '@/design-system/utils/cn';

interface ProductCommentsSectionProps {
  productId: string;
}

export function ProductCommentsSection({ productId }: ProductCommentsSectionProps) {
  const [orderBy, setOrderBy] = useState('Newest');
  const [page, setPage] = useState(1);

  const { data: average } = useGetProductCommentsAverage(productId);
  const { data: commentsResponse, isLoading } = useGetProductComments(productId, orderBy, page);

  const comments = commentsResponse?.items || [];

  const handleWriteComment = () => {
    showToast.success('درگاه ثبت نظر به زودی فعال خواهد شد');
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-right mt-6">
      <h3 className="text-sm md:text-base font-bold font-iran-yekan text-foreground">امتیاز و نظرات کاربران</h3>

      {average && (
        <div className="w-full border rounded-xl p-5 bg-background flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="flex flex-col items-center justify-center text-center gap-2 md:border-l md:pl-8 shrink-0">
            <span className="text-3xl md:text-4xl font-black text-foreground font-iran-sans">{average.averageRate.toFixed(1)}</span>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "h-4 w-4 shrink-0", 
                    i < Math.round(average.averageRate) ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"
                  )} 
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-muted-foreground font-iran-sans mt-1">از {average.allRatesCount} امتیاز ثبت شده</span>
          </div>

          <div className="flex-1 flex flex-col gap-2.5 w-full">
            {[
              { label: '۵ ستاره', value: average.starPercentages.five },
              { label: '۴ ستاره', value: average.starPercentages.four },
              { label: '۳ ستاره', value: average.starPercentages.three },
              { label: '۲ ستاره', value: average.starPercentages.two },
              { label: '۱ ستاره', value: average.starPercentages.one }
            ].map((star, idx) => (
              <div key={idx} className="w-full flex items-center gap-3.5 text-xs text-muted-foreground font-iran-sans">
                <span className="w-11 shrink-0 font-bold">{star.label}</span>
                <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
                  <div style={{ width: `${star.value}%` }} className="absolute inset-y-0 right-0 bg-yellow-400 rounded-full" />
                </div>
                <span className="w-8 shrink-0 text-left font-bold">{star.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-2.5">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold text-muted-foreground font-iran-sans shrink-0">نمایش بر اساس:</span>
          {[
            { value: 'Newest', label: 'جدیدترین' },
            { value: 'Oldest', label: 'قدیمی‌ترین' },
            { value: 'MostLike', label: 'مفیدترین' },
            { value: 'LeastLike', label: 'کمترین امتیاز' }
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setOrderBy(opt.value); setPage(1); }}
              className={cn(
                "text-xs font-bold font-iran-sans pb-1 shrink-0 border-b-2 outline-none",
                orderBy === opt.value ? "text-primary border-primary" : "text-muted-foreground border-transparent"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleWriteComment}
          className="rounded-xl text-xs font-bold font-iran-sans h-9 border-primary/20 text-primary hover:bg-primary/5 flex items-center gap-1 shrink-0"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>دیدگاه خود را بنویسید</span>
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <span className="text-xs text-muted-foreground font-iran-sans">در حال لود دیدگاه‌ها...</span>
        ) : comments.length > 0 ? (
          comments.map((comment: any) => (
            <div key={comment.id} className="p-4 border rounded-xl bg-background flex gap-4 text-right">
              <div className="w-10 h-10 shrink-0 rounded-full border bg-muted/15 flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-foreground font-iran-sans">{comment.creator}</span>
                  <span className="text-[10px] text-muted-foreground font-iran-sans">{comment.createDateFormatted}</span>
                </div>
                
                <div className="flex items-center gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "h-3 w-3 shrink-0", 
                        i < comment.rate ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"
                      )} 
                    />
                  ))}
                </div>

                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 mt-2.5 font-iran-sans">{comment.comment}</p>

                {comment.userBoughtFrom && (
                  <span className="text-[9px] font-bold text-success-500 bg-success-50 dark:bg-success-950/20 px-2 py-0.5 rounded-full inline-block mt-3 font-iran-sans">
                    خریدار این کالا از فروشگاه {comment.userBoughtFrom}
                  </span>
                )}

                <div className="flex items-center gap-4 justify-end mt-4 border-t border-dashed pt-2.5">
                  <button className="flex items-center gap-1 text-[10px] font-bold font-iran-sans text-muted-foreground hover:text-success-500 transition-colors">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>({comment.likes})</span>
                  </button>
                  <button className="flex items-center gap-1 text-[10px] font-bold font-iran-sans text-muted-foreground hover:text-destructive transition-colors">
                    <ThumbsDown className="h-3.5 w-3.5" />
                    <span>({comment.dislikes})</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <span className="text-xs text-muted-foreground font-iran-sans py-4">هیچ دیدگاهی برای این کالا ثبت نشده است. اولین نفری باشید که نظر خود را ثبت می‌کند!</span>
        )}
      </div>

    </div>
  );
}

import { showToast } from '@/core/utils/toast';