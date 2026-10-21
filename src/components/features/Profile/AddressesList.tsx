'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Plus, Trash2, Pencil, User, Phone, ArrowRight } from 'lucide-react';
import {
  useGetUserLocations,
  useCreateUserLocation,
  useUpdateUserLocation,
  useDeleteUserLocation,
  useChangeBasketLocation,
} from '@/domains/front/basket/hooks/basket.hooks';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { AddressMapModal } from '@/components/composites/AddressMapModal/AddressMapModal';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

function LottiePlayer({ path, className = 'w-48 h-48', loop = true }: { path: string; className?: string; loop?: boolean }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let anim: any = null;
    let isMounted = true;
    const init = async () => {
      try {
        const altPath = path.includes('/anumations/')
          ? path.replace('/anumations/', '/animations/')
          : path.replace('/animations/', '/anumations/');
        let animationData: any = null;
        for (const p of [path, altPath]) {
          try {
            const res = await fetch(p);
            if (res.ok) {
              animationData = await res.json();
              break;
            }
          } catch {}
        }
        if (!animationData || !isMounted || !containerRef.current) return;
        const lottieModule = await import('lottie-web');
        const lottie = lottieModule.default || lottieModule;
        if (containerRef.current && isMounted) {
          anim = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay: true,
            animationData,
          });
        }
      } catch {}
    };
    init();
    return () => {
      isMounted = false;
      anim?.destroy();
    };
  }, [path, loop]);

  return <div ref={containerRef} className={className} />;
}

