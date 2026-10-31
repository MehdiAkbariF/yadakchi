'use client';

import * as React from 'react';
import { User, MessageSquare, ThumbsUp, ThumbsDown, HelpCircle, ArrowLeft, Clock, Package } from 'lucide-react';
import { useGetProductInquiries } from '@/domains/front/product/hooks/product.hooks';
import { useCreateInquiry, useLikeInquiry, useUnlikeInquiry } from '@/domains/front/inquiry/hooks/inquiry.hooks';
import { Button } from '@/components/primitives/Button/Button';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { cn } from '@/design-system/utils/cn';
import { showToast } from '@/core/utils/toast';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';

export interface ProductInquiriesSectionProps {
  productId: string;
  productTitle?: string;
  productImage?: string | null;
}

export function ProductInquiriesSection({
  productId,
  productTitle = 'قطعه انتخابی',
  productImage,
}: ProductInquiriesSectionProps) {
  const [orderBy, setOrderBy] = React.useState('Latest');
  const [page, setPage] = React.useState(1);
  const [isWriteModalOpen, setIsWriteModalOpen] = React.useState(false);
  const [inquiryText, setInquiryText] = React.useState('');

  const { data: inquiriesResponse, isLoading } = useGetProductInquiries(productId, orderBy, page);
  const createInquiry = useCreateInquiry();
  const likeInquiry = useLikeInquiry();
  const unlikeInquiry = useUnlikeInquiry();

  // استیت محلی برای لایک آنی
  const [localInquiries, setLocalInquiries] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (inquiriesResponse?.items) {
      setLocalInquiries(inquiriesResponse.items);
    }
  }, [inquiriesResponse]);

  const handleInquirySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inquiryText.trim().length < 5) {
      showToast.error('متن پرسش شما باید حداقل ۵ کاراکتر باشد');
      return;
    }
    try {
      await createInquiry.mutateAsync({ productId, comment: inquiryText.trim() });
      showToast.success('پرسش شما ثبت شد و پس از بررسی منتشر خواهد شد');
      setInquiryText('');
      setIsWriteModalOpen(false);
    } catch (error: any) {
      showToast.error(error?.userMessage || 'خطا در ثبت پرسش شما');
    }
  };

  // لایک آنی پرسش
  const handleLike = (inquiry: any) => {
    const prev = [...localInquiries];
    const isLiked = !!inquiry.userLiked;
    const isDisliked = !!inquiry.userDisLiked;

    setLocalInquiries((list) =>
      list.map((q) => {
        if (q.id !== inquiry.id) return q;
        const curLikes = typeof q.likes === 'object' ? q.likes?.likes : q.likes || 0;
        const curDislikes = typeof q.likes === 'object' ? q.likes?.dislikes : q.dislikes || 0;

        if (isLiked) {
          return { ...q, userLiked: false, likes: Math.max(0, curLikes - 1) };
        } else {
          return {
            ...q,
            userLiked: true,
            userDisLiked: false,
            likes: curLikes + 1,
            dislikes: isDisliked ? Math.max(0, curDislikes - 1) : curDislikes,
          };
        }
      })
    );

    if (isLiked) {
      unlikeInquiry.mutate(inquiry.id, {
        onError: () => setLocalInquiries(prev),
      });
    } else {
      likeInquiry.mutate(
        { productInquiryId: inquiry.id, likeStatus: 'Like' },
        { onError: () => setLocalInquiries(prev) }
      );
    }
  };

  // دیس‌لایک آنی پرسش
  const handleDislike = (inquiry: any) => {
    const prev = [...localInquiries];
    const isLiked = !!inquiry.userLiked;
    const isDisliked = !!inquiry.userDisLiked;

    setLocalInquiries((list) =>
      list.map((q) => {
        if (q.id !== inquiry.id) return q;
        const curLikes = typeof q.likes === 'object' ? q.likes?.likes : q.likes || 0;
        const curDislikes = typeof q.likes === 'object' ? q.likes?.dislikes : q.dislikes || 0;

        if (isDisliked) {
          return { ...q, userDisLiked: false, dislikes: Math.max(0, curDislikes - 1) };
        } else {
          return {
            ...q,
            userDisLiked: true,
            userLiked: false,
            dislikes: curDislikes + 1,
            likes: isLiked ? Math.max(0, curLikes - 1) : curLikes,
          };
        }
      })
    );

    if (isDisliked) {
      unlikeInquiry.mutate(inquiry.id, {
        onError: () => setLocalInquiries(prev),
      });
    } else {
      likeInquiry.mutate(
        { productInquiryId: inquiry.id, likeStatus: 'Dislike' },
        { onError: () => setLocalInquiries(prev) }
      );
    }
  };

  return (
    <div className="mt-6 flex w-full flex-col gap-6 pb-12">
      <h3 className="text-sm font-bold text-foreground md:text-base">پرسش‌ها و پاسخ‌ها</h3>

      <div className="flex flex-col items-center justify-between gap-4 border-b border-border pb-3 md:flex-row">
        <div className="flex items-center gap-4 overflow-x-auto py-1 scrollbar-none">
          <span className="shrink-0 text-xs font-bold text-muted-foreground">نمایش بر اساس:</span>
          {[
            { value: 'Latest', label: 'جدیدترین' },
            { value: 'Oldest', label: 'قدیمی‌ترین' },
            { value: 'MostPopular', label: 'مفیدترین' },
            { value: 'MostReplied', label: 'بیشترین پاسخ' },
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

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsWriteModalOpen(true)}
          className="flex h-9 shrink-0 items-center gap-2 border-shop/40 text-xs font-bold text-shop hover:bg-shop/5"
        >
          <MessageSquare aria-hidden="true" className="h-4 w-4" />
          <span>شما هم سوال خود را بپرسید</span>
        </Button>
      </div>

      <div className="flex flex-col gap-5">
        {isLoading ? (
          <span className="text-xs text-muted-foreground">در حال بارگذاری پرسش‌ها...</span>
        ) : localInquiries.length > 0 ? (
          localInquiries.map((inquiry: any) => {
            const author = inquiry.creator || inquiry.userName || inquiry.user?.displayName || 'کاربر یدکچی';
            const inquiryContent = inquiry.comment || inquiry.content || '';
            const likesCount = typeof inquiry.likes === 'object' ? inquiry.likes?.likes : inquiry.likes || 0;
            const dislikesCount = typeof inquiry.likes === 'object' ? inquiry.likes?.dislikes : inquiry.dislikes || 0;
            const displayDate = inquiry.createDateFormatted || inquiry.metadata?.timeAgo || '';

            return (
              <div key={inquiry.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
                <div className="flex w-full items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                    <User aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{author}</span>
                        {inquiry.isConfirmed === false && (
                          <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-1 text-2xs font-bold text-warning">
                            <Clock aria-hidden="true" className="h-3 w-3" />
                            در حال بررسی
                          </span>
                        )}
                      </div>
                      {displayDate && (
                        <span className="text-2xs text-muted-foreground">{toPersianDigits(displayDate)}</span>
                      )}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-foreground">{inquiryContent}</p>
                  </div>
                </div>

                {inquiry.bestReply && (
                  <div className="me-6 flex gap-3 rounded-e-xl border-s-2 border-primary bg-accent/50 p-4 md:me-10">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-accent">
                      <User aria-hidden="true" className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-bold text-primary">
                          {inquiry.bestReply.creator || inquiry.bestReply.userName || 'پشتیبان'} (پاسخ برتر)
                        </span>
                        <span className="text-2xs text-muted-foreground">
                          {inquiry.bestReply.createDateFormatted || ''}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {inquiry.bestReply.comment || inquiry.bestReply.content}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-4 border-t border-dashed border-border pt-3">
                  <button
                    type="button"
                    onClick={() => handleLike(inquiry)}
                    className={cn(
                      'flex items-center gap-1.5 text-2xs font-bold transition-all active:scale-90',
                      inquiry.userLiked ? 'text-success' : 'text-muted-foreground hover:text-success'
                    )}
                  >
                    <ThumbsUp aria-hidden="true" className="h-4 w-4" />
                    <span>({toPersianDigits(likesCount)})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDislike(inquiry)}
                    className={cn(
                      'flex items-center gap-1.5 text-2xs font-bold transition-all active:scale-90',
                      inquiry.userDisLiked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
                    )}
                  >
                    <ThumbsDown aria-hidden="true" className="h-4 w-4" />
                    <span>({toPersianDigits(dislikesCount)})</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span className="text-xs text-muted-foreground">
              هیچ پرسشی برای این کالا ثبت نشده است. اولین سوال خود را بپرسید!
            </span>
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(true)}
              className="flex shrink-0 items-center gap-1 text-xs font-bold text-shop outline-none hover:underline"
            >
              <span>ثبت پرسش</span>
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* مودال ثبت سوال با نمایش مشخصات محصول */}
      <Modal isOpen={isWriteModalOpen} onClose={() => setIsWriteModalOpen(false)} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsWriteModalOpen(false)}>
          <ModalTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
            <HelpCircle aria-hidden="true" className="h-4 w-4 text-primary" />
            شما هم سوال خودتون رو بپرسید
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="p-5 pt-4">
          <form onSubmit={handleInquirySubmit} className="flex w-full flex-col gap-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border">
              <div className="w-16 h-16 rounded-xl border border-border bg-card p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                {productImage ? (
                  <img
                    src={getFullUrl(productImage)}
                    alt={productTitle}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Package className="w-7 h-7 text-muted-foreground" />
                )}
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-2xs font-bold text-muted-foreground">پرسش درباره کالا:</span>
                <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-2">
                  {productTitle}
                </h4>
              </div>
            </div>

            <TextArea
              label="متن پرسش شما *"
              placeholder="پرسش خود را درباره تطابق با خودرو، کارکرد یا مشخصات قطعه بنویسید..."
              value={inquiryText}
              onChange={(e) => setInquiryText(e.target.value)}
              className="h-28 text-xs leading-relaxed"
              required
            />
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
            isLoading={createInquiry.isPending}
            className="h-10 flex-1 text-xs font-bold"
            onClick={() => handleInquirySubmit()}
          >
            ثبت پرسش نهایی
          </Button>
        </div>
      </Modal>
    </div>
  );
}