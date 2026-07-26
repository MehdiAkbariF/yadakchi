'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUserLocation, useChangeBasketLocation } from '@/domains/front/basket/hooks/basket.hooks';
import { Input } from '@/components/primitives/Input/Input';
import { Button } from '@/components/primitives/Button/Button';
import { MapPin, X, Plus, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { showToast } from '@/core/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';

const addressFormSchema = z.object({
  title: z.string().min(2, 'عنوان باید حداقل ۲ کاراکتر باشد'),
  postalCode: z.string().regex(/^[0-9]{9,10}$/, 'کد پستی باید ۹ یا ۱۰ رقم باشد'),
  plaque: z.string().min(1, 'شماره پلاک الزامی است'),
  unit: z.string().min(1, 'شماره واحد الزامی است'),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: any[];
  activeAddress: any;
  onOpenMapModal: () => void;
  mapAddressData: {
    address: string;
    latitude: number;
    longitude: number;
    cityId: string;
    cityName: string;
    provinceName: string;
  } | null;
  isNewAddressOpen: boolean;
  setIsNewAddressOpen: (open: boolean) => void;
}

export function AddressModal({ 
  isOpen, 
  onClose, 
  locations, 
  activeAddress, 
  onOpenMapModal,
  mapAddressData,
  isNewAddressOpen,
  setIsNewAddressOpen
}: AddressModalProps) {
  const [mounted, setMounted] = useState(false);
  const changeLocation = useChangeBasketLocation();
  const createLocation = useCreateUserLocation();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      title: '',
      postalCode: '',
      plaque: '',
      unit: '',
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mapAddressData) {
      reset({
        title: '',
        postalCode: '',
        plaque: '',
        unit: '',
      });
    }
  }, [mapAddressData, reset]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      onClose();
    };

    window.history.pushState({ modalOpen: 'address-modal' }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  const handleCreateAddress = async (data: AddressFormData) => {
    if (!mapAddressData) {
      showToast.error('خطا در همگام‌سازی موقعیت جغرافیایی نقشه');
      return;
    }

    const formData = new FormData();
    formData.append('Title', data.title);
    formData.append('Address', mapAddressData.address);
    formData.append('PostalCode', data.postalCode);
    formData.append('Plaque', data.plaque);
    formData.append('Unit', data.unit);
    formData.append('CityId', mapAddressData.cityId);
    formData.append('IsDefault', 'true');
    formData.append('IsUserReceiver', 'true');
    formData.append('Latitude', String(mapAddressData.latitude));
    formData.append('Longitude', String(mapAddressData.longitude));

    try {
      await createLocation.mutateAsync(formData);
      showToast.success('آدرس جدید با موفقیت ثبت شد');
      setIsNewAddressOpen(false);
      reset();
      onClose();
    } catch (err: any) {}
  };

  const handleSelectLocation = async (id: string) => {
    try {
      await changeLocation.mutateAsync(id);
      showToast.success('آدرس تحویل سفارش تغییر یافت');
      onClose();
    } catch (err: any) {}
  };

  const handleClose = () => {
    setIsNewAddressOpen(false);
    onClose();
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center text-right" dir="rtl">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        />
      </AnimatePresence>

      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        className="relative z-10 w-full h-full max-h-full max-w-none md:max-w-lg md:h-[500px] md:max-h-[90vh] md:rounded-xl p-0 overflow-hidden flex flex-col fixed inset-0 md:relative bg-background shadow-2xl"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b shrink-0 bg-muted/20">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleClose}
              className="md:hidden p-1 -mr-1 hover:bg-muted rounded-full"
              aria-label="Back"
            >
              <ArrowRight className="h-5 w-5 text-foreground" />
            </button>
            <span className="text-sm font-bold font-iran-yekan flex items-center gap-1.5 text-foreground">
              <MapPin className="h-4.5 w-4.5 text-primary" />
              {isNewAddressOpen ? 'تکمیل جزئیات آدرس تحویل' : 'انتخاب آدرس تحویل سفارش'}
            </span>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleClose} className="hidden md:flex rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className={cn("flex-1 overflow-y-auto p-5", isNewAddressOpen ? "pb-24" : "pb-5")}>
          {isNewAddressOpen ? (
            <form id="addressForm" onSubmit={handleSubmit(handleCreateAddress)} className="flex flex-col gap-4 text-right w-full">
              <div className="w-full">
                <Input
                  placeholder="عنوان آدرس * (مثال: خانه، محل کار)"
                  error={errors.title?.message}
                  className="text-xs font-iran-yekan w-full"
                  {...register('title')}
                />
              </div>
              <div className="w-full">
                <Input
                  placeholder="کد پستی * (۹ یا ۱۰ رقمی)"
                  error={errors.postalCode?.message}
                  className="text-xs font-iran-yekan text-left w-full"
                  dir="ltr"
                  {...register('postalCode')}
                />
              </div>
              <div className="w-full">
                <Input
                  placeholder="شماره پلاک *"
                  error={errors.plaque?.message}
                  className="text-xs font-iran-yekan w-full"
                  {...register('plaque')}
                />
              </div>
              <div className="w-full">
                <Input
                  placeholder="شماره واحد *"
                  error={errors.unit?.message}
                  className="text-xs font-iran-yekan w-full"
                  {...register('unit')}
                />
              </div>
              <div className="space-y-1 w-full">
                <span className="text-[10px] font-bold font-iran-yekan text-muted-foreground mr-1">موقعیت جغرافیایی قفل‌شده روی نقشه</span>
                <Input
                  value={mapAddressData?.cityName || ''}
                  className="text-xs font-iran-yekan bg-muted/30 border-zinc-200 w-full"
                  disabled
                  readOnly
                />
              </div>
              <div className="space-y-1 w-full">
                <span className="text-[10px] font-bold font-iran-yekan text-muted-foreground mr-1">نشانی پستی قفل‌شده روی نقشه</span>
                <Input
                  value={mapAddressData?.address || ''}
                  className="text-xs font-iran-yekan bg-muted/30 border-zinc-200 w-full"
                  disabled
                  readOnly
                />
              </div>
            </form>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={onOpenMapModal}
                className="rounded-xl text-xs font-bold font-iran-yekan h-10 border-primary/20 text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>ثبت آدرس جدید روی نقشه</span>
              </Button>

              <div className="space-y-2 pt-2">
                {locations.map((loc: any) => {
                  const isCurrent = activeAddress?.id === loc.id;
                  return (
                    <div
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc.id)}
                      className={cn(
                        "p-4 rounded-xl border cursor-pointer text-right flex items-start justify-between gap-4 transition-all hover:border-primary/30",
                        isCurrent ? "border-primary bg-primary/5" : "bg-background"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold font-iran-yekan text-foreground block mb-1">{loc.title}</span>
                        <p className="text-xs text-muted-foreground leading-relaxed font-iran-yekan">{loc.province}، {loc.city}، {loc.address} (پلاک {loc.plaque}، واحد {loc.unit})</p>
                      </div>
                      <div className="shrink-0 mt-0.5 text-primary">
                        {isCurrent ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5 text-muted-foreground/40" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {isNewAddressOpen && (
          <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-4 flex gap-3 shrink-0 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-6 md:pb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewAddressOpen(false)}
              className="flex-1 rounded-xl text-xs font-bold font-iran-yekan h-10"
            >
              مرحله قبل (نقشه)
            </Button>
            <Button
              type="submit"
              form="addressForm"
              variant="primary"
              size="sm"
              isLoading={createLocation.isPending}
              className="flex-1 rounded-xl text-xs font-bold font-iran-yekan h-10"
            >
              ثبت آدرس نهایی
            </Button>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}