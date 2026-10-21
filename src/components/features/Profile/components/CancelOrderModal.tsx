'use client';

import * as React from 'react';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Select } from '@/components/primitives/Select/Select';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { useGetSubOrderCancelReasons, useCancelOrder } from '@/domains/userpanel/hooks/userpanel.hooks';
import { showToast } from '@/core/utils/toast';
import { AlertCircle, Ban } from 'lucide-react';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export function CancelOrderModal({ isOpen, onClose, orderId }: CancelOrderModalProps) {
  const { data: reasons = [], isLoading: isReasonsLoading } = useGetSubOrderCancelReasons();
  const cancelOrder = useCancelOrder();

  const [selectedReasonId, setSelectedReasonId] = React.useState('');
  const [description, setDescription] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setSelectedReasonId('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReasonId) {
      showToast.error('لطفاً دلیل لغو سفارش را مشخص کنید');
      return;
    }

    try {
      await cancelOrder.mutateAsync({
        orderId,
        cancelationReasonId: selectedReasonId,
        userCancelationDescription: description.trim(),
      });
      showToast.success('سفارش شما با موفقیت لغو گردید');
      onClose();
    } catch (err: any) {
      showToast.error(err?.userMessage || 'خطا در ثبت درخواست لغو سفارش');
    }
  };

  const reasonOptions = reasons.map((r: any) => ({
    value: r.id,
    label: r.name,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Ban className="h-5 w-5 text-destructive" />
          <span>لغو سفارش</span>
        </ModalTitle>
      </ModalHeader>

      <ModalBody className="p-5 pt-3">
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs leading-relaxed text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              در صورت لغو سفارش، مبالغ پرداخت‌شده ظرف حداکثر ۲۴ ساعت به کیف پول یا حساب بانکی شما بازگردانده خواهد شد.
            </span>
          </div>

          <div className="w-full">
            <Select
              label="دلیل انصراف و لغو سفارش *"
              placeholder="انتخاب علت لغو..."
              value={selectedReasonId}
              onChange={(e) => setSelectedReasonId(e.target.value)}
              options={reasonOptions}
              disabled={isReasonsLoading}
              required
            />
          </div>

          <div className="w-full">
            <TextArea
              label="توضیحات بیشتر (اختیاری)"
              placeholder="علت لغو سفارش خود را شرح دهید..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-24 text-xs"
            />
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
              variant="destructive"
              isLoading={cancelOrder.isPending}
              className="h-10 flex-1 rounded-xl text-xs font-bold shadow-xs"
            >
              تایید و لغو نهایی
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}