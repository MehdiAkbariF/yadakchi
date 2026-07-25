'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { Card } from '@/components/composites/Card';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { PersonalInfoModal } from './components/PersonalInfoModal';
import { ChangeMobileModal } from './components/ChangeMobileModal';
import { DefaultBankModal } from './components/DefaultBankModal';
import { JobModal } from './components/JobModal';
import { EconomicCodeModal } from './components/EconomicCodeModal';
import { LegalInfoModal } from './components/LegalInfoModal';
import { Settings, ArrowRight } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export function SettingsForm() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'personal' | 'legal'>('personal');
  const [activeModal, setActiveModal] = useState<number | null>(null);

  if (isLoading || !user) {
    return <PageLoading message="در حال دریافت اطلاعات حساب کاربری..." />;
  }

  const defaultAccount = user.bankAccounts?.find(b => b.isDefault) || user.bankAccounts?.[0] || null;

  const renderItemCard = (label: string, value: string | null, required: boolean, onClick: () => void) => (
    <Card 
      onClick={onClick}
      className="cursor-pointer border rounded-2xl p-5 bg-card hover:border-primary/25 hover:bg-primary/5 hover:scale-[1.01] transition-all duration-200 flex flex-col justify-center gap-2 text-right select-none shadow-sm min-h-[96px]"
    >
      <span className="text-[10px] md:text-xs text-muted-foreground font-bold font-iran-sans flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </span>
      <span className="text-xs md:text-sm font-black text-foreground leading-relaxed truncate">
        {value || 'ثبت نشده'}
      </span>
    </Card>
  );

  return (
    <div className="flex-1 flex flex-col gap-6 w-full text-right" dir="rtl">
      
      <div className="lg:hidden flex items-center justify-between border-b pb-3 mb-1 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.push('/profile')}
            className="p-1 -mr-1 hover:bg-muted rounded-full flex items-center justify-center transition-colors"
            aria-label="Back"
          >
            <ArrowRight className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-sm font-bold font-iran-yekan text-foreground">اطلاعات حساب کاربری</span>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2 border-b pb-5">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary shrink-0" />
          <span className="text-lg md:text-xl font-black text-foreground font-iran-yekan">اطلاعات حساب</span>
        </div>
        <p className="text-xs text-muted-foreground font-iran-sans">
          مشاهده شناسنامه اطلاعات فردی، کارت تسویه، و فاکتور حقوقی شما (برای ویرایش روی کارت مورد نظر کلیک کنید)
        </p>
      </div>

      <div className="flex items-center gap-5 border-b pb-2.5 w-full mt-2 select-none">
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={cn(
            "text-xs md:text-sm font-bold font-iran-yekan pb-2 border-b-2 transition-all outline-none",
            activeTab === 'personal' ? "text-primary border-primary" : "text-muted-foreground border-transparent"
          )}
        >
          مشخصات فردی
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('legal')}
          className={cn(
            "text-xs md:text-sm font-bold font-iran-yekan pb-2 border-b-2 transition-all outline-none",
            activeTab === 'legal' ? "text-primary border-primary" : "text-muted-foreground border-transparent"
          )}
        >
          اطلاعات حقوقی
        </button>
      </div>

      <div className="w-full flex flex-col">
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full animate-in fade-in duration-200">
            {renderItemCard('نام و نام خانوادگی', user.fullName, true, () => setActiveModal(1))}
            {renderItemCard('شماره ملی', user.nationalCode, true, () => setActiveModal(1))}
            {renderItemCard('آدرس ایمیل', user.email, false, () => setActiveModal(1))}
            {renderItemCard('شماره موبایل', user.phoneNumber, true, () => setActiveModal(2))}
            {renderItemCard('تاریخ تولد', user.birthDate ? new Date(user.birthDate).toLocaleDateString('fa-IR') : null, true, () => setActiveModal(1))}
            {renderItemCard('شماره شبا تسویه', defaultAccount?.shebaNumber || null, true, () => setActiveModal(3))}
            {renderItemCard('شماره کارت تسویه', defaultAccount?.cardNumber || null, true, () => setActiveModal(3))}
            {renderItemCard('شغل / سمت', user.job, false, () => setActiveModal(4))}
            {renderItemCard('کد اقتصادی اشخاص حقیقی', user.naturalPersonEconomicCode, false, () => setActiveModal(5))}
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full animate-in fade-in duration-200">
            {renderItemCard('نام سازمان / شرکت', user.legalInfo?.organizationName || null, true, () => setActiveModal(6))}
            {renderItemCard('نوع سازمان / نوع صنف', user.legalInfo?.organizationType || null, true, () => setActiveModal(6))}
            {renderItemCard('شناسه ملی شرکت / سازمان', user.legalInfo?.organizationNationalCode || null, true, () => setActiveModal(6))}
            {renderItemCard('شناسه ثبت سازمان', user.legalInfo?.organizationRegisterationCode || null, true, () => setActiveModal(6))}
            {renderItemCard('کد اقتصادی حقوقی', user.legalInfo?.organizationEconomicCode || null, true, () => setActiveModal(6))}
            {renderItemCard('استان (محل دفتر مرکزی)', user.legalInfo?.organizationHeadOfficeProvince || null, true, () => setActiveModal(6))}
            {renderItemCard('شهر (محل دفتر مرکزی)', user.legalInfo?.organizationHeadOfficeCity || null, true, () => setActiveModal(6))}
            {renderItemCard('شماره تلفن ثابت دفتر مرکزی', user.legalInfo?.organizationHeadOfficeTel || null, true, () => setActiveModal(6))}
          </div>
        )}
      </div>

      <PersonalInfoModal 
        isOpen={activeModal === 1} 
        onClose={() => setActiveModal(null)} 
        user={user} 
      />

      <ChangeMobileModal 
        isOpen={activeModal === 2} 
        onClose={() => setActiveModal(null)} 
      />

      <DefaultBankModal 
        isOpen={activeModal === 3} 
        onClose={() => setActiveModal(null)} 
      />

      <JobModal 
        isOpen={activeModal === 4} 
        onClose={() => setActiveModal(null)} 
        user={user} 
      />

      <EconomicCodeModal 
        isOpen={activeModal === 5} 
        onClose={() => setActiveModal(null)} 
        user={user} 
      />

      <LegalInfoModal 
        isOpen={activeModal === 6} 
        onClose={() => setActiveModal(null)} 
        user={user} 
      />

    </div>
  );
}