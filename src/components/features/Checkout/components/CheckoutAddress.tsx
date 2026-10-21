'use client';

import { MapPin, User, Phone, CheckCircle, ChevronLeft, Plus } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button';

export interface CheckoutAddressProps {
  activeAddress: any;
  onOpenModal: () => void;
}

export function CheckoutAddress({ activeAddress, onOpenModal }: CheckoutAddressProps) {
  const formatPersian = (val: any) => new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(val || 0);

  return (
    <Card className="w-full overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
      <CardHeader className="flex items-center justify-between border-b border-border/60 bg-card px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">آدرس تحویل سفارش</span>
            {activeAddress ? (
              <span className="hidden items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-2xs font-semibold text-success sm:flex">
                <CheckCircle className="h-3 w-3" />
                تایید شده
              </span>
            ) : null}
          </div>
        </div>

        {activeAddress ? (
          <button
            type="button"
            onClick={onOpenModal}
            className="flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            <span>تغییر یا ویرایش آدرس</span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </CardHeader>

      <CardBody className="p-5">
        {activeAddress ? (
          <div className="flex flex-col gap-3.5">
            {/* متن آدرس کامل */}
            <p className="text-sm font-semibold leading-relaxed text-foreground">
              {activeAddress.province}، شهر {activeAddress.city}، {activeAddress.address}
            </p>

            {/* جزییات گیرنده و مشخصات پستی در قالب چیپ‌های منظم */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-2.5 py-1 text-foreground/80">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>گیرنده: {activeAddress.receiverFullName}</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-2.5 py-1 text-foreground/80">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span dir="ltr">{formatPersian(activeAddress.receiverMobile)}</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-lg bg-secondary/40 px-2.5 py-1">
                <span>کد پستی: {formatPersian(activeAddress.postalCode)}</span>
              </div>

              {activeAddress.plaque ? (
                <div className="flex items-center gap-1.5 rounded-lg bg-secondary/40 px-2 py-1">
                  <span>پلاک: {formatPersian(activeAddress.plaque)}</span>
                </div>
              ) : null}

              {activeAddress.unit ? (
                <div className="flex items-center gap-1.5 rounded-lg bg-secondary/40 px-2 py-1">
                  <span>واحد: {formatPersian(activeAddress.unit)}</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
            <p className="text-xs text-muted-foreground">
              هنوز آدرسی برای دریافت کالاها انتخاب نکرده‌اید.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenModal}
              className="mt-2 flex h-9 items-center gap-1.5 px-4 text-xs font-bold"
            >
              <Plus className="h-4 w-4" />
              <span>انتخاب یا ثبت آدرس تحویل</span>
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}