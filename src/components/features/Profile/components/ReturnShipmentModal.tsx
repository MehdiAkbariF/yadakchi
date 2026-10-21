'use client';

import * as React from 'react';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { Select } from '@/components/primitives/Select/Select';
import { useSubmitReturnShipmentReceipt } from '@/domains/userpanel/hooks/userpanel.hooks';
import { showToast } from '@/core/utils/toast';
import { Truck, UploadCloud, CheckCircle, FileText, X } from 'lucide-react';

interface ReturnShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnRequestId: string;
}

const SHIPMENT_METHODS = [
  { value: 'Tipax', label: 'تیپاکس' },
  { value: 'Post', label: 'پست پیشتاز' },
  { value: 'Carrier', label: 'باربری / چاپار' },
  { value: 'Direct', label: 'پیک / تحویل مستقیم' },
];

export function ReturnShipmentModal({ isOpen, onClose, returnRequestId }: ReturnShipmentModalProps) {
  const submitReceipt = useSubmitReturnShipmentReceipt();

  const [method, setMethod] = React.useState('Tipax');
  const [traceNumber, setTraceNumber] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setMethod('Tipax');
      setTraceNumber('');
      setFile(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!traceNumber.trim()) {
      showToast.error('لطفاً شماره رهگیری بارنامه پستی را وارد کنید');
      return;
    }

    if (!file) {
      showToast.error('لطفاً تصویر فیش یا بارنامه ارسال را بارگذاری کنید');
      return;
    }

    try {
      await submitReceipt.mutateAsync({
        id: returnRequestId,
        method,
        traceNumber: traceNumber.trim(),
        file,
      });
      showToast.success('اطلاعات بارنامه با موفقیت ثبت شد و روند بازگشت وجه آغاز گردید');
      onClose();
    } catch (err: any) {
      showToast.error(err?.userMessage || 'خطا در ثبت اطلاعات بارنامه پستی');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Truck className="h-5 w-5 text-primary" />
          <span>ثبت مشخصات ارسال کالای مرجوعی</span>
        </ModalTitle>
      </ModalHeader>

      <ModalBody className="p-5 pt-3">
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-foreground">
            پس از تحویل کالا به پست یا تیپاکس، شماره بارنامه و تصویر قبض ارسال را در این بخش ثبت کنید تا بررسی شود.
          </div>

          <div className="w-full">
            <Select
              label="شیوه ارسال مرسوله *"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              options={SHIPMENT_METHODS}
              required
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-2xs font-bold text-muted-foreground">کد یا شماره رهگیری بارنامه *</label>
            <Input
              placeholder="مثال: ۲۴۴۵۸۹۶۳۱۰۰۲"
              value={traceNumber}
              onChange={(e) => setTraceNumber(e.target.value)}
              dir="ltr"
              className="h-10 text-xs font-mono"
              required
            />
          </div>

          {/* بارگذاری تصویر فیش */}
          <div className="flex w-full flex-col gap-2">
            <span className="text-2xs font-bold text-muted-foreground">تصویر قبض پستی یا رسید باربری *</span>
            {!file ? (
              <label className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/40 bg-card p-4 text-center transition-colors hover:border-primary hover:bg-primary/5">
                <UploadCloud className="h-6 w-6 text-primary mb-1" />
                <span className="text-xs font-bold text-foreground">برای انتخاب عکس فیش کلیک کنید</span>
                <span className="text-2xs text-muted-foreground mt-0.5">فرمت‌های مجاز: JPG, PNG</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-success/30 bg-success/5 p-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="h-5 w-5 text-success shrink-0" />
                  <span className="truncate text-xs font-semibold text-foreground">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-2 flex w-full gap-3 border-t border-border/60 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 flex-1 rounded-xl text-xs font-bold"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitReceipt.isPending}
              className="h-10 flex-1 rounded-xl text-xs font-bold shadow-xs"
            >
              ثبت نهایی بارنامه
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}