const addressFormSchema = z.object({
  title: z.string().min(2, 'عنوان آدرس باید حداقل ۲ کاراکتر باشد'),
  postalCode: z.string().regex(/^[0-9]{9,10}$/, 'کد پستی باید ۹ یا ۱۰ رقم باشد'),
  plaque: z.string().min(1, 'شماره پلاک الزامی است'),
  unit: z.string().min(1, 'شماره واحد الزامی است'),
  isUserReceiver: z.boolean(),
  receiverFullName: z.string().optional(),
  receiverMobile: z.string().optional(),
  receiverNationalCode: z.string().optional(),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

export function AddressesList() {
  const router = useRouter();

  const { data: locations = [], isLoading } = useGetUserLocations();

  const createLocation = useCreateUserLocation();
  const updateLocation = useUpdateUserLocation();
  const deleteLocation = useDeleteUserLocation();
  const changeLocation = useChangeBasketLocation();

  const [isMapOpen, setIsMapOpen] = React.useState(false);
  const [isFormOpen, setIsAddFormOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<any | null>(null);
  const [mapInitialCoords, setMapInitialCoords] = React.useState<{ lat: number; lon: number } | null>(null);

  const [mapData, setMapAddressData] = React.useState<{
    address: string;
    latitude: number;
    longitude: number;
    cityId: string;
    cityName: string;
    provinceName: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      title: '',
      postalCode: '',
      plaque: '',
      unit: '',
      isUserReceiver: true,
      receiverFullName: '',
      receiverMobile: '',
      receiverNationalCode: '',
    },
  });

  const watchIsUserReceiver = watch('isUserReceiver');

  const handleOpenNewAddressMap = () => {
    setEditingAddress(null);
    setMapInitialCoords(null);
    setIsMapOpen(true);
  };

  const handleOpenEditAddressMap = (addr: any) => {
    setEditingAddress(addr);
    setMapInitialCoords({ lat: addr.latitude, lon: addr.longitude });
    setIsMapOpen(true);
  };

  const handleConfirmMapAddress = (data: {
    address: string;
    latitude: number;
    longitude: number;
    cityId: string;
    cityName: string;
    provinceName: string;
  }) => {
    setMapAddressData(data);
    setIsMapOpen(false);

    if (editingAddress) {
      reset({
        title: editingAddress.title,
        postalCode: editingAddress.postalCode,
        plaque: editingAddress.plaque,
        unit: editingAddress.unit,
        isUserReceiver: editingAddress.isUserReceiver,
        receiverFullName: editingAddress.receiverFullName || '',
        receiverMobile: editingAddress.receiverMobile || '',
        receiverNationalCode: editingAddress.receiverNationalCode || '',
      });
    } else {
      reset({
        title: '',
        postalCode: '',
        plaque: '',
        unit: '',
        isUserReceiver: true,
        receiverFullName: '',
        receiverMobile: '',
        receiverNationalCode: '',
      });
    }
    setIsAddFormOpen(true);
  };

  const handleFormSubmit = async (data: AddressFormValues) => {
    if (!mapData) return;

    const formData = new FormData();
    formData.append('Title', data.title);
    formData.append('Address', mapData.address);
    formData.append('PostalCode', data.postalCode);
    formData.append('Plaque', data.plaque);
    formData.append('Unit', data.unit);
    formData.append('CityId', mapData.cityId);
    formData.append('IsUserReceiver', String(data.isUserReceiver));
    formData.append('Latitude', String(mapData.latitude));
    formData.append('Longitude', String(mapData.longitude));

    if (!data.isUserReceiver) {
      formData.append('ReceiverFullName', data.receiverFullName || '');
      formData.append('ReceiverMobile', data.receiverMobile || '');
      formData.append('ReceiverNationalCode', data.receiverNationalCode || '');
    }

    try {
      if (editingAddress) {
        formData.append('Id', editingAddress.id);
        formData.append('IsDefault', String(editingAddress.isDefault));
        await updateLocation.mutateAsync(formData);
        showToast.success('آدرس با موفقیت ویرایش شد');
      } else {
        formData.append('IsDefault', 'false');
        await createLocation.mutateAsync(formData);
        showToast.success('آدرس جدید با موفقیت ثبت شد');
      }
      setIsAddFormOpen(false);
      setEditingAddress(null);
      setMapAddressData(null);
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLocation.mutateAsync(id);
      showToast.success('آدرس با موفقیت حذف شد');
    } catch {}
  };

  const handleSetDefault = async (id: string) => {
    try {
      await changeLocation.mutateAsync(id);
      showToast.success('آدرس پیش‌فرض تحویل سفارشات تغییر یافت');
    } catch {}
  };

  if (isLoading) {
    return <PageLoading label="در حال لود آدرس‌های شما..." />;
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="mb-1 flex items-center justify-between border-b border-border pb-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/profile')}
            aria-label="بازگشت"
            className="-me-1 flex items-center justify-center rounded-full p-1 transition-colors hover:bg-muted"
          >
            <ArrowRight aria-hidden="true" className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-sm font-bold text-foreground">آدرس‌های من</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenNewAddressMap}
          className="flex h-9 shrink-0 items-center justify-center gap-1 border-accent px-4 py-1.5 text-2xs text-primary hover:bg-accent/50"
        >
          <Plus aria-hidden="true" className="h-3.5 w-3.5" />
          <span>ثبت آدرس</span>
        </Button>
      </div>

      <div className="hidden items-center justify-between border-b border-border pb-3 lg:flex">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <MapPin aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-xl font-bold text-foreground">آدرس‌های من</span>
          </div>
          <p className="text-xs text-muted-foreground">
            آدرس‌های ذخیره‌شده جهت تسریع روند ثبت نهایی سفارشات و محاسبه هزینه‌های ارسال
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenNewAddressMap}
          className="flex h-10 items-center justify-center gap-1.5 px-5 text-xs font-bold shadow-xs"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          <span>ثبت آدرس جدید روی نقشه</span>
        </Button>
      </div>

      {locations.length > 0 ? (
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          {locations.map((loc: any) => (
            <Card key={loc.id} className="flex w-full flex-col justify-between gap-4 p-5">
              <div className="flex w-full items-center justify-between border-b border-dashed border-border pb-3.5">
                <span className="text-sm font-bold text-foreground">{loc.title}</span>
                <button
                  type="button"
                  onClick={() => handleSetDefault(loc.id)}
                  disabled={changeLocation.isPending}
                  className={cn(
                    'rounded-md border px-2.5 py-1 text-xs font-bold transition-colors',
                    loc.isDefault
                      ? 'border-success/30 bg-success/10 text-success'
                      : 'border-border bg-muted text-muted-foreground hover:bg-accent'
                  )}
                >
                  {loc.isDefault ? 'آدرس پیش‌فرض' : 'انتخاب به عنوان پیش‌فرض'}
                </button>
              </div>

              <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
                <p className="font-bold leading-relaxed text-foreground">
                  {loc.province}، {loc.city}، {loc.address}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-2">
                  <span>پلاک: {loc.plaque}</span>
                  <span>واحد: {loc.unit}</span>
                  <span>کد پستی: {loc.postalCode}</span>
                </div>
                {loc.isUserReceiver ? (
                  <div className="mt-1 flex items-center gap-1.5 border-t border-dashed border-border pt-2.5">
                    <User aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                    <span>تحویل‌گیرنده: خودتان ({loc.receiverFullName})</span>
                  </div>
                ) : (
                  <div className="mt-1 flex flex-col gap-1.5 border-t border-dashed border-border pt-2.5">
                    <div className="flex items-center gap-1.5">
                      <User aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                      <span>تحویل‌گیرنده: {loc.receiverFullName}</span>
                    </div>
                    {loc.receiverMobile ? (
                      <div className="flex items-center gap-1.5">
                        <Phone aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                        <span>شماره تماس: {loc.receiverMobile}</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="mt-1.5 flex items-center justify-end gap-2 border-t border-dashed border-border pt-3.5">
                <button
                  type="button"
                  onClick={() => handleOpenEditAddressMap(loc)}
                  aria-label="ویرایش"
                  className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-primary"
                >
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(loc.id)}
                  disabled={deleteLocation.isPending}
                  aria-label="حذف"
                  className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-4 py-12 text-center">
          <LottiePlayer path="/anumations/addresss.json" className="mx-auto h-48 w-48 max-w-full" />
          <span className="text-sm font-bold text-muted-foreground">
            هیچ آدرسی در حساب کاربری شما ثبت نشده است.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenNewAddressMap}
            className="mt-2 flex h-10 items-center justify-center gap-1 px-6 py-2 text-xs font-bold shadow-xs"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            <span>ثبت اولین آدرس روی نقشه</span>
          </Button>
        </div>
      )}

      <AddressMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirmAddress={handleConfirmMapAddress}
        initialCoordinates={mapInitialCoords}
      />

      <Modal isOpen={isFormOpen} onClose={() => setIsAddFormOpen(false)} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsAddFormOpen(false)}>
          <ModalTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
            <MapPin aria-hidden="true" className="h-5 w-5 text-primary" />
            {editingAddress ? 'ویرایش جزئیات آدرس' : 'تکمیل اطلاعات آدرس جدید'}
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="p-0 pt-4">
          {mapData ? (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="flex w-full flex-col gap-4">
              <Input
                label="عنوان آدرس *"
                placeholder="مثال: خانه، محل کار، باغ"
                error={errors.title?.message ? String(errors.title.message) : undefined}
                className="text-xs"
                {...register('title')}
              />

              <Input
                label="کد پستی *"
                placeholder="کد پستی ۱۰ رقمی بدون خط تیره..."
                type="text"
                maxLength={10}
                error={errors.postalCode?.message ? String(errors.postalCode.message) : undefined}
                className="text-xs"
                dir="ltr"
                {...register('postalCode')}
              />

              <div className="grid w-full grid-cols-2 gap-3">
                <Input
                  label="پلاک *"
                  placeholder="شماره پلاک..."
                  error={errors.plaque?.message ? String(errors.plaque.message) : undefined}
                  className="text-xs"
                  {...register('plaque')}
                />
                <Input
                  label="واحد *"
                  placeholder="شماره واحد..."
                  error={errors.unit?.message ? String(errors.unit.message) : undefined}
                  className="text-xs"
                  {...register('unit')}
                />
              </div>

              <div className="flex w-full flex-col gap-1 rounded-md border border-border bg-muted/60 p-3">
                <span className="text-2xs font-bold text-muted-foreground">نشانی جغرافیایی انتخاب شده:</span>
                <span className="text-xs font-bold leading-relaxed text-foreground">
                  {mapData.cityName}، {mapData.address}
                </span>
              </div>

              <div className="flex select-none items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="user_is_receiver"
                  className="h-4 w-4 cursor-pointer rounded-sm border-border text-primary focus:ring-2 focus:ring-ring"
                  {...register('isUserReceiver')}
                />
                <label htmlFor="user_is_receiver" className="cursor-pointer text-xs font-bold text-foreground">
                  تحویل‌گیرنده سفارش خودم هستم
                </label>
              </div>

              {!watchIsUserReceiver ? (
                <div className="mt-1 flex w-full flex-col gap-4.5 border-t border-dashed border-border pt-3">
                  <Input
                    label="نام و نام خانوادگی گیرنده *"
                    placeholder="نام کامل گیرنده را وارد کنید..."
                    error={errors.receiverFullName?.message ? String(errors.receiverFullName.message) : undefined}
                    className="text-xs"
                    {...register('receiverFullName')}
                  />
                  <Input
                    label="شماره موبایل گیرنده *"
                    placeholder="مثال: 09123456789"
                    type="text"
                    maxLength={11}
                    error={errors.receiverMobile?.message ? String(errors.receiverMobile.message) : undefined}
                    className="text-xs"
                    dir="ltr"
                    {...register('receiverMobile')}
                  />
                </div>
              ) : null}

              <div className="mt-4 flex w-full gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddFormOpen(false)}
                  className="h-10 flex-1 text-xs"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createLocation.isPending || updateLocation.isPending}
                  className="h-10 flex-1 text-xs"
                >
                  {editingAddress ? 'ویرایش نهایی' : 'ثبت نهایی آدرس'}
                </Button>
              </div>
            </form>
          ) : null}
        </ModalBody>
      </Modal>
    </div>
  );
}