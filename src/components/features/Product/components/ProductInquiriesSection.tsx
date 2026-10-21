'use client';

import * as React from 'react';
import { User, MessageSquare, ThumbsUp, ThumbsDown, HelpCircle, ArrowLeft, Clock } from 'lucide-react';
import { useGetProductInquiries } from '@/domains/front/product/hooks/product.hooks';
import { useCreateInquiry, useLikeInquiry, useUnlikeInquiry } from '@/domains/front/inquiry/hooks/inquiry.hooks';
import { Button } from '@/components/primitives/Button/Button';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { cn } from '@/design-system/utils/cn';
import { showToast } from '@/core/utils/toast';
import { toPersianDigits } from '@/core/utils/formatters';

export interface ProductInquiriesSectionProps {
  productId: string;
}

export function ProductInquiriesSection({ productId }: ProductInquiriesSectionProps) {
  const [orderBy, setOrderBy] = React.useState('Latest');
  const [page, setPage] = React.useState(1);
  const [isWriteModalOpen, setIsWriteModalOpen] = React.useState(false);
  const [inquiryText, setInquiryText] = React.useState('');

  const { data: inquiriesResponse, isLoading } = useGetProductInquiries(productId, orderBy, page);
  const createInquiry = useCreateInquiry();
  const likeInquiry = useLikeInquiry();
  const unlikeInquiry = useUnlikeInquiry();

  const inquiries = inquiriesResponse?.items || [];

  const handleInquirySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inquiryText.trim().length < 5) {
      showToast.error('متن پرسش شما باید حداقل ۵ کاراکتر باشد');
      return;
    }
    try {
      await createInquiry.mutateAsync({ productId, comment: inquiryText });
      showToast.success('پرسش شما با موفقیت ثبت شد و پس از تایید مدیران سیستم نمایش داده خواهد شد');
      setInquiryText('');
      setIsWriteModalOpen(false);
    } catch (error: any) {
      showToast.error(error?.userMessage || 'خطا در ثبت پرسش شما');
    }
  };

  const handleLike = (inquiry: any) => {
    if (inquiry.userLiked) unlikeInquiry.mutate(inquiry.id);
    else likeInquiry.mutate({ productInquiryId: inquiry.id, likeStatus: 'Like' });
  };

  const handleDislike = (inquiry: any) => {
    if (inquiry.userDisLiked) unlikeInquiry.mutate(inquiry.id);
    else likeInquiry.mutate({ productInquiryId: inquiry.id, likeStatus: 'Dislike' });
  };

  return (
    <div className="mt-6 flex w-full flex-col gap-6 pb-12">
      <h3 className="text-sm font-bold text-foreground md:text-base">پرسش‌ها و پاسخ‌ها</h3>

      <div className="flex flex-col items-center justify-between gap-4 border-b border-border pb-2.5 md:flex-row">
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
          className="flex h-9 shrink-0 items-center gap-1 border-shop/40 text-xs font-bold text-shop hover:bg-shop/5"
        >
          <MessageSquare aria-hidden="true" className="h-3.5 w-3.5" />
          <span>شما هم سوال خود را بپرسید</span>
        </Button>
      </div>

      <div className="flex flex-col gap-5">
        {isLoading ? (
          <span className="text-xs text-muted-foreground">در حال بارگذاری پرسش‌ها...</span>
        ) : inquiries.length > 0 ? (
          inquiries.map((inquiry: any) => (
            <div key={inquiry.id} className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
              <div className="flex w-full items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                  <User aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{inquiry.creator}</span>
                      {(inquiry as any).isConfirmed === false ? (
                        <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-2xs font-bold text-warning">
                          <Clock aria-hidden="true" className="h-3 w-3" />
                          در حال بررسی
                        </span>
                      ) : null}
                    </div>
                    <span className="text-2xs text-muted-foreground">{inquiry.createDateFormatted}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-foreground">{inquiry.comment}</p>
                </div>
              </div>

              {inquiry.bestReply ? (
                <div className="me-6 flex gap-3 rounded-e-md border-s-2 border-primary bg-accent/50 p-3.5 md:me-10">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-accent">
                    <User aria-hidden="true" className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-primary">{inquiry.bestReply.creator} (پاسخ برتر)</span>
                      <span className="text-2xs text-muted-foreground">{inquiry.bestReply.createDateFormatted}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{inquiry.bestReply.comment}</p>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-4 border-t border-dashed border-border pt-2.5">
                <button
                  type="button"
                  onClick={() => handleLike(inquiry)}
                  disabled={likeInquiry.isPending || unlikeInquiry.isPending}
                  className={cn(
                    'flex items-center gap-1 text-2xs font-bold transition-colors',
                    inquiry.userLiked ? 'text-success' : 'text-muted-foreground hover:text-success'
                  )}
                >
                  <ThumbsUp aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>({toPersianDigits(inquiry.likes)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDislike(inquiry)}
                  disabled={likeInquiry.isPending || unlikeInquiry.isPending}
                  className={cn(
                    'flex items-center gap-1 text-2xs font-bold transition-colors',
                    inquiry.userDisLiked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
                  )}
                >
                  <ThumbsDown aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>({toPersianDigits(inquiry.dislikes)})</span>
                </button>
              </div>
            </div>
          ))
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

      <Modal isOpen={isWriteModalOpen} onClose={() => setIsWriteModalOpen(false)} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsWriteModalOpen(false)}>
          <ModalTitle className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <HelpCircle aria-hidden="true" className="h-4 w-4 text-primary" />
            شما هم سوال خودتون رو بپرسید
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="p-5 pt-4">
          <form onSubmit={handleInquirySubmit} className="flex w-full flex-col gap-4">
            <TextArea
              label="متن پرسش شما *"
              placeholder="پرسش خود را در مورد این کالا مطرح نمایید..."
              value={inquiryText}
              onChange={(e) => setInquiryText(e.target.value)}
              className="h-28 text-xs"
              required
            />
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
