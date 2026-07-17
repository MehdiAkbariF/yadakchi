'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, AlertTriangle, Phone, Navigation, ArrowRight, Store, Loader2 } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Button } from '@/components/primitives/Button/Button';
import { useGetReportSubjects, useSubmitShopReport } from '@/domains/front/shop/hooks/shop.hooks';
import { Select } from '@/components/primitives/Select/Select';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { showToast } from '@/core/utils/toast';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal';

interface InPersonSellersMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellers: any[];
  productTitle: string;
  initialActiveSellerId?: string | null;
}

export function InPersonSellersMapModal({
  isOpen,
  onClose,
  sellers = [],
  productTitle,
  initialActiveSellerId = null
}: InPersonSellersMapModalProps) {
  const [mounted, setMounted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeSellerId, setActiveSellerId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [reportShop, setReportShop] = useState<any | null>(null);

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: reportSubjects = [] } = useGetReportSubjects('ShopProductReport');
  const submitReport = useSubmitShopReport();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if ((window as any).L) {
      setMapLoaded(true);
      return;
    }

    const existingLink = document.getElementById('leaflet-css');
    if (!existingLink) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById('leaflet-js');
    if (existingScript) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      setMapLoaded(true);
    };
    document.body.appendChild(script);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handlePopState = () => {
      onClose();
    };

    window.history.pushState({ modalOpen: 'in-person-map' }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !isOpen || sellers.length === 0) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
    }

    const L = (window as any).L;
    
    const targetSellerId = initialActiveSellerId || sellers[0]?.id;
    const targetSeller = sellers.find(s => s.id === targetSellerId) || sellers[0];
    
    const initialLat = targetSeller?.shop?.latitude || 35.6892;
    const initialLon = targetSeller?.shop?.longitude || 51.3890;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    if (initialActiveSellerId) {
      setActiveSellerId(initialActiveSellerId);
    }

    sellers.forEach(seller => {
      if (!seller.shop?.latitude || !seller.shop?.longitude) return;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([seller.shop.latitude, seller.shop.longitude], { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          setActiveSellerId(seller.id);
          map.flyTo([seller.shop.latitude, seller.shop.longitude], 15);
        });

      markersRef.current[seller.id] = marker;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
  }, [mapLoaded, isOpen, sellers, initialActiveSellerId]);

  useEffect(() => {
    if (isOpen && activeSellerId && cardRefs.current[activeSellerId]) {
      cardRefs.current[activeSellerId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeSellerId, isOpen]);

  const handleSelectSeller = (seller: any) => {
    setActiveSellerId(seller.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([seller.shop.latitude, seller.shop.longitude], 15);
    }
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

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center text-right w-screen h-screen overflow-hidden" dir="rtl">
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        />
      </AnimatePresence>

      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        className="relative z-10 w-screen h-screen bg-background shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b shrink-0 bg-muted/20">
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-1 -mr-1 hover:bg-muted rounded-full"
              aria-label="Back"
            >
              <ArrowRight className="h-5 w-5 text-foreground" />
            </button>
            <span className="text-sm font-bold font-iran-yekan flex items-center gap-1.5 text-foreground">
              <MapPin className="h-4.5 w-4.5 text-primary" />
              فروشگاه‌های حضوری: {productTitle}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-full flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-0 w-full relative">
          
          <div className="hidden md:flex w-[380px] shrink-0 border-l flex-col bg-background min-h-0 overflow-y-auto p-4 gap-3">
            {sellers.map((seller) => {
              const isSelected = activeSellerId === seller.id;
              return (
                <div
                  key={seller.id}
                  onClick={() => handleSelectSeller(seller)}
                  className={cn(
                    "rounded-xl border cursor-pointer text-right flex flex-col transition-all overflow-hidden h-fit",
                    isSelected ? "border-primary bg-primary/5 p-4 gap-3" : "border-zinc-200 hover:border-zinc-300 bg-background p-3.5 gap-0"
                  )}
                >
                  <div className="flex gap-3 items-start w-full">
                    <div className="w-10 h-10 shrink-0 rounded-lg border bg-muted/10 flex items-center justify-center overflow-hidden">
                      {seller.shop.logo ? (
                        <img src={getFullUrl(seller.shop.logo)} className="w-full h-full object-contain" alt="" />
                      ) : (
                        <Store className="h-5 w-5 text-muted-foreground/80" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-foreground block truncate font-iran-sans">{seller.shop.title}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground font-iran-sans">شهر ری</span>
                        <span className="text-zinc-300">|</span>
                        <span className="text-[10px] text-success-500 font-bold font-iran-sans">عملکرد عالی</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-dashed pt-3 mt-2.5 w-full">
                    <div className="flex flex-col text-right">
                      {seller.hasDiscount && (
                        <span className="text-[9px] text-zinc-400 line-through leading-none mb-1 font-iran-sans">
                          {formatPrice(seller.retailPriceRaw / 10)}
                        </span>
                      )}
                      <span className="text-xs md:text-sm font-black text-foreground font-iran-sans leading-none">{seller.finalPrice}</span>
                    </div>
                    
                    {seller.hasDiscount && (
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {seller.discountPercentage}% تخفیف
                      </span>
                    )}

                    <Button
                      variant={isSelected ? "primary" : "outline"}
                      size="sm"
                      className="rounded-xl text-[10px] font-bold font-iran-sans h-8 px-3.5"
                    >
                      {isSelected ? "نمایش اطلاعات" : "مشاهده جزئیات"}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-dashed pt-3 mt-1 flex flex-col gap-3.5 text-right w-full"
                      >
                        <div className="flex flex-col gap-1 w-full">
                          <span className="text-[9px] font-bold text-muted-foreground font-iran-sans">آدرس فروشگاه:</span>
                          <p className="text-[11px] font-bold text-foreground font-iran-sans leading-relaxed">{seller.shop.address}</p>
                        </div>
                        
                        <div className="flex gap-2 w-full">
                          <a
                            href={`tel:${seller.shop.tell}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 h-9 rounded-xl border border-zinc-200 hover:bg-muted text-foreground text-[10px] font-bold font-iran-sans flex items-center justify-center gap-1 shadow-sm transition-all"
                          >
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span>تماس با فروشگاه</span>
                          </a>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${seller.shop.latitude},${seller.shop.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 h-9 rounded-xl bg-primary text-white text-[10px] font-bold font-iran-sans flex items-center justify-center gap-1 shadow-sm transition-all"
                          >
                            <Navigation className="h-3.5 w-3.5 shrink-0" />
                            <span>مسیریابی روی نقشه</span>
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="flex-1 h-full min-h-0 relative z-0">
            {!mapLoaded && (
              <div className="absolute inset-0 z-50 bg-background/80 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span className="text-xs font-iran-sans text-muted-foreground">در حال بارگذاری نقشه...</span>
              </div>
            )}
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          <div className="md:hidden absolute bottom-4 left-4 right-4 z-10 flex overflow-x-auto gap-3 no-scrollbar py-1 items-end">
            {sellers.map((seller) => {
              const isSelected = activeSellerId === seller.id;
              return (
                <div
                  key={seller.id}
                  ref={el => { cardRefs.current[seller.id] = el; }}
                  onClick={() => handleSelectSeller(seller)}
                  className={cn(
                    "rounded-xl border bg-background shadow-lg flex flex-col shrink-0 text-right transition-all overflow-hidden min-w-[280px] max-w-[280px] h-fit",
                    isSelected ? "border-primary p-4 gap-3" : "border-zinc-200 p-3.5 gap-0"
                  )}
                >
                  <div className="flex gap-3 items-start w-full">
                    <div className="w-10 h-10 shrink-0 rounded-lg border bg-muted/10 flex items-center justify-center overflow-hidden">
                      {seller.shop.logo ? (
                        <img src={getFullUrl(seller.shop.logo)} className="w-full h-full object-contain" alt="" />
                      ) : (
                        <Store className="h-5 w-5 text-muted-foreground/80" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-foreground block truncate font-iran-sans">{seller.shop.title}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-muted-foreground font-iran-sans">شهر ری</span>
                        <span className="text-zinc-300">|</span>
                        <span className="text-[10px] text-success-500 font-bold font-iran-sans">عملکرد عالی</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-dashed pt-3 mt-2.5 w-full">
                    <div className="flex flex-col text-right">
                      {seller.hasDiscount && (
                        <span className="text-[9px] text-zinc-400 line-through leading-none mb-1 font-iran-sans">
                          {formatPrice(seller.retailPriceRaw / 10)}
                        </span>
                      )}
                      <span className="text-xs md:text-sm font-black text-foreground font-iran-sans leading-none">{seller.finalPrice}</span>
                    </div>

                    <Button
                      variant={isSelected ? "primary" : "outline"}
                      size="sm"
                      className="rounded-xl text-[10px] font-bold font-iran-sans h-8 px-3.5"
                    >
                      {isSelected ? "نمایش اطلاعات" : "مشاهده جزئیات"}
                    </Button>
                  </div>

                  {isSelected && (
                    <div className="border-t border-dashed pt-3 mt-1 flex flex-col gap-3 text-right w-full animate-in slide-in-from-bottom duration-200">
                      <div className="flex flex-col gap-1 w-full">
                        <span className="text-[9px] font-bold text-muted-foreground font-iran-sans">آدرس فروشگاه:</span>
                        <p className="text-[11px] font-bold text-foreground font-iran-sans leading-relaxed">{seller.shop.address}</p>
                      </div>
                      
                      <div className="flex gap-2 w-full">
                        <a
                          href={`tel:${seller.shop.tell}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 h-9 rounded-xl border border-zinc-200 bg-background text-foreground text-[10px] font-bold font-iran-sans flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>تماس</span>
                        </a>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${seller.shop.latitude},${seller.shop.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 h-9 rounded-xl bg-primary text-white text-[10px] font-bold font-iran-sans flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Navigation className="h-3.5 w-3.5 shrink-0" />
                          <span>مسیریابی</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        <Modal isOpen={!!reportShop} onClose={() => setReportShop(null)} className="max-w-md w-full animate-none">
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

      </motion.div>
    </div>,
    document.body
  );
}