'use client';

import { useState } from 'react';
import { Store, ShieldCheck, MapPin, Truck, AlertTriangle, Phone, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Button } from '@/components/primitives/Button/Button';
import { useAddToBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { InPersonSellersMapModal } from './InPersonSellersMapModal';
import { useGetReportSubjects, useSubmitShopReport } from '@/domains/front/shop/hooks/shop.hooks';
import { Select } from '@/components/primitives/Select/Select';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { showToast } from '@/core/utils/toast';

interface SellersListProps {
  activeSellers: any;
  selectedSellerId: string | null;
  onSelectSeller: (id: string) => void;
  productTitle?: string;
}

export function SellersList({ activeSellers, selectedSellerId, onSelectSeller, productTitle = 'قطعه یدکی' }: SellersListProps) {
  const [activeTab, setActiveTab] = useState<'online' | 'local'>('online');
  const [reportShop, setReportShop] = useState<any | null>(null);
  const [loadingSellerId, setLoadingSellerId] = useState<string | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapInitialSellerId, setMapInitialSellerId] = useState<string | null>(null);

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const addToBasket = useAddToBasket();
  const { data: reportSubjects = [] } = useGetReportSubjects('ShopProductReport');
  const submitReport = useSubmitShopReport();

  const onlineList = activeSellers.online || [];
  const localList = activeSellers.local || [];

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

  const handleAddOnlineToBasket = async (e: React.MouseEvent, seller: any) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingSellerId(seller.id);
    try {
      await addToBasket.mutateAsync({ shopProductId: seller.id, quantity: 1 });
      showToast.success('قطعه با موفقیت به سبد خرید افزوده شد');
    } catch (err: any) {
    } finally {
      setLoadingSellerId(null);
    }
  };

  const handleOpenMapWithSeller = (e: React.MouseEvent, seller: any) => {
    e.preventDefault();
    e.stopPropagation();
    setMapInitialSellerId(seller.id);
    setIsMapModalOpen(true);
  };

  const handleOpenGeneralMap = () => {
    setMapInitialSellerId(null);
    setIsMapModalOpen(true);
  };

  const handleReportSubmit = async () => {
    if (!selectedSubjectId) {
      showToast.error('لطفاً دلیل گزارش را انتخاب کنید');
      return;
    }

    try {
      await submitReport.mutateAsync({
        shopId: reportShop.shop.id,
        shopProductId: reportShop.id,
        reportSubjectId: selectedSubjectId,
        description: reportDescription,
      });

      showToast.success('گزارش خطای قیمت با موفقیت ثبت شد و توسط پشتیبانی بررسی خواهد گردید');
      setReportShop(null);
      setSelectedSubjectId('');
      setReportDescription('');
    } catch (error: any) {
      showToast.error(error.userMessage || 'خطا در ثبت گزارش');
    }
  };

  const renderSellerRow = (seller: any) => {
    const isOnline = activeTab === 'online';
    const isSelected = isOnline && selectedSellerId === seller.id;

    return (
      <div
        key={seller.id}
        onClick={() => isOnline && onSelectSeller(seller.id)}
        className={cn(
          "p-4 md:p-5 rounded-2xl border flex items-start justify-between gap-4 transition-all w-full",
          isSelected ? "border-primary bg-primary/5" : "bg-background",
          isOnline ? "cursor-pointer hover:border-primary/20" : "cursor-default"
        )}
      >
        <div className="flex-1 flex gap-3.5 items-start min-w-0">
          <div className="w-12 h-12 shrink-0 rounded-xl border bg-muted/10 flex items-center justify-center overflow-hidden">
            {seller.shop.logo ? (
              <img src={getFullUrl(seller.shop.logo)} className="w-full h-full object-contain" alt="" />
            ) : (
              <Store className="h-5 w-5 text-muted-foreground/80" />
            )}
          </div>
          
          <div className="flex-1 min-w-0 text-right flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs md:text-sm font-bold text-foreground truncate">{seller.shop.title}</span>
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{seller.typeLabel}</span>
              {seller.isAdvertised && (
                <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">آگهی</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] md:text-xs text-muted-foreground font-iran-sans">
              <span className="font-bold text-success-500">عملکرد عالی</span>
              <span className="text-zinc-300">|</span>
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-zinc-400" />
                {seller.dayOfDeliveryLabel}
              </span>
              <span className="text-zinc-300">|</span>
              <span className="flex items-center gap-1 text-success-600 dark:text-success-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                ضمانت اصالت کالا
              </span>
            </div>

            {!isOnline && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-iran-sans mt-1.5">
                <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">{seller.shop.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end justify-start gap-3 shrink-0">
          {isOnline ? (
            <Button
              variant={isSelected ? "primary" : "outline"}
              size="sm"
              onClick={(e) => handleAddOnlineToBasket(e, seller)}
              disabled={loadingSellerId === seller.id}
              className="rounded-xl text-xs font-bold font-iran-sans h-10 px-5 w-auto min-w-[110px] md:min-w-[130px] shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
            >
              {loadingSellerId === seller.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>افزودن به سبد</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handleOpenMapWithSeller(e, seller)}
              className="rounded-xl text-xs font-bold font-iran-sans h-10 px-5 w-auto min-w-[110px] md:min-w-[130px] border-zinc-200 hover:bg-muted text-foreground shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>اطلاعات تماس</span>
            </Button>
          )}

          <div className="flex flex-col items-end text-right mt-1">
            <span className="text-sm md:text-base font-black text-foreground font-iran-sans leading-none">{seller.finalPrice}</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setReportShop(seller);
              }}
              className="text-[9px] md:text-[10px] font-bold font-iran-sans text-muted-foreground hover:text-destructive flex items-center gap-0.5 mt-2.5 outline-none"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>گزارش خطای قیمت</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 text-right mt-4 select-none relative">
      
      <div className="sticky top-[64px] lg:top-[76px] z-20 bg-background border-b pb-2 flex items-center gap-6 w-full shadow-sm px-1 transition-all duration-300">
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
              <div 
                onClick={handleOpenGeneralMap}
                className="w-full h-36 border border-zinc-150 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 relative overflow-hidden flex flex-col items-center justify-center p-6 gap-3 cursor-pointer shadow-sm group hover:border-primary/30 transition-all mt-2 select-none"
              >
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-zinc-950/5 pointer-events-none" />
                <div className="p-3 bg-primary/10 rounded-full border border-primary/20 text-primary group-hover:scale-105 transition-transform duration-300 z-10 shrink-0">
                  <MapPin className="h-6 w-6 stroke-[2]" />
                </div>
                <span className="text-xs md:text-sm font-black font-iran-sans text-foreground z-10">مشاهده تمام فروشگاه‌های حضوری روی نقشه</span>
                <button
                  type="button"
                  className="text-[10px] font-bold font-iran-sans border-b border-primary text-primary pb-0.5 hover:text-primary/80 transition-colors z-10 outline-none"
                >
                  مشاهده نقشه
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={!!reportShop} onClose={() => setReportShop(null)} className="max-w-md w-full">
        <ModalHeader onClose={() => setReportShop(null)}>
          <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-1.5">
            <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
            گزارش خطا در قیمت فروشگاه {reportShop?.shop.title}
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="p-0 pt-4 text-right flex flex-col gap-4">
          <div className="flex flex-col gap-1 w-full">
            <Select
              label="دلیل گزارش *"
              placeholder="دلیل گزارش را انتخاب کنید..."
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              options={reportSubjects.map((sub: any) => ({
                value: sub.id,
                label: sub.title,
              }))}
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <TextArea
              label="توضیحات (اختیاری)"
              placeholder="توضیحات خود را اینجا بنویسید..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="h-24"
            />
          </div>

          <div className="flex gap-2.5 mt-4 w-full">
            <Button
              variant="outline"
              onClick={() => {
                setReportShop(null);
                setSelectedSubjectId('');
                setReportDescription('');
              }}
              className="rounded-xl text-xs h-10 font-bold font-iran-sans"
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={handleReportSubmit}
              isLoading={submitReport.isPending}
              className="rounded-xl text-xs h-10 font-bold font-iran-sans"
            >
              ثبت گزارش خطا
            </Button>
          </div>
        </ModalBody>
      </Modal>

      <InPersonSellersMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        sellers={localList}
        productTitle={productTitle}
        initialActiveSellerId={mapInitialSellerId}
      />

    </div>
  );
}