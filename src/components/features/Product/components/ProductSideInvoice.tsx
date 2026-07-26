'use client';

import { useState } from 'react';
import { Store, ShieldCheck, Truck, LineChart, Loader2, Sparkles, ShoppingBag, Info, Eye, Star, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { useAddToBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { useGetProductPriceChart } from '@/domains/front/product/hooks/product.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils';

interface ProductSideInvoiceProps {
  product: any;
  seller: any | null;
  sellersCount?: number;
}

export function ProductSideInvoice({ product, seller, sellersCount = 0 }: ProductSideInvoiceProps) {
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToBasket = useAddToBasket();
  
  // لود نمودار فقط در صورتی که فروشنده وجود داشته باشد انجام می‌گیرد
  const { data: chartData, isLoading: isChartLoading } = useGetProductPriceChart(
    product.id,
    seller ? seller.type : 'New'
  );

  const handleAddToBasket = async () => {
    if (!seller) return;
    setIsSubmitting(true);
    try {
      await addToBasket.mutateAsync({ shopProductId: seller.id, quantity: 1 });
      showToast.success('قطعه با موفقیت به سبد خرید شما افزوده شد');
    } catch (err: any) {
      // مدیریت خطا توسط سیستم
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value);
  };

  const discountPercentage =
    seller && seller.hasDiscount && seller.retailPriceRaw && seller.finalPriceRaw
      ? Math.round(((seller.retailPriceRaw - seller.finalPriceRaw) / seller.retailPriceRaw) * 100)
      : seller?.discountPercentage || 0;

  return (
    <Card className="w-full flex flex-col overflow-hidden border bg-background rounded-2xl shadow-sm">
      {seller && seller.hasDiscount && discountPercentage > 0 && (
        <div className="w-full bg-destructive text-white py-2 px-4 text-center text-xs font-black font-iran-yekan animate-pulse shrink-0">
          با تخفیف ویژه {formatPrice(discountPercentage)} درصد
        </div>
      )}

      <div className="p-5 flex flex-col gap-4">
        {seller ? (
          <>
            {/* مشخصات فروشنده فعال */}
            <div className="flex items-center justify-between border-b pb-3.5 w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-lg border bg-muted/10 flex items-center justify-center overflow-hidden">
                  {seller.shop.logo ? (
                    <img src={getFullUrl(seller.shop.logo)} className="w-full h-full object-contain" alt="" />
                  ) : (
                    <Store className="h-5 w-5 text-muted-foreground/80" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs md:text-sm font-bold text-foreground block truncate font-iran-yekan">
                    {seller.shop.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5 font-iran-yekan">
                    عملکرد عالی فروشنده
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="text-[10px] font-bold font-iran-yekan text-primary border-b border-primary pb-0.5 hover:text-primary/80 transition-colors outline-none"
              >
                همه فروشندگان ({formatPrice(sellersCount)})
              </button>
            </div>

            {/* گارانتی و نحوه ارسال */}
            <div className="flex flex-col gap-3 w-full border-b pb-3.5 text-xs text-muted-foreground font-iran-yekan">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-success-500 shrink-0" />
                <span className="font-bold text-foreground">ضمانت اصل بودن کالا</span>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary shrink-0" />
                <span className="font-bold text-foreground">نوع قطعه: {seller.typeLabel}</span>
              </div>

              <div className="flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
                <span className="font-bold text-foreground">
                  ارسال از {seller.shop.address.split('،')[0]} | {seller.dayOfDeliveryLabel}
                </span>
              </div>
            </div>
          </>
        ) : (
          /* ظاهر بخش ناموجود */
          <div className="flex flex-col items-center justify-center text-center py-6 px-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 gap-2.5 w-full">
            <div className="p-2.5 bg-destructive/10 text-destructive rounded-full">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <span className="text-sm font-black text-destructive font-iran-yekan">کالا در حال حاضر ناموجود است</span>
            <span className="text-[10px] text-muted-foreground font-iran-yekan leading-relaxed">
              این قطعه فعلاً توسط هیچ فروشگاهی عرضه نشده است. با فعال شدن فروشندگان امکان خرید فراهم خواهد شد.
            </span>
          </div>
        )}

        {/* آمار محصول */}
        <div className="grid grid-cols-3 gap-2 py-3 border-b border-dashed w-full text-center shrink-0">
          <div className="flex flex-col items-center justify-center gap-1">
            <Info className="h-4.5 w-4.5 text-primary shrink-0" />
            <span className="text-[10px] font-bold text-foreground font-iran-yekan leading-none mt-1">
              {product.salesCount || '۰'} خرید
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 border-x dark:border-zinc-800">
            <Eye className="h-4.5 w-4.5 text-primary shrink-0" />
            <span className="text-[10px] font-bold text-foreground font-iran-yekan leading-none mt-1">
              {product.views || '۰'} بازدید
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <Star className="h-4.5 w-4.5 fill-yellow-400 text-yellow-400 shrink-0" />
            <span className="text-[10px] font-bold text-foreground font-iran-yekan leading-none mt-1">
              امتیاز {product.averageRate || '۵'}
            </span>
          </div>
        </div>

        {/* قیمت‌گذاری یا اعلام ناموجودی */}
        {seller ? (
          <div className="w-full flex items-center justify-between pt-1">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-muted-foreground font-iran-yekan mb-0.5">قیمت فروشنده:</span>
              {seller.hasDiscount && (
                <span className="text-[10px] text-zinc-400 line-through leading-none mb-1 font-iran-yekan">
                  {seller.retailPrice}
                </span>
              )}
              <span className="text-base md:text-lg font-black text-foreground font-iran-yekan leading-none">
                {seller.finalPrice}
              </span>
            </div>

            <button
              onClick={() => setIsChartOpen(true)}
              className="p-2 border rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all shrink-0 outline-none"
            >
              <LineChart className="h-4.5 w-4.5" />
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between pt-1 text-right">
            <span className="text-xs font-bold text-muted-foreground font-iran-yekan">وضعیت تامین قطعه:</span>
            <span className="text-xs font-black text-destructive font-iran-yekan">غیرفعال</span>
          </div>
        )}

        {/* دکمه اکشن نهایی */}
        <Button
          variant={seller ? 'primary' : 'outline'}
          size="lg"
          fullWidth
          onClick={seller ? handleAddToBasket : undefined}
          isLoading={isSubmitting || addToBasket.isPending}
          disabled={!seller}
          className={cn(
            'rounded-xl font-iran-yekan font-bold text-xs h-11 flex items-center justify-center gap-1.5 mt-1 transition-all',
            !seller && 'opacity-65 cursor-not-allowed bg-zinc-100 dark:bg-zinc-850 text-zinc-400 dark:text-zinc-650 border-zinc-200'
          )}
        >
          {seller ? (
            <>
              <ShoppingBag className="h-4 w-4" />
              <span>افزودن به سبد خرید</span>
            </>
          ) : (
            <span>ناموجود</span>
          )}
        </Button>
      </div>

      {/* مودال چارت قیمت */}
      <Modal isOpen={isChartOpen} onClose={() => setIsChartOpen(false)} className="max-w-md w-full animate-none">
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
              <span className="text-xs text-muted-foreground font-iran-yekan">در حال لود نمودار قیمت...</span>
            </div>
          ) : chartData && chartData.prices.length > 0 ? (
            <div className="w-full py-4 font-iran-yekan text-xs text-muted-foreground">
              نمودار تغییرات قیمت به زودی در قالب چارت گرافیکی فعال خواهد شد.
            </div>
          ) : (
            <div className="w-full py-12 font-iran-yekan text-xs text-muted-foreground text-center">
              دیتای تغییرات قیمتی برای این فروشنده در بازار ثبت نشده است.
            </div>
          )}
          <Button
            variant="outline"
            fullWidth
            onClick={() => setIsChartOpen(false)}
            className="rounded-xl mt-6 text-xs h-10 font-bold font-iran-yekan"
          >
            متوجه شدم
          </Button>
        </ModalBody>
      </Modal>
    </Card>
  );
}