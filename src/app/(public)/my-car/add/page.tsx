'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { useCreateUserVehicle, useGetUserVehicles } from '@/domains/userpanel/hooks/userpanel.hooks';
import { useGetCarManufacturers } from '@/domains/front/reference/car/hooks/car.hooks';
import { userPanelValidators } from '@/domains/userpanel/validation/userpanel.validation';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { getHttpClient } from '@/core/http/client';
import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { 
  Car, 
  Search, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl } from '@/core/utils/formatters';

const DEFAULT_CAR_IMAGE = '/car-noimage.png';

interface AddVehicleFormValues {
  carId: string;
  title: string;
  isDefault: boolean;
}

export default function AddCarPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createVehicle = useCreateUserVehicle();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // واکشی خودروهای موجود کاربر جهت بررسی عدم تکراری بودن
  const { data: userVehicles = [] } = useGetUserVehicles();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null);
  const [selectedModel, setSelectedModel] = useState<any | null>(null);

  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      showToast.error('برای ثبت خودروی جدید ابتدا وارد حساب کاربری خود شوید');
      router.replace('/login?redirect=/my-car/add');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const { data: manufacturers = [], isLoading: isManufacturersLoading } = useGetCarManufacturers({
    name: brandSearch || undefined,
  });

  const { data: cars = [], isLoading: isCarsLoading } = useTypedQuery<any[]>(
    ['front', 'cars', 'by-manufacturer', selectedBrand?.id, modelSearch],
    async () => {
      if (!selectedBrand?.id) return [];
      const client = getHttpClient();
      const response = await client.get<any[]>('/api/Front/CarList', {
        params: {
          CarManufacturerId: selectedBrand.id,
          Model: modelSearch || undefined,
          PageSize: 100
        }
      });
      return Array.isArray(response.data) ? response.data : [];
    },
    {
      enabled: !!selectedBrand?.id,
      staleTime: 5 * 60 * 1000
    }
  );

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<AddVehicleFormValues>({
    resolver: zodResolver(userPanelValidators.createVehicle.getSchema() as any),
    defaultValues: {
      carId: '',
      title: '',
      isDefault: false
    }
  });

  const handleSelectBrand = (brand: any) => {
    setSelectedBrand(brand);
    setStep(2);
  };

  const handleSelectModel = (model: any) => {
    // اعتبارسنجی فرانت‌اندر جهت جلوگیری از انتخاب خودروی تکراری
    const isAlreadyAdded = userVehicles.some(
      (v: any) => String(v.carId) === String(model.id) || String(v.car?.id) === String(model.id)
    );

    if (isAlreadyAdded) {
      showToast.error(`خودروی ${model.model} قبلاً به گاراژ شما اضافه شده است و امکان ثبت تکراری وجود ندارد.`);
      return;
    }

    setSelectedModel(model);
    setValue('carId', model.id);
    setStep(3);
  };

  const handleBackToBrands = () => {
    setSelectedBrand(null);
    setSelectedModel(null);
    setValue('carId', '');
    setStep(1);
  };

  const onSubmit = async (data: AddVehicleFormValues) => {
    // بررسی مجدد قبل از سابمیت
    const isDuplicate = userVehicles.some(
      (v: any) => String(v.carId) === String(data.carId) || String(v.car?.id) === String(data.carId)
    );

    if (isDuplicate) {
      showToast.error('این خودرو در حال حاضر در گاراژ شما ثبت شده است.');
      return;
    }

    try {
      await createVehicle.mutateAsync({
        carId: data.carId,
        title: data.title,
        isDefault: data.isDefault,
      });
      showToast.success('خودرو با موفقیت به گاراژ شما اضافه شد');
      await queryClient.invalidateQueries({ queryKey: ['user', 'vehicles'] });
      router.push('/my-car');
    } catch (error) {}
  };

  if (isAuthLoading || !isAuthenticated) {
    return <PageLoading message="در حال بررسی دسترسی به گاراژ..." />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 select-none" dir="rtl">
      
      <div className="w-full flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => step > 1 ? setStep((prev) => (prev - 1) as any) : router.push('/my-car')}
            className="p-1.5 hover:bg-muted rounded-full transition-all"
            aria-label="Back"
          >
            <ArrowRight className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-lg md:text-xl font-black text-foreground ">افزودن خودرو</span>
        </div>
      </div>

      {/* استپر گام‌ها */}
      <div className="w-full flex items-center justify-center gap-1.5 sm:gap-6 border rounded-2xl bg-muted/10 px-4 py-4 select-none mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border",
            step === 1 ? "bg-primary border-primary text-primary-foreground" : step > 1 ? "bg-success-500/10 border-success-500 text-success-500" : "border-border text-muted-foreground"
          )}>
            {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : "۱"}
          </div>
          <span className={cn("text-xs font-bold ", step === 1 ? "text-primary" : "text-muted-foreground")}>سازنده</span>
        </div>

        <div className="h-px w-8 sm:w-16 bg-border" />

        <div className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border",
            step === 2 ? "bg-primary border-primary text-primary-foreground" : step > 2 ? "bg-success-500/10 border-success-500 text-success-500" : "border-border text-muted-foreground"
          )}>
            {step > 2 ? <CheckCircle2 className="h-4 w-4" /> : "۲"}
          </div>
          <span className={cn("text-xs font-bold ", step === 2 ? "text-primary" : "text-muted-foreground")}>مدل</span>
        </div>

        <div className="h-px w-8 sm:w-16 bg-border" />

        <div className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border",
            step === 3 ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground"
          )}>
            ۳
          </div>
          <span className={cn("text-xs font-bold ", step === 3 ? "text-primary" : "text-muted-foreground")}>پایان</span>
        </div>
      </div>

      {/* گام ۱: انتخاب برند */}
      {step === 1 && (
        <div className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-sm md:text-base font-black text-foreground ">انتخاب شرکت سازنده</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              برند خودروی خود را از لیست زیر انتخاب کنید یا نام آن را جستجو نمایید.
            </p>
          </div>

          <Input
            type="text"
            placeholder="جستجوی نام برند (مثلا: سایپا، ایران خودرو، جک...)"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            className="w-full "
          />

          {isManufacturersLoading ? (
            <PageLoading message="در حال لود برندهای خودرو..." />
          ) : manufacturers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
              {manufacturers.map((brand: any) => (
                <Card 
                  key={brand.id}
                  onClick={() => handleSelectBrand(brand)}
                  className="border rounded-2xl cursor-pointer hover:border-primary/50 hover:scale-[1.02] bg-card text-center flex flex-col items-center justify-center p-5 gap-3 shadow-sm transition-all"
                >
                  <div className="w-14 h-14 shrink-0 rounded-full bg-card border p-2 flex items-center justify-center overflow-hidden">
                    {brand.logo ? (
                      <img 
                        src={getFullUrl(brand.logo)} 
                        alt={brand.name} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Car className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-foreground">{brand.name}</span>
                </Card>
              ))}
            </div>
          ) : (
            <div className="w-full py-12 text-center border border-dashed rounded-xl bg-card">
              <span className="text-xs font-bold text-muted-foreground">برندی پیدا نشد.</span>
            </div>
          )}
        </div>
      )}

      {/* گام ۲: انتخاب مدل (بزرگ‌تر شدن تصویر و نام خودرو و بررسی عدم تکراری بودن) */}
      {step === 2 && selectedBrand && (
        <div className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 border-b pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground ">برند انتخاب شده:</span>
              <span className="text-xs font-bold text-foreground bg-muted px-2.5 py-1 rounded-lg">
                {selectedBrand.name}
              </span>
              <button 
                onClick={handleBackToBrands}
                className="text-xs font-bold text-primary hover:underline"
              >
                (تغییر)
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="text-sm md:text-base font-black text-foreground ">انتخاب مدل خودرو</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              مدل دقیق خودروی خود را انتخاب کنید یا نام آن را در کادر زیر جستجو نمایید.
            </p>
          </div>

          <Input
            type="text"
            placeholder={`جستجو در مدل‌های ${selectedBrand.name}...`}
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            className="w-full "
          />

          {isCarsLoading ? (
            <PageLoading message="در حال لود مدل‌های خودرو..." />
          ) : cars.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
              {cars.map((model: any) => {
                const isDuplicate = userVehicles.some(
                  (v: any) => String(v.carId) === String(model.id) || String(v.car?.id) === String(model.id)
                );

                return (
                  <Card 
                    key={model.id}
                    onClick={() => handleSelectModel(model)}
                    className={cn(
                      "border rounded-2xl bg-card text-center flex flex-col items-center justify-between p-4 gap-3 shadow-sm transition-all overflow-hidden relative",
                      isDuplicate 
                        ? "opacity-60 cursor-not-allowed border-border" 
                        : "cursor-pointer hover:border-primary/50 hover:scale-[1.02]"
                    )}
                  >
                    {isDuplicate && (
                      <span className="absolute top-2 right-2 bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 z-10">
                        <AlertTriangle className="h-3 w-3" />
                        قبلاً اضافه شده
                      </span>
                    )}

                    {/* ابعاد بزرگ‌تر تصویر خودرو */}
                    <div className="w-28 h-20 sm:w-32 sm:h-24 shrink-0 rounded-xl bg-card flex items-center justify-center overflow-hidden p-1.5">
                      <img 
                        src={model.cover ? getFullUrl(model.cover) : DEFAULT_CAR_IMAGE} 
                        alt={model.model} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_CAR_IMAGE;
                        }}
                      />
                    </div>
                    {/* ابعاد بزرگ‌تر و خواناتر نام خودرو */}
                    <span className="text-sm sm:text-base font-black text-foreground line-clamp-1">
                      {model.model}
                    </span>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="w-full py-12 text-center border border-dashed rounded-xl bg-card">
              <span className="text-xs font-bold text-muted-foreground">مدلی پیدا نشد.</span>
            </div>
          )}
        </div>
      )}

      {/* گام ۳: ثبت عنوان و پیش‌فرض */}
      {step === 3 && selectedBrand && selectedModel && (
        <div className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 border-b pb-4">
            <h3 className="text-sm md:text-base font-black text-foreground ">ثبت نهایی خودرو در گاراژ</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              عنوان دلخواهی برای شناسایی این خودرو وارد کنید تا فرآیند افزودن تکمیل شود.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border">
            <div className="w-14 h-14 shrink-0 rounded-xl bg-card border p-1 flex items-center justify-center overflow-hidden">
              <img 
                src={selectedModel.cover ? getFullUrl(selectedModel.cover) : DEFAULT_CAR_IMAGE} 
                alt={selectedModel.model} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_CAR_IMAGE;
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-black text-foreground ">{selectedModel.model}</span>
              <span className="text-xs text-muted-foreground mt-0.5">کمپانی {selectedBrand.name}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4.5 w-full">
            <div className="w-full">
              <Input
                label="عنوان دلخواه خودرو *"
                placeholder="مثال: ماشین شخصی، آژانس، کاری"
                error={errors.title?.message ? String(errors.title.message) : undefined}
                className="text-xs md:text-sm "
                {...register('title')}
              />
            </div>

            <div className="flex items-center gap-2.5 pt-2 select-none">
              <input
                type="checkbox"
                id="final_default_car"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                {...register('isDefault')}
              />
              <label htmlFor="final_default_car" className="text-xs font-bold text-foreground cursor-pointer">
                به عنوان خودروی پیش‌فرض من در سیستم ثبت شود
              </label>
            </div>

            <div className="flex gap-2 mt-4 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl text-xs md:text-sm h-11"
              >
                مرحله قبل
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={createVehicle.isPending}
                className="flex-1 rounded-xl text-xs md:text-sm h-11"
              >
                ثبت نهایی خودرو
              </Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
