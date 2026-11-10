// src/components/features/Product/components/ProductCommentsSection.tsx
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  User,
  MessageSquare,
  ArrowLeft,
  Clock,
  Package,
  ChevronLeft,
} from 'lucide-react';
import { useGetProductComments, useGetProductCommentsAverage } from '@/domains/front/product/hooks/product.hooks';
import { useCreateComment, useLikeComment, useUnlikeComment } from '@/domains/front/comment/hooks/comment.hooks';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { useRequireAuth } from '@/domains/auth/hooks/useRequireAuth';
import { Button } from '@/components/primitives/Button/Button';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/composites/Modal/Modal';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { Checkbox } from '@/components/primitives/Checkbox/Checkbox';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';
import { showToast } from '@/core/utils/toast';

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
  const searchParams = useSearchParams();
  const { checkAuthAndRun, isCheckingAuth } = useRequireAuth();

  const [orderBy, setOrderBy] = React.useState('Newest');
  const [page, setPage] = React.useState(1);
  const [isWriteModalOpen, setIsWriteModalOpen] = React.useState(false);
  const [isAllCommentsModalOpen, setIsAllCommentsModalOpen] = React.useState(false);
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

  const [localComments, setLocalComments] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (commentsResponse?.items) {
      setLocalComments(commentsResponse.items);
    }
  }, [commentsResponse]);

  React.useEffect(() => {
    if (searchParams?.get('action') === 'write-comment') {
      setIsWriteModalOpen(true);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('action');
        window.history.replaceState(null, '', url.pathname + url.search);
      }
    }
  }, [searchParams]);

  const handleOpenWriteModal = () => {
    checkAuthAndRun(() => {
      setIsWriteModalOpen(true);
    }, 'write-comment');
  };

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
      unlikeComment.mutate(comment.id, { onError: () => setLocalComments(prev) });
    } else {
      likeComment.mutate(
        { productCommentId: comment.id, likeStatus: 'Like' },
        { onError: () => setLocalComments(prev) }
      );
    }
  };

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
      unlikeComment.mutate(comment.id, { onError: () => setLocalComments(prev) });
    } else {
      likeComment.mutate(
        { productCommentId: comment.id, likeStatus: 'Dislike' },
        { onError: () => setLocalComments(prev) }
      );
    }
  };

  // کارت نظر مینیمال بدون بردرهای ضخیم و رنگ‌های زائد
  const renderMinimalCommentCard = (comment: any) => {
    const authorName = comment.creator || comment.userName || 'کاربر یدکچی';
    const commentContent = comment.comment || comment.content || '';
    const likesCount = typeof comment.likes === 'object' ? comment.likes?.likes : comment.likes || 0;
    const dislikesCount = typeof comment.likes === 'object' ? comment.likes?.dislikes : comment.dislikes || 0;
    const displayDate = comment.createDateFormatted || comment.metadata?.timeAgo || '';

    return (
      <div key={comment.id} className="flex flex-col gap-2.5 py-4 border-b border-border/70 last:border-b-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="h-3 w-3" />
            </div>
            <span className="text-xs font-semibold text-foreground">{authorName}</span>
            {comment.isConfirmed === false && (
              <span className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-3xs text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                در حال بررسی
              </span>
            )}
          </div>
          {displayDate && (
            <span className="text-3xs text-muted-foreground">{toPersianDigits(displayDate)}</span>
          )}
        </div>

        <div className="flex items-center gap-1" dir="ltr">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-3 w-3',
                i < (comment.rate || 0)
                  ? 'fill-warning text-warning'
                  : 'text-border'
              )}
            />
          ))}
        </div>

        <p className="text-xs leading-relaxed text-foreground/90 text-justify">{commentContent}</p>

        {comment.userBoughtFrom && (
          <div className="inline-flex items-center gap-1 text-3xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span>خریدار این کالا از فروشگاه {comment.userBoughtFrom}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleLike(comment)}
            className={cn(
              'flex items-center gap-1 text-3xs font-medium transition-colors',
              comment.userLiked ? 'text-success font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{toPersianDigits(likesCount)}</span>
          </button>
          <button
            type="button"
            onClick={() => handleDislike(comment)}
            className={cn(
              'flex items-center gap-1 text-3xs font-medium transition-colors',
              comment.userDisLiked ? 'text-destructive font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            <span>{toPersianDigits(dislikesCount)}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6 flex w-full flex-col gap-6">
      {/* هدر بخش با عنوان و مشاهده همه */}
      <div className="flex items-center justify-between">
        <h3 className="text-title-sm md:text-base font-bold">امتیاز و نظرات کاربران</h3>
        {localComments.length > 0 && (
          <button
            type="button"
            onClick={() => setIsAllCommentsModalOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>مشاهده همه ({toPersianDigits(localComments.length)})</span>
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-10">
        {/* استایل کامل و اصلی سایدبار امتیاز و ستاره‌ها (بدون تغییر) */}
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
                isLoading={isCheckingAuth}
                onClick={handleOpenWriteModal}
                className="mt-2 flex h-10 w-full items-center gap-2 border-shop/40 text-xs font-bold text-shop hover:bg-shop/5"
              >
                <MessageSquare aria-hidden="true" className="h-4 w-4" />
                <span>دیدگاه خود را بنویسید</span>
              </Button>
            </div>
          ) : null}
        </div>

        {/* لیست مینیمال نظرات کاربران */}
        <div className="flex w-full flex-col gap-4 lg:col-span-7">
          <div className="flex items-center gap-4 overflow-x-auto border-b border-border/80 pb-3 py-1 scrollbar-none">
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
                  'shrink-0 border-b-2 pb-1 text-xs font-bold outline-none transition-colors',
                  orderBy === opt.value
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col">
            {isLoading ? (
              <span className="text-xs text-muted-foreground py-6">در حال بارگذاری دیدگاه‌ها...</span>
            ) : localComments.length > 0 ? (
              localComments.slice(0, 4).map((comment) => renderMinimalCommentCard(comment))
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 py-6">
                <span className="text-xs text-muted-foreground">
                  هیچ دیدگاهی برای این کالا ثبت نشده است. اولین نفری باشید که نظر خود را ثبت می‌کند!
                </span>
                <button
                  type="button"
                  onClick={handleOpenWriteModal}
                  disabled={isCheckingAuth}
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

      {/* ================= مودال مینیمال مشاهده تمام نظرات ================= */}
      <Modal
        isOpen={isAllCommentsModalOpen}
        onClose={() => setIsAllCommentsModalOpen(false)}
        size="lg"
      >
        <ModalHeader onClose={() => setIsAllCommentsModalOpen(false)}>
          <ModalTitle>تمام نظرات کاربران ({toPersianDigits(localComments.length)})</ModalTitle>
        </ModalHeader>
        <ModalBody className="p-4 md:p-6 divide-y divide-border/60">
          {localComments.map((comment) => renderMinimalCommentCard(comment))}
        </ModalBody>
      </Modal>

      {/* ================= مودال مینیمال ثبت دیدگاه جدید ================= */}
      <Modal isOpen={isWriteModalOpen} onClose={() => setIsWriteModalOpen(false)} size="sm">
        <ModalHeader onClose={() => setIsWriteModalOpen(false)}>
          <ModalTitle>ثبت دیدگاه جدید</ModalTitle>
        </ModalHeader>

        <ModalBody className="p-4 md:p-5">
          <form id="comment-form" onSubmit={handleCommentSubmit} className="flex w-full flex-col gap-4">
            {/* پیش‌نمایش مینیمال کالا */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/20">
              <div className="w-12 h-12 rounded-lg border border-border bg-card p-1 flex items-center justify-center shrink-0">
                {productImage ? (
                  <img src={getFullUrl(productImage)} alt={productTitle} className="w-full h-full object-contain" />
                ) : (
                  <Package className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-3xs text-muted-foreground">کالای انتخابی</span>
                <span className="text-xs font-semibold text-foreground truncate">{productTitle}</span>
              </div>
            </div>

            {/* ستاره‌ها */}
            <div className="flex flex-col items-center justify-center gap-1 py-1 text-center">
              <span className="text-xs font-medium text-muted-foreground">امتیاز شما به کالا *</span>
              <div className="flex items-center gap-2" dir="ltr">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isHighlighted = (hoverRate || rate) >= starValue;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onMouseEnter={() => setHoverRate(starValue)}
                      onMouseLeave={() => setHoverRate(0)}
                      onClick={() => setRate(starValue)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={cn(
                          'h-6 w-6',
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
              label="متن دیدگاه *"
              placeholder="تجربه و نظر خود درباره کیفیت، اصالت یا بسته‌بندی این کالا را بنویسید..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="h-28 text-xs leading-relaxed"
              required
            />

            {/* ارسال ناشناس */}
            <div className="flex items-start gap-2.5 pt-1 select-none">
              <Checkbox checked={isIncognito} onChange={(checked) => setIsIncognito(checked)} />
              <div>
                <span className="block text-xs font-medium text-foreground">ارسال به صورت ناشناس</span>
                <span className="text-3xs text-muted-foreground">نام شما در صفحه کالا نمایش داده نخواهد شد.</span>
              </div>
            </div>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsWriteModalOpen(false)}
            className="h-10 flex-1 text-xs font-bold rounded-lg"
          >
            انصراف
          </Button>
          <Button
            type="submit"
            form="comment-form"
            variant="primary"
            isLoading={createComment.isPending}
            className="h-10 flex-1 text-xs font-bold rounded-lg"
          >
            ثبت دیدگاه
          </Button>
        </ModalFooter>
      </Modal>

      {/* مودال مینیمال موفقیت */}
      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} size="xs">
        <ModalBody className="flex flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center bg-muted text-foreground">
            <Star className="h-6 w-6 fill-warning text-warning" />
          </div>
          <h4 className="text-sm font-bold text-foreground">{userName} عزیز، نظر شما ثبت شد</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            دیدگاه شما پس از بررسی پشتیبانی در این بخش نمایش داده خواهد شد.
          </p>
          <Button
            variant="primary"
            onClick={() => setIsSuccessModalOpen(false)}
            className="mt-2 h-9 px-6 text-xs font-bold rounded-lg"
          >
            متوجه شدم
          </Button>
        </ModalBody>
      </Modal>
    </div>
  );
}