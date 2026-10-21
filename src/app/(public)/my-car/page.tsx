'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { 
  useGetUserVehicles, 
  useUpdateUserVehicle, 
  useDeleteUserVehicle 
} from '@/domains/userpanel/hooks/userpanel.hooks';
import { userPanelValidators } from '@/domains/userpanel/validation/userpanel.validation';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { Select } from '@/components/primitives/Select/Select';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { formatToLocalDateString, jalaliToGregorian, getFullUrl } from '@/core/utils/formatters';
import { 
  Car,
  Plus, 
  Trash2, 
  Wrench, 
  Gauge, 
  Calendar, 
  Check, 
  Search,
  AlertCircle
} from 'lucide-react';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

const DEFAULT_CAR_IMAGE = '/car-noimage.png';

// کامپوننت رندر مستقیم لاتی با DOM Ref بدون استفاده از dynamic یا React.lazy
function EmptyGarageLottie() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let anim: any = null;
    let isMounted = true;

    const renderLottie = async () => {
      try {
        let animationData: any = null;

        // بررسی هر دو مسیر نام‌گذاری پوشه انیمیشن
        const paths = ['/anumations/garage-empty.json', '/animations/garage-empty.json'];
        for (const p of paths) {
          try {
            const res = await fetch(p);
            if (res.ok) {
              animationData = await res.json();
              break;
            }
          } catch {}
        }

        if (!animationData || !isMounted || !containerRef.current) {
          if (!animationData) setHasError(true);
          return;
        }

        // بارگذاری کتابخانه لاتی به صورت خالص در مرورگر
        const lottieModule = await import('lottie-web');
        const lottie = lottieModule.default || lottieModule;

        if (containerRef.current && isMounted) {
          anim = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData,
          });
        }
      } catch (err) {
        if (isMounted) setHasError(true);
      }
    };

    renderLottie();

    return () => {
      isMounted = false;
      anim?.destroy();
    };
  }, []);

  if (hasError) {
    return (
      <div className="w-32 h-32 flex items-center justify-center rounded-full bg-primary/10 text-primary">
        <Car className="w-16 h-16 animate-bounce" />
      </div>
    );
  }

  return <div ref={containerRef} className="w-64 h-64 max-w-full mx-auto flex items-center justify-center" />;
}

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
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  
  const { data: rawVehicles = [], isLoading: isVehiclesLoading } = useGetUserVehicles();

  const updateVehicle = useUpdateUserVehicle();
  const deleteVehicle = useDeleteUserVehicle();

  // خودروی پیش‌فرض همیشه در ابتدای لیست قرار می‌گیرد
  const vehicles = useMemo(() => {
    return [...rawVehicles].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });
  }, [rawVehicles]);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  // استیت‌های مودال تأیید حذف
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<any | null>(null);

  // مقدار پیش‌فرض کیلومتر مفید روغن: ۷۰۰۰
  const [updateOilLimit, setUpdateOilLimit] = useState<number>(7000);
  const [updateDay, setUpdateDay] = useState<number>(1);
  const [updateMonth, setUpdateMonth] = useState<number>(1);
  const [updateYear, setUpdateYear] = useState<number>(1404);

  // بررسی عدم تغییر فرم برای غیرفعال نگه‌داشتن دکمه ثبت
  const [initialFormValues, setInitialFormValues] = useState<{
    mileage: number;
    oilLimit: number;
    day: number;
    month: number;
    year: number;
  } | null>(null);

  const { 
    register: registerUpdate, 
    handleSubmit: handleSubmitUpdate, 
    watch: watchUpdate, 
    reset: resetUpdate, 
    formState: { errors: errorsUpdate } 
  } = useForm<UpdateVehicleFormValues>({
    resolver: zodResolver(userPanelValidators.updateVehicle.getSchema() as any),
    defaultValues: {
      id: '',
      title: '',
      mileage: 0,
      oilKmLimit: 7000,
      lastServiceDate: '',
      isDefault: false
    }
  });

  const watchMileage = watchUpdate('mileage');

  const isFormUnchanged = useMemo(() => {
    if (!initialFormValues) return true;
    const currentMileage = Number(watchMileage) || 0;
    return (
      currentMileage === initialFormValues.mileage &&
      updateOilLimit === initialFormValues.oilLimit &&
      updateDay === initialFormValues.day &&
      updateMonth === initialFormValues.month &&
      updateYear === initialFormValues.year
    );
  }, [initialFormValues, watchMileage, updateOilLimit, updateDay, updateMonth, updateYear]);

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

  const handleAddCarClick = () => {
    if (!isAuthenticated) {
      showToast.error('برای ثبت خودرو ابتدا وارد حساب کاربری خود شوید');
      router.push('/login?redirect=/my-car/add');
      return;
    }
    router.push('/my-car/add');
  };

  const handleOpenUpdateModal = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    const limit = vehicle.oilKmLimitRaw || 7000;
    setUpdateOilLimit(limit);
    
    resetUpdate({
      id: vehicle.id,
      title: vehicle.title,
      mileage: vehicle.mileageRaw || 0,
      oilKmLimit: limit,
      lastServiceDate: vehicle.lastServiceDate ? formatToLocalDateString(vehicle.lastServiceDate) : null,
      isDefault: vehicle.isDefault,
    });

    const initValues = {
      mileage: vehicle.mileageRaw || 0,
      oilLimit: limit,
      day: 1,
      month: 1,
      year: 1404
    };

    setUpdateDay(1);
    setUpdateMonth(1);
    setUpdateYear(1404);
    setInitialFormValues(initValues);

    setIsUpdateModalOpen(true);
  };

  const onUpdateSubmit = async (data: UpdateVehicleFormValues) => {
    if (isFormUnchanged) return;

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
      await queryClient.invalidateQueries({ queryKey: ['user', 'vehicles'] });
      setIsUpdateModalOpen(false);
    } catch (error) {}
  };

  const handleOpenDeleteModal = (vehicle: any) => {
    setVehicleToDelete(vehicle);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    try {
      await deleteVehicle.mutateAsync(vehicleToDelete.id);
      showToast.success('خودرو با موفقیت از گاراژ حذف شد');
      await queryClient.invalidateQueries({ queryKey: ['user', 'vehicles'] });
      setIsDeleteModalOpen(false);
      setVehicleToDelete(null);
    } catch (error) {}
  };

  const handleToggleDefault = async (vehicle: any) => {
    try {
      await updateVehicle.mutateAsync({
        id: vehicle.id,
        title: vehicle.title,
        mileage: vehicle.mileageRaw || 0,
        oilKmLimit: vehicle.oilKmLimitRaw || 7000,
        lastServiceDate: vehicle.lastServiceDate ? formatToLocalDateString(vehicle.lastServiceDate) : null,
        isDefault: !vehicle.isDefault,
      });
      await queryClient.invalidateQueries({ queryKey: ['user', 'vehicles'] });
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
    <div className="w-full flex flex-col gap-6 select-none" dir="rtl">
      
      {/* هدر صفحه */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-black text-foreground ">گاراژ من</span>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full ">
              {new Intl.NumberFormat('fa-IR').format(vehicles.length)} خودرو از ۱۰ خودرو
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            با وارد کردن مقدار کیلومتر کارکرد خودرو، یدک‌چی زمان سرویس دوره ای رو بهت یادآوری میکنه
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleAddCarClick}
          className="rounded-xl font-bold text-xs h-10 px-5 flex items-center justify-center gap-2 self-start md:self-auto shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>افزودن خودرو</span>
        </Button>
      </div>

      {/* لیست خودروها یا استیت گاراژ خالی */}
      {vehicles.length > 0 ? (
        <div className="flex flex-col gap-4 w-full">
          {vehicles.map((vehicle: any) => {
            // محاسبه کیلومتر سرویس بعدی = کارکرد فعلی + کیلومتر مفید
            const totalNextServiceMileage = 
              vehicle.mileageRaw !== undefined && vehicle.mileageRaw !== null
                ? Number(vehicle.mileageRaw) + (Number(vehicle.oilKmLimitRaw) || 7000)
                : null;

            // تاریخ ثبت واقعی خودرو در سیستم
            const carAddedDate = vehicle.createDate || vehicle.createdAt || vehicle.registerDate;
            const formattedAddedDate = carAddedDate 
              ? formatToLocalDateString(carAddedDate) 
              : 'ثبت نشده';

            return (
              <Card 
                key={vehicle.id} 
                className={cn(
                  "w-full border rounded-2xl bg-card shadow-sm transition-all overflow-hidden",
                  vehicle.isDefault ? "border-primary/40 ring-1 ring-primary/20" : "hover:border-border dark:hover:border-border"
                )}
              >
                <CardBody className="p-4 md:p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
                  
                  <div className="flex items-start md:items-center gap-4 min-w-0 flex-1">
                    <div className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-2xl border bg-muted/10 flex items-center justify-center overflow-hidden p-2">
                      <img 
                        src={vehicle.carCover ? getFullUrl(vehicle.carCover) : DEFAULT_CAR_IMAGE} 
                        alt={vehicle.carModel || vehicle.title} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_CAR_IMAGE;
                        }}
                      />
                      <button
                        onClick={() => handleOpenDeleteModal(vehicle)}
                        disabled={deleteVehicle.isPending}
                        className="absolute bottom-1 right-1 p-2 bg-card/80 hover:bg-destructive hover:text-destructive-foreground rounded-lg text-muted-foreground shadow-sm transition-all"
                        aria-label="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      {/* نام خودرو بدون کاراکتر - */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base md:text-lg font-black text-foreground truncate ">
                          {vehicle.carModel}
                        </span>
                        {vehicle.title && (
                          <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg ">
                            {vehicle.title}
                          </span>
                        )}
                        {vehicle.isDefault && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full ">
                            پیش‌فرض
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground ">
                        <div className="flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>کیلومتر پیمایش:</span>
                          <span className="font-bold text-foreground">
                            {vehicle.mileage !== 'ثبت نشده' && vehicle.mileage ? `${vehicle.mileage} km` : '-'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>سرویس بعدی:</span>
                          <span className="font-bold text-foreground">
                            {totalNextServiceMileage 
                              ? `${new Intl.NumberFormat('fa-IR').format(totalNextServiceMileage)} km` 
                              : '-'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>تاریخ اضافه به گاراژ:</span>
                          <span className="font-bold text-foreground">{formattedAddedDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0 border-t lg:border-t-0 border-dashed pt-4 lg:pt-0">
                    <button
                      onClick={() => handleToggleDefault(vehicle)}
                      disabled={updateVehicle.isPending}
                      className={cn(
                        "rounded-xl text-[10px] md:text-xs font-bold px-3 py-2 flex items-center justify-center gap-1.5 self-start sm:self-auto transition-all outline-none",
                        vehicle.isDefault 
                          ? "bg-success-500/10 text-success-500 border border-success-500/20 hover:bg-success-500/20" 
                          : "border border-border hover:border-primary/20 text-muted-foreground hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      {vehicle.isDefault ? (
                        <>
                          <Check className="h-4 w-4 stroke-[2.5]" />
                          <span>خودروی پیش‌فرض</span>
                        </>
                      ) : (
                        <>
                          <div className="h-4 w-4 rounded-full border-2 border-current shrink-0" />
                          <span>انتخاب به عنوان پیش‌فرض</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {/* دکمه با ابعاد بزرگتر و بوردر آبی */}
                      <button
                        onClick={() => handleOpenUpdateModal(vehicle)}
                        className="rounded-xl font-bold text-xs md:text-sm h-11 px-5 flex items-center justify-center gap-1.5 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all shadow-sm shrink-0"
                      >
                        <Gauge className="h-4 w-4" />
                        <span>بروزرسانی کارکرد</span>
                      </button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push(`/search?carIds=${vehicle.car?.id || vehicle.carId}`)}
                        className="rounded-xl font-bold text-xs md:text-sm h-11 px-4 flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Search className="h-4 w-4" />
                        <span>جستجوی قطعات</span>
                      </Button>
                    </div>
                  </div>

                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        /* استیت گاراژ خالی با انیمیشن لاتی و متون دقیق QA */
        <div className="w-full py-12 px-4 text-center rounded-2xl bg-card border flex flex-col items-center justify-center gap-4">
          <div className="w-64 h-64 max-w-full flex items-center justify-center">
            <EmptyGarageLottie />
          </div>
          
          <div className="flex flex-col items-center gap-2 max-w-md">
            <h3 className="text-lg md:text-xl font-black text-foreground ">
              ! گاراژ شما خالیه
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              برای اضافه کردن خودروهای خودتون روی افزودن خودرو کلیک کنین
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleAddCarClick}
            className="rounded-xl font-bold text-sm h-11 px-8 flex items-center justify-center gap-2 mt-2 shadow-md"
          >
            <span>افزودن خودرو +</span>
          </Button>
        </div>
      )}

      {/* مودال بروزرسانی کارکرد */}
      <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} className="max-w-md w-full">
        <ModalHeader onClose={() => setIsUpdateModalOpen(false)}>
          <ModalTitle className=" font-bold text-sm text-foreground flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            بروزرسانی کارکرد خودرو
          </ModalTitle>
        </ModalHeader>
        
        <ModalBody className="p-5 pt-4">
          {selectedVehicle && (
            <form onSubmit={handleSubmitUpdate(onUpdateSubmit)} className="flex flex-col gap-4 w-full">
              
              <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border border-border">
                <div className="w-12 h-12 shrink-0 rounded-lg border bg-card flex items-center justify-center overflow-hidden p-0.5">
                  <img 
                    src={selectedVehicle.carCover ? getFullUrl(selectedVehicle.carCover) : DEFAULT_CAR_IMAGE} 
                    className="w-full h-full object-contain" 
                    alt={selectedVehicle.carModel || ''} 
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_CAR_IMAGE;
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>برند:</span>
                    <span className="font-bold text-foreground">{selectedVehicle.carManufacturerName}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-foreground">{selectedVehicle.carModel}</span>
                    {selectedVehicle.title && (
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {selectedVehicle.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full">
                <Input
                  label="کیلومتر حدودی یا دقیق خودرو *"
                  placeholder="کیلومتر کارکرد فعلی را وارد کنید..."
                  type="number"
                  error={errorsUpdate.mileage?.message ? String(errorsUpdate.mileage.message) : undefined}
                  rightIcon={<span className="text-xs font-bold text-muted-foreground ">km</span>}
                  className="text-xs"
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
                  {[5000, 7000, 10000].map((limit) => (
                    <button
                      key={limit}
                      type="button"
                      onClick={() => setUpdateOilLimit(limit)}
                      className={cn(
                        "py-2 rounded-xl border text-xs font-bold transition-all outline-none",
                        updateOilLimit === limit
                          ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                          : "bg-card text-foreground hover:border-border"
                      )}
                    >
                      {new Intl.NumberFormat('fa-IR').format(limit)} کیلومتر
                    </button>
                  ))}
                </div>
              </div>

              {/* نمایش عدد نهایی با رنگ مشکی */}
              <div className="w-full bg-muted/70 dark:bg-muted/60 border border-border rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground">
                  <Wrench className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs font-bold ">کیلومتر سرویس بعدی شما:</span>
                </div>
                <div className="flex items-center gap-1 font-black text-foreground text-sm" dir="ltr">
                  <span>
                    {new Intl.NumberFormat('fa-IR').format((Number(watchMileage) || 0) + updateOilLimit)}
                  </span>
                  <span className="text-[11px] font-bold">km</span>
                </div>
              </div>

            </form>
          )}
        </ModalBody>

        <div className="flex flex-row gap-2.5 p-5 pt-4 border-t border-border/50 w-full shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsUpdateModalOpen(false)}
            className="flex-1 rounded-xl text-xs h-10 font-bold "
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isFormUnchanged || updateVehicle.isPending}
            isLoading={updateVehicle.isPending}
            className="flex-1 rounded-xl text-xs h-10 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmitUpdate(onUpdateSubmit)}
          >
            ثبت تغییرات
          </Button>
        </div>
      </Modal>

      {/* مودال تأیید حذف خودرو مطابق متن QA */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="max-w-md w-full">
        <ModalHeader onClose={() => setIsDeleteModalOpen(false)}>
          <ModalTitle className=" font-bold text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            حذف خودرو از گاراژ
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="p-6 flex flex-col gap-3">
          <p className="text-sm font-bold text-foreground leading-relaxed">
            از حذف «{vehicleToDelete?.carModel || vehicleToDelete?.title}» از گاراژ مطمئنی؟
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            با انتخاب بله تمام اطلاعات مرتبط با این خودرو حذف میشه
          </p>
        </ModalBody>

        <div className="flex flex-row gap-2.5 p-5 pt-2 border-t border-border/50 w-full shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
            className="flex-1 rounded-xl text-xs h-10 font-bold "
          >
            نه
          </Button>
          <Button
            type="button"
            variant="destructive"
            isLoading={deleteVehicle.isPending}
            onClick={confirmDeleteVehicle}
            className="flex-1 rounded-xl text-xs h-10 font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            بله حذف میکنم
          </Button>
        </div>
      </Modal>

    </div>
  );
}
