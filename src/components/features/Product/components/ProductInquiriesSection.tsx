// src/components/features/Product/components/ProductInquiriesSection.tsx
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  User,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  ArrowLeft,
  Clock,
  Package,
  ChevronLeft,
} from 'lucide-react';
import { useGetProductInquiries } from '@/domains/front/product/hooks/product.hooks';
import { useCreateInquiry, useLikeInquiry, useUnlikeInquiry } from '@/domains/front/inquiry/hooks/inquiry.hooks';
import { useRequireAuth } from '@/domains/auth/hooks/useRequireAuth';
import { Button } from '@/components/primitives/Button/Button';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/composites/Modal/Modal';
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
  const searchParams = useSearchParams();
  const { checkAuthAndRun, isCheckingAuth } = useRequireAuth();

  const [orderBy, setOrderBy] = React.useState('Latest');
  const [page, setPage] = React.useState(1);
  const [isWriteModalOpen, setIsWriteModalOpen] = React.useState(false);
  const [isAllInquiriesModalOpen, setIsAllInquiriesModalOpen] = React.useState(false);
  const [inquiryText, setInquiryText] = React.useState('');

  const { data: inquiriesResponse, isLoading } = useGetProductInquiries(productId, orderBy, page);
  const createInquiry = useCreateInquiry();
  const likeInquiry = useLikeInquiry();
  const unlikeInquiry = useUnlikeInquiry();

  const [localInquiries, setLocalInquiries] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (inquiriesResponse?.items) {
      setLocalInquiries(inquiriesResponse.items);
    }
  }, [inquiriesResponse]);

  React.useEffect(() => {
    if (searchParams?.get('action') === 'write-inquiry') {
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
    }, 'write-inquiry');
  };

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
      unlikeInquiry.mutate(inquiry.id, { onError: () => setLocalInquiries(prev) });
    } else {
      likeInquiry.mutate(
        { productInquiryId: inquiry.id, likeStatus: 'Like' },
        { onError: () => setLocalInquiries(prev) }
      );
    }
  };

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
      unlikeInquiry.mutate(inquiry.id, { onError: () => setLocalInquiries(prev) });
    } else {
      likeInquiry.mutate(
        { productInquiryId: inquiry.id, likeStatus: 'Dislike' },
        { onError: () => setLocalInquiries(prev) }
      );
    }
  };

  // کارت مینیمال پرسش و پاسخ
  const renderMinimalInquiryCard = (inquiry: any) => {
    const author = inquiry.creator || inquiry.userName || 'کاربر یدکچی';
    const inquiryContent = inquiry.comment || inquiry.content || '';
    const likesCount = typeof inquiry.likes === 'object' ? inquiry.likes?.likes : inquiry.likes || 0;
    const dislikesCount = typeof inquiry.likes === 'object' ? inquiry.likes?.dislikes : inquiry.dislikes || 0;
    const displayDate = inquiry.createDateFormatted || inquiry.metadata?.timeAgo || '';

    return (
      <div key={inquiry.id} className="flex flex-col gap-2.5 py-4 border-b border-border/70 last:border-b-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="h-3 w-3" />
            </div>
            <span className="text-xs font-semibold text-foreground">{author}</span>
            {inquiry.isConfirmed === false && (
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

        <p className="text-xs leading-relaxed text-foreground/90 text-justify">{inquiryContent}</p>

        {/* پاسخ برتر به صورت یک حاشیه ظریف مینیمال */}
        {inquiry.bestReply && (
          <div className="mr-2 border-r-2 border-foreground/30 pr-3 my-1">
            <div className="flex items-center justify-between">
              <span className="text-3xs font-bold text-foreground">
                {inquiry.bestReply.creator || 'پاسخ کارشناس یدکچی'}
              </span>
              <span className="text-3xs text-muted-foreground">
                {inquiry.bestReply.createDateFormatted || ''}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground mt-1">
              {inquiry.bestReply.comment || inquiry.bestReply.content}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleLike(inquiry)}
            className={cn(
              'flex items-center gap-1 text-3xs font-medium transition-colors',
              inquiry.userLiked ? 'text-success font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{toPersianDigits(likesCount)}</span>
          </button>
          <button
            type="button"
            onClick={() => handleDislike(inquiry)}
            className={cn(
              'flex items-center gap-1 text-3xs font-medium transition-colors',
              inquiry.userDisLiked ? 'text-destructive font-bold' : 'text-muted-foreground hover:text-foreground'
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
    <div className="mt-6 flex w-full flex-col gap-4 pb-8">
      {/* سربرگ بخش با مشاهده همه و دکمه پرسش */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-title-sm md:text-base font-bold">پرسش و پاسخ</h3>
          {localInquiries.length > 0 && (
            <button
              type="button"
              onClick={() => setIsAllInquiriesModalOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>مشاهده همه ({toPersianDigits(localInquiries.length)})</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          isLoading={isCheckingAuth}
          onClick={handleOpenWriteModal}
          className="flex h-8 items-center gap-1.5 text-xs font-bold rounded-lg border-shop/40 text-shop hover:bg-shop/5"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>طرح پرسش</span>
        </Button>
      </div>

      <div className="flex flex-col">
        {isLoading ? (
          <span className="text-xs text-muted-foreground py-6">در حال بارگذاری پرسش‌ها...</span>
        ) : localInquiries.length > 0 ? (
          localInquiries.slice(0, 4).map((inquiry) => renderMinimalInquiryCard(inquiry))
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 py-6">
            <span className="text-xs text-muted-foreground">
              پرسشی برای این کالا ثبت نشده است. اولین سوال خود را بپرسید!
            </span>
            <button
              type="button"
              onClick={handleOpenWriteModal}
              disabled={isCheckingAuth}
              className="flex shrink-0 items-center gap-1 text-xs font-bold text-shop outline-none hover:underline"
            >
              <span>ثبت پرسش</span>
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ================= مودال مینیمال مشاهده تمام پرسش‌ها ================= */}
      <Modal
        isOpen={isAllInquiriesModalOpen}
        onClose={() => setIsAllInquiriesModalOpen(false)}
        size="lg"
      >
        <ModalHeader onClose={() => setIsAllInquiriesModalOpen(false)}>
          <ModalTitle>تمام پرسش‌ها ({toPersianDigits(localInquiries.length)})</ModalTitle>
        </ModalHeader>
        <ModalBody className="p-4 md:p-6 divide-y divide-border/60">
          {localInquiries.map((inquiry) => renderMinimalInquiryCard(inquiry))}
        </ModalBody>
      </Modal>

      {/* ================= مودال مینیمال ثبت پرسش جدید ================= */}
      <Modal isOpen={isWriteModalOpen} onClose={() => setIsWriteModalOpen(false)} size="sm">
        <ModalHeader onClose={() => setIsWriteModalOpen(false)}>
          <ModalTitle className="flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span>ثبت پرسش جدید</span>
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="p-4 md:p-5">
          <form id="inquiry-form" onSubmit={handleInquirySubmit} className="flex w-full flex-col gap-4">
            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/20">
              <div className="w-12 h-12 rounded-lg border border-border bg-card p-1 flex items-center justify-center shrink-0">
                {productImage ? (
                  <img src={getFullUrl(productImage)} alt={productTitle} className="w-full h-full object-contain" />
                ) : (
                  <Package className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-3xs text-muted-foreground">پرسش درباره کالا:</span>
                <span className="text-xs font-semibold text-foreground truncate">{productTitle}</span>
              </div>
            </div>

            <TextArea
              label="متن پرسش شما *"
              placeholder="پرسش خود را درباره سازگاری با خودرو، مدل یا عملکرد فنی بنویسید..."
              value={inquiryText}
              onChange={(e) => setInquiryText(e.target.value)}
              className="h-28 text-xs leading-relaxed"
              required
            />
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
            form="inquiry-form"
            variant="primary"
            isLoading={createInquiry.isPending}
            className="h-10 flex-1 text-xs font-bold rounded-lg"
          >
            ثبت پرسش
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}