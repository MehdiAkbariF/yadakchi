'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, X, Plus, CheckCircle2, Circle, ArrowRight, Loader2, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateUserLocation, useSetBasketLocationAndPrice } from '@/domains/front/basket/hooks/basket.hooks';
import { Input } from '@/components/primitives/Input/Input';
import { Button } from '@/components/primitives/Button/Button';
import { cn } from '@/design-system/utils/cn';
import { showToast } from '@/core/utils/toast';

const addressFormSchema = z.object({
  title: z.string().min(2, 'عنوان باید حداقل ۲ کاراکتر باشد'),
  postalCode: z.string().regex(/^[0-9]{9,10}$/, 'کد پستی باید ۹ یا ۱۰ رقم باشد'),
  plaque: z.string().min(1, 'شماره پلاک الزامی است'),
  unit: z.string().min(1, 'شماره واحد الزامی است'),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

export interface AddressModalProps {
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
  locations = [],
  activeAddress,
  onOpenMapModal,
  mapAddressData,
  isNewAddressOpen,
  setIsNewAddressOpen,
}: AddressModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [selectingLocationId, setSelectingLocationId] = React.useState<string | null>(null);

  const setBasketLocation = useSetBasketLocationAndPrice();
  const createLocation = useCreateUserLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { title: '', postalCode: '', plaque: '', unit: '' },
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mapAddressData) {
      reset({ title: '', postalCode: '', plaque: '', unit: '' });
    }
  }, [mapAddressData, reset]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handlePopState = () => onClose();
    window.history.pushState({ modalOpen: 'address-modal' }, '');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, onClose]);

  const handleCreateAddress = async (data: AddressFormData) => {
    if (!mapAddressData) {
      showToast.error('موقعیت مکانی روی نقشه مشخص نشده است');
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
    } catch {}
  };

  // انتخاب آدرس همراه با نمایش لودینگ اختصاصی و مهار کلیک‌های مکرر
  const handleSelectLocation = async (id: string) => {
    if (selectingLocationId) return;
    setSelectingLocationId(id);

    try {
      await setBasketLocation.mutateAsync(id);
      showToast.success('آدرس تحویل با موفقیت انتخاب شد');
      onClose();
    } catch (err: any) {
      showToast.error(err?.userMessage || 'خطا در ثبت آدرس یا استعلام کرایه حمل');
    } finally {
      setSelectingLocationId(null);
    }
  };

  const handleClose = () => {
    if (selectingLocationId) return;
    setIsNewAddressOpen(false);
    onClose();
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-center justify-center p-0 md:p-4">
      {/* بک‌دراپ شیشه‌ای */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-foreground/45 backdrop-blur-xs"
        />
      </AnimatePresence>

      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 32 }}
        className="relative z-10 flex h-full max-h-full w-full max-w-none flex-col overflow-hidden bg-card shadow-2xl md:h-[580px] md:max-h-[90vh] md:max-w-xl md:rounded-2xl border border-border/80"
      >
        {/* هدر شفاف و استاندارد مودال */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-card px-5 py-4">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              aria-label="بازگشت"
              className="-me-1 rounded-full p-1.5 transition-colors hover:bg-secondary md:hidden"
            >
              <ArrowRight aria-hidden="true" className="h-5 w-5 text-foreground" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin aria-hidden="true" className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-foreground">
              {isNewAddressOpen ? 'تکمیل جزئیات آدرس جدید' : 'انتخاب آدرس تحویل سفارش'}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleClose}
            disabled={!!selectingLocationId}
            className="hidden rounded-full hover:bg-secondary md:flex"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>

        {/* بدنه مودال */}
        <div className={cn('flex-1 overflow-y-auto p-5', isNewAddressOpen ? 'pb-24' : 'pb-5')}>
          {isNewAddressOpen ? (
            /* فرم تکمیل آدرس */
            <form id="addressForm" onSubmit={handleSubmit(handleCreateAddress)} className="flex w-full flex-col gap-4">
              {/* کادر لوکیشن انتخاب‌شده روی نقشه */}
              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-secondary/30 p-3.5">
                <Navigation className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="text-2xs font-bold text-muted-foreground">
                    موقعیت مکانی: {mapAddressData?.provinceName}، {mapAddressData?.cityName}
                  </span>
                  <p className="text-xs font-semibold leading-relaxed text-foreground truncate">
                    {mapAddressData?.address}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-2xs font-bold text-muted-foreground">عنوان آدرس *</label>
                <Input
                  placeholder="مثال: خانه، محل کار، تعمیرگاه"
                  error={errors.title?.message}
                  className="h-10 text-xs"
                  {...register('title')}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-2xs font-bold text-muted-foreground">کد پستی ۱۰ رقمی *</label>
                <Input
                  placeholder="کد پستی بدون خط تیره"
                  error={errors.postalCode?.message}
                  className="h-10 text-xs"
                  dir="ltr"
                  {...register('postalCode')}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-2xs font-bold text-muted-foreground">شماره پلاک *</label>
                  <Input
                    placeholder="پلاک"
                    error={errors.plaque?.message}
                    className="h-10 text-xs"
                    {...register('plaque')}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-2xs font-bold text-muted-foreground">واحد *</label>
                  <Input
                    placeholder="واحد"
                    error={errors.unit?.message}
                    className="h-10 text-xs"
                    {...register('unit')}
                  />
                </div>
              </div>
            </form>
          ) : (
            /* لیست آدرس‌های کاربر */
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                disabled={!!selectingLocationId}
                onClick={onOpenMapModal}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border-dashed border-primary/60 bg-primary/[0.02] text-xs font-bold text-primary transition-colors hover:bg-primary/10"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                <span>ثبت آدرس جدید روی نقشه</span>
              </Button>

              <div className="flex flex-col gap-2.5 pt-2">
                {locations.map((loc: any) => {
                  const isCurrent = activeAddress?.id === loc.id;
                  const isThisSelecting = selectingLocationId === loc.id;
                  const isAnySelecting = Boolean(selectingLocationId);

                  return (
                    <div
                      key={loc.id}
                      onClick={() => !isAnySelecting && handleSelectLocation(loc.id)}
                      className={cn(
                        'group relative flex items-start justify-between gap-4 rounded-xl border p-4 transition-all duration-fast',
                        isAnySelecting ? 'cursor-wait pointer-events-none' : 'cursor-pointer',
                        isCurrent
                          ? 'border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-xs'
                          : 'border-border/70 bg-card hover:border-primary/40 hover:bg-secondary/30',
                        isThisSelecting && 'border-primary/80 bg-primary/[0.08]'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{loc.title}</span>
                          {loc.isDefault ? (
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-2xs font-semibold text-muted-foreground">
                              پیش‌فرض
                            </span>
                          ) : null}
                        </div>

                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {loc.province}، شهر {loc.city}، {loc.address} (پلاک {loc.plaque}، واحد {loc.unit})
                        </p>
                      </div>

                      {/* آیکون وضعیت یا لودینگ اختصاصی این کارت */}
                      <div className="mt-0.5 shrink-0">
                        {isThisSelecting ? (
                          <div className="flex items-center gap-1.5 text-primary">
                            <span className="hidden text-2xs font-semibold sm:inline">در حال استعلام...</span>
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        ) : isCurrent ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/30 transition-colors group-hover:text-primary/50" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* دکمه‌های پایینی فرم ثبت آدرس جدید */}
        {isNewAddressOpen ? (
          <div className="absolute inset-x-0 bottom-0 z-30 flex shrink-0 gap-3 border-t border-border/60 bg-card p-4 pb-6 shadow-sm md:pb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewAddressOpen(false)}
              className="h-10 flex-1 rounded-xl text-xs font-bold"
            >
              مرحله قبل (نقشه)
            </Button>
            <Button
              type="submit"
              form="addressForm"
              variant="primary"
              size="sm"
              isLoading={createLocation.isPending}
              className="h-10 flex-1 rounded-xl text-xs font-bold shadow-xs"
            >
              ثبت و انتخاب این آدرس
            </Button>
          </div>
        ) : null}
      </motion.div>
    </div>,
    document.body
  );
}