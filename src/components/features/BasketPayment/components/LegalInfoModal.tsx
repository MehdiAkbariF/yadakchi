// src/components/features/BasketPayment/components/LegalInfoModal.tsx
'use client';

import * as React from 'react';
import { X, Building, Save, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { useUpdateProfile } from '@/domains/userpanel/hooks/userpanel.hooks';
import { showToast } from '@/core/utils/toast';

const legalSchema = z.object({
  organizationName: z.string().min(2, 'نام سازمان یا شرکت الزامی است'),
  organizationType: z.string().optional().or(z.literal('')),
  organizationEconomicCode: z.string().min(12, 'کد اقتصادی باید ۱۲ رقم باشد').max(12, 'کد اقتصادی باید ۱۲ رقم باشد'),
  organizationNationalCode: z.string().min(11, 'شناسه ملی باید ۱۱ رقم باشد').max(11, 'شناسه ملی باید ۱۱ رقم باشد'),
  organizationRegisterationCode: z.string().optional().or(z.literal('')),
  organizationHeadOfficeTel: z.string().optional().or(z.literal('')),
});

type LegalFormValues = z.infer<typeof legalSchema>;

interface LegalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onSuccess: () => void;
}

export function LegalInfoModal({ isOpen, onClose, currentUser, onSuccess }: LegalInfoModalProps) {
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LegalFormValues>({
    resolver: zodResolver(legalSchema),
    defaultValues: {
      organizationName: '',
      organizationType: '',
      organizationEconomicCode: '',
      organizationNationalCode: '',
      organizationRegisterationCode: '',
      organizationHeadOfficeTel: '',
    },
  });

  React.useEffect(() => {
    if (currentUser?.legalInfo) {
      reset({
        organizationName: currentUser.legalInfo.organizationName || '',
        organizationType: currentUser.legalInfo.organizationType || '',
        organizationEconomicCode: currentUser.legalInfo.organizationEconomicCode || '',
        organizationNationalCode: currentUser.legalInfo.organizationNationalCode || '',
        organizationRegisterationCode: currentUser.legalInfo.organizationRegisterationCode || '',
        organizationHeadOfficeTel: currentUser.legalInfo.organizationHeadOfficeTel || '',
      });
    }
  }, [currentUser, reset]);

  const onSubmit = async (data: LegalFormValues) => {
    const formData = new FormData();
    // حفظ اطلاعات فردی قبلی در صورت وجود
    formData.append('FullName', currentUser?.fullName || 'کاربر مهمان');
    if (currentUser?.nationalCode) formData.append('NationalCode', currentUser.nationalCode);
    if (currentUser?.email) formData.append('Email', currentUser.email);
    if (currentUser?.job) formData.append('Job', currentUser.job);

    // ارسال اطلاعات حقوقی جدید
    formData.append('HasLegalInfo', 'true');
    formData.append('OrganizationName', data.organizationName);
    formData.append('OrganizationType', data.organizationType || '');
    formData.append('OrganizationEconomicCode', data.organizationEconomicCode);
    formData.append('OrganizationNationalCode', data.organizationNationalCode);
    formData.append('OrganizationRegisterationCode', data.organizationRegisterationCode || '');
    formData.append('OrganizationHeadOfficeTel', data.organizationHeadOfficeTel || '');

    try {
      await updateProfile.mutateAsync(formData);
      showToast.success('اطلاعات حقوقی با موفقیت ثبت شد');
      onSuccess();
      onClose();
    } catch {}
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-modal flex h-full max-h-full w-full max-w-none flex-col rounded-none bg-card p-0 md:relative md:h-[37.5rem] md:max-h-[90vh] md:max-w-2xl md:overflow-hidden md:rounded-2xl md:border md:border-border md:shadow-2xl"
      overlayClassName="bg-black/50 backdrop-blur-sm"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-5 py-4" dir="rtl">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building className="h-4 w-4" />
          </div>
          <span className="text-title-sm">تکمیل و ارسال مدارک حقوقی</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="بستن پنجره"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden" dir="rtl">
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
            جهت صدور فاکتور رسمی شرکت، لطفاً اطلاعات ثبتی سازمان خود را با دقت وارد نمایید. پس از ثبت، این اطلاعات بررسی و تایید خواهند شد.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="نام سازمان / شرکت *"
              placeholder="نام کامل ثبتی شرکت"
              error={errors.organizationName?.message}
              {...register('organizationName')}
            />

            <Input
              label="نوع سازمان / نوع صنف"
              placeholder="مثال: با مسئولیت محدود، سهامی خاص"
              error={errors.organizationType?.message}
              {...register('organizationType')}
            />

            <Input
              label="شناسه ملی ۱۱ رقمی *"
              placeholder="شناسه ملی شرکت"
              maxLength={11}
              dir="ltr"
              error={errors.organizationNationalCode?.message}
              {...register('organizationNationalCode')}
            />

            <Input
              label="شماره ثبت"
              placeholder="شماره ثبت شرکت"
              dir="ltr"
              error={errors.organizationRegisterationCode?.message}
              {...register('organizationRegisterationCode')}
            />

            <Input
              label="کد اقتصادی حقوقی ۱۲ رقمی *"
              placeholder="کد اقتصادی ۱۲ رقمی"
              maxLength={12}
              dir="ltr"
              error={errors.organizationEconomicCode?.message}
              {...register('organizationEconomicCode')}
            />

            <Input
              label="تلفن ثابت دفتر مرکزی"
              placeholder="مثال: 02188888888"
              dir="ltr"
              error={errors.organizationHeadOfficeTel?.message}
              {...register('organizationHeadOfficeTel')}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-xl px-5 text-xs font-bold"
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={updateProfile.isPending}
            className="h-10 gap-1.5 rounded-xl px-6 text-xs font-bold shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>ثبت و تایید اطلاعات</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}