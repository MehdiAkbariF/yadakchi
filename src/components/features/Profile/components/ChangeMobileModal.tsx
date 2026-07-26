'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useRequestUpdatePhoneNumber,
  useConfirmCurrentPhoneOTP,
  useConfirmNewPhoneOTP
} from '@/domains/userpanel/hooks/userpanel.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { OtpInput } from '@/components/primitives/OtpInput/OtpInput';
import { Smartphone, ArrowRight } from 'lucide-react';
import { showToast } from '@/core/utils/toast';

const changeMobileSchema = z.object({
  phoneNumber: z.string().regex(/^09[0-9]{9}$/, 'شماره موبایل نامعتبر است')
});

type ChangeMobileFormValues = z.infer<typeof changeMobileSchema>;

interface ChangeMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangeMobileModal({ isOpen, onClose }: ChangeMobileModalProps) {
  const queryClient = useQueryClient();

  const requestPhoneUpdate = useRequestUpdatePhoneNumber();
  const confirmCurrentOTP = useConfirmCurrentPhoneOTP();
  const confirmNewOTP = useConfirmNewPhoneOTP();

  const [phoneStep, setPhoneStep] = useState<1 | 2 | 3>(1);
  const [targetPhone, setTargetPhone] = useState('');
  const [otpArray, setOtpArray] = useState<string[]>(Array(5).fill(''));

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangeMobileFormValues>({
    resolver: zodResolver(changeMobileSchema as any),
    defaultValues: {
      phoneNumber: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      setPhoneStep(1);
      setOtpArray(Array(5).fill(''));
      setTargetPhone('');
      reset({ phoneNumber: '' });
    }
  }, [isOpen, reset]);

  const onPhoneSubmit = async (data: ChangeMobileFormValues) => {
    try {
      await requestPhoneUpdate.mutateAsync(data.phoneNumber);
      setTargetPhone(data.phoneNumber);
      setPhoneStep(2);
      setOtpArray(Array(5).fill(''));
      showToast.success('کد تایید به شماره فعلی شما پیامک شد');
    } catch (error) {}
  };

  const onConfirmCurrentOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpArray.join('');
    if (code.length < 5) {
      showToast.error('لطفاً کد تایید ۵ رقمی را کامل کنید');
      return;
    }
    try {
      await confirmCurrentOTP.mutateAsync(code);
      setPhoneStep(3);
      setOtpArray(Array(5).fill(''));
      showToast.success('شماره فعلی تایید شد؛ اکنون کد تایید ارسال شده به شماره جدید را وارد کنید');
    } catch (error) {}
  };

  const onConfirmNewOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpArray.join('');
    if (code.length < 5) {
      showToast.error('لطفاً کد تایید ۵ رقمی را کامل کنید');
      return;
    }
    try {
      await confirmNewOTP.mutateAsync(code);
      showToast.success('شماره موبایل شما با موفقیت به شماره جدید تغییر یافت');
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      onClose();
    } catch (error) {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          ویرایش شماره موبایل
        </ModalTitle>
      </ModalHeader>
      <ModalBody className="p-0 pt-4 text-right">
        {phoneStep === 1 && (
          <form onSubmit={handleSubmit(onPhoneSubmit)} className="flex flex-col gap-4 w-full text-right">
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 text-xs text-primary leading-relaxed">
              مالکیت شماره همراه باید با نام و نام خانوادگی شما همخوانی داشته باشد
            </div>

            <Input
              label="شماره همراه جدید *"
              placeholder="مثال: 09121234567"
              error={errors.phoneNumber?.message ? String(errors.phoneNumber.message) : undefined}
              className="text-xs font-iran-yekan text-left"
              dir="ltr"
              {...register('phoneNumber')}
            />

            <span className="text-[10px] text-muted-foreground font-iran-yekan leading-relaxed mr-1 block">
              برای ثبت شماره موبایل جدید، ابتدا شماره فعلی شما تایید می‌شود.
            </span>

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
                isLoading={requestPhoneUpdate.isPending}
                className="flex-1 rounded-xl text-xs h-10"
              >
                تایید شماره فعلی
              </Button>
            </div>
          </form>
        )}

        {phoneStep === 2 && (
          <form onSubmit={onConfirmCurrentOTP} className="flex flex-col gap-5 w-full text-right">
            <span className="text-xs text-muted-foreground font-iran-yekan text-center block">
              کد تایید پیامک شده به شماره فعلی خود را وارد کنید
            </span>

            <OtpInput 
              length={5} 
              value={otpArray} 
              onChange={(val) => setOtpArray(val)} 
            />

            <div className="flex gap-2 mt-4 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPhoneStep(1)}
                className="flex-1 rounded-xl text-xs h-10"
              >
                مرحله قبل
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={confirmCurrentOTP.isPending}
                className="flex-1 rounded-xl text-xs h-10"
              >
                مرحله بعد
              </Button>
            </div>
          </form>
        )}

        {phoneStep === 3 && (
          <form onSubmit={onConfirmNewOTP} className="flex flex-col gap-5 w-full text-right">
            <span className="text-xs text-muted-foreground font-iran-yekan text-center block">
              کد تایید پیامک شده به شماره جدید <span className="font-bold text-foreground" dir="ltr">{targetPhone}</span> را وارد کنید
            </span>

            <OtpInput 
              length={5} 
              value={otpArray} 
              onChange={(val) => setOtpArray(val)} 
            />

            <div className="flex gap-2 mt-4 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPhoneStep(2)}
                className="flex-1 rounded-xl text-xs h-10"
              >
                مرحله قبل
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={confirmNewOTP.isPending}
                className="flex-1 rounded-xl text-xs h-10"
              >
                ثبت شماره جدید
              </Button>
            </div>
          </form>
        )}
      </ModalBody>
    </Modal>
  );
}