'use client';

import { Info } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button';

interface TrackingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrackingDetailsModal({ isOpen, onClose }: TrackingDetailsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-1.5">
          <Info className="h-4.5 w-4.5 text-primary" />
          روند ارسال و پردازش سفارش
        </ModalTitle>
      </ModalHeader>
      <ModalBody className="p-0 pt-4 text-right">
        <p className="text-xs leading-relaxed text-muted-foreground font-iran-sans">
          تمام قطعات خریداری شده در کوتاه‌ترین زمان ممکن از طریق روش ارسال انتخابی جمع‌آوری، بسته‌بندی و تحویل می‌گردند. پس از ارسال، کد رهگیری مرسوله پستی یا تیپاکس از طریق پیامک برای شما ارسال خواهد شد و می‌توانید وضعیت آن را لحظه به لحظه رصد نمایید.
        </p>
        <Button
          variant="outline"
          fullWidth
          onClick={onClose}
          className="rounded-xl mt-6 text-xs h-10 font-bold font-iran-sans"
        >
          متوجه شدم
        </Button>
      </ModalBody>
    </Modal>
  );
}