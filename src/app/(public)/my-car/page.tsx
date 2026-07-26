'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  useGetUserVehicles, 
  useUpdateUserVehicle, 
  useDeleteUserVehicle 
} from '@/domains/userpanel/hooks/userpanel.hooks';
import { userPanelValidators } from '@/domains/userpanel/validation/userpanel.validation';
import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { Select } from '@/components/primitives/Select/Select';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { formatToLocalDateString, jalaliToGregorian } from '@/core/utils/formatters';
import { 
  Car, 
  Plus, 
  Trash2, 
  Wrench, 
  Gauge, 
  Calendar, 
  Check, 
  Search, 
  AlertTriangle 
} from 'lucide-react';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

interface UpdateVehicleFormValues {
  id: string;
  title: string;
  mileage: number;
  oilKmLimit: number;
  lastServiceDate: string | null;
  isDefault: boolean;
}

export default function MyCarPage() {
  const router = useRouter();
  
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useGetUserVehicles();

  const updateVehicle = useUpdateUserVehicle();
  const deleteVehicle = useDeleteUserVehicle();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  const [updateOilLimit, setUpdateOilLimit] = useState<number>(5000);
  const [updateDay, setUpdateDay] = useState<number>(1);
  const [updateMonth, setUpdateMonth] = useState<number>(1);
  const [updateYear, setUpdateYear] = useState<number>(1404);

  const { register: registerUpdate, handleSubmit: handleSubmitUpdate, watch: watchUpdate, reset: resetUpdate, formState: { errors: errorsUpdate } } = useForm<UpdateVehicleFormValues>({
    resolver: zodResolver(userPanelValidators.updateVehicle.getSchema() as any),
    defaultValues: {
      id: '',
      title: '',
      mileage: 0,
      oilKmLimit: 5000,
      lastServiceDate: '',
      isDefault: false
    }
  });

  const watchMileage = watchUpdate('mileage');

  const months = [
    { value: '1', label: 'فروردین' },
    { value: '2', label: 'اردیبهشت' },
    { value: '3', label: 'خرداد' },
    { value: '4', label: 'تیر' },
    { value: '5', label: 'مرداد' },
    { value: '6', label: 'شهریور' },
    { value: '7', label: 'مهر' },
    { value: '8', label: 'آبان' },
    { value: '9', label: 'آذر' },
    { value: '10', label: 'دی' },
    { value: '11', label: 'بهمن' },
    { value: '12', label: 'اسفند' },
  ];

  const days = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
  const years = Array.from({ length: 5 }, (_, i) => ({ value: String(1402 + i), label: String(1402 + i) }));

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const handleOpenUpdateModal = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setUpdateOilLimit(vehicle.oilKmLimitRaw || 5000);
    
    resetUpdate({
      id: vehicle.id,
      title: vehicle.title,
      mileage: vehicle.mileageRaw,
      oilKmLimit: vehicle.oilKmLimitRaw,
      lastServiceDate: vehicle.lastServiceDate ? formatToLocalDateString(vehicle.lastServiceDate) : null,
      isDefault: vehicle.isDefault,
    });

    if (vehicle.lastServiceDate) {
      const date = new Date(vehicle.lastServiceDate);
      if (!isNaN(date.getTime())) {
        setUpdateDay(1);
        setUpdateMonth(1);
        setUpdateYear(1404);
      }
    }
    setIsUpdateModalOpen(true);
  };

  const onUpdateSubmit = async (data: UpdateVehicleFormValues) => {
    try {
      const isoServiceDate = jalaliToGregorian(updateYear, updateMonth, updateDay);
      await updateVehicle.mutateAsync({
        id: data.id,
        title: data.title,
        mileage: data.mileage,
        oilKmLimit: updateOilLimit,
        lastServiceDate: isoServiceDate,
        isDefault: data.isDefault,
      });
      showToast.success('کارکرد خودرو با موفقیت بروزرسانی شد');
      setIsUpdateModalOpen(false);
    } catch (error) {}
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      await deleteVehicle.mutateAsync(id);
      showToast.success('خودرو با موفقیت از گاراژ حذف شد');
    } catch (error) {}
  };

  const handleToggleDefault = async (vehicle: any) => {
    try {
      await updateVehicle.mutateAsync({
        id: vehicle.id,
        title: vehicle.title,
        mileage: vehicle.mileageRaw,
        oilKmLimit: vehicle.oilKmLimitRaw,
        lastServiceDate: vehicle.lastServiceDate ? formatToLocalDateString(vehicle.lastServiceDate) : null,
        isDefault: !vehicle.isDefault,
      });
      if (!vehicle.isDefault) {
        showToast.success('خودرو به عنوان پیش‌فرض انتخاب شد');
      } else {
        showToast.success('خودرو از حالت پیش‌فرض خارج شد');
      }
    } catch (error) {}
  };

  if (isVehiclesLoading) {
    return <PageLoading message="در حال دریافت اطلاعات گاراژ..." />;
  }

  return (
    <MainLayout>
      <div className="w-full flex flex-col gap-6 select-none text-right" dir="rtl">
        
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg md:text-xl font-black text-foreground font-iran-yekan">گاراژ من</span>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full font-iran-yekan">
                {new Intl.NumberFormat('fa-IR').format(vehicles.length)} خودرو از ۱۰ خودرو
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground font-iran-yekan leading-relaxed">
              با وارد کردن مقدار کیلومتر کارکرد خودرو، یدکچی زمان سرویس دوره ای رو بهت یادآوری میکنه
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => router.push('/my-car/add')}
            className="rounded-xl font-iran-yekan font-bold text-xs h-10 px-5 flex items-center justify-center gap-2 self-start md:self-auto shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>افزودن خودرو</span>
          </Button>
        </div>

        {vehicles.length > 0 ? (
          <div className="flex flex-col gap-4 w-full">
            {vehicles.map((vehicle: any) => (
              <Card key={vehicle.id} className="w-full border rounded-2xl bg-card shadow-sm hover:border-zinc-300 dark:hover:border-zinc-800 transition-all overflow-hidden">
                <CardBody className="p-4 md:p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
                  
                  <div className="flex items-start md:items-center gap-4 min-w-0 flex-1">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl border bg-muted/10 flex items-center justify-center overflow-hidden">
                      <img 
                        src={getFullUrl(vehicle.carCover)} 
                        alt={vehicle.carModel} 
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        disabled={deleteVehicle.isPending}
                        className="absolute bottom-1 right-1 p-2 bg-background/80 hover:bg-destructive hover:text-white rounded-lg text-muted-foreground shadow-sm transition-all"
                        aria-label="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm md:text-base font-black text-foreground truncate font-iran-yekan">
                          {vehicle.carModel}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg font-iran-yekan">
                          - {vehicle.title}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-iran-yekan">
                        <div className="flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-zinc-400 shrink-0" />
                          <span>کیلومتر پیمایش:</span>
                          <span className="font-bold text-foreground">
                            {vehicle.mileage !== 'ثبت نشده' ? vehicle.mileage : '- km'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-zinc-400 shrink-0" />
                          <span>سرویس بعدی:</span>
                          <span className="font-bold text-foreground">
                            {vehicle.oilKmLimit !== 'ثبت نشده' ? vehicle.oilKmLimit : '- km'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
                          <span>تاریخ اضافه به گاراژ:</span>
                          <span className="font-bold text-foreground">{vehicle.lastServiceDateFormatted}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0 border-t lg:border-t-0 border-dashed pt-4 lg:pt-0">
                    <button
                      onClick={() => handleToggleDefault(vehicle)}
                      disabled={updateVehicle.isPending}
                      className={cn(
                        "rounded-xl text-[10px] md:text-xs font-bold font-iran-yekan px-3 py-2 flex items-center justify-center gap-1.5 self-start sm:self-auto transition-all outline-none",
                        vehicle.isDefault 
                          ? "bg-success-500/10 text-success-500 border border-success-500/20 hover:bg-success-500/20" 
                          : "border border-zinc-200 hover:border-primary/20 text-muted-foreground hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      {vehicle.isDefault ? (
                        <>
                          <Check className="h-4 w-4 stroke-[2.5]" />
                          <span>خودروی پیشفرض</span>
                        </>
                      ) : (
                        <>
                          <div className="h-4 w-4 rounded-full border-2 border-current shrink-0" />
                          <span>انتخاب به عنوان پیشفرض</span>
                        </>
                      )}
                    </button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenUpdateModal(vehicle)}
                        className="rounded-xl font-iran-yekan font-bold text-xs h-10 px-4 flex items-center justify-center gap-1 shadow-sm"
                      >
                        <span>افزودن کارکرد خودرو</span>
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push(`/search?carIds=${vehicle.car?.id}`)}
                        className="rounded-xl font-iran-yekan font-bold text-xs h-10 px-4 flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Search className="h-4 w-4" />
                        <span>جستجوی قطعات</span>
                      </Button>
                    </div>
                  </div>

                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="w-full py-16 text-center border border-dashed rounded-2xl bg-card flex flex-col items-center justify-center gap-3">
            <Car className="h-12 w-12 text-muted-foreground/60 stroke-[1.5] animate-bounce" />
            <span className="text-xs font-bold font-iran-yekan text-muted-foreground">هیچ خودرویی در گاراژ شما ثبت نشده است.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/my-car/add')}
              className="rounded-xl mt-4 text-xs font-bold font-iran-yekan h-10 px-6 py-2 flex items-center justify-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>ثبت اولین خودرو</span>
            </Button>
          </div>
        )}
<Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} className="max-w-md w-full">
  <ModalHeader onClose={() => setIsUpdateModalOpen(false)}>
    <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-2">
      <Gauge className="h-5 w-5 text-primary" />
      بروزرسانی کارکرد خودرو
    </ModalTitle>
  </ModalHeader>
  
  <ModalBody className="p-5 pt-4 text-right">
    {selectedVehicle && (
      <form onSubmit={handleSubmitUpdate(onUpdateSubmit)} className="flex flex-col gap-4 w-full text-right">
        
        <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="w-10 h-10 shrink-0 rounded-lg border bg-background flex items-center justify-center overflow-hidden p-0.5">
            <img src={getFullUrl(selectedVehicle.carCover)} className="w-full h-full object-contain" alt="" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>برند:</span>
              <span className="font-bold text-foreground">{selectedVehicle.carManufacturerName}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-foreground">{selectedVehicle.carModel}</span>
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">- {selectedVehicle.title}</span>
            </div>
          </div>
        </div>

        <div className="w-full">
          <Input
            label="کیلومتر حدودی یا دقیق خودرو *"
            placeholder="کیلومتر کارکرد فعلی را وارد کنید..."
            type="number"
            error={errorsUpdate.mileage?.message ? String(errorsUpdate.mileage.message) : undefined}
            rightIcon={<span className="text-xs font-bold text-muted-foreground font-iran-yekan">km</span>}
            className="text-xs font-iran-yekan text-left"
            dir="ltr"
            {...registerUpdate('mileage', { valueAsNumber: true })}
          />
        </div>

        <div className="w-full flex flex-col gap-2">
          <label className="text-xs md:text-sm font-medium leading-none text-foreground">
            تاریخ حدودی سرویس خودرو (تعویض روغن یا فیلترها) *
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Select
              placeholder="روز"
              value={String(updateDay)}
              onChange={(e) => setUpdateDay(Number(e.target.value))}
              options={days}
            />
            <Select
              placeholder="ماه"
              value={String(updateMonth)}
              onChange={(e) => setUpdateMonth(Number(e.target.value))}
              options={months}
            />
            <Select
              placeholder="سال"
              value={String(updateYear)}
              onChange={(e) => setUpdateYear(Number(e.target.value))}
              options={years}
            />
          </div>
        </div>

        <div className="w-full flex flex-col gap-2">
          <label className="text-xs md:text-sm font-medium leading-none text-foreground">
            کیلومتر مفید روغن استفاده شده در زمان سرویس *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[5000, 7500, 10000].map((limit) => (
              <button
                key={limit}
                type="button"
                onClick={() => setUpdateOilLimit(limit)}
                className={cn(
                  "py-2 rounded-xl border text-xs font-bold font-iran-yekan transition-all outline-none",
                  updateOilLimit === limit
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                    : "bg-background text-foreground hover:border-zinc-300"
                )}
              >
                {new Intl.NumberFormat('fa-IR').format(limit)} کیلومتر
              </button>
            ))}
          </div>
        </div>

        <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between text-right">
          <div className="flex items-center gap-2 text-primary">
            <Wrench className="h-4 w-4 shrink-0" />
            <span className="text-xs font-bold font-iran-yekan">کیلومتر سرویس بعدی شما:</span>
          </div>
          <div className="flex items-center gap-1 text-primary font-black font-iran-yekan" dir="ltr">
            <span>{new Intl.NumberFormat('fa-IR').format((Number(watchMileage) || 0) + updateOilLimit)}</span>
            <span className="text-[10px] font-bold">km</span>
          </div>
        </div>

      </form>
    )}
  </ModalBody>

  {/* فوتر با دکمه‌های تمام عرض */}
  <div className="flex flex-row gap-2.5 p-5 pt-4 border-t border-border/50 w-full shrink-0">
    <Button
      type="button"
      variant="outline"
      onClick={() => setIsUpdateModalOpen(false)}
      className="flex-1 rounded-xl text-xs h-10 font-bold font-iran-yekan"
    >
      انصراف
    </Button>
    <Button
      type="submit"
      variant="primary"
      isLoading={updateVehicle.isPending}
      className="flex-1 rounded-xl text-xs h-10 font-bold font-iran-yekan"
      onClick={handleSubmitUpdate(onUpdateSubmit)}
    >
      ثبت تغییرات
    </Button>
  </div>
</Modal>

      </div>
    </MainLayout>
  );
}