'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateProfile } from '@/domains/userpanel/hooks/userpanel.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { FileText } from 'lucide-react';
import { showToast } from '@/core/utils/toast';

const economicCodeSchema = z.object({
  naturalPersonEconomicCode: z.string().min(12, 'کد اقتصادی شخص حقیقی باید ۱۲ رقم باشد').regex(/^[0-9]+$/, 'کد اقتصادی فقط شامل اعداد است')
});

type EconomicCodeFormValues = z.infer<typeof economicCodeSchema>;

interface EconomicCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function EconomicCodeModal({ isOpen, onClose, user }: EconomicCodeModalProps) {
  const updateProfile = useUpdateProfile();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EconomicCodeFormValues>({
    resolver: zodResolver(economicCodeSchema as any),
    defaultValues: {
      naturalPersonEconomicCode: ''
    }
  });

  useEffect(() => {
    if (isOpen && user) {
      reset({
        naturalPersonEconomicCode: user.naturalPersonEconomicCode || ''
      });
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data: EconomicCodeFormValues) => {
    const formData = new FormData();
    formData.append('NaturalPersonEconomicCode', data.naturalPersonEconomicCode);
    try {
      await updateProfile.mutateAsync(formData);
      showToast.success('کد اقتصادی حقیقی شما با موفقیت ثبت شد');
      onClose();
    } catch (error) {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          ویرایش کد اقتصادی حقیقی
        </ModalTitle>
      </ModalHeader>
      <ModalBody className="p-0 pt-4 text-right">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full text-right">
          <span className="text-xs text-muted-foreground font-iran-yekan block mb-2 leading-relaxed">
            در صورت داشتن کد اقتصادی شخص حقیقی در کادر زیر وارد کنید
          </span>

          <div className="w-full">
            <Input
              label="کد اقتصادی حقیقی *"
              placeholder="کد اقتصادی خود را وارد کنید"
              error={errors.naturalPersonEconomicCode?.message ? String(errors.naturalPersonEconomicCode.message) : undefined}
              className="text-xs font-iran-yekan text-left"
              dir="ltr"
              {...register('naturalPersonEconomicCode')}
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
              ثبت تغییرات
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}