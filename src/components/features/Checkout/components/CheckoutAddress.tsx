'use client';

import { MapPin } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button';

interface CheckoutAddressProps {
  activeAddress: any;
  onOpenModal: () => void;
}

export function CheckoutAddress({ activeAddress, onOpenModal }: CheckoutAddressProps) {
  return (
    <Card className="w-full overflow-hidden border rounded-xl shadow-sm bg-background text-right">
      <CardHeader className="border-b bg-muted/20 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4.5 w-4.5 text-primary" />
          <span className="text-xs font-bold font-iran-yekan text-foreground">آدرس تحویل سفارش</span>
        </div>
      </CardHeader>
      <CardBody className="p-5 flex flex-col gap-2">
        {activeAddress ? (
          <>
            <p className="text-sm font-bold text-foreground font-iran-sans leading-relaxed">
              {activeAddress.province}، {activeAddress.city}، {activeAddress.address}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground mt-2 font-iran-sans">
              <span>پلاک: {new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(activeAddress.plaque || 0)}</span>
              <span>واحد: {new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(activeAddress.unit || 0)}</span>
              <span>کد پستی: {new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(activeAddress.postalCode || 0)}</span>
              <span>تحویل‌گیرنده: {activeAddress.receiverFullName} ({new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(activeAddress.receiverMobile || 0)})</span>
            </div>
            <div className="flex justify-end border-t border-dashed pt-4 mt-4 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenModal}
                className="rounded-xl border font-iran-sans font-bold text-xs h-10 px-5 py-2 w-full sm:w-auto"
              >
                انتخاب یا ویرایش آدرس
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full py-6 text-center flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground font-iran-sans">هیچ آدرسی ثبت نشده است. لطفا آدرس خود را ثبت کنید.</p>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={onOpenModal} 
              className="rounded-xl mt-4 text-xs font-bold font-iran-sans h-10.5 px-6 py-2.5 w-full sm:w-auto"
            >
              ثبت اولین آدرس
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}