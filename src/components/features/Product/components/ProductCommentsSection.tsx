'use client';

import * as React from 'react';
import { Star, ThumbsUp, ThumbsDown, User, MessageSquare, ArrowLeft, Clock } from 'lucide-react';
import { useGetProductComments, useGetProductCommentsAverage } from '@/domains/front/product/hooks/product.hooks';
import { useCreateComment, useLikeComment, useUnlikeComment } from '@/domains/front/comment/hooks/comment.hooks';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { Button } from '@/components/primitives/Button/Button';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { Checkbox } from '@/components/primitives/Checkbox/Checkbox';
import { toPersianDigits } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';
import { showToast } from '@/core/utils/toast';

function LottiePlayer({ path, className = 'w-48 h-48', loop = true }: { path: string; className?: string; loop?: boolean }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let anim: any = null;
    let isMounted = true;

    const init = async () => {
      try {
        const altPath = path.includes('/anumations/')
          ? path.replace('/anumations/', '/animations/')
          : path.replace('/animations/', '/anumations/');
        let animationData: any = null;
        for (const p of [path, altPath]) {
          try {
            const res = await fetch(p);
            if (res.ok) {
              animationData = await res.json();
              break;
            }
          } catch {}
        }
        if (!animationData || !isMounted || !containerRef.current) return;
        const lottieModule = await import('lottie-web');
        const lottie = lottieModule.default || lottieModule;
        if (containerRef.current && isMounted) {
          anim = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay: true,
            animationData,
          });
        }
      } catch {}
    };

    init();
    return () => {
      isMounted = false;
      anim?.destroy();
    };
  }, [path, loop]);

  return <div ref={containerRef} className={className} />;
}

export interface ProductCommentsSectionProps {
  productId: string;
  productTitle?: string;
}

