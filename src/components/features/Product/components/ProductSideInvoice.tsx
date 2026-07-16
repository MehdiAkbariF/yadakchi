'use client';

import { useState } from 'react';
import { Store, ShieldCheck, Truck, LineChart, Loader2, Sparkles, ShoppingBag } from 'lucide-react';
import { Card, CardTitle } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { useAddToBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { useGetProductPriceChart } from '@/domains/front/product/hooks/product.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { showToast } from '@/core/utils/toast';

interface ProductSideInvoiceProps {
  product: any;
  seller: any;
}

export function ProductSideInvoice({ product, seller }: ProductSideInvoiceProps) {
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToBasket = useAddToBasket();
  const { data: chartData, isLoading: isChartLoading } = useGetProductPriceChart(
    product.id,
    seller.type
  );

  const handleAddToBasket = async () => {
    setIsSubmitting(true);
    try {
      await addToBasket.mutateAsync({ shopProductId: seller.id, quantity: 1 });
      showToast.success('قطعه با موفقیت به سبد خرید شما افزوده شد');
    } catch (err: any) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full border rounded-xl p-5 bg-background shadow-sm text-right flex flex-col gap-4.5 select-none">
      
      <div className="flex items-center gap-3 border-b pb-3.5 w-full">
        <div className="w-10 h-10 shrink-0 rounded-lg border bg-muted/10 flex items-center justify-center overflow-hidden">
          {seller.shop.logo ? (
            <img src={getFullUrl(seller.shop.logo)} className="w-full h-full object-contain" alt="" />
          ) : (
            <Store className="h-5 w-5 text-muted-foreground/80" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs md:text-sm font-bold text-foreground block truncate font-iran-sans">{seller.shop.title}</span>
          <span className="text-[10px] text-muted-foreground block mt-0.5 font-iran-sans">عملکرد عالی فروشنده</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full border-b pb-3.5 text-xs text-muted-foreground font-iran-sans">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-success-500 shrink-0" />
          <span className="font-bold text-foreground">{seller.warrantyTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-primary shrink-0" />
          <span className="font-bold text-foreground">{seller.typeLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <Truck className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
          <span className="font-bold text-foreground">{seller.dayOfDeliveryLabel}</span>
        </div>
      </div>

      <div className="w-full flex items-center justify-between pt-1">
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-muted-foreground font-iran-sans mb-0.5">قیمت فروشنده:</span>
          <span className="text-base md:text-lg font-black text-foreground font-iran-sans">{seller.finalPrice}</span>
        </div>

        <button 
          onClick={() => setIsChartOpen(true)}
          className="p-2 border rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all shrink-0 outline-none"
        >
          <LineChart className="h-4.5 w-4.5" />
        </button>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleAddToBasket}
        isLoading={isSubmitting || addToBasket.isPending}
        className="rounded-xl font-iran-sans font-bold text-xs h-11 flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 mt-1"
      >
        <ShoppingBag className="h-4 w-4" />
        <span>افزودن به سبد خرید</span>
      </Button>

      <Modal isOpen={isChartOpen} onClose={() => setIsChartOpen(false)} className="max-w-md w-full">
        <ModalHeader onClose={() => setIsChartOpen(false)}>
          <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-1.5">
            <LineChart className="h-4.5 w-4.5 text-primary" />
            نمودار تغییرات قیمت فروش
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="p-0 pt-4 text-center">
          {isChartLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground font-iran-sans">در حال لود نمودار قیمت...</span>
            </div>
          ) : chartData && chartData.prices.length > 0 ? (
            <div className="w-full py-4 font-iran-sans text-xs text-muted-foreground">
              نمودار تغییرات قیمت به زودی در قالب چارت گرافیکی فعال خواهد شد.
            </div>
          ) : (
            <div className="w-full py-12 font-iran-sans text-xs text-muted-foreground text-center">
              دیتای تغییرات قیمتی برای این فروشنده در بازار ثبت نشده است.
            </div>
          )}
          <Button
            variant="outline"
            fullWidth
            onClick={() => setIsChartOpen(false)}
            className="rounded-xl mt-6 text-xs h-10 font-bold font-iran-sans"
          >
            متوجه شدم
          </Button>
        </ModalBody>
      </Modal>

    </Card>
  );
}

const getFullUrl = (path: string | null) => {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};