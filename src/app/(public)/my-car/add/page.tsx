'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateUserVehicle } from '@/domains/userpanel/hooks/userpanel.hooks';
import { useGetCarManufacturers } from '@/domains/front/reference/car/hooks/car.hooks';
import { userPanelValidators } from '@/domains/userpanel/validation/userpanel.validation';
import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { getHttpClient } from '@/core/http/client';
import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { 
  Car, 
  Search, 
  ChevronLeft, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

interface AddVehicleFormValues {
  carId: string;
  title: string;
  isDefault: boolean;
}

export default function AddCarPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createVehicle = useCreateUserVehicle();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null);
  const [selectedModel, setSelectedModel] = useState<any | null>(null);

  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');

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

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const handleSelectBrand = (brand: any) => {
    setSelectedBrand(brand);
    setStep(2);
  };

  const handleSelectModel = (model: any) => {
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

  return (
    <MainLayout>
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 select-none text-right" dir="rtl">
        
        <div className="w-full flex items-center justify-between border-b pb-5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => step > 1 ? setStep((prev) => (prev - 1) as any) : router.push('/my-car')}
              className="p-1.5 hover:bg-muted rounded-full transition-all"
              aria-label="Back"
            >
              <ArrowRight className="h-5 w-5 text-foreground" />
            </button>
            <span className="text-lg md:text-xl font-black text-foreground font-iran-yekan">افزودن خودرو</span>
          </div>
        </div>

        <div className="w-full flex items-center justify-center gap-1.5 sm:gap-6 border rounded-2xl bg-muted/10 px-4 py-4 select-none mb-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-iran-yekan border",
              step === 1 ? "bg-primary border-primary text-white" : step > 1 ? "bg-success-500/10 border-success-500 text-success-500" : "border-zinc-300 text-muted-foreground"
            )}>
              {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : "۱"}
            </div>
            <span className={cn("text-xs font-bold font-iran-yekan", step === 1 ? "text-primary" : "text-muted-foreground")}>سازنده</span>
          </div>

          <div className="h-px w-8 sm:w-16 bg-zinc-300 dark:bg-zinc-800" />

          <div className="flex items-center gap-2">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-iran-yekan border",
              step === 2 ? "bg-primary border-primary text-white" : step > 2 ? "bg-success-500/10 border-success-500 text-success-500" : "border-zinc-300 text-muted-foreground"
            )}>
              {step > 2 ? <CheckCircle2 className="h-4 w-4" /> : "۲"}
            </div>
            <span className={cn("text-xs font-bold font-iran-yekan", step === 2 ? "text-primary" : "text-muted-foreground")}>مدل</span>
          </div>

          <div className="h-px w-8 sm:w-16 bg-zinc-300 dark:bg-zinc-800" />

          <div className="flex items-center gap-2">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-iran-yekan border",
              step === 3 ? "bg-primary border-primary text-white" : "border-zinc-300 text-muted-foreground"
            )}>
              ۳
            </div>
            <span className={cn("text-xs font-bold font-iran-yekan", step === 3 ? "text-primary" : "text-muted-foreground")}>پایان</span>
          </div>
        </div>

        {step === 1 && (
          <div className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm md:text-base font-black text-foreground font-iran-yekan">انتخاب شرکت سازنده</h3>
              <p className="text-xs text-muted-foreground font-iran-yekan leading-relaxed">
                برند خودروی خود را از لیست زیر انتخاب کنید یا نام آن را جستجو نمایید.
              </p>
            </div>

            <Input
              type="text"
              placeholder="جستجوی نام برند (مثلا: سایپا، ایران خودرو، جک...)"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-zinc-400" />}
              className="w-full font-iran-yekan"
            />

            {isManufacturersLoading ? (
              <PageLoading message="در حال لود برندهای خودرو..." />
            ) : manufacturers.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                {manufacturers.map((brand: any) => (
                  <Card 
                    key={brand.id}
                    onClick={() => handleSelectBrand(brand)}
                    className="border rounded-xl cursor-pointer hover:border-primary/40 hover:scale-[1.02] bg-card text-center flex flex-col items-center justify-center p-4 gap-3 shadow-sm transition-all"
                  >
                    <div className="w-12 h-12 shrink-0 rounded-full bg-background border p-1 flex items-center justify-center overflow-hidden">
                      {brand.logo ? (
                        <img src={getFullUrl(brand.logo)} alt={brand.name} className="w-full h-full object-contain" />
                      ) : (
                        <Car className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-xs font-bold font-iran-yekan text-foreground">{brand.name}</span>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="w-full py-12 text-center border border-dashed rounded-xl bg-card">
                <span className="text-xs font-bold font-iran-yekan text-muted-foreground">برندی پیدا نشد.</span>
              </div>
            )}
          </div>
        )}

        {step === 2 && selectedBrand && (
          <div className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 border-b pb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-iran-yekan">برند انتخاب شده:</span>
                <span className="text-xs font-bold text-foreground font-iran-yekan bg-muted px-2.5 py-1 rounded-lg">
                  {selectedBrand.name}
                </span>
                <button 
                  onClick={handleBackToBrands}
                  className="text-xs font-bold font-iran-yekan text-primary hover:underline"
                >
                  (تغییر)
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm md:text-base font-black text-foreground font-iran-yekan">انتخاب مدل خودرو</h3>
              <p className="text-xs text-muted-foreground font-iran-yekan leading-relaxed">
                مدل دقیق خودروی خود را انتخاب کنید یا نام آن را در کادر زیر جستجو نمایید.
              </p>
            </div>

            <Input
              type="text"
              placeholder={`جستجو در مدل‌های ${selectedBrand.name}...`}
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-zinc-400" />}
              className="w-full font-iran-yekan"
            />

            {isCarsLoading ? (
              <PageLoading message="در حال لود مدل‌های خودرو..." />
            ) : cars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                {cars.map((model: any) => (
                  <Card 
                    key={model.id}
                    onClick={() => handleSelectModel(model)}
                    className="border rounded-xl cursor-pointer hover:border-primary/40 hover:scale-[1.02] bg-card text-center flex flex-col items-center justify-center p-4 gap-3 shadow-sm transition-all"
                  >
                    <div className="w-16 h-12 shrink-0 rounded-lg bg-background flex items-center justify-center overflow-hidden">
                      {model.cover ? (
                        <img src={getFullUrl(model.cover)} alt={model.model} className="w-full h-full object-contain" />
                      ) : (
                        <Car className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-xs font-bold font-iran-yekan text-foreground mt-1 line-clamp-1">{model.model}</span>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="w-full py-12 text-center border border-dashed rounded-xl bg-card">
                <span className="text-xs font-bold font-iran-yekan text-muted-foreground">مدلی پیدا نشد.</span>
              </div>
            )}
          </div>
        )}

        {step === 3 && selectedBrand && selectedModel && (
          <div className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 border-b pb-4">
              <h3 className="text-sm md:text-base font-black text-foreground font-iran-yekan">ثبت نهایی خودرو در گاراژ</h3>
              <p className="text-xs text-muted-foreground font-iran-yekan leading-relaxed">
                عنوان دلخواهی برای شناسایی این خودرو وارد کنید تا فرآیند افزودن تکمیل شود.
              </p>
            </div>

            <div className="flex items-center gap-3.5 bg-muted/30 p-4 rounded-xl border">
              <div className="w-10 h-10 shrink-0 rounded-full bg-background border p-1 flex items-center justify-center overflow-hidden">
                {selectedBrand.logo ? (
                  <img src={getFullUrl(selectedBrand.logo)} alt="" className="w-full h-full object-contain" />
                ) : (
                  <Car className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-foreground font-iran-yekan">{selectedModel.model}</span>
                <span className="text-[10px] text-muted-foreground font-iran-yekan mt-0.5">کمپانی {selectedBrand.name}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4.5 w-full text-right">
              <div className="w-full">
                <Input
                  label="عنوان دلخواه خودرو *"
                  placeholder="مثال: ماشین شخصی، آژانس، سی"
                  error={errors.title?.message ? String(errors.title.message) : undefined}
                  className="text-xs font-iran-yekan"
                  {...register('title')}
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2 select-none">
                <input
                  type="checkbox"
                  id="final_default_car"
                  className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
                  {...register('isDefault')}
                />
                <label htmlFor="final_default_car" className="text-xs font-bold text-foreground font-iran-yekan cursor-pointer">
                  به عنوان خودروی پیش‌فرض من در سیستم ثبت شود
                </label>
              </div>

              <div className="flex gap-2 mt-4 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-xl text-xs h-10"
                >
                  مرحله قبل
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createVehicle.isPending}
                  className="flex-1 rounded-xl text-xs h-10"
                >
                  ثبت نهایی خودرو
                </Button>
              </div>
            </form>
          </div>
        )}

      </div>
    </MainLayout>
  );
}