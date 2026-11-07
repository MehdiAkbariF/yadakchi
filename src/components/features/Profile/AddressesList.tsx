'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Plus,
  Trash2,
  Pencil,
  User,
  Phone,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import {
  useGetUserLocations,
  useCreateUserLocation,
  useUpdateUserLocation,
  useDeleteUserLocation,
} from '@/domains/front/basket/hooks/basket.hooks';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { AddressMapModal } from '@/components/composites/AddressMapModal/AddressMapModal';
import { LottiePlayer } from '@/components/shared/Lottie/LottiePlayer';
import { showToast } from '@/core/utils/toast';
import { toPersianDigits } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';

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
const queryClient = useQueryClient();
  const { data: locations = [], isLoading } = useGetUserLocations();

  const createLocation = useCreateUserLocation();
  const updateLocation = useUpdateUserLocation();
  const deleteLocation = useDeleteUserLocation();

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

  // ✅ اصلاح اصلی: ارسال درخواست PUT استاندارد به جای تغییر آدرس سبد خرید
 const handleSetDefault = async (loc: any) => {
    // ۱. تغییر آنی در کش (Optimistic Update) تا بدون ۱ میلی‌ثانیه تاخیر نتیجه را ببینید
    queryClient.setQueryData(['user', 'locations'], (old: any) => {
      if (!Array.isArray(old)) return old;
      return old.map((item: any) => ({
        ...item,
        isDefault: item.id === loc.id,
      }));
    });

    const formData = new FormData();
    formData.append('Id', loc.id);
    formData.append('Title', loc.title);
    formData.append('Address', loc.address);
    formData.append('PostalCode', loc.postalCode);
    formData.append('Plaque', loc.plaque);
    formData.append('Unit', loc.unit);
    formData.append('CityId', loc.cityId || '');
    formData.append('IsUserReceiver', String(loc.isUserReceiver));
    formData.append('Latitude', String(loc.latitude || 0));
    formData.append('Longitude', String(loc.longitude || 0));
    formData.append('IsDefault', 'true');

    if (!loc.isUserReceiver) {
      formData.append('ReceiverFullName', loc.receiverFullName || '');
      formData.append('ReceiverMobile', loc.receiverMobile || '');
      formData.append('ReceiverNationalCode', loc.receiverNationalCode || '');
    }

    try {
      await updateLocation.mutateAsync(formData);
      showToast.success('آدرس پیش‌فرض تحویل سفارشات تغییر یافت');
      // ۲. دریافت لیست تازه از سرور
      await queryClient.refetchQueries({ queryKey: ['user', 'locations'] });
    } catch {
      // در صورت بروز خطا لیست را به حالت قبل بازمی‌گردانیم
      await queryClient.refetchQueries({ queryKey: ['user', 'locations'] });
      showToast.error('خطا در تغییر آدرس پیش‌فرض');
    }
  };
  if (isLoading) {
    return <PageLoading label="در حال دریافت لیست آدرس‌های شما..." />;
  }

  return (
    <div className="flex w-full flex-col gap-5" dir="rtl">
      
      {/* هدر بخش آدرس‌ها */}
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">آدرس‌های من</h1>
          </div>
          <p className="hidden text-base text-muted-foreground sm:block">
            آدرس‌های ثبت‌شده جهت تسریع در ارسال سفارش‌ها و محاسبه دقیق هزینه حمل‌ونقل
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenNewAddressMap}
          className="h-9 gap-1.5 rounded-xl px-4 text-xs font-bold shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>ثبت آدرس جدید</span>
        </Button>
      </div>

      {/* لیست آدرس‌ها */}
      {locations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {locations.map((loc: any) => (
            <Card
              key={loc.id}
              className={cn(
                'flex flex-col justify-between rounded-2xl border p-4.5 sm:p-5 shadow-xs transition-all',
                loc.isDefault ? 'border-primary/50 bg-primary/2' : 'border-border/80 bg-card'
              )}
            >
              <div>
                {/* ردیف تایتل و دکمه پیش‌فرض */}
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{loc.title}</span>
                    {loc.isDefault && (
                      <span className="flex items-center gap-1 rounded-md bg-success/10 px-2 py-0.5 text-3xs font-bold text-success/90 dark:text-success/80">
                        <CheckCircle2 className="h-3 w-3" />
                        پیش‌فرض تحویل
                      </span>
                    )}
                  </div>

                  {!loc.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(loc)}
                      disabled={updateLocation.isPending}
                      className="rounded-lg border border-border px-2.5 py-1 text-3xs font-bold text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-primary transition-colors disabled:opacity-50"
                    >
                      {updateLocation.isPending ? 'در حال ثبت...' : 'انتخاب به عنوان پیش‌فرض'}
                    </button>
                  )}
                </div>

                {/* شرح آدرس */}
                <div className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground text-right leading-relaxed">
                  <p className="font-bold text-foreground">
                    {loc.province}، {loc.city}، {loc.address}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-2xs text-muted-foreground mt-1">
                    <span>پلاک: <strong className="text-foreground">{toPersianDigits(loc.plaque)}</strong></span>
                    <span>واحد: <strong className="text-foreground">{toPersianDigits(loc.unit)}</strong></span>
                    <span>کد پستی: <strong className="text-foreground" dir="ltr">{toPersianDigits(loc.postalCode)}</strong></span>
                  </div>

                  {/* تحویل‌گیرنده */}
                  <div className="mt-2 flex items-center gap-2 border-t border-dashed border-border/60 pt-2 text-2xs">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>تحویل‌گیرنده: </span>
                    <strong className="text-foreground">
                      {loc.isUserReceiver ? `خودتان (${loc.receiverFullName})` : loc.receiverFullName}
                    </strong>
                    {loc.receiverMobile && (
                      <span className="text-muted-foreground ms-2" dir="ltr">
                        ({toPersianDigits(loc.receiverMobile)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* اکشن‌های ویرایش و حذف */}
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/50 pt-3">
                <button
                  type="button"
                  onClick={() => handleOpenEditAddressMap(loc)}
                  aria-label="ویرایش آدرس"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-primary transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(loc.id)}
                  disabled={deleteLocation.isPending}
                  aria-label="حذف آدرس"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* استیت خالی بدون آدرس */
        <div className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-card py-16 text-center">
          <LottiePlayer path="/animations/addresss.json" className="mx-auto h-44 w-44" />
          <span className="text-label-muted">
            هیچ آدرسی در حساب کاربری شما ثبت نشده است.
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenNewAddressMap}
            className="mt-2 h-9 gap-1.5 rounded-xl px-5 text-xs font-bold"
          >
            <Plus className="h-4 w-4" />
            <span>ثبت اولین آدرس روی نقشه</span>
          </Button>
        </div>
      )}

      {/* مودال نقشه */}
      <AddressMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirmAddress={handleConfirmMapAddress}
        initialCoordinates={mapInitialCoords}
      />

      {/* مودال تکمیل جزئیات فرم آدرس */}
      <Modal isOpen={isFormOpen} onClose={() => setIsAddFormOpen(false)} className="w-full max-w-lg overflow-hidden rounded-2xl">
        <ModalHeader onClose={() => setIsAddFormOpen(false)}>
          <ModalTitle className="flex items-center gap-2 text-sm font-black text-foreground">
            <MapPin className="h-4.5 w-4.5 text-primary" />
            <span>{editingAddress ? 'ویرایش جزئیات آدرس' : 'تکمیل جزئیات آدرس جدید'}</span>
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="p-5 md:p-6 max-h-[80dvh] overflow-y-auto no-scrollbar">
          {mapData ? (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="flex w-full flex-col gap-4">
              
              {/* باکس نشانی جغرافیایی انتخاب‌شده */}
              <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-right">
                <Navigation className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-3xs font-bold text-primary">موقعیت جغرافیایی انتخابی:</span>
                  <span className="text-label leading-relaxed">
                    {mapData.cityName}، {mapData.address}
                  </span>
                </div>
              </div>

              <Input
                label="عنوان آدرس *"
                placeholder="مثال: خانه، محل کار، تعمیرگاه"
                error={errors.title?.message}
                {...register('title')}
              />

              <Input
                label="کد پستی ۱۰ رقمی *"
                placeholder="کد پستی بدون خط تیره"
                maxLength={10}
                dir="ltr"
                error={errors.postalCode?.message}
                {...register('postalCode')}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="شماره پلاک *"
                  placeholder="پلاک..."
                  error={errors.plaque?.message}
                  {...register('plaque')}
                />
                <Input
                  label="شماره واحد *"
                  placeholder="واحد..."
                  error={errors.unit?.message}
                  {...register('unit')}
                />
              </div>

              {/* گزینه تحویل گیرنده */}
              <div className="flex items-center gap-2.5 pt-1 select-none">
                <input
                  type="checkbox"
                  id="user_is_receiver"
                  className="h-4 w-4 rounded-md border-border text-primary focus:ring-primary cursor-pointer"
                  {...register('isUserReceiver')}
                />
                <label htmlFor="user_is_receiver" className="text-label cursor-pointer">
                  تحویل‌گیرنده سفارش خودم هستم
                </label>
              </div>

              {!watchIsUserReceiver && (
                <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border/80 bg-muted/20 p-3.5 mt-1">
                  <span className="text-3xs font-bold text-muted-foreground">مشخصات شخص تحویل‌گیرنده:</span>
                  <Input
                    label="نام و نام خانوادگی گیرنده *"
                    placeholder="نام کامل تحویل‌گیرنده"
                    error={errors.receiverFullName?.message}
                    {...register('receiverFullName')}
                  />
                  <Input
                    label="شماره موبایل گیرنده *"
                    placeholder="0912..."
                    maxLength={11}
                    dir="ltr"
                    error={errors.receiverMobile?.message}
                    {...register('receiverMobile')}
                  />
                </div>
              )}

              {/* دکمه‌های پایانی فرم */}
              <div className="mt-3 flex w-full items-center gap-2.5 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddFormOpen(false)}
                  className="h-10 flex-1 rounded-xl text-xs font-bold"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createLocation.isPending || updateLocation.isPending}
                  className="h-10 flex-1 rounded-xl text-xs font-bold shadow-xs"
                >
                  {editingAddress ? 'ذخیره تغییرات' : 'ثبت نهایی آدرس'}
                </Button>
              </div>
            </form>
          ) : null}
        </ModalBody>
      </Modal>

    </div>
  );
}