'use client';

import { useState } from 'react';
import { useGetProductComments, useGetProductCommentsAverage } from '@/domains/front/product/hooks/product.hooks';
import { useCreateComment } from '@/domains/front/comment/hooks/comment.hooks';
import { Star, ThumbsUp, ThumbsDown, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/primitives/Button/Button';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { Checkbox } from '@/components/primitives/Checkbox/Checkbox';
import { toPersianDigits } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';
import { showToast } from '@/core/utils/toast';

interface ProductCommentsSectionProps {
  productId: string;
  productTitle?: string;
}

export function ProductCommentsSection({ productId, productTitle = 'قطعه یدکی' }: ProductCommentsSectionProps) {
  const [orderBy, setOrderBy] = useState('Newest');
  const [page, setPage] = useState(1);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  const [rate, setRate] = useState(0);
  const [hoverRate, setHoverRate] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isIncognito, setIsIncognito] = useState(false);

  const { data: average } = useGetProductCommentsAverage(productId);
  const { data: commentsResponse, isLoading } = useGetProductComments(productId, orderBy, page);
  const createComment = useCreateComment();

  const comments = commentsResponse?.items || [];

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rate === 0) {
      showToast.error('لطفاً امتیاز خود به این کالا را انتخاب کنید');
      return;
    }

    if (commentText.trim().length < 10) {
      showToast.error('متن نظر شما باید حداقل ۱۰ کاراکتر باشد');
      return;
    }

    try {
      await createComment.mutateAsync({
        productId,
        comment: commentText,
        rate,
        isIncognito,
      });

      showToast.success('دیدگاه ارزشمند شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد');
      setRate(0);
      setCommentText('');
      setIsIncognito(false);
      setIsWriteModalOpen(false);
    } catch (error: any) {
      showToast.error(error.userMessage || 'خطا در ثبت دیدگاه شما');
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-right mt-6">
      <h3 className="text-sm md:text-base font-bold font-iran-yekan text-foreground">امتیاز و نظرات کاربران</h3>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start w-full">
        
        <div className="lg:col-span-3 flex flex-col gap-5 lg:sticky lg:top-[196px] w-full bg-background border rounded-2xl p-5 shadow-sm">
          {average && (
            <div className="flex flex-col gap-5 items-center w-full">
              <div className="flex flex-col items-center justify-center text-center gap-2">
                <span className="text-4xl font-black text-foreground font-iran-sans">{toPersianDigits(average.averageRate.toFixed(1))}</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "h-4.5 w-4.5 shrink-0", 
                        i < Math.round(average.averageRate) ? "fill-yellow-400 text-yellow-400" : "text-zinc-200 dark:text-zinc-800"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground font-iran-sans mt-1">از {toPersianDigits(average.allRatesCount)} امتیاز ثبت شده</span>
              </div>

              <div className="w-full flex flex-col gap-2.5 border-t border-dashed pt-4">
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
                    <span className="w-8 shrink-0 text-left font-bold">{toPersianDigits(star.value)}%</span>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWriteModalOpen(true)}
                className="rounded-xl text-xs font-bold font-iran-sans h-10 border-primary/20 text-primary hover:bg-primary/5 flex items-center gap-1.5 w-full mt-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>دیدگاه خود را بنویسید</span>
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4 w-full">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1 border-b border-dashed pb-2.5">
            <span className="text-xs font-bold text-muted-foreground font-iran-sans shrink-0">نمایش بر اساس:</span>
            {[
              { value: 'Newest', label: 'جدیدترین‌ها' },
              { value: 'Oldest', label: 'قدیمی‌ترین‌ها' },
              { value: 'MostLike', label: 'مفیدترین‌ها' },
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
                      <span className="text-[10px] text-muted-foreground font-iran-sans">{toPersianDigits(comment.createDateFormatted)}</span>
                    </div>
                    
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
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
                      <span className="text-[9px] font-bold text-success-500 bg-success-50 dark:bg-success-950/20 px-2.5 py-0.5 rounded-full inline-block mt-3 font-iran-sans">
                        خریدار این کالا از فروشگاه {comment.userBoughtFrom}
                      </span>
                    )}

                    <div className="flex items-center gap-4 justify-end mt-4 border-t border-dashed pt-2.5">
                      <button className="flex items-center gap-1 text-[10px] font-bold font-iran-sans text-muted-foreground hover:text-success-500 transition-colors">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>({toPersianDigits(comment.likes)})</span>
                      </button>
                      <button className="flex items-center gap-1 text-[10px] font-bold font-iran-sans text-muted-foreground hover:text-destructive transition-colors">
                        <ThumbsDown className="h-3.5 w-3.5" />
                        <span>({toPersianDigits(comment.dislikes)})</span>
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

      </div>

 <Modal isOpen={isWriteModalOpen} onClose={() => setIsWriteModalOpen(false)} className="max-w-md w-full">
  <ModalHeader onClose={() => setIsWriteModalOpen(false)}>
    <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right">
      ثبت دیدگاه جدید
    </ModalTitle>
  </ModalHeader>
  
  <ModalBody className="p-5 pt-4 text-right">
    <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4 w-full text-right">
      
      <div className="flex flex-col gap-1 w-full border-b pb-3">
        <span className="text-[10px] font-bold text-muted-foreground font-iran-sans">نام کالا:</span>
        <span className="text-xs font-bold text-foreground font-iran-sans leading-relaxed">{toPersianDigits(productTitle)}</span>
      </div>

      <div className="flex flex-col gap-2 items-center justify-center text-center py-2 border-b border-dashed w-full">
        <span className="text-xs font-bold text-muted-foreground font-iran-sans">امتیاز شما به کالا *</span>
        <div className="flex items-center gap-1.5 mt-1" dir="ltr">
          {[1, 2, 3, 4, 5].map((starValue) => {
            const isHighlighted = (hoverRate || rate) >= starValue;
            return (
              <button
                key={starValue}
                type="button"
                onMouseEnter={() => setHoverRate(starValue)}
                onMouseLeave={() => setHoverRate(0)}
                onClick={() => setRate(starValue)}
                className="p-1 hover:scale-110 transition-transform outline-none"
              >
                <Star 
                  className={cn(
                    "h-7 w-7 shrink-0", 
                    isHighlighted ? "fill-yellow-400 text-yellow-400" : "text-zinc-200 dark:text-zinc-800"
                  )} 
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full">
        <TextArea
          label="متن نظر *"
          placeholder="نظر خود را در مورد این کالا به اشتراک بگذارید..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="h-28 text-xs font-iran-sans"
          required
        />
      </div>

      <div className="flex items-start gap-2.5 w-full mt-1 border-t border-dashed pt-4 select-none">
        <Checkbox
          checked={isIncognito}
          onChange={(checked) => setIsIncognito(checked)}
        />
        <div className="">
          <span className="text-xs font-bold text-foreground font-iran-sans block">ارسال به صورت ناشناس</span>
          <span className="text-[10px] text-muted-foreground font-iran-sans block mt-0.5">در صورت فعال‌سازی، نام شما به کاربران نمایش داده نخواهد شد.</span>
        </div>
      </div>

    </form>
  </ModalBody>

  {/* فوتر با دکمه‌های تمام عرض */}
  <div className="flex flex-row gap-2.5 p-5 pt-4 border-t border-border/50 w-full shrink-0">
    <Button
      type="button"
      variant="outline"
      onClick={() => setIsWriteModalOpen(false)}
      className="flex-1 rounded-xl text-xs h-10 font-bold font-iran-sans"
    >
      انصراف
    </Button>
    <Button
      type="submit"
      variant="primary"
      isLoading={createComment.isPending}
      className="flex-1 rounded-xl text-xs h-10 font-bold font-iran-sans"
      onClick={handleCommentSubmit}
    >
      ثبت نظر نهایی
    </Button>
  </div>
</Modal>

    </div>
  );
}