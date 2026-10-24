'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Select } from '@/components/primitives/Select/Select';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { useGetReturnRequestReasons, useSubmitReturnRequest } from '@/domains/userpanel/hooks/userpanel.hooks';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';
import { showToast } from '@/core/utils/toast';
import { Paperclip, FileText, X, AlertTriangle } from 'lucide-react';

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  subOrder: any;
  item: any;
}

export function ReturnRequestModal({ isOpen, onClose, subOrder, item }: ReturnRequestModalProps) {
  const { data: reasons = [] } = useGetReturnRequestReasons();
  const submitReturn = useSubmitReturnRequest();

  const [selectedReasonId, setSelectedReasonId] = useState('');
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  // ✅ پاک کردن فرم هنگام باز شدن مودال
  useEffect(() => {
    if (isOpen) {
      setSelectedReasonId('');
      setReturnQuantity(1);
      setDescription('');
      setAttachments([]);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // محدودیت ۵ تصویر و بررسی نوع فایل
      const validFiles = filesArray.filter(file => file.type.startsWith('image/'));
      const remainingSlots = 5 - attachments.length;
      
      if (validFiles.length > remainingSlots) {
        showToast.error(`شما فقط می‌توانید ${remainingSlots} تصویر دیگر آپلود کنید`);
      }
      
      setAttachments(prev => [...prev, ...validFiles].slice(0, 5));
    }
  };

  const handleRemoveFile = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReasonId) {
      showToast.error('لطفاً علت اصلی مرجوعی کالا را انتخاب کنید');
      return;
    }

    if (description.trim().length < 10) {
      showToast.error('لطفاً دلیل مرجوعی را با جزئیات بیشتر (حداقل ۱۰ کاراکتر) توضیح دهید');
      return;
    }

    try {
      const itemsPayload = [
        {
          subOrderItemId: item.id,
          quantity: returnQuantity,
          returnRequestReasonId: selectedReasonId,
          description: description,
        }
      ];

      await submitReturn.mutateAsync({
        subOrderId: subOrder.id,
        items: itemsPayload,
        files: attachments,
      });

      showToast.success('درخواست مرجوعی شما با موفقیت ثبت شد و به بخش مدیریت ارجاع گردید');
      onClose();
    } catch (error: any) {
      showToast.error(error.userMessage || 'خطا در ثبت درخواست مرجوعی کالا');
    }
  };

  const quantityOptions = Array.from({ length: item?.quantity || 1 }, (_, i) => ({
    value: String(i + 1),
    label: `${toPersianDigits(i + 1)} عدد`,
  }));

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="font-bold text-sm text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          ثبت درخواست مرجوعی کالا
        </ModalTitle>
      </ModalHeader>

      <ModalBody className="p-5 pt-4">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4.5 w-full">
          
          {/* اطلاعات کوتاه کالا */}
          <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border">
            <div className="w-12 h-12 shrink-0 rounded-lg border bg-card flex items-center justify-center overflow-hidden p-0.5">
              <img src={getFullUrl(item.shopProduct.product.image)} className="w-full h-full object-contain" alt="" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-foreground truncate block">{item.shopProduct.product.title}</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">فروشگاه: {subOrder.shop?.shopTitle}</span>
            </div>
          </div>

          {/* دلیل مرجوعی */}
          <div className="w-full">
            <Select
              label="علت اصلی مرجوعی کالا *"
              placeholder="علت مرجوعی را انتخاب کنید..."
              value={selectedReasonId}
              onChange={(e) => setSelectedReasonId(e.target.value)}
              options={reasons.map((r: any) => ({ value: r.id, label: r.name }))}
              required
            />
          </div>

          {/* تعداد مرجوعی */}
          {item.quantity > 1 && (
            <div className="w-full">
              <Select
                label="تعداد کالای مرجوعی *"
                value={String(returnQuantity)}
                onChange={(e) => setReturnQuantity(Number(e.target.value))}
                options={quantityOptions}
                required
              />
            </div>
          )}

          {/* شرح جزییات */}
          <div className="w-full">
            <TextArea
              label="شرح علت و جزییات مرجوعی کالا *"
              placeholder="لطفاً جزییات، عیوب یا مغایرت‌های فنی کالا را در این بخش بنویسید..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-24 text-xs"
              required
            />
          </div>

          {/* مدارک و آپلود عکس */}
          <div className="flex flex-col gap-2 w-full border-t border-dashed pt-4">
            <span className="text-xs font-bold text-foreground mb-1">تصاویر کالای معیوب یا مغایر (حداکثر ۵ تصویر)</span>
            <div className="flex flex-wrap gap-2.5 items-center">
              <label className="h-10 px-4 rounded-xl border border-dashed border-primary/30 hover:border-primary text-primary hover:bg-primary/5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all select-none">
                <Paperclip className="h-4 w-4" />
                <span>انتخاب عکس کالا</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {attachments.map((file, idx) => (
                <div 
                  key={idx}
                  className="h-10 px-2.5 rounded-xl border bg-muted/20 text-[9px] font-bold text-foreground flex items-center gap-1.5 max-w-[120px] shrink-0"
                >
                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate flex-1">{file.name}</span>
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

        </form>
      </ModalBody>

      <div className="flex flex-row gap-2.5 p-5 pt-4 border-t border-border/50 w-full shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 rounded-xl text-xs h-10 font-bold"
        >
          انصراف
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={submitReturn.isPending}
          className="flex-1 rounded-xl text-xs h-10 font-bold"
          onClick={handleFormSubmit}
        >
          ثبت درخواست مرجوعی
        </Button>
      </div>
    </Modal>
  );
}