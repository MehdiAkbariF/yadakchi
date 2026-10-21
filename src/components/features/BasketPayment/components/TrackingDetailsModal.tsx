'use client';

import { Info } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button';

export interface TrackingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrackingDetailsModal({ isOpen, onClose }: TrackingDetailsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="flex items-center gap-1.5 text-sm font-bold text-foreground">
          <Info aria-hidden="true" className="h-4 w-4 text-primary" />
          روند ارسال و پردازش سفارش
        </ModalTitle>
      </ModalHeader>
      <ModalBody className="p-0 pt-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          تمام قطعات خریداری شده در کوتاه‌ترین زمان ممکن از طریق روش ارسال انتخابی جمع‌آوری، بسته‌بندی و تحویل می‌گردند. پس از ارسال، کد رهگیری مرسوله پستی یا تیپاکس از طریق پیامک برای شما ارسال خواهد شد و می‌توانید وضعیت آن را لحظه به لحظه رصد نمایید.
        </p>
        <Button
          variant="outline"
          fullWidth
          onClick={onClose}
          className="mt-6 h-10 text-xs font-bold"
        >
          متوجه شدم
        </Button>
      </ModalBody>
    </Modal>
  );
}