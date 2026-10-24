'use client';

import * as React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/composites/Modal/Modal';
import { Select } from '@/components/primitives/Select/Select';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { Button } from '@/components/primitives/Button/Button';
import { useGetSubOrderCancelReasons, useCancelOrder } from '@/domains/userpanel/hooks/userpanel.hooks';
import { showToast } from '@/core/utils/toast';
import { toPersianDigits } from '@/core/utils/formatters';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export function CancelOrderModal({ isOpen, onClose, orderId }: CancelOrderModalProps) {
  const [reasonId, setReasonId] = React.useState('');
  const [description, setDescription] = React.useState('');
  const { data: reasons = [] } = useGetSubOrderCancelReasons();
  const cancelOrder = useCancelOrder();

  // ✅ پاک کردن فرم هنگام باز شدن مودال
  React.useEffect(() => {
    if (isOpen) {
      setReasonId('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!reasonId) {
      showToast.error('لطفاً دلیل لغو را انتخاب کنید');
      return;
    }
    try {
      await cancelOrder.mutateAsync({
        orderId,
        cancelationReasonId: reasonId,
        userCancelationDescription: description,
      });
      showToast.success('سفارش با موفقیت لغو شد');
      onClose();
    } catch (err: any) {
      showToast.error(err.userMessage || 'خطا در لغو سفارش');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="text-sm font-bold text-foreground">لغو سفارش</ModalTitle>
      </ModalHeader>
      <ModalBody className="flex flex-col gap-4 p-5">
        <Select
          label="دلیل لغو *"
          placeholder="یک دلیل انتخاب کنید..."
          value={reasonId}
          onChange={(e) => setReasonId(e.target.value)}
          options={(reasons as any[]).map((r: any) => ({ value: r.id, label: r.name }))}
        />
        <TextArea
          label="توضیحات (اختیاری)"
          placeholder="جزییات لغو را بنویسید..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-24"
        />
      </ModalBody>
      <ModalFooter className="gap-2.5 p-5 pt-0">
        <Button variant="outline" onClick={onClose} className="flex-1">انصراف</Button>
        <Button variant="destructive" onClick={handleSubmit} isLoading={cancelOrder.isPending} className="flex-1">
          تایید لغو
        </Button>
      </ModalFooter>
    </Modal>
  );
}