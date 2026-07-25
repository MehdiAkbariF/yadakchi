'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateProfile } from '@/domains/userpanel/hooks/userpanel.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { Building } from 'lucide-react';
import { showToast } from '@/core/utils/toast';

const legalInfoSchema = z.object({
  organizationName: z.string().min(2, 'نام شرکت الزامی است'),
  organizationType: z.string().min(2, 'نوع شرکت الزامی است'),
  organizationEconomicCode: z.string().min(12, 'کد اقتصادی باید ۱۲ رقم باشد').regex(/^[0-9]+$/, 'کد اقتصادی فقط شامل اعداد است'),
  organizationNationalCode: z.string().length(11, 'شناسه ملی باید ۱۱ رقم باشد').regex(/^[0-9]+$/, 'شناسه ملی فقط شامل اعداد است'),
  organizationRegisterationCode: z.string().min(1, 'شناسه ثبت الزامی است'),
  organizationHeadOfficeTel: z.string().min(8, 'تلفن ثابت الزامی است').regex(/^[0-9]+$/, 'تلفن ثابت فقط شامل اعداد است')
});

type LegalInfoFormValues = z.infer<typeof legalInfoSchema>;

interface LegalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function LegalInfoModal({ isOpen, onClose, user }: LegalInfoModalProps) {
  const updateProfile = useUpdateProfile();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LegalInfoFormValues>({
    resolver: zodResolver(legalInfoSchema as any),
    defaultValues: {
      organizationName: '',
      organizationType: '',
      organizationEconomicCode: '',
      organizationNationalCode: '',
      organizationRegisterationCode: '',
      organizationHeadOfficeTel: ''
    }
  });

  useEffect(() => {
    if (isOpen && user) {
      reset({
        organizationName: user.legalInfo?.organizationName || '',
        organizationType: user.legalInfo?.organizationType || '',
        organizationEconomicCode: user.legalInfo?.organizationEconomicCode || '',
        organizationNationalCode: user.legalInfo?.organizationNationalCode || '',
        organizationRegisterationCode: user.legalInfo?.organizationRegisterationCode || '',
        organizationHeadOfficeTel: user.legalInfo?.organizationHeadOfficeTel || ''
      });
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data: LegalInfoFormValues) => {
    const formData = new FormData();
    formData.append('HasLegalInfo', 'true');
    formData.append('OrganizationName', data.organizationName);
    formData.append('OrganizationType', data.organizationType);
    formData.append('OrganizationEconomicCode', data.organizationEconomicCode);
    formData.append('OrganizationNationalCode', data.organizationNationalCode);
    formData.append('OrganizationRegisterationCode', data.organizationRegisterationCode);
    formData.append('OrganizationHeadOfficeTel', data.organizationHeadOfficeTel);
    try {
      await updateProfile.mutateAsync(formData);
      showToast.success('اطلاعات حقوقی سازمان شما با موفقیت بروزرسانی شد');
      onClose();
    } catch (error) {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          ویرایش اطلاعات حقوقی
        </ModalTitle>
      </ModalHeader>
      <ModalBody className="p-0 pt-4 text-right">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full text-right">
          <span className="text-xs text-muted-foreground font-iran-sans block mb-2 leading-relaxed">
            لطفاً اطلاعات شرکت خود را جهت ثبت در فاکتور رسمی وارد کنید.
          </span>

          <div className="w-full">
            <Input
              label="نام سازمان *"
              placeholder="نام شرکت را وارد کنید"
              error={errors.organizationName?.message ? String(errors.organizationName.message) : undefined}
              className="text-xs font-iran-sans"
              {...register('organizationName')}
            />
          </div>

          <div className="w-full">
            <Input
              label="نوع سازمان / نوع صنف *"
              placeholder="نوع شرکت را وارد کنید"
              error={errors.organizationType?.message ? String(errors.organizationType.message) : undefined}
              className="text-xs font-iran-sans"
              {...register('organizationType')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <Input
              label="شناسه ملی *"
              placeholder="ثبت نشده"
              error={errors.organizationNationalCode?.message ? String(errors.organizationNationalCode.message) : undefined}
              className="text-xs font-iran-sans text-left"
              dir="ltr"
              {...register('organizationNationalCode')}
            />
            <Input
              label="شناسه ثبت *"
              placeholder="ثبت نشده"
              error={errors.organizationRegisterationCode?.message ? String(errors.organizationRegisterationCode.message) : undefined}
              className="text-xs font-iran-sans text-left"
              dir="ltr"
              {...register('organizationRegisterationCode')}
            />
          </div>

          <div className="w-full">
            <Input
              label="کد اقتصادی *"
              placeholder="ثبت نشده"
              error={errors.organizationEconomicCode?.message ? String(errors.organizationEconomicCode.message) : undefined}
              className="text-xs font-iran-sans text-left"
              dir="ltr"
              {...register('organizationEconomicCode')}
            />
          </div>

          <div className="w-full">
            <Input
              label="تلفن ثابت دفتر مرکزی *"
              placeholder="ثبت نشده"
              error={errors.organizationHeadOfficeTel?.message ? String(errors.organizationHeadOfficeTel.message) : undefined}
              className="text-xs font-iran-sans text-left"
              dir="ltr"
              {...register('organizationHeadOfficeTel')}
            />
          </div>

          <div className="flex gap-2 mt-4 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl text-xs h-10"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={updateProfile.isPending}
              className="flex-1 rounded-xl text-xs h-10"
            >
              ثبت اطلاعات
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}