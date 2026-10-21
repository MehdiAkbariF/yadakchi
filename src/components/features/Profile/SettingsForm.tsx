'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ArrowRight } from 'lucide-react';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { Card } from '@/components/composites/Card';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { PersonalInfoModal } from './components/PersonalInfoModal';
import { ChangeMobileModal } from './components/ChangeMobileModal';
import { DefaultBankModal } from './components/DefaultBankModal';
import { JobModal } from './components/JobModal';
import { EconomicCodeModal } from './components/EconomicCodeModal';
import { LegalInfoModal } from './components/LegalInfoModal';
import { cn } from '@/design-system/utils/cn';

type TabKey = 'personal' | 'legal';

interface SettingItem {
  label: string;
  value: string | null;
  required: boolean;
  modalId: number;
}

export function SettingsForm() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [activeTab, setActiveTab] = React.useState<TabKey>('personal');
  const [activeModal, setActiveModal] = React.useState<number | null>(null);

  if (isLoading || !user) {
    return <PageLoading label="در حال دریافت اطلاعات حساب کاربری..." />;
  }

  const defaultAccount =
    user.bankAccounts?.find((b) => b.isDefault) || user.bankAccounts?.[0] || null;

  const personalItems: SettingItem[] = [
    { label: 'نام و نام خانوادگی', value: user.fullName, required: true, modalId: 1 },
    { label: 'شماره ملی', value: user.nationalCode, required: true, modalId: 1 },
    { label: 'آدرس ایمیل', value: user.email, required: false, modalId: 1 },
    { label: 'شماره موبایل', value: user.phoneNumber, required: true, modalId: 2 },
    {
      label: 'تاریخ تولد',
      value: user.birthDate ? new Date(user.birthDate).toLocaleDateString('fa-IR') : null,
      required: true,
      modalId: 1,
    },
    { label: 'شماره شبا تسویه', value: defaultAccount?.shebaNumber || null, required: true, modalId: 3 },
    { label: 'شماره کارت تسویه', value: defaultAccount?.cardNumber || null, required: true, modalId: 3 },
    { label: 'شغل / سمت', value: user.job, required: false, modalId: 4 },
    {
      label: 'کد اقتصادی اشخاص حقیقی',
      value: user.naturalPersonEconomicCode,
      required: false,
      modalId: 5,
    },
  ];

  const legalItems: SettingItem[] = [
    {
      label: 'نام سازمان / شرکت',
      value: user.legalInfo?.organizationName || null,
      required: true,
      modalId: 6,
    },
    {
      label: 'نوع سازمان / نوع صنف',
      value: user.legalInfo?.organizationType || null,
      required: true,
      modalId: 6,
    },
    {
      label: 'شناسه ملی شرکت / سازمان',
      value: user.legalInfo?.organizationNationalCode || null,
      required: true,
      modalId: 6,
    },
    {
      label: 'شناسه ثبت سازمان',
      value: user.legalInfo?.organizationRegisterationCode || null,
      required: true,
      modalId: 6,
    },
    {
      label: 'کد اقتصادی حقوقی',
      value: user.legalInfo?.organizationEconomicCode || null,
      required: true,
      modalId: 6,
    },
    {
      label: 'استان (محل دفتر مرکزی)',
      value: user.legalInfo?.organizationHeadOfficeProvince || null,
      required: true,
      modalId: 6,
    },
    {
      label: 'شهر (محل دفتر مرکزی)',
      value: user.legalInfo?.organizationHeadOfficeCity || null,
      required: true,
      modalId: 6,
    },
    {
      label: 'شماره تلفن ثابت دفتر مرکزی',
      value: user.legalInfo?.organizationHeadOfficeTel || null,
      required: true,
      modalId: 6,
    },
  ];

  const renderItemCard = (item: SettingItem) => (
    <div key={item.label} className="flex w-full select-none flex-col gap-1.5">
      <span className="me-1 flex items-center gap-1 text-xs font-bold text-muted-foreground">
        {item.label}
        {item.required ? <span className="text-destructive">*</span> : null}
      </span>
      <Card
        onClick={() => setActiveModal(item.modalId)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActiveModal(item.modalId);
          }
        }}
        className="flex h-11 cursor-pointer items-center justify-start border border-border bg-card px-4 py-2.5 shadow-xs transition-colors duration-fast hover:border-primary/40 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="truncate text-sm font-medium text-foreground">
          {item.value || <span className="text-muted-foreground">ثبت نشده</span>}
        </span>
      </Card>
    </div>
  );

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="mb-1 flex shrink-0 items-center justify-between border-b border-border pb-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/profile')}
            aria-label="بازگشت"
            className="-me-1 flex items-center justify-center rounded-full p-1 transition-colors hover:bg-muted"
          >
            <ArrowRight aria-hidden="true" className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-sm font-bold text-foreground">اطلاعات حساب کاربری</span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 border-b border-border pb-5">
        <div className="flex items-center gap-2">
          <Settings aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
          <span className="text-xl font-bold text-foreground">اطلاعات حساب</span>
        </div>
        <p className="text-xs text-muted-foreground">
          مشاهده شناسنامه اطلاعات فردی، کارت تسویه، و فاکتور حقوقی شما (برای ویرایش روی هر کارت کلیک کنید)
        </p>
      </div>

      <div className="mt-2 flex w-full select-none items-center gap-5 border-b border-border pb-2.5">
        {(
          [
            { key: 'personal' as const, label: 'مشخصات فردی' },
            { key: 'legal' as const, label: 'اطلاعات حقوقی' },
          ]
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'border-b-2 pb-2 text-sm font-bold outline-none transition-colors',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex w-full flex-col">
        {activeTab === 'personal' ? (
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {personalItems.map(renderItemCard)}
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {legalItems.map(renderItemCard)}
          </div>
        )}
      </div>

      <PersonalInfoModal isOpen={activeModal === 1} onClose={() => setActiveModal(null)} user={user} />
      <ChangeMobileModal isOpen={activeModal === 2} onClose={() => setActiveModal(null)} />
      <DefaultBankModal isOpen={activeModal === 3} onClose={() => setActiveModal(null)} />
      <JobModal isOpen={activeModal === 4} onClose={() => setActiveModal(null)} user={user} />
      <EconomicCodeModal isOpen={activeModal === 5} onClose={() => setActiveModal(null)} user={user} />
      <LegalInfoModal isOpen={activeModal === 6} onClose={() => setActiveModal(null)} user={user} />
    </div>
  );
}