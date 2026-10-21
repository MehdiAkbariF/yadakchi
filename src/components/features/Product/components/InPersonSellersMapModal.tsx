'use client';

import * as React from 'react';
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
import { getFullUrl } from '@/core/utils/formatters';

export interface InPersonSellersMapModalProps {
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
  initialActiveSellerId = null,
}: InPersonSellersMapModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const [activeSellerId, setActiveSellerId] = React.useState<string | null>(null);
  const [reportShop, setReportShop] = React.useState<any | null>(null);

  const [selectedSubjectId, setSelectedSubjectId] = React.useState('');
  const [reportDescription, setReportDescription] = React.useState('');

  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markersRef = React.useRef<Record<string, any>>({});
  const cardRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const { data: reportSubjects = [] } = useGetReportSubjects('ShopProductReport');
  const submitReport = useSubmitShopReport();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
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
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handlePopState = () => onClose();
    window.history.pushState({ modalOpen: 'in-person-map' }, '');
    window.addEventListener('popstate', handlePopState);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !isOpen || sellers.length === 0) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
    }
    const L = (window as any).L;
    const targetSellerId = initialActiveSellerId || sellers[0]?.id;
    const targetSeller = sellers.find((s) => s.id === targetSellerId) || sellers[0];
    const initialLat = targetSeller?.shop?.latitude || 35.6892;
    const initialLon = targetSeller?.shop?.longitude || 51.389;
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
    if (initialActiveSellerId) setActiveSellerId(initialActiveSellerId);

    sellers.forEach((seller) => {
      if (!seller.shop?.latitude || !seller.shop?.longitude) return;
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div class="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
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

  React.useEffect(() => {
    if (isOpen && activeSellerId && cardRefs.current[activeSellerId]) {
      cardRefs.current[activeSellerId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
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

  const formatPrice = (value: number) => new Intl.NumberFormat('fa-IR').format(value);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-modal flex h-screen w-screen items-center justify-center overflow-hidden">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm"
        />
      </AnimatePresence>

      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        className="relative z-10 flex h-screen w-screen flex-col bg-card shadow-lg"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-4 py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="بازگشت"
              className="-me-1 rounded-full p-1 hover:bg-muted"
            >
              <ArrowRight aria-hidden="true" className="h-5 w-5 text-foreground" />
            </button>
            <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <MapPin aria-hidden="true" className="h-4 w-4 text-primary" />
              فروشگاه‌های حضوری: {productTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-muted"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex min-h-0 w-full flex-1 flex-col md:flex-row">
          <div className="hidden min-h-0 w-[380px] shrink-0 flex-col gap-3 overflow-y-auto border-e border-border bg-card p-4 md:flex">
            {sellers.map((seller) => {
              const isSelected = activeSellerId === seller.id;
              return (
                <div
                  key={seller.id}
                  onClick={() => handleSelectSeller(seller)}
                  className={cn(
                    'flex h-fit cursor-pointer flex-col overflow-hidden rounded-md border transition-colors',
                    isSelected
                      ? 'border-primary bg-accent/50 p-4 gap-3'
                      : 'border-border bg-card p-3.5 gap-0 hover:border-primary/40'
                  )}
                >
                  <div className="flex w-full items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                      {seller.shop.logo ? (
                        <img src={getFullUrl(seller.shop.logo)} className="h-full w-full object-contain" alt="" />
                      ) : (
                        <Store aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-shop">{seller.shop.title}</span>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-2xs text-muted-foreground">شهر ری</span>
                        <span className="text-muted-foreground">|</span>
                        <span className="text-2xs font-bold text-success">عملکرد عالی</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 flex w-full items-center justify-between border-t border-dashed border-border pt-3">
                    <div className="flex flex-col">
                      {seller.hasDiscount ? (
                        <span className="mb-1 text-2xs leading-none text-muted-foreground line-through">
                          {formatPrice(seller.retailPriceRaw / 10)}
                        </span>
                      ) : null}
                      <span className="text-xs font-bold leading-none text-foreground md:text-sm">
                        {seller.finalPrice}
                      </span>
                    </div>

                    {seller.hasDiscount ? (
                      <span className="rounded-sm bg-accent px-2 py-0.5 text-2xs font-bold text-accent-foreground">
                        {seller.discountPercentage}% تخفیف
                      </span>
                    ) : null}

                    <Button
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      className="h-8 px-3.5 text-2xs font-bold"
                    >
                      {isSelected ? 'نمایش اطلاعات' : 'مشاهده جزئیات'}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {isSelected ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-1 flex w-full flex-col gap-3.5 overflow-hidden border-t border-dashed border-border pt-3"
                      >
                        <div className="flex w-full flex-col gap-1">
                          <span className="text-2xs font-bold text-muted-foreground">آدرس فروشگاه:</span>
                          <p className="text-xs font-bold leading-relaxed text-foreground">{seller.shop.address}</p>
                        </div>

                        <div className="flex w-full gap-2">
                          <a
                            href={`tel:${seller.shop.tell}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex h-9 flex-1 items-center justify-center gap-1 rounded-md border border-border text-xs font-bold text-foreground shadow-xs transition-colors hover:bg-muted"
                          >
                            <Phone aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                            <span>تماس با فروشگاه</span>
                          </a>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${seller.shop.latitude},${seller.shop.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex h-9 flex-1 items-center justify-center gap-1 rounded-md bg-primary text-xs font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary-hover"
                          >
                            <Navigation aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                            <span>مسیریابی روی نقشه</span>
                          </a>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="relative z-0 h-full min-h-0 flex-1">
            {!mapLoaded ? (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-card/80">
                <Loader2 aria-hidden="true" className="h-7 w-7 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">در حال بارگذاری نقشه...</span>
              </div>
            ) : null}
            <div ref={mapContainerRef} className="h-full w-full" />
          </div>

          <div className="absolute inset-x-4 bottom-4 z-10 flex items-end gap-3 overflow-x-auto py-1 scrollbar-none md:hidden">
            {sellers.map((seller) => {
              const isSelected = activeSellerId === seller.id;
              return (
                <div
                  key={seller.id}
                  ref={(el) => { cardRefs.current[seller.id] = el; }}
                  onClick={() => handleSelectSeller(seller)}
                  className={cn(
                    'flex h-fit min-w-[280px] max-w-[280px] shrink-0 flex-col overflow-hidden rounded-md border bg-card shadow-lg transition-colors',
                    isSelected ? 'border-primary p-4 gap-3' : 'border-border p-3.5 gap-0'
                  )}
                >
                  <div className="flex w-full items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                      {seller.shop.logo ? (
                        <img src={getFullUrl(seller.shop.logo)} className="h-full w-full object-contain" alt="" />
                      ) : (
                        <Store aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-shop">{seller.shop.title}</span>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-2xs text-muted-foreground">شهر ری</span>
                        <span className="text-muted-foreground">|</span>
                        <span className="text-2xs font-bold text-success">عملکرد عالی</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 flex w-full items-center justify-between border-t border-dashed border-border pt-3">
                    <div className="flex flex-col">
                      {seller.hasDiscount ? (
                        <span className="mb-1 text-2xs leading-none text-muted-foreground line-through">
                          {formatPrice(seller.retailPriceRaw / 10)}
                        </span>
                      ) : null}
                      <span className="text-xs font-bold leading-none text-foreground md:text-sm">
                        {seller.finalPrice}
                      </span>
                    </div>

                    <Button
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      className="h-8 px-3.5 text-2xs font-bold"
                    >
                      {isSelected ? 'نمایش اطلاعات' : 'مشاهده جزئیات'}
                    </Button>
                  </div>

                  {isSelected ? (
                    <div className="mt-1 flex w-full flex-col gap-3 border-t border-dashed border-border pt-3">
                      <div className="flex w-full flex-col gap-1">
                        <span className="text-2xs font-bold text-muted-foreground">آدرس فروشگاه:</span>
                        <p className="text-xs font-bold leading-relaxed text-foreground">{seller.shop.address}</p>
                      </div>

                      <div className="flex w-full gap-2">
                        <a
                          href={`tel:${seller.shop.tell}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-9 flex-1 items-center justify-center gap-1 rounded-md border border-border bg-card text-xs font-bold text-foreground shadow-xs"
                        >
                          <Phone aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                          <span>تماس</span>
                        </a>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${seller.shop.latitude},${seller.shop.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-9 flex-1 items-center justify-center gap-1 rounded-md bg-primary text-xs font-bold text-primary-foreground shadow-xs"
                        >
                          <Navigation aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                          <span>مسیریابی</span>
                        </a>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <Modal isOpen={!!reportShop} onClose={() => setReportShop(null)} className="w-full max-w-md">
          <ModalHeader onClose={() => setReportShop(null)}>
            <ModalTitle className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <AlertTriangle aria-hidden="true" className="h-4 w-4 text-destructive" />
              گزارش خطا در قیمت فروشگاه {reportShop?.shop.title}
            </ModalTitle>
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4 p-0 pt-4">
            <Select
              label="دلیل گزارش *"
              placeholder="دلیل گزارش را انتخاب کنید..."
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              options={reportSubjects.map((sub: any) => ({ value: sub.id, label: sub.title }))}
            />

            <TextArea
              label="توضیحات (اختیاری)"
              placeholder="توضیحات خود را اینجا بنویسید..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="h-24"
            />

            <div className="mt-4 flex w-full gap-2.5">
              <Button
                variant="outline"
                onClick={() => {
                  setReportShop(null);
                  setSelectedSubjectId('');
                  setReportDescription('');
                }}
                className="h-10 flex-1 text-xs font-bold"
              >
                انصراف
              </Button>
              <Button
                variant="destructive"
                onClick={handleReportSubmit}
                isLoading={submitReport.isPending}
                className="h-10 flex-1 text-xs font-bold"
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
