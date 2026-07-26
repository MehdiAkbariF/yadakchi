'use client';

import { useState } from 'react';
import { useGetProductInquiries } from '@/domains/front/product/hooks/product.hooks';
import { useCreateInquiry } from '@/domains/front/inquiry/hooks/inquiry.hooks';
import { User, MessageSquare, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import { Button } from '@/components/primitives/Button/Button';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { cn } from '@/design-system/utils/cn';
import { showToast } from '@/core/utils/toast';

interface ProductInquiriesSectionProps {
  productId: string;
}

export function ProductInquiriesSection({ productId }: ProductInquiriesSectionProps) {
  const [orderBy, setOrderBy] = useState('Latest');
  const [page, setPage] = useState(1);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [inquiryText, setInquiryText] = useState('');

  const { data: inquiriesResponse, isLoading } = useGetProductInquiries(productId, orderBy, page);
  const createInquiry = useCreateInquiry();

  const inquiries = inquiriesResponse?.items || [];

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inquiryText.trim().length < 5) {
      showToast.error('متن پرسش شما باید حداقل ۵ کاراکتر باشد');
      return;
    }

    try {
      await createInquiry.mutateAsync({
        productId,
        comment: inquiryText,
      });

      showToast.success('پرسش شما با موفقیت ثبت شد و پس از تایید مدیران سیستم نمایش داده خواهد شد');
      setInquiryText('');
      setIsWriteModalOpen(false);
    } catch (error: any) {
      showToast.error(error.userMessage || 'خطا در ثبت پرسش شما');
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-right mt-6 pb-12">
      <h3 className="text-sm md:text-base font-bold font-iran-yekan text-foreground">پرسش‌ها و پاسخ‌ها</h3>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-2.5">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold text-muted-foreground font-iran-yekan shrink-0">نمایش بر اساس:</span>
          {[
            { value: 'Latest', label: 'جدیدترین' },
            { value: 'Oldest', label: 'قدیمی‌ترین' },
            { value: 'MostPopular', label: 'مفیدترین' },
            { value: 'MostReplied', label: 'بیشترین پاسخ' }
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setOrderBy(opt.value); setPage(1); }}
              className={cn(
                "text-xs font-bold font-iran-yekan pb-1 shrink-0 border-b-2 outline-none",
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
          onClick={() => setIsWriteModalOpen(true)}
          className="rounded-xl text-xs font-bold font-iran-yekan h-9 border-primary/20 text-primary hover:bg-primary/5 flex items-center gap-1 shrink-0"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>شما هم سوال خود را بپرسید</span>
        </Button>
      </div>

      <div className="flex flex-col gap-5">
        {isLoading ? (
          <span className="text-xs text-muted-foreground font-iran-yekan">در حال بارگذاری پرسش‌ها...</span>
        ) : inquiries.length > 0 ? (
          inquiries.map((inquiry: any) => (
            <div key={inquiry.id} className="p-4 border rounded-xl bg-background flex flex-col gap-4 text-right">
              <div className="flex gap-4 items-start w-full">
                <div className="w-10 h-10 shrink-0 rounded-full border bg-muted/15 flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-foreground font-iran-yekan">{inquiry.creator}</span>
                    <span className="text-[10px] text-muted-foreground font-iran-yekan">{inquiry.createDateFormatted}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-200 mt-2 font-iran-yekan">
                    {inquiry.comment}
                  </p>
                </div>
              </div>

              {inquiry.bestReply && (
                <div className="mr-6 md:mr-10 p-3.5 border-r-2 border-primary bg-primary/5 flex gap-3 text-right rounded-l-xl">
                  <div className="w-8 h-8 shrink-0 rounded-full border bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-primary font-iran-yekan">{inquiry.bestReply.creator} (پاسخ برتر)</span>
                      <span className="text-[10px] text-muted-foreground font-iran-yekan">{inquiry.bestReply.createDateFormatted}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 mt-1 font-iran-yekan">
                      {inquiry.bestReply.comment}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-4 border-t border-dashed pt-2.5">
                <button className="flex items-center gap-1 text-[10px] font-bold font-iran-yekan text-muted-foreground hover:text-success-500 transition-colors">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>({inquiry.likes})</span>
                </button>
                <button className="flex items-center gap-1 text-[10px] font-bold font-iran-yekan text-muted-foreground hover:text-destructive transition-colors">
                  <ThumbsDown className="h-3.5 w-3.5" />
                  <span>({inquiry.dislikes})</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <span className="text-xs text-muted-foreground font-iran-yekan py-4">هیچ پرسشی برای این کالا ثبت نشده است. اولین سوال خود را بپرسید!</span>
        )}
      </div>
<Modal isOpen={isWriteModalOpen} onClose={() => setIsWriteModalOpen(false)} className="max-w-md w-full">
  <ModalHeader onClose={() => setIsWriteModalOpen(false)}>
    <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-1.5">
      <HelpCircle className="h-4.5 w-4.5 text-primary" />
      شما هم سوال خودتون رو بپرسید
    </ModalTitle>
  </ModalHeader>
  
  <ModalBody className="p-5 pt-4 text-right">
    <form onSubmit={handleInquirySubmit} className="flex flex-col gap-4 w-full text-right">
      <TextArea
        label="متن پرسش شما *"
        placeholder="پرسش خود را در مورد این کالا مطرح نمایید..."
        value={inquiryText}
        onChange={(e) => setInquiryText(e.target.value)}
        className="h-28 text-xs font-iran-yekan"
        required
      />
    </form>
  </ModalBody>

  {/* فوتر با دکمه‌های تمام عرض */}
  <div className="flex flex-row gap-2.5 p-5 pt-4 border-t border-border/50 w-full shrink-0">
    <Button
      type="button"
      variant="outline"
      onClick={() => setIsWriteModalOpen(false)}
      className="flex-1 rounded-xl text-xs h-10 font-bold font-iran-yekan"
    >
      انصراف
    </Button>
    <Button
      type="submit"
      variant="primary"
      isLoading={createInquiry.isPending}
      className="flex-1 rounded-xl text-xs h-10 font-bold font-iran-yekan"
      onClick={handleInquirySubmit}
    >
      ثبت پرسش نهایی
    </Button>
  </div>
</Modal>

    </div>
  );
}