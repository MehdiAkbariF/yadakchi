'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  useGetUserLocations, 
  useCreateUserLocation, 
  useUpdateUserLocation, 
  useDeleteUserLocation,
  useChangeBasketLocation
} from '@/domains/front/basket/hooks/basket.hooks';
import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { AddressMapModal } from '@/components/composites/AddressMapModal/AddressMapModal';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Pencil, 
  User, 
  Phone, 
  Check, 
  MapPinOff, 
  ArrowRight,
  X 
} from 'lucide-react';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

const addressFormSchema = z.object({
  title: z.string().min(2, 'عنوان آدرس باید حداقل ۲ کاراکتر باشد'),
  postalCode: z.string().regex(/^[0-9]{9,10}$/, 'کد پستی باید ۹ یا ۱۰ رقم باشد'),
  plaque: z.string().min(1, 'شماره پلاک الزامی است'),
  unit: z.string().min(1, 'شماره واحد الزامی است'),
  isUserReceiver: z.boolean(),
  receiverFullName: z.string().optional(),
  receiverMobile: z.string().optional(),
  receiverNationalCode: z.string().optional()
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

export function AddressesList() {
  const router = useRouter();

  const { data: locations = [], isLoading } = useGetUserLocations();

  const createLocation = useCreateUserLocation();
  const updateLocation = useUpdateUserLocation();
  const deleteLocation = useDeleteUserLocation();
  const changeLocation = useChangeBasketLocation();

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isFormOpen, setIsAddFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [mapInitialCoords, setMapInitialCoords] = useState<{ lat: number; lon: number } | null>(null);

  const [mapData, setMapAddressData] = useState<{
    address: string;
    latitude: number;
    longitude: number;
    cityId: string;
    cityName: string;
    provinceName: string;
  } | null>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      title: '',
      postalCode: '',
      plaque: '',
      unit: '',
      isUserReceiver: true,
      receiverFullName: '',
      receiverMobile: '',
      receiverNationalCode: ''
    }
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
        receiverNationalCode: editingAddress.receiverNationalCode || ''
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
        receiverNationalCode: ''
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
    } catch (error) {}
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLocation.mutateAsync(id);
      showToast.success('آدرس با موفقیت حذف شد');
    } catch (error) {}
  };

  const handleSetDefault = async (id: string) => {
    try {
      await changeLocation.mutateAsync(id);
      showToast.success('آدرس پیش‌فرض تحویل سفارشات تغییر یافت');
    } catch (error) {}
  };

  if (isLoading) {
    return <PageLoading message="در حال لود آدرس‌های شما..." />;
  }

  return (
    <div className="flex-1 flex flex-col gap-6 w-full text-right" dir="rtl">
      
      <div className="lg:hidden flex items-center justify-between border-b pb-3 mb-1 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/profile')}
            className="p-1 -mr-1 hover:bg-muted rounded-full flex items-center justify-center transition-colors"
            aria-label="Back"
          >
            <ArrowRight className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-sm font-bold font-iran-yekan text-foreground">آدرس‌های من</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenNewAddressMap}
          className="rounded-xl text-[10px] h-9 px-4 py-1.5 border-primary/20 text-primary hover:bg-primary/5 flex items-center justify-center gap-1 shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>ثبت آدرس</span>
        </Button>
      </div>

      <div className="hidden lg:flex items-center justify-between w-full border-b pb-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            <span className="text-lg md:text-xl font-black text-foreground font-iran-yekan">آدرس‌های من</span>
          </div>
          <p className="text-xs text-muted-foreground font-iran-yekan">
            آدرس‌های ذخیره‌شده جهت تسریع روند ثبت نهایی سفارشات و محاسبه هزینه‌های ارسال
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenNewAddressMap}
          className="rounded-xl text-xs h-10 px-5 flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>ثبت آدرس جدید روی نقشه</span>
        </Button>
      </div>

      {locations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full animate-in fade-in duration-200">
          {locations.map((loc: any) => (
            <Card key={loc.id} className="w-full border rounded-2xl bg-card shadow-sm hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors flex flex-col justify-between gap-4 p-5">
              <div className="flex items-center justify-between border-b border-dashed pb-3.5 w-full">
                <span className="text-xs md:text-sm font-black text-foreground font-iran-yekan">{loc.title}</span>
                <button
                  onClick={() => handleSetDefault(loc.id)}
                  disabled={changeLocation.isPending}
                  className={cn(
                    "font-bold text-[10px] md:text-xs px-2.5 py-1 rounded-lg border transition-all",
                    loc.isDefault 
                      ? "bg-success-500/10 text-success-500 border-success-500/20" 
                      : "bg-muted text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  )}
                >
                  {loc.isDefault ? "آدرس پیش‌فرض" : "انتخاب به عنوان پیش‌فرض"}
                </button>
              </div>

              <div className="flex flex-col gap-2.5 text-xs text-muted-foreground font-iran-yekan text-right">
                <p className="font-bold text-foreground leading-relaxed">{loc.province}، {loc.city}، {loc.address}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-1">
                  <span>پلاک: {loc.plaque}</span>
                  <span>واحد: {loc.unit}</span>
                  <span>کد پستی: {loc.postalCode}</span>
                </div>
                {loc.isUserReceiver ? (
                  <div className="flex items-center gap-1.5 mt-1 border-t border-dashed pt-2.5">
                    <User className="h-4 w-4 text-zinc-400" />
                    <span>تحویل‌گیرنده: خودتان ({loc.receiverFullName})</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 mt-1 border-t border-dashed pt-2.5 text-right">
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-zinc-400" />
                      <span>تحویل‌گیرنده: {loc.receiverFullName}</span>
                    </div>
                    {loc.receiverMobile && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-zinc-400" />
                        <span>شماره تماس: {loc.receiverMobile}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-dashed pt-3.5 mt-1.5">
                <button
                  onClick={() => handleOpenEditAddressMap(loc)}
                  className="p-1.5 border hover:border-primary/20 hover:bg-primary/5 text-muted-foreground hover:text-primary rounded-lg transition-all"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(loc.id)}
                  disabled={deleteLocation.isPending}
                  className="p-1.5 border hover:border-destructive/20 hover:bg-destructive/5 text-muted-foreground hover:text-destructive rounded-lg transition-all"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="w-full py-16 text-center border border-dashed rounded-2xl bg-card flex flex-col items-center justify-center gap-3">
          <MapPinOff className="h-12 w-12 text-muted-foreground/60 stroke-[1.5] animate-bounce" />
          <span className="text-xs font-bold font-iran-yekan text-muted-foreground">هیچ آدرسی در حساب کاربری شما ثبت نشده است.</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenNewAddressMap}
            className="rounded-xl mt-4 text-xs font-bold font-iran-yekan h-10 px-6 py-2 flex items-center justify-center gap-1"
          >
            <Plus className="h-4 w-4" />
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

      <Modal isOpen={isFormOpen} onClose={() => setIsAddFormOpen(false)} className="max-w-md w-full">
        <ModalHeader onClose={() => setIsAddFormOpen(false)}>
          <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {editingAddress ? "ویرایش جزئیات آدرس" : "تکمیل اطلاعات آدرس جدید"}
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="p-0 pt-4 text-right">
          {mapData && (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 w-full text-right">
              
              <div className="w-full">
                <Input
                  label="عنوان آدرس *"
                  placeholder="مثال: خانه، محل کار، باغ"
                  error={errors.title?.message ? String(errors.title.message) : undefined}
                  className="text-xs font-iran-yekan"
                  {...register('title')}
                />
              </div>

              <div className="w-full">
                <Input
                  label="کد پستی *"
                  placeholder="کد پستی ۱۰ رقمی بدون خط تیره..."
                  type="text"
                  maxLength={10}
                  error={errors.postalCode?.message ? String(errors.postalCode.message) : undefined}
                  className="text-xs font-iran-yekan text-left"
                  dir="ltr"
                  {...register('postalCode')}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <Input
                  label="پلاک *"
                  placeholder="شماره پلاک..."
                  error={errors.plaque?.message ? String(errors.plaque.message) : undefined}
                  className="text-xs font-iran-yekan"
                  {...register('plaque')}
                />
                <Input
                  label="واحد *"
                  placeholder="شماره واحد..."
                  error={errors.unit?.message ? String(errors.unit.message) : undefined}
                  className="text-xs font-iran-yekan"
                  {...register('unit')}
                />
              </div>

              <div className="w-full bg-muted/20 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground">نشانی جغرافیایی انتخاب شده:</span>
                <span className="text-xs font-bold text-foreground leading-relaxed">{mapData.cityName}، {mapData.address}</span>
              </div>

              <div className="flex items-center gap-2.5 pt-2 select-none">
                <input
                  type="checkbox"
                  id="user_is_receiver"
                  className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
                  {...register('isUserReceiver')}
                />
                <label htmlFor="user_is_receiver" className="text-xs font-bold text-foreground font-iran-yekan cursor-pointer">
                  تحویل‌گیرنده سفارش خودم هستم
                </label>
              </div>

              {!watchIsUserReceiver && (
                <div className="flex flex-col gap-4.5 w-full pt-2 border-t border-dashed mt-1 animate-in slide-in-from-top duration-200">
                  <div className="w-full">
                    <Input
                      label="نام و نام خانوادگی گیرنده *"
                      placeholder="نام کامل گیرنده را وارد کنید..."
                      error={errors.receiverFullName?.message ? String(errors.receiverFullName.message) : undefined}
                      className="text-xs font-iran-yekan"
                      {...register('receiverFullName')}
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      label="شماره موبایل گیرنده *"
                      placeholder="مثال: 09123456789"
                      type="text"
                      maxLength={11}
                      error={errors.receiverMobile?.message ? String(errors.receiverMobile.message) : undefined}
                      className="text-xs font-iran-yekan text-left"
                      dir="ltr"
                      {...register('receiverMobile')}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddFormOpen(false)}
                  className="flex-1 rounded-xl text-xs h-10"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createLocation.isPending || updateLocation.isPending}
                  className="flex-1 rounded-xl text-xs h-10"
                >
                  {editingAddress ? "ویرایش نهایی" : "ثبت نهایی آدرس"}
                </Button>
              </div>

            </form>
          )}
        </ModalBody>
      </Modal>

    </div>
  );
}