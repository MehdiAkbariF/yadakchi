'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetTicketCategories, useCreateTicket } from '@/domains/ticket/hooks/ticket.hooks';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { Select } from '@/components/primitives/Select/Select';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { ArrowRight, MessageSquare, Paperclip, X, FileText } from 'lucide-react';
import { showToast } from '@/core/utils/toast';

export function CreateTicket() {
  const router = useRouter();
  
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [orderNumberStr, setOrderNumberStr] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const { data: categories = [] } = useGetTicketCategories('User');
  const createTicket = useCreateTicket();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...filesArray].slice(0, 5));
    }
  };

  const handleRemoveFile = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategoryId) {
      showToast.error('لطفاً دلیل و دسته‌بندی تیکت را انتخاب کنید');
      return;
    }

    if (title.trim().length < 4) {
      showToast.error('موضوع تیکت باید حداقل ۴ کاراکتر باشد');
      return;
    }

    if (text.trim().length < 10) {
      showToast.error('متن پیام پشتیبانی باید حداقل ۱۰ کاراکتر باشد');
      return;
    }

    try {
      const orderNumber = orderNumberStr ? Number(orderNumberStr) : undefined;
      await createTicket.mutateAsync({
        categoryId: selectedCategoryId,
        title,
        text,
        orderNumber,
        attachments,
      });

      showToast.success('تیکت شما با موفقیت ثبت شد و به زودی توسط پشتیبانی پاسخ داده خواهد شد');
      router.push('/profile/support');
    } catch (error: any) {
      showToast.error(error.userMessage || 'خطا در ثبت تیکت پشتیبانی جدید');
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full text-right" dir="rtl">
      
      <div className="flex items-center gap-3 border-b pb-3 mb-1 shrink-0">
        <button 
          onClick={() => router.push('/profile/support')}
          className="p-1 -mr-1 hover:bg-muted rounded-full flex items-center justify-center transition-colors"
          aria-label="Back"
        >
          <ArrowRight className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-sm font-bold font-iran-yekan text-foreground">ثبت تیکت پشتیبانی جدید</span>
      </div>

      <Card className="w-full border rounded-xl bg-background shadow-sm">
        <CardBody className="p-5 md:p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4.5 w-full text-right">
            
            <div className="w-full">
              <Select
                label="موضوع و دلیل ارتباط *"
                placeholder="دلیل و موضوع تیکت را انتخاب کنید..."
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                options={categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                required
              />
            </div>

            <div className="w-full">
              <Input
                label="موضوع تیکت *"
                placeholder="مثال: عدم واریز موجودی کیف پول"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs font-iran-sans"
                required
              />
            </div>

            <div className="w-full">
              <Input
                label="شماره سفارش (اختیاری)"
                placeholder="مثال: 100160"
                type="number"
                value={orderNumberStr}
                onChange={(e) => setOrderNumberStr(e.target.value)}
                className="text-xs font-iran-sans"
              />
            </div>

            <div className="w-full">
              <TextArea
                label="شرح جزئیات تیکت *"
                placeholder="جزئیات کامل مشکل خود را همراه با اطلاعات کافی بنویسید..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="h-32 text-xs font-iran-sans"
                required
              />
            </div>

            <div className="flex flex-col gap-2 w-full mt-1 border-t border-dashed pt-4">
              <span className="text-xs font-bold text-foreground font-iran-sans mb-1">فایل‌های ضمیمه (حداکثر ۵ فایل)</span>
              <div className="flex flex-wrap gap-2.5 items-center">
                <label className="h-10 px-5 py-2 rounded-xl border border-dashed border-primary/30 hover:border-primary text-primary hover:bg-primary/5 text-xs font-bold font-iran-sans flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all select-none">
                  <Paperclip className="h-4 w-4" />
                  <span>انتخاب فایل ضمیمه</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {attachments.map((file, idx) => (
                  <div 
                    key={idx}
                    className="h-10 px-3 rounded-xl border bg-muted/20 text-[10px] font-bold font-iran-sans text-foreground flex items-center gap-2 max-w-[150px] shrink-0"
                  >
                    <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate flex-1 text-right">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="p-0.5 hover:bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={createTicket.isPending}
              className="rounded-xl font-iran-sans font-bold text-xs h-11 mt-4 shadow-md shadow-primary/10 px-5 py-3"
            >
              ثبت و ارسال تیکت
            </Button>

          </form>
        </CardBody>
      </Card>

    </div>
  );
}