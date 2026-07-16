'use client';

import { useState } from 'react';
import { Store, ShieldCheck, MapPin, Truck, Award, Sparkles } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

interface SellersListProps {
  activeSellers: any;
  selectedSellerId: string | null;
  onSelectSeller: (id: string) => void;
}

export function SellersList({ activeSellers, selectedSellerId, onSelectSeller }: SellersListProps) {
  const [activeTab, setActiveTab] = useState<'online' | 'local'>('online');

  const onlineList = activeSellers.online || [];
  const localList = activeSellers.local || [];

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const handleOpenMap = () => {
    showToast.success('در حال آماده‌سازی نقشه فروشگاه‌ها...');
  };

  const renderSellerRow = (seller: any) => {
    const isSelected = selectedSellerId === seller.id;
    return (
      <div
        key={seller.id}
        onClick={() => onSelectSeller(seller.id)}
        className={cn(
          "p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer transition-all hover:border-primary/30",
          isSelected ? "border-primary bg-primary/5" : "bg-background"
        )}
      >
        <div className="flex-1 flex gap-3.5 items-center min-w-0">
          <div className="w-11 h-11 shrink-0 rounded-lg border bg-muted/15 flex items-center justify-center overflow-hidden">
            {seller.shop.logo ? (
              <img src={getFullUrl(seller.shop.logo)} className="w-full h-full object-contain" alt="" />
            ) : (
              <Store className="h-5 w-5 text-muted-foreground/80" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs md:text-sm font-bold text-foreground block truncate font-iran-sans">{seller.shop.title}</span>
            <div className="flex flex-wrap gap-2.5 items-center mt-1">
              <span className="text-[10px] font-bold text-success-500 font-iran-sans flex items-center gap-0.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                {seller.warrantyTitle}
              </span>
              <span className="text-[10px] font-bold text-primary font-iran-sans flex items-center gap-0.5">
                <Sparkles className="h-3.5 w-3.5" />
                {seller.typeLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end text-right gap-1 shrink-0 w-full md:w-auto border-t md:border-t-0 border-dashed pt-3 md:pt-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-iran-sans">
            <Truck className="h-4 w-4 text-zinc-400" />
            <span>{seller.dayOfDeliveryLabel}</span>
          </div>
          {activeTab === 'local' && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-iran-sans mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-zinc-400" />
              <span>{seller.shop.address}</span>
            </div>
          )}
          <span className="text-sm md:text-base font-black text-foreground font-iran-sans mt-1.5">{seller.finalPrice}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 text-right mt-4">
      
      <div className="border-b pb-2 flex items-center gap-6">
        <button
          onClick={() => setActiveTab('online')}
          className={cn(
            "text-xs md:text-sm font-bold font-iran-yekan pb-2 border-b-2 transition-all outline-none",
            activeTab === 'online' ? "text-primary border-primary" : "text-muted-foreground border-transparent"
          )}
        >
          خرید اینترنتی ({onlineList.length} فروشگاه)
        </button>
        <button
          onClick={() => setActiveTab('local')}
          className={cn(
            "text-xs md:text-sm font-bold font-iran-yekan pb-2 border-b-2 transition-all outline-none",
            activeTab === 'local' ? "text-primary border-primary" : "text-muted-foreground border-transparent"
          )}
        >
          خرید حضوری ({localList.length} فروشگاه)
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {activeTab === 'online' ? (
          onlineList.length > 0 ? (
            onlineList.map((s: any) => renderSellerRow(s))
          ) : (
            <span className="text-xs text-muted-foreground font-iran-sans py-4">فروشگاه اینترنتی فعالی برای این قطعه موجود نیست.</span>
          )
        ) : (
          <>
            {localList.length > 0 ? (
              localList.map((s: any) => renderSellerRow(s))
            ) : (
              <span className="text-xs text-muted-foreground font-iran-sans py-4">فروشگاه حضوری فعالی برای این قطعه ثبت نشده است.</span>
            )}
            {localList.length > 0 && (
              <button
                onClick={handleOpenMap}
                className="w-full py-3.5 border border-dashed rounded-xl bg-muted/10 text-xs font-bold font-iran-sans text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 mt-1.5"
              >
                <MapPin className="h-4.5 w-4.5" />
                <span>مشاهده تمام فروشگاه‌های حضوری روی نقشه</span>
              </button>
            )}
          </>
        )}
      </div>

    </div>
  );
}

import { showToast } from '@/core/utils/toast';