'use client';

import * as React from 'react';
import { Star, ThumbsUp, ThumbsDown, User, MessageSquare, ArrowLeft, Clock, Package } from 'lucide-react';
import { useGetProductComments, useGetProductCommentsAverage } from '@/domains/front/product/hooks/product.hooks';
import { useCreateComment, useLikeComment, useUnlikeComment } from '@/domains/front/comment/hooks/comment.hooks';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { Button } from '@/components/primitives/Button/Button';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { Checkbox } from '@/components/primitives/Checkbox/Checkbox';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';
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
  productImage?: string | null;
}

export function ProductCommentsSection({
  productId,
  productTitle = 'قطعه انتخابی',
  productImage,
}: ProductCommentsSectionProps) {
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

  // استیت محلی برای آپدیت ۱۰۰٪ درجا و آنی لایک و دیس‌لایک
  const [localComments, setLocalComments] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (commentsResponse?.items) {
      setLocalComments(commentsResponse.items);
    }
  }, [commentsResponse]);

  const handleCommentSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (rate === 0) {
      showToast.error('لطفاً امتیاز خود به این کالا را انتخاب فرمایید');
      return;
    }
    if (commentText.trim().length < 10) {
      showToast.error('متن نظر شما باید حداقل ۱۰ کاراکتر باشد');
      return;
    }
    try {
      await createComment.mutateAsync({ productId, comment: commentText.trim(), rate, isIncognito });
      setRate(0);
      setCommentText('');
      setIsIncognito(false);
      setIsWriteModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      showToast.error(error?.userMessage || 'خطا در ثبت دیدگاه شما');
    }
  };

  // لایک درجا و بدون تاخیر
  const handleLike = (comment: any) => {
    const prev = [...localComments];
    const isLiked = !!comment.userLiked;
    const isDisliked = !!comment.userDisLiked;

    setLocalComments((list) =>
      list.map((c) => {
        if (c.id !== comment.id) return c;
        const curLikes = typeof c.likes === 'object' ? c.likes?.likes : c.likes || 0;
        const curDislikes = typeof c.likes === 'object' ? c.likes?.dislikes : c.dislikes || 0;

        if (isLiked) {
          return { ...c, userLiked: false, likes: Math.max(0, curLikes - 1) };
        } else {
          return {
            ...c,
            userLiked: true,
            userDisLiked: false,
            likes: curLikes + 1,
            dislikes: isDisliked ? Math.max(0, curDislikes - 1) : curDislikes,
          };
        }
      })
    );

    if (isLiked) {
      unlikeComment.mutate(comment.id, {
        onError: () => setLocalComments(prev),
      });
    } else {
      likeComment.mutate(
        { productCommentId: comment.id, likeStatus: 'Like' },
        { onError: () => setLocalComments(prev) }
      );
    }
  };

  // دیس‌لایک درجا و بدون تاخیر
  const handleDislike = (comment: any) => {
    const prev = [...localComments];
    const isLiked = !!comment.userLiked;
    const isDisliked = !!comment.userDisLiked;

    setLocalComments((list) =>
      list.map((c) => {
        if (c.id !== comment.id) return c;
        const curLikes = typeof c.likes === 'object' ? c.likes?.likes : c.likes || 0;
        const curDislikes = typeof c.likes === 'object' ? c.likes?.dislikes : c.dislikes || 0;

        if (isDisliked) {
          return { ...c, userDisLiked: false, dislikes: Math.max(0, curDislikes - 1) };
        } else {
          return {
            ...c,
            userDisLiked: true,
            userLiked: false,
            dislikes: curDislikes + 1,
            likes: isLiked ? Math.max(0, curLikes - 1) : curLikes,
          };
        }
      })
    );

    if (isDisliked) {
      unlikeComment.mutate(comment.id, {
        onError: () => setLocalComments(prev),
      });
    } else {
      likeComment.mutate(
        { productCommentId: comment.id, likeStatus: 'Dislike' },
        { onError: () => setLocalComments(prev) }
      );
    }
  };

  return (
    <div className="mt-6 flex w-full flex-col gap-6">
      <h3 className="text-title-sm md:text-base">امتیاز و نظرات کاربران</h3>

      <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-10">
        {/* سایدبار میانگین امتیاز */}
        <div className="flex w-full flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-xs lg:sticky lg:top-[12.25rem] lg:col-span-3">
          {average ? (
            <div className="flex w-full flex-col items-center gap-5">
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <span className="text-4xl font-bold text-foreground tabular-nums">
                  {toPersianDigits(average.averageRate.toFixed(1))}
                </span>
                <div className="flex items-center gap-1">
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
                <span className="mt-1 text-label-2xs">
                  از {toPersianDigits(average.allRatesCount)} امتیاز ثبت شده
                </span>
              </div>

              <div className="flex w-full flex-col gap-3 border-t border-dashed border-border pt-4">
                {[
                  { label: '۵ ستاره', value: average.starPercentages?.five || 0 },
                  { label: '۴ ستاره', value: average.starPercentages?.four || 0 },
                  { label: '۳ ستاره', value: average.starPercentages?.three || 0 },
                  { label: '۲ ستاره', value: average.starPercentages?.two || 0 },
                  { label: '۱ ستاره', value: average.starPercentages?.one || 0 },
                ].map((star, idx) => (
                  <div key={idx} className="flex w-full items-center gap-3 text-xs text-muted-foreground">
                    <span className="w-12 shrink-0 font-bold">{star.label}</span>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        style={{ width: `${star.value}%` }}
                        className="absolute inset-y-0 end-0 rounded-full bg-warning"
                      />
                    </div>
                    <span className="w-8 shrink-0 font-bold text-left tabular-nums">{toPersianDigits(star.value)}%</span>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWriteModalOpen(true)}
                className="mt-2 flex h-10 w-full items-center gap-2 border-shop/40 text-xs font-bold text-shop hover:bg-shop/5"
              >
                <MessageSquare aria-hidden="true" className="h-4 w-4" />
                <span>دیدگاه خود را بنویسید</span>
              </Button>
            </div>
          ) : null}
        </div>

        {/* لیست نظرات کاربران */}
        <div className="flex w-full flex-col gap-4 lg:col-span-7">
          <div className="flex items-center gap-4 overflow-x-auto border-b border-dashed border-border pb-3 py-1 scrollbar-none">
            <span className="shrink-0 text-label-muted">نمایش بر اساس:</span>
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
              <span className="text-xs text-muted-foreground">در حال بارگذاری دیدگاه‌ها...</span>
            ) : localComments.length > 0 ? (
              localComments.map((comment: any) => {
                const authorName = comment.creator || comment.userName || comment.user?.displayName || 'کاربر یدکچی';
                const commentContent = comment.comment || comment.content || '';
                const likesCount = typeof comment.likes === 'object' ? comment.likes?.likes : comment.likes || 0;
                const dislikesCount = typeof comment.likes === 'object' ? comment.likes?.dislikes : comment.dislikes || 0;
                const displayDate = comment.createDateFormatted || comment.metadata?.timeAgo || '';

                return (
                  <div key={comment.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                      <User aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-label">{authorName}</span>
                          {comment.isConfirmed === false && (
                            <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-1 text-2xs font-bold text-warning">
                              <Clock aria-hidden="true" className="h-3 w-3" />
                              در حال بررسی
                            </span>
                          )}
                        </div>
                        {displayDate && (
                          <span className="text-2xs text-muted-foreground">
                            {toPersianDigits(displayDate)}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            aria-hidden="true"
                            className={cn(
                              'h-3 w-3 shrink-0',
                              i < (comment.rate || 0) ? 'fill-warning text-warning' : 'text-border'
                            )}
                          />
                        ))}
                      </div>

                      <p className="mt-3 text-base leading-relaxed text-muted-foreground">{commentContent}</p>

                      {comment.userBoughtFrom && (
                        <span className="mt-3 inline-block rounded-full bg-success/10 px-3 py-1 text-2xs font-bold text-success">
                          خریدار این کالا از فروشگاه {comment.userBoughtFrom}
                        </span>
                      )}

                      <div className="mt-4 flex items-center justify-end gap-4 border-t border-dashed border-border pt-3">
                        <button
                          type="button"
                          onClick={() => handleLike(comment)}
                          className={cn(
                            'flex items-center gap-1 text-2xs font-bold transition-all active:scale-90',
                            comment.userLiked ? 'text-success' : 'text-muted-foreground hover:text-success'
                          )}
                        >
                          <ThumbsUp aria-hidden="true" className="h-4 w-4" />
                          <span>({toPersianDigits(likesCount)})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDislike(comment)}
                          className={cn(
                            'flex items-center gap-1 text-2xs font-bold transition-all active:scale-90',
                            comment.userDisLiked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
                          )}
                        >
                          <ThumbsDown aria-hidden="true" className="h-4 w-4" />
                          <span>({toPersianDigits(dislikesCount)})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
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

      {/* ================= مودال ثبت دیدگاه جدید با تصویر بزرگتر و نام کامل ================= */}
      <Modal isOpen={isWriteModalOpen} onClose={() => setIsWriteModalOpen(false)} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsWriteModalOpen(false)}>
          <ModalTitle className="text-title-sm">ثبت دیدگاه جدید</ModalTitle>
        </ModalHeader>

        <ModalBody className="p-5 pt-4">
          <form onSubmit={handleCommentSubmit} className="flex w-full flex-col gap-4">
            {/* سربرگ مشخصات محصول با عکس بزرگتر */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border">
              <div className="w-20 h-20 rounded-xl border border-border bg-card p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                {productImage ? (
                  <img
                    src={getFullUrl(productImage)}
                    alt={productTitle}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Package className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-label-2xs">نام کالا:</span>
                <h4 className="text-xs sm:text-title-sm leading-snug line-clamp-2">
                  {productTitle}
                </h4>
              </div>
            </div>

            {/* امتیازدهی ستاره‌ای */}
            <div className="flex w-full flex-col items-center justify-center gap-2 border-b border-dashed border-border py-2 text-center">
              <span className="text-label-muted">امتیاز شما به این کالا *</span>
              <div className="mt-1 flex items-center gap-2" dir="ltr">
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
                      className="p-1 outline-none transition-transform hover:scale-110 active:scale-95"
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

            {/* متن دیدگاه */}
            <TextArea
              label="متن نظر *"
              placeholder="تجربه و نظر خود درباره کیفیت، انطباق فنی، اصالت یا بسته‌بندی این کالا را بنویسید..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="h-28 text-xs leading-relaxed"
              required
            />

            {/* ارسال ناشناس */}
            <div className="mt-1 flex w-full items-start gap-3 border-t border-dashed border-border pt-4 select-none">
              <Checkbox checked={isIncognito} onChange={(checked) => setIsIncognito(checked)} />
              <div>
                <span className="block text-label">ارسال به صورت ناشناس</span>
                <span className="mt-1 block text-2xs text-muted-foreground">
                  در صورت فعال‌سازی، نام شما به سایر کاربران نمایش داده نخواهد شد.
                </span>
              </div>
            </div>
          </form>
        </ModalBody>

        <div className="flex w-full shrink-0 flex-row gap-3 border-t border-border p-5 pt-4">
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

      {/* مودال موفقیت */}
      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} className="w-full max-w-md">
        <ModalBody className="flex flex-col items-center justify-center gap-3 p-6 text-center">
          <LottiePlayer path="/anumations/Rate-cong.json" className="mx-auto h-72 w-72 max-w-full" loop={false} />

          <h4 className="text-base font-bold leading-relaxed text-foreground">
            {userName} عزیز، از ارسال نظر شما ممنونیم
          </h4>

          <p className="text-base font-medium text-shop">دیدگاه شما به سایر خریداران کمک شایانی خواهد کرد</p>

          <p className="mx-auto max-w-xs text-base leading-relaxed text-muted-foreground">
            دیدگاه شما پس از بررسی توسط تیم پشتیبانی، در صفحه محصول منتشر خواهد شد.
          </p>

          <Button
            variant="primary"
            onClick={() => setIsSuccessModalOpen(false)}
            className="mt-3 h-9 px-6 text-xs font-bold shadow-xs"
          >
            متوجه شدم
          </Button>
        </ModalBody>
      </Modal>
    </div>
  );
}