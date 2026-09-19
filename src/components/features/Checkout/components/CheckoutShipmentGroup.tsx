'use client';

import { Truck, Store, Zap } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/composites/Card';
import { Typography } from '@/components/primitives/Typography';
import { cn } from '@/design-system/utils/cn';

interface CheckoutShipmentGroupProps {
  sub: any;
  index: number;
  totalSubBaskets: number;
  selectedMethod: string | null;
  onSelectMethod: (method: string) => void;
}

export function CheckoutShipmentGroup({
  sub,
  index,
  totalSubBaskets,
  selectedMethod,
  onSelectMethod,
}: CheckoutShipmentGroupProps) {
  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value / 10) + ' تومان';
  };

  // ۱. تیپاکس (Tipax = 2)
  const isTipaxAvailable = typeof sub.tipaxShipmentPrice === 'number' && sub.tipaxShipmentPrice > 0;

  // ۲. ارسال مستقیم فروشنده (DirectShipment = 3)
  const directPrice = sub.directShipmentPrice ?? sub.sellerShipmentPrice;
  const isDirectAvailable = typeof directPrice === 'number' && directPrice > 0;

  // ۳. اسنپ‌باکس (SnappBox = 5)
  const snappBoxPrice = sub.snappBoxShipmentPrice ?? sub.snappShipmentPrice;
  const isSnappBoxAvailable = typeof snappBoxPrice === 'number' && snappBoxPrice > 0;

  // ۴. دریافت حضوری (Local = 1)
  const isLocalAvailable = !!sub.isLocalShipmentAvailable;

  return (
    <Card className="w-full overflow-hidden border rounded-xl shadow-sm bg-background text-right">
      <CardHeader className="border-b bg-muted/20 px-4 py-3.5 flex items-center justify-between">
        <span className="text-xs font-bold font-iran-yekan text-foreground">
          مرسوله {new Intl.NumberFormat('fa-IR').format(index + 1)} از {new Intl.NumberFormat('fa-IR').format(totalSubBaskets)}
        </span>
        <span className="text-[10px] font-bold font-iran-yekan text-muted-foreground">
          ارسال از فروشگاه: {sub.shop?.shopTitle || ''}
        </span>
      </CardHeader>

      <CardBody className="p-5 flex flex-col gap-5">
        <div className="w-full flex flex-col gap-3">
          <Typography variant="h6" className="font-iran-yekan font-bold text-foreground border-b pb-1.5 mb-2">
            شیوه دریافت سفارش را انتخاب کنید
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* ۱. ارسال با تیپاکس */}
            {isTipaxAvailable && (
              <button
                type="button"
                onClick={() => onSelectMethod('Tipax')}
                className={cn(
                  "p-3.5 border rounded-xl flex items-center justify-between text-right transition-all outline-none",
                  selectedMethod === 'Tipax' 
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary font-bold" 
                    : "hover:border-primary/20 bg-background text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <Truck className="h-4.5 w-4.5 shrink-0" />
                  <span className="text-xs font-iran-yekan font-bold">ارسال با تیپاکس</span>
                </div>
                <span className="text-xs font-iran-yekan font-bold">{formatPrice(sub.tipaxShipmentPrice)}</span>
              </button>
            )}

            {/* ۲. ارسال مستقیم (فروشنده) */}
            {isDirectAvailable && (
              <button
                type="button"
                onClick={() => onSelectMethod('DirectShipment')}
                className={cn(
                  "p-3.5 border rounded-xl flex items-center justify-between text-right transition-all outline-none",
                  selectedMethod === 'DirectShipment' 
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary font-bold" 
                    : "hover:border-primary/20 bg-background text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <Truck className="h-4.5 w-4.5 shrink-0" />
                  <span className="text-xs font-iran-yekan font-bold">ارسال فروشنده</span>
                </div>
                <span className="text-xs font-iran-yekan font-bold">{formatPrice(directPrice)}</span>
              </button>
            )}

            {/* ۳. اسنپ‌باکس */}
            {isSnappBoxAvailable && (
              <button
                type="button"
                onClick={() => onSelectMethod('SnappBox')}
                className={cn(
                  "p-3.5 border rounded-xl flex items-center justify-between text-right transition-all outline-none",
                  selectedMethod === 'SnappBox' 
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary font-bold" 
                    : "hover:border-primary/20 bg-background text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4.5 w-4.5 shrink-0 text-amber-500" />
                  <span className="text-xs font-iran-yekan font-bold">اسنپ‌باکس (فوری)</span>
                </div>
                <span className="text-xs font-iran-yekan font-bold">{formatPrice(snappBoxPrice)}</span>
              </button>
            )}

            {/* ۴. تحویل حضوری */}
            {isLocalAvailable && (
              <button
                type="button"
                onClick={() => onSelectMethod('Local')}
                className={cn(
                  "p-3.5 border rounded-xl flex items-center justify-between text-right transition-all outline-none",
                  selectedMethod === 'Local' 
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary font-bold" 
                    : "hover:border-primary/20 bg-background text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <Store className="h-4.5 w-4.5 shrink-0" />
                  <span className="text-xs font-iran-yekan font-bold">دریافت حضوری</span>
                </div>
                <span className="text-xs font-iran-yekan font-bold text-success-500">رایگان</span>
              </button>
            )}
          </div>
        </div>

        {/* لیست محصولات سفارش */}
        <div className="w-full divide-y border-t border-dashed mt-3 pt-3">
          {sub.subBasketItems?.map((item: any) => (
            <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
              <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border bg-muted/10">
                <img
                  src={getFullUrl(item.shopProduct?.product?.image)}
                  alt={item.shopProduct?.product?.title || ''}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold font-iran-yekan text-foreground truncate">
                  {item.shopProduct?.product?.title}
                </h4>
                <span className="text-[10px] font-bold font-iran-yekan text-muted-foreground block mt-1.5">
                  تعداد: {new Intl.NumberFormat('fa-IR').format(item.quantity)} عدد
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}