// src/app/(public)/my-car/page.tsx
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { 
  useGetUserVehicles, 
  useUpdateUserVehicle, 
  useDeleteUserVehicle 
} from '@/domains/userpanel/hooks/userpanel.hooks';
import { useGetCarListFlat } from '@/domains/front/reference/car/hooks/car.hooks';
import { userPanelValidators } from '@/domains/userpanel/validation/userpanel.validation';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Select } from '@/components/primitives/Select/Select';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { jalaliToGregorian, getFullUrl, toPersianDigits } from '@/core/utils/formatters';
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

// تبدیل تاریخ میلادی ISO به تاریخ شمسی با حروف فارسی
function formatToJalali(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'ثبت نشده';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'ثبت نشده';
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return 'ثبت نشده';
  }
}

// تبدیل ارقام فارسی به انگلیسی جهت فرم
function normalizeNumbers(str: string): string {
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(persianDigits[i], String(i)).replace(arabicDigits[i], String(i));
  }
  return result;
}

function EmptyGarageLottie() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let anim: any = null;
    let isMounted = true;

    const renderLottie = async () => {
      try {
        let animationData: any = null;
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
      <div className="w-32 h-32 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Car className="w-16 h-16" />
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
  const { data: carsReferenceList = [] } = useGetCarListFlat(1, 300);

  const updateVehicle = useUpdateUserVehicle();
  const deleteVehicle = useDeleteUserVehicle();

  const vehicles = useMemo(() => {
    return [...rawVehicles].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });
  }, [rawVehicles]);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<any | null>(null);

  const [updateOilLimit, setUpdateOilLimit] = useState<number>(7000);
  const [updateDay, setUpdateDay] = useState<number>(1);
  const [updateMonth, setUpdateMonth] = useState<number>(1);
  const [updateYear, setUpdateYear] = useState<number>(1403);

  const [initialFormValues, setInitialFormValues] = useState<{
    mileage: number;
    oilLimit: number;
    day: number;
    month: number;
    year: number;
  } | null>(null);

  const { 
    control,
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
  const years = Array.from({ length: 5 }, (_, i) => ({ value: String(1401 + i), label: String(1401 + i) }));

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
    const limit = Number(vehicle.oilKmLimitRaw || vehicle.oilKmLimit) || 7000;
    const currentMileage = Number(vehicle.mileageRaw || vehicle.mileage) || 0;
    setUpdateOilLimit(limit);
    
    let initYear = 1403;
    let initMonth = 1;
    let initDay = 1;

    if (vehicle.lastServiceDate) {
      try {
        const d = new Date(vehicle.lastServiceDate);
        const faDateStr = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        }).format(d);
        const [y, m, day] = faDateStr.split('/').map(Number);
        if (y && m && day) {
          initYear = y;
          initMonth = m;
          initDay = day;
        }
      } catch {}
    }

    setUpdateDay(initDay);
    setUpdateMonth(initMonth);
    setUpdateYear(initYear);

    resetUpdate({
      id: vehicle.id,
      title: vehicle.title || '',
      mileage: currentMileage,
      oilKmLimit: limit,
      lastServiceDate: vehicle.lastServiceDate ? formatToJalali(vehicle.lastServiceDate) : null,
      isDefault: vehicle.isDefault,
    });

    setInitialFormValues({
      mileage: currentMileage,
      oilLimit: limit,
      day: initDay,
      month: initMonth,
      year: initYear
    });

    setIsUpdateModalOpen(true);
  };

  const onUpdateSubmit = async (data: UpdateVehicleFormValues) => {
    if (isFormUnchanged) return;

    try {
      const isoServiceDate = jalaliToGregorian(updateYear, updateMonth, updateDay);
      await updateVehicle.mutateAsync({
        id: data.id,
        title: data.title,
        mileage: Number(data.mileage) || 0,
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
        mileage: Number(vehicle.mileageRaw ?? vehicle.mileage) || 0,
        oilKmLimit: Number(vehicle.oilKmLimitRaw ?? vehicle.oilKmLimit) || 7000,
        lastServiceDate: vehicle.lastServiceDate || null,
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

  const handleSearchPartsClick = (vehicle: any) => {
    const directEnglish = vehicle.car?.englishTitle || vehicle.carEnglishTitle || vehicle.englishTitle;
    
    if (directEnglish && typeof directEnglish === 'string' && directEnglish.trim()) {
      const slug = directEnglish.trim().replace(/\s+/g, '-');
      router.push(`/car/${encodeURIComponent(slug)}`);
      return;
    }

    const targetCarId = vehicle.car?.id || vehicle.carId;
    const targetModel = vehicle.car?.model || vehicle.carModel;

    if (carsReferenceList.length > 0) {
      const matchedCar = carsReferenceList.find(
        (c: any) => (targetCarId && c.id === targetCarId) || (targetModel && c.model === targetModel)
      );

      if (matchedCar?.englishTitle) {
        const slug = matchedCar.englishTitle.trim().replace(/\s+/g, '-');
        router.push(`/car/${encodeURIComponent(slug)}`);
        return;
      }
    }

    if (targetModel) {
      const slug = targetModel.trim().replace(/\s+/g, '-');
      router.push(`/car/${encodeURIComponent(slug)}`);
      return;
    }

    router.push(`/search?carIds=${targetCarId || vehicle.id}`);
  };

  if (isVehiclesLoading) {
    return <PageLoading message="در حال دریافت اطلاعات گاراژ..." />;
  }

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6 select-none" dir="rtl">
      
      {/* ================= هدر چسبان و کامپکت اختصاصی موبایل (متعادل بدون رنگ جیغ) ================= */}
      <div className="sticky top-14 z-30 -mx-4 -mt-1 flex w-[calc(100%+2rem)] shrink-0 select-none items-center justify-between border-b border-border/80 bg-card/95 px-3.5 py-2.5 shadow-xs backdrop-blur-md md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted text-foreground p-0.5">
            <Car className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-[0.625rem] font-bold text-muted-foreground leading-none">مدیریت خودروها</span>
            <span className="mt-0.5 truncate text-xs font-bold text-foreground">
              گاراژ من ({toPersianDigits(vehicles.length)} از ۱۰)
            </span>
          </div>
        </div>

        {/* دکمه افزودن خودرو به عنوان تنها نقطه عطف در هدر */}
        <button
          type="button"
          onClick={handleAddCarClick}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-2xs font-bold text-primary-foreground shadow-xs active:scale-95 transition-transform"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>افزودن خودرو</span>
        </button>
      </div>

      {/* ================= هدر دسکتاپ ================= */}
      <div className="hidden md:flex w-full flex-row items-center justify-between gap-4 border-b border-border pb-5 mt-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg md:text-xl font-bold text-foreground">گاراژ من</h1>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-md">
              {toPersianDigits(vehicles.length)} خودرو از ۱۰ خودرو
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            با وارد کردن کیلومتر کارکرد، زمان سرویس دوره‌ای و تعویض روغن به شما یادآوری می‌شود.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleAddCarClick}
          className="rounded-xl font-bold text-xs h-10 px-5 flex items-center justify-center gap-2 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>افزودن خودرو</span>
        </Button>
      </div>

      {/* ================= لیست خودروهای گاراژ ================= */}
      {vehicles.length > 0 ? (
        <div className="flex flex-col gap-3.5 sm:gap-4 w-full">
          {vehicles.map((vehicle: any) => {
            const rawMileage = vehicle.mileageRaw ?? vehicle.mileage;
            const rawLimit = vehicle.oilKmLimitRaw ?? vehicle.oilKmLimit;

            // بررسی دقیق اعتبارسنجی کارکرد جهت جلوگیری از باگ NaN / «ناعدد»
            const hasValidMileage =
              rawMileage !== undefined &&
              rawMileage !== null &&
              rawMileage !== '' &&
              !isNaN(Number(rawMileage)) &&
              Number(rawMileage) > 0;

            const mileageNumber = hasValidMileage ? Number(rawMileage) : null;

            // محاسبه کیلومتر سرویس بعدی
            const nextServiceKm =
              vehicle.nextServiceKM ??
              (hasValidMileage && rawLimit ? mileageNumber! + Number(rawLimit) : null);

            const hasValidNextService =
              nextServiceKm !== null &&
              nextServiceKm !== undefined &&
              !isNaN(Number(nextServiceKm)) &&
              Number(nextServiceKm) > 0;

            // تبدیل تاریخ به شمسی با حروف فارسی
            const formattedAddedDate = formatToJalali(
              vehicle.createDate || vehicle.createdAt || vehicle.registerDate
            );

            const carCoverImage = vehicle.car?.cover || vehicle.carCover;
            const carDisplayModel = vehicle.car?.model || vehicle.carModel || vehicle.title;

            return (
              <Card 
                key={vehicle.id} 
                className={cn(
                  "w-full border rounded-2xl bg-card shadow-xs transition-all overflow-hidden",
                  vehicle.isDefault ? "border-foreground/30 bg-muted/10" : "border-border hover:border-border/80"
                )}
              >
                <CardBody className="p-3.5 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-5">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-center overflow-hidden p-1.5">
                      <img 
                        src={carCoverImage ? getFullUrl(carCoverImage) : DEFAULT_CAR_IMAGE} 
                        alt={carDisplayModel} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_CAR_IMAGE;
                        }}
                      />
                      <button
                        onClick={() => handleOpenDeleteModal(vehicle)}
                        disabled={deleteVehicle.isPending}
                        className="absolute bottom-1 right-1 p-1.5 bg-card/90 hover:bg-destructive hover:text-destructive-foreground rounded-lg text-muted-foreground shadow-xs transition-all"
                        aria-label="حذف خودرو"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-foreground truncate">
                          {carDisplayModel}
                        </span>
                        {vehicle.title && (
                          <span className="text-3xs sm:text-2xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                            {vehicle.title}
                          </span>
                        )}
                        {vehicle.isDefault && (
                          <span className="text-3xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-md">
                            خودروی پیش‌فرض
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Gauge className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>کارکرد:</span>
                          <span className="font-semibold text-foreground">
                            {hasValidMileage ? `${toPersianDigits(mileageNumber!.toLocaleString('fa-IR'))} کیلومتر` : 'ثبت نشده'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Wrench className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>سرویس بعدی:</span>
                          <span className="font-semibold text-foreground">
                            {hasValidNextService ? `${toPersianDigits(Number(nextServiceKm).toLocaleString('fa-IR'))} کیلومتر` : 'نامشخص'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>ثبت:</span>
                          <span className="font-medium text-foreground">{formattedAddedDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* بخش دکمه‌ها و اکشن‌های کارت */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between lg:justify-center gap-2.5 sm:gap-3 shrink-0 border-t lg:border-t-0 border-border/60 pt-3 lg:pt-0">
                    {/* وضعیت پیش‌فرض با رنگ معنایی سبز به جای نارنجی */}
                    <button
                      onClick={() => handleToggleDefault(vehicle)}
                      disabled={updateVehicle.isPending}
                      className={cn(
                        "rounded-lg text-xs font-medium px-2.5 py-1.5 flex items-center justify-center gap-1.5 self-start sm:self-auto transition-all outline-none border",
                        vehicle.isDefault 
                          ? "bg-foreground/5 text-foreground border-foreground/20 font-bold" 
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {vehicle.isDefault ? (
                        <>
                          <Check className="h-3.5 w-3.5 stroke-[2.5] text-success" />
                          <span>خودروی پیش‌فرض</span>
                        </>
                      ) : (
                        <>
                          <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground shrink-0" />
                          <span>انتخاب به عنوان پیش‌فرض</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {/* دکمه ۱: بروزرسانی کارکرد با استایل خنثی کارت */}
                      <button
                        onClick={() => handleOpenUpdateModal(vehicle)}
                        className="flex-1 sm:flex-none rounded-xl font-medium text-xs h-9 sm:h-10 px-3.5 flex items-center justify-center gap-1.5 border border-border bg-card text-foreground hover:bg-muted transition-all shadow-2xs shrink-0"
                      >
                        <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>بروزرسانی کارکرد</span>
                      </button>

                      {/* دکمه ۲: جستجوی قطعات با استایل شیک و های‌کنتراست (بدون نارنجی تکراری) */}
                      <button
                        onClick={() => handleSearchPartsClick(vehicle)}
                        className="flex-1 sm:flex-none rounded-xl font-bold text-xs h-9 sm:h-10 px-4 flex items-center justify-center gap-1.5 bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xs"
                      >
                        <Search className="h-3.5 w-3.5" />
                        <span>جستجوی قطعات</span>
                      </button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="w-full py-12 px-4 text-center rounded-2xl bg-card border border-border flex flex-col items-center justify-center gap-4">
          <div className="w-56 h-56 max-w-full flex items-center justify-center">
            <EmptyGarageLottie />
          </div>
          
          <div className="flex flex-col items-center gap-1.5 max-w-md">
            <h2 className="text-base md:text-lg font-bold text-foreground">
              گاراژ شما خالی است
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              با افزودن خودرو، قطعات سازگار و یادآور تعویض روغن را به راحتی مدیریت کنید.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleAddCarClick}
            className="rounded-xl font-bold text-xs h-10 px-6 flex items-center justify-center gap-2 mt-2 shadow-xs"
          >
            <span>افزودن اولین خودرو</span>
          </Button>
        </div>
      )}

      {/* ================= مودال بروزرسانی کارکرد ================= */}
      <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} className="max-w-md w-full">
        <ModalHeader onClose={() => setIsUpdateModalOpen(false)}>
          <ModalTitle className="font-bold text-sm text-foreground flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            بروزرسانی کارکرد خودرو
          </ModalTitle>
        </ModalHeader>
        
        <ModalBody className="p-5 pt-4">
          {selectedVehicle && (
            <form onSubmit={handleSubmitUpdate(onUpdateSubmit)} className="flex flex-col gap-4 w-full">
              <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border/80">
                <div className="w-12 h-12 shrink-0 rounded-lg border border-border bg-card flex items-center justify-center overflow-hidden p-1">
                  <img 
                    src={(selectedVehicle.car?.cover || selectedVehicle.carCover) ? getFullUrl(selectedVehicle.car?.cover || selectedVehicle.carCover) : DEFAULT_CAR_IMAGE} 
                    className="w-full h-full object-contain" 
                    alt={selectedVehicle.car?.model || selectedVehicle.carModel || ''} 
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_CAR_IMAGE;
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-2xs text-muted-foreground">
                    <span>کمپانی:</span>
                    <span className="font-medium text-foreground">
                      {selectedVehicle.car?.carManufacturer?.name || selectedVehicle.carManufacturerName || '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-foreground">
                      {selectedVehicle.car?.model || selectedVehicle.carModel}
                    </span>
                    {selectedVehicle.title && (
                      <span className="text-3xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {selectedVehicle.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ورودی کیلومتر */}
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  کیلومتر کارکرد فعلی خودرو *
                </label>
                <Controller
                  name="mileage"
                  control={control}
                  render={({ field }) => {
                    const rawValue = field.value !== undefined && field.value !== null ? String(field.value) : '';
                    const displayValue = rawValue ? Number(rawValue).toLocaleString('en-US') : '';

                    return (
                      <div className="relative w-full" dir="ltr">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="125,000"
                          value={displayValue}
                          onChange={(e) => {
                            const normalized = normalizeNumbers(e.target.value).replace(/[^0-9]/g, '');
                            const numericVal = normalized ? Number(normalized) : 0;
                            field.onChange(numericVal);
                          }}
                          className={cn(
                            "w-full h-11 pl-3.5 pr-12 rounded-xl border bg-card text-foreground font-semibold text-sm outline-none transition-all placeholder:text-muted-foreground/40 text-left",
                            errorsUpdate.mileage 
                              ? "border-destructive focus:ring-1 focus:ring-destructive" 
                              : "border-border focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
                          )}
                        />
                        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-2xs font-bold text-muted-foreground select-none">
                          km
                        </span>
                      </div>
                    );
                  }}
                />
                {watchMileage ? (
                  <span className="text-2xs text-muted-foreground">
                    معادل: {toPersianDigits(Number(watchMileage).toLocaleString('fa-IR'))} کیلومتر
                  </span>
                ) : null}
                {errorsUpdate.mileage?.message && (
                  <span className="text-2xs text-destructive font-medium">
                    {String(errorsUpdate.mileage.message)}
                  </span>
                )}
              </div>

              {/* تاریخ سرویس */}
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  تاریخ سرویس اخیر (تعویض روغن یا فیلتر) *
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

              {/* عمر مفید روغن */}
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  عمر مفید روغن مصرفی *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5000, 7000, 10000].map((limit) => (
                    <button
                      key={limit}
                      type="button"
                      onClick={() => setUpdateOilLimit(limit)}
                      className={cn(
                        "py-2 rounded-xl border text-xs font-semibold transition-all outline-none",
                        updateOilLimit === limit
                          ? "border-foreground bg-muted font-bold text-foreground"
                          : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                      )}
                    >
                      {toPersianDigits(limit.toLocaleString('fa-IR'))} km
                    </button>
                  ))}
                </div>
              </div>

              {/* پیش‌نمایش سرویس بعدی */}
              <div className="w-full bg-muted/40 border border-border/80 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground">
                  <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-xs font-medium">سرویس بعدی شما:</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-foreground text-sm" dir="ltr">
                  <span>
                    {toPersianDigits(((Number(watchMileage) || 0) + updateOilLimit).toLocaleString('fa-IR'))}
                  </span>
                  <span className="text-2xs font-semibold text-muted-foreground">کیلومتر</span>
                </div>
              </div>
            </form>
          )}
        </ModalBody>

        <div className="flex flex-row gap-2.5 p-5 pt-3 border-t border-border w-full shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsUpdateModalOpen(false)}
            className="flex-1 rounded-xl text-xs h-10 font-medium border-border"
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isFormUnchanged || updateVehicle.isPending}
            isLoading={updateVehicle.isPending}
            className="flex-1 rounded-xl text-xs h-10 font-bold disabled:opacity-50"
            onClick={handleSubmitUpdate(onUpdateSubmit)}
          >
            ثبت تغییرات
          </Button>
        </div>
      </Modal>

      {/* ================= مودال حذف ================= */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="max-w-md w-full">
        <ModalHeader onClose={() => setIsDeleteModalOpen(false)}>
          <ModalTitle className="font-bold text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            حذف خودرو از گاراژ
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="p-5 flex flex-col gap-2">
          <p className="text-xs font-bold leading-relaxed text-foreground">
            آیا از حذف «{vehicleToDelete?.car?.model || vehicleToDelete?.carModel || vehicleToDelete?.title}» مطمئن هستید؟
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            با حذف این خودرو، یادآورهای سرویس دوره‌ای و لیست قطعات سازگار با آن پاک خواهند شد.
          </p>
        </ModalBody>

        <div className="flex flex-row gap-2.5 p-5 pt-2 border-t border-border w-full shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
            className="flex-1 rounded-xl text-xs h-10 font-medium border-border"
          >
            انصراف
          </Button>
          <Button
            type="button"
            variant="destructive"
            isLoading={deleteVehicle.isPending}
            onClick={confirmDeleteVehicle}
            className="flex-1 rounded-xl text-xs h-10 font-bold"
          >
            بله، حذف شود
          </Button>
        </div>
      </Modal>
    </div>
  );
}