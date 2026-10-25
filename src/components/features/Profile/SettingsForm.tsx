'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Building,
  CreditCard,
  Smartphone,
  Save,
} from 'lucide-react';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { useUpdateProfile } from '@/domains/userpanel/hooks/userpanel.hooks';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { Select } from '@/components/primitives/Select/Select';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { ChangeMobileModal } from './components/ChangeMobileModal';
import { jalaliToGregorian } from '@/core/utils/formatters';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

const profileSchema = z.object({
  fullName: z.string().min(3, 'نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد'),
  // کد ملی کاملاً اختیاری
  nationalCode: z
    .string()
    .refine((val) => !val || /^[0-9]{10}$/.test(val), {
      message: 'کد ملی باید دقیقا ۱۰ رقم عددی باشد',
    })
    .optional()
    .or(z.literal('')),
  email: z.string().email('ایمیل معتبر نیست').optional().or(z.literal('')),
  job: z.string().optional().or(z.literal('')),
  naturalPersonEconomicCode: z.string().optional().or(z.literal('')),

  // اطلاعات حقوقی
  organizationName: z.string().optional().or(z.literal('')),
  organizationType: z.string().optional().or(z.literal('')),
  organizationEconomicCode: z.string().optional().or(z.literal('')),
  organizationNationalCode: z.string().optional().or(z.literal('')),
  organizationRegisterationCode: z.string().optional().or(z.literal('')),
  organizationHeadOfficeTel: z.string().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function SettingsForm() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const updateProfile = useUpdateProfile();

  const [activeTab, setActiveTab] = React.useState<'personal' | 'legal'>('personal');
  const [isMobileModalOpen, setIsMobileModalOpen] = React.useState(false);

  // وضعیت تاریخ تولد
  const [birthDay, setBirthDay] = React.useState('1');
  const [birthMonth, setBirthMonth] = React.useState('1');
  const [birthYear, setBirthYear] = React.useState('1370');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      nationalCode: '',
      email: '',
      job: '',
      naturalPersonEconomicCode: '',
      organizationName: '',
      organizationType: '',
      organizationEconomicCode: '',
      organizationNationalCode: '',
      organizationRegisterationCode: '',
      organizationHeadOfficeTel: '',
    },
  });

  React.useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || '',
        nationalCode: user.nationalCode || '',
        email: user.email || '',
        job: user.job || '',
        naturalPersonEconomicCode: user.naturalPersonEconomicCode || '',
        organizationName: user.legalInfo?.organizationName || '',
        organizationType: user.legalInfo?.organizationType || '',
        organizationEconomicCode: user.legalInfo?.organizationEconomicCode || '',
        organizationNationalCode: user.legalInfo?.organizationNationalCode || '',
        organizationRegisterationCode: user.legalInfo?.organizationRegisterationCode || '',
        organizationHeadOfficeTel: user.legalInfo?.organizationHeadOfficeTel || '',
      });

      if (user.birthDate) {
        try {
          const date = new Date(user.birthDate);
          if (!isNaN(date.getTime())) {
            // مقادیر پیش‌فرض تاریخ تولد
            setBirthDay('1');
            setBirthMonth('1');
            setBirthYear('1370');
          }
        } catch {}
      }
    }
  }, [user, reset]);

  if (isLoading && !user) {
    return <PageLoading label="در حال دریافت اطلاعات کاربری..." />;
  }

  const onSubmit = async (data: ProfileFormValues) => {
    const formData = new FormData();
    formData.append('FullName', data.fullName);
    if (data.nationalCode) formData.append('NationalCode', data.nationalCode);
    if (data.email) formData.append('Email', data.email);
    if (data.job) formData.append('Job', data.job);
    if (data.naturalPersonEconomicCode) formData.append('NaturalPersonEconomicCode', data.naturalPersonEconomicCode);

    // افزودن تاریخ تولد
    const birthDateGregorian = jalaliToGregorian(Number(birthYear), Number(birthMonth), Number(birthDay));
    formData.append('BirthDate', birthDateGregorian);

    // افزودن اطلاعات حقوقی در صورت تکمیل نام سازمان
    if (data.organizationName) {
      formData.append('HasLegalInfo', 'true');
      formData.append('OrganizationName', data.organizationName);
      formData.append('OrganizationType', data.organizationType || '');
      formData.append('OrganizationEconomicCode', data.organizationEconomicCode || '');
      formData.append('OrganizationNationalCode', data.organizationNationalCode || '');
      formData.append('OrganizationRegisterationCode', data.organizationRegisterationCode || '');
      formData.append('OrganizationHeadOfficeTel', data.organizationHeadOfficeTel || '');
    }

    try {
      await updateProfile.mutateAsync(formData);
      showToast.success('اطلاعات حساب کاربری با موفقیت بروزرسانی شد');
    } catch {}
  };

  const days = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
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
  const years = Array.from({ length: 70 }, (_, i) => ({ value: String(1340 + i), label: String(1340 + i) }));

  const defaultAccount = user?.bankAccounts?.find((b: any) => b.isDefault) || user?.bankAccounts?.[0];

  return (
    <div className="flex w-full flex-col gap-5">
      {/* هدر بخش تنظیمات در دسکتاپ */}
      <div className="hidden lg:flex flex-col gap-1 border-b border-border/70 pb-4">
        <h1 className="text-base font-black text-foreground sm:text-lg">اطلاعات حساب کاربری</h1>
        <p className="text-xs text-muted-foreground">
          اطلاعات هویتی و حقوقی خود را جهت صدور فاکتور رسمی و تسویه سفارشات مدیریت کنید.
        </p>
      </div>

      {/* تب‌های تنظیمات */}
      <div className="flex items-center gap-2 border-b border-border/80">
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors',
            activeTab === 'personal'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <User className="h-4 w-4" />
          <span>مشخصات فردی و بانکی</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('legal')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors',
            activeTab === 'legal'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Building className="h-4 w-4" />
          <span>اطلاعات حقوقی و سازمانی</span>
        </button>
      </div>

      {/* کارت تغییر شماره موبایل با امنیت پیامکی */}
      <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">شماره موبایل فعال</span>
            <span className="text-2xs text-muted-foreground  mt-0.5" dir="ltr">
              {user?.phoneNumber}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsMobileModalOpen(true)}
          className="h-8.5 rounded-lg text-2xs font-bold text-primary hover:bg-primary/5"
        >
          تغییر شماره
        </Button>
      </div>

      {/* فرم یکپارچه اصلی */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {activeTab === 'personal' ? (
          <div className="flex flex-col gap-4">
            <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
              <h2 className="mb-4 text-xs font-bold text-foreground">شناسنامه هویتی</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="نام و نام خانوادگی *"
                  placeholder="مثال: علی رضایی"
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />

                <Input
                  label="کد ملی (اختیاری)"
                  placeholder="۱۰ رقم بدون خط تیره"
                  maxLength={10}
                  dir="ltr"
                  error={errors.nationalCode?.message}
                  {...register('nationalCode')}
                />

                <Input
                  label="آدرس ایمیل"
                  placeholder="example@gmail.com"
                  dir="ltr"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="شغل / سمت"
                  placeholder="مثال: مکانیک، فروشنده قطعات"
                  {...register('job')}
                />

                <div className="md:col-span-2">
                  <Input
                    label="کد اقتصادی شخص حقیقی (اختیاری)"
                    placeholder="۱۲ رقم کد اقتصادی"
                    dir="ltr"
                    {...register('naturalPersonEconomicCode')}
                  />
                </div>

                {/* انتخاب تاریخ تولد */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-2xs font-bold text-muted-foreground">تاریخ تولد</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      placeholder="روز"
                      value={birthDay}
                      onChange={(e) => setBirthDay(e.target.value)}
                      options={days}
                    />
                    <Select
                      placeholder="ماه"
                      value={birthMonth}
                      onChange={(e) => setBirthMonth(e.target.value)}
                      options={months}
                    />
                    <Select
                      placeholder="سال"
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      options={years}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* کارت مشخصات حساب بانکی و تسویه */}
            <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4.5 w-4.5 text-primary" />
                  <h2 className="text-xs font-bold text-foreground">حساب بانکی پیش‌فرض تسویه</h2>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/profile/wallet')}
                  className="h-7.5 rounded-lg text-3xs font-bold text-primary"
                >
                  تغییر کارت در کیف پول
                </Button>
              </div>

              {defaultAccount ? (
                <div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-4 border border-border/50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">شماره کارت:</span>
                    <span className=" font-bold text-foreground" dir="ltr">
                      {defaultAccount.cardNumber}
                    </span>
                  </div>
                  {defaultAccount.shebaNumber && (
                    <div className="flex items-center justify-between border-t border-border/40 pt-2">
                      <span className="text-muted-foreground">شماره شبا:</span>
                      <span className=" font-bold text-foreground" dir="ltr">
                        {defaultAccount.shebaNumber}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-2xs text-muted-foreground">
                  هنوز شماره کارت یا شبایی برای تسویه در کیف پول ثبت نکرده‌اید.
                </p>
              )}
            </Card>
          </div>
        ) : (
          /* اطلاعات حقوقی */
          <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
            <h2 className="mb-4 text-xs font-bold text-foreground">اطلاعات حقوقی شرکت (جهت فاکتور رسمی)</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="نام سازمان / شرکت"
                placeholder="نام کامل ثبتی شرکت"
                {...register('organizationName')}
              />

              <Input
                label="نوع سازمان / نوع صنف"
                placeholder="مثال: با مسئولیت محدود، سهامی خاص"
                {...register('organizationType')}
              />

              <Input
                label="شناسه ملی ۱۱ رقمی"
                placeholder="شناسه ملی شرکت"
                maxLength={11}
                dir="ltr"
                {...register('organizationNationalCode')}
              />

              <Input
                label="شناسه ثبت"
                placeholder="شماره ثبت شرکت"
                dir="ltr"
                {...register('organizationRegisterationCode')}
              />

              <Input
                label="کد اقتصادی حقوقی"
                placeholder="کد اقتصادی ۱۲ رقمی"
                maxLength={12}
                dir="ltr"
                {...register('organizationEconomicCode')}
              />

              <Input
                label="تلفن ثابت دفتر مرکزی"
                placeholder="مثال: 02188888888"
                dir="ltr"
                {...register('organizationHeadOfficeTel')}
              />
            </div>
          </Card>
        )}

        {/* دکمه چسبان ذخیره تغییرات */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={updateProfile.isPending}
            disabled={!isDirty && !updateProfile.isPending}
            className="h-10 gap-2 rounded-xl px-6 text-xs font-bold shadow-sm"
          >
            <Save className="h-4 w-4" />
            <span>ذخیره تغییرات</span>
          </Button>
        </div>
      </form>

      {/* مودال تغییر شماره موبایل */}
      <ChangeMobileModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />
    </div>
  );
}