'use client';

import { useState } from 'react';
import { useGetProductInquiries } from '@/domains/front/product/hooks/product.hooks';
import { User, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/primitives/Button/Button';
import { cn } from '@/design-system/utils/cn';

interface ProductInquiriesSectionProps {
  productId: string;
}

export function ProductInquiriesSection({ productId }: ProductInquiriesSectionProps) {
  const [orderBy, setOrderBy] = useState('Latest');
  const [page, setPage] = useState(1);

  const { data: inquiriesResponse, isLoading } = useGetProductInquiries(productId, orderBy, page);

  const inquiries = inquiriesResponse?.items || [];

  const handleWriteInquiry = () => {
    showToast.success('درگاه ثبت پرسش به زودی فعال خواهد شد');
  };

  return (
    <div className="w-full flex flex-col gap-6 text-right mt-6 pb-12">
      <h3 className="text-sm md:text-base font-bold font-iran-yekan text-foreground">پرسش‌ها و پاسخ‌ها</h3>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-2.5">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold text-muted-foreground font-iran-sans shrink-0">نمایش بر اساس:</span>
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
          onClick={handleWriteInquiry}
          className="rounded-xl text-xs font-bold font-iran-sans h-9 border-primary/20 text-primary hover:bg-primary/5 flex items-center gap-1 shrink-0"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>شما هم سوال خود را بپرسید</span>
        </Button>
      </div>

      <div className="flex flex-col gap-5">
        {isLoading ? (
          <span className="text-xs text-muted-foreground font-iran-sans">در حال بارگذاری پرسش‌ها...</span>
        ) : inquiries.length > 0 ? (
          inquiries.map((inquiry: any) => (
            <div key={inquiry.id} className="p-4 border rounded-xl bg-background flex flex-col gap-4 text-right">
              <div className="flex gap-4 items-start w-full">
                <div className="w-10 h-10 shrink-0 rounded-full border bg-muted/15 flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-foreground font-iran-sans">{inquiry.creator}</span>
                    <span className="text-[10px] text-muted-foreground font-iran-sans">{inquiry.createDateFormatted}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-200 mt-2 font-iran-sans">
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
                      <span className="text-xs font-bold text-primary font-iran-sans">{inquiry.bestReply.creator} (پاسخ برتر)</span>
                      <span className="text-[10px] text-muted-foreground font-iran-sans">{inquiry.bestReply.createDateFormatted}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 mt-1 font-iran-sans">
                      {inquiry.bestReply.comment}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-4 border-t border-dashed pt-2.5">
                <button className="flex items-center gap-1 text-[10px] font-bold font-iran-sans text-muted-foreground hover:text-success-500 transition-colors">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>({inquiry.likes})</span>
                </button>
                <button className="flex items-center gap-1 text-[10px] font-bold font-iran-sans text-muted-foreground hover:text-destructive transition-colors">
                  <ThumbsDown className="h-3.5 w-3.5" />
                  <span>({inquiry.dislikes})</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <span className="text-xs text-muted-foreground font-iran-sans py-4">هیچ پرسشی برای این کالا ثبت نشده است. اولین سوال خود را بپرسید!</span>
        )}
      </div>

    </div>
  );
}

import { showToast } from '@/core/utils/toast';