export function ProductCommentsSection({ productId, productTitle = 'قطعه یدکی' }: ProductCommentsSectionProps) {
  const [orderBy, setOrderBy] = React.useState('Newest');
  const [page, setPage] = React.useState(1);
  const [isWriteModalOpen, setIsWriteModalOpen] = React.useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);

  const { user } = useAuth();
  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'کاربر';

  const [rate, setRate] = React.useState(0);
  const [hoverRate, setHoverRate] = React.useState(0);
  const [commentText, setCommentText] = React.useState('');
  const [isIncognito, setIsIncognito] = React.useState(false);

  const { data: average } = useGetProductCommentsAverage(productId);
  const { data: commentsResponse, isLoading } = useGetProductComments(productId, orderBy, page);
  const createComment = useCreateComment();
  const likeComment = useLikeComment();
  const unlikeComment = useUnlikeComment();

  const comments = commentsResponse?.items || [];

  const handleCommentSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (rate === 0) {
      showToast.error('لطفاً امتیاز خود به این کالا را انتخاب کنید');
      return;
    }
    if (commentText.trim().length < 10) {
      showToast.error('متن نظر شما باید حداقل ۱۰ کاراکتر باشد');
      return;
    }
    try {
      await createComment.mutateAsync({ productId, comment: commentText, rate, isIncognito });
      setRate(0);
      setCommentText('');
      setIsIncognito(false);
      setIsWriteModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      showToast.error(error.userMessage || 'خطا در ثبت دیدگاه شما');
    }
  };

  const handleLike = (comment: any) => {
    if (comment.userLiked) unlikeComment.mutate(comment.id);
    else likeComment.mutate({ productCommentId: comment.id, likeStatus: 'Like' });
  };

  const handleDislike = (comment: any) => {
    if (comment.userDisLiked) unlikeComment.mutate(comment.id);
    else likeComment.mutate({ productCommentId: comment.id, likeStatus: 'Dislike' });
  };

  return (
    <div className="mt-6 flex w-full flex-col gap-6">
      <h3 className="text-sm font-bold text-foreground md:text-base">امتیاز و نظرات کاربران</h3>

      <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-10">
        <div className="flex w-full flex-col gap-5 rounded-lg border border-border bg-card p-5 shadow-xs lg:sticky lg:top-[196px] lg:col-span-3">
          {average ? (
            <div className="flex w-full flex-col items-center gap-5">
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <span className="text-4xl font-bold text-foreground">
                  {toPersianDigits(average.averageRate.toFixed(1))}
                </span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      className={cn(
                        'h-4 w-4 shrink-0',
                        i < Math.round(average.averageRate)
                          ? 'fill-warning text-warning'
                          : 'text-border'
                      )}
                    />
                  ))}
                </div>
                <span className="mt-1 text-2xs font-bold text-muted-foreground">
                  از {toPersianDigits(average.allRatesCount)} امتیاز ثبت شده
                </span>
              </div>

              <div className="flex w-full flex-col gap-2.5 border-t border-dashed border-border pt-4">
                {[
                  { label: '۵ ستاره', value: average.starPercentages.five },
                  { label: '۴ ستاره', value: average.starPercentages.four },
                  { label: '۳ ستاره', value: average.starPercentages.three },
                  { label: '۲ ستاره', value: average.starPercentages.two },
                  { label: '۱ ستاره', value: average.starPercentages.one },
                ].map((star, idx) => (
                  <div key={idx} className="flex w-full items-center gap-3.5 text-xs text-muted-foreground">
                    <span className="w-11 shrink-0 font-bold">{star.label}</span>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        style={{ width: `${star.value}%` }}
                        className="absolute inset-y-0 end-0 rounded-full bg-warning"
                      />
                    </div>
                    <span className="w-8 shrink-0 font-bold">{toPersianDigits(star.value)}%</span>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWriteModalOpen(true)}
                className="mt-2 flex h-10 w-full items-center gap-1.5 border-shop/40 text-xs font-bold text-shop hover:bg-shop/5"
              >
                <MessageSquare aria-hidden="true" className="h-4 w-4" />
                <span>دیدگاه خود را بنویسید</span>
              </Button>
            </div>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-4 lg:col-span-7">
          <div className="flex items-center gap-4 overflow-x-auto border-b border-dashed border-border pb-2.5 py-1 scrollbar-none">
            <span className="shrink-0 text-xs font-bold text-muted-foreground">نمایش بر اساس:</span>
            {[
              { value: 'Newest', label: 'جدیدترین‌ها' },
              { value: 'Oldest', label: 'قدیمی‌ترین‌ها' },
              { value: 'MostLike', label: 'مفیدترین‌ها' },
              { value: 'LeastLike', label: 'کمترین امتیاز' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setOrderBy(opt.value);
                  setPage(1);
                }}
                className={cn(
                  'shrink-0 border-b-2 pb-1 text-xs font-bold outline-none',
                  orderBy === opt.value
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {isLoading ? (
              <span className="text-xs text-muted-foreground">در حال لود دیدگاه‌ها...</span>
            ) : comments.length > 0 ? (
              comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-4 rounded-md border border-border bg-card p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                    <User aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{comment.creator}</span>
                        {(comment as any).isConfirmed === false ? (
                          <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-2xs font-bold text-warning">
                            <Clock aria-hidden="true" className="h-3 w-3" />
                            در حال بررسی
                          </span>
                        ) : null}
                      </div>
                      <span className="text-2xs text-muted-foreground">
                        {toPersianDigits(comment.createDateFormatted)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          aria-hidden="true"
                          className={cn(
                            'h-3 w-3 shrink-0',
                            i < comment.rate ? 'fill-warning text-warning' : 'text-border'
                          )}
                        />
                      ))}
                    </div>

                    <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{comment.comment}</p>

                    {comment.userBoughtFrom ? (
                      <span className="mt-3 inline-block rounded-full bg-success/10 px-2.5 py-0.5 text-2xs font-bold text-success">
                        خریدار این کالا از فروشگاه {comment.userBoughtFrom}
                      </span>
                    ) : null}

                    <div className="mt-4 flex items-center justify-end gap-4 border-t border-dashed border-border pt-2.5">
                      <button
                        type="button"
                        onClick={() => handleLike(comment)}
                        disabled={likeComment.isPending || unlikeComment.isPending}
                        className={cn(
                          'flex items-center gap-1 text-2xs font-bold transition-colors',
                          comment.userLiked ? 'text-success' : 'text-muted-foreground hover:text-success'
                        )}
                      >
                        <ThumbsUp aria-hidden="true" className="h-3.5 w-3.5" />
                        <span>({toPersianDigits(comment.likes)})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDislike(comment)}
                        disabled={likeComment.isPending || unlikeComment.isPending}
                        className={cn(
                          'flex items-center gap-1 text-2xs font-bold transition-colors',
                          comment.userDisLiked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
                        )}
                      >
                        <ThumbsDown aria-hidden="true" className="h-3.5 w-3.5" />
                        <span>({toPersianDigits(comment.dislikes)})</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 py-4">
                <span className="text-xs text-muted-foreground">
                  هیچ دیدگاهی برای این کالا ثبت نشده است. اولین نفری باشید که نظر خود را ثبت می‌کند!
                </span>
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(true)}
                  className="flex shrink-0 items-center gap-1 text-xs font-bold text-shop outline-none hover:underline"
                >
                  <span>ثبت دیدگاه</span>
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isWriteModalOpen} onClose={() => setIsWriteModalOpen(false)} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsWriteModalOpen(false)}>
          <ModalTitle className="text-sm font-bold text-foreground">ثبت دیدگاه جدید</ModalTitle>
        </ModalHeader>

        <ModalBody className="p-5 pt-4">
          <form onSubmit={handleCommentSubmit} className="flex w-full flex-col gap-4">
            <div className="flex w-full flex-col gap-1 border-b border-border pb-3">
              <span className="text-2xs font-bold text-muted-foreground">نام کالا:</span>
              <span className="text-xs font-bold leading-relaxed text-foreground">
                {toPersianDigits(productTitle)}
              </span>
            </div>

            <div className="flex w-full flex-col items-center justify-center gap-2 border-b border-dashed border-border py-2 text-center">
              <span className="text-xs font-bold text-muted-foreground">امتیاز شما به کالا *</span>
              <div className="mt-1 flex items-center gap-1.5" dir="ltr">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isHighlighted = (hoverRate || rate) >= starValue;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onMouseEnter={() => setHoverRate(starValue)}
                      onMouseLeave={() => setHoverRate(0)}
                      onClick={() => setRate(starValue)}
                      aria-label={`${starValue} ستاره`}
                      className="p-1 outline-none"
                    >
                      <Star
                        aria-hidden="true"
                        className={cn(
                          'h-7 w-7 shrink-0',
                          isHighlighted ? 'fill-warning text-warning' : 'text-border'
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <TextArea
              label="متن نظر *"
              placeholder="نظر خود را در مورد این کالا به اشتراک بگذارید..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="h-28 text-xs"
              required
            />

            <div className="mt-1 flex w-full items-start gap-2.5 border-t border-dashed border-border pt-4 select-none">
              <Checkbox checked={isIncognito} onChange={(checked) => setIsIncognito(checked)} />
              <div>
                <span className="block text-xs font-bold text-foreground">ارسال به صورت ناشناس</span>
                <span className="mt-0.5 block text-2xs text-muted-foreground">
                  در صورت فعال‌سازی، نام شما به کاربران نمایش داده نخواهد شد.
                </span>
              </div>
            </div>
          </form>
        </ModalBody>

        <div className="flex w-full shrink-0 flex-row gap-2.5 border-t border-border p-5 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsWriteModalOpen(false)}
            className="h-10 flex-1 text-xs font-bold"
          >
            انصراف
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={createComment.isPending}
            className="h-10 flex-1 text-xs font-bold"
            onClick={() => handleCommentSubmit()}
          >
            ثبت نظر نهایی
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} className="w-full max-w-md">
        <ModalBody className="flex flex-col items-center justify-center gap-3 p-6 text-center">
          <LottiePlayer path="/anumations/Rate-cong.json" className="mx-auto h-72 w-72 max-w-full" loop={false} />

          <h4 className="text-base font-bold leading-relaxed text-foreground">
            {userName} عزیز، از ارسال نظر شما ممنونیم
          </h4>

          <p className="text-xs font-bold text-shop">با نوشتن این نظر به بقیه هم کمک بزرگی کردی</p>

          <p className="mx-auto max-w-xs text-xs leading-relaxed text-muted-foreground">
            نظر شما ثبت شد و پس از بررسی و تایید پشتیبانی، برای دیگران هم به اشتراک گذاشته می‌شود.
          </p>

          <Button
            variant="primary"
            onClick={() => setIsSuccessModalOpen(false)}
            className="mt-3 h-8 px-4 text-2xs font-bold shadow-xs"
          >
            متوجه شدم
          </Button>
        </ModalBody>
      </Modal>
    </div>
  );
}
