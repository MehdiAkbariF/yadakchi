'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  useGetBankAccounts, 
  useSetDefaultBankAccount, 
  useCreateBankAccount 
} from '@/domains/userpanel/hooks/userpanel.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { CreditCard, Plus, ArrowRight, Check } from 'lucide-react';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

const addCardSchema = z.object({
  cardNumber: z.string().optional().or(z.literal('')),
  shebaNumber: z.string().optional().or(z.literal(''))
}).refine(data => data.cardNumber || data.shebaNumber, {
  message: 'لطفاً یکی از دو کادر شماره کارت یا شبا را پر کنید',
  path: ['cardNumber']
});

type AddCardFormValues = z.infer<typeof addCardSchema>;

interface DefaultBankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DefaultBankModal({ isOpen, onClose }: DefaultBankModalProps) {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  const { data: bankAccounts = [] } = useGetBankAccounts();
  const setDefaultBank = useSetDefaultBankAccount();
  const createBankAccount = useCreateBankAccount();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddCardFormValues>({
    resolver: zodResolver(addCardSchema as any),
    defaultValues: {
      cardNumber: '',
      shebaNumber: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      setIsAddCardOpen(false);
      reset({
        cardNumber: '',
        shebaNumber: ''
      });
    }
  }, [isOpen, reset]);

  const onSelectDefaultBank = async (id: string) => {
    try {
      await setDefaultBank.mutateAsync(id);
      showToast.success('کارت تسویه پیش‌فرض تغییر یافت');
      onClose();
    } catch (error) {}
  };

  const onAddCardSubmit = async (data: AddCardFormValues) => {
    try {
      const cleanSheba = data.shebaNumber ? `IR${data.shebaNumber}` : '';
      await createBankAccount.mutateAsync({
        cardNumber: data.cardNumber || '',
        shebaNumber: cleanSheba
      });
      showToast.success('حساب تسویه جدید با موفقیت ثبت شد');
      setIsAddCardOpen(false);
      reset();
    } catch (error) {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          انتخاب حساب پیش‌فرض تسویه
        </ModalTitle>
      </ModalHeader>
      <ModalBody className="p-0 pt-4 text-right">
        {!isAddCardOpen ? (
          <div className="flex flex-col gap-4 w-full">
            <span className="text-xs text-muted-foreground font-iran-yekan block mb-1">
              برای انتخاب حساب پیش‌فرض، روی کارت مورد نظر کلیک کنید.
            </span>

            <div className="flex flex-col gap-2.5 max-h-52 overflow-y-auto no-scrollbar">
              {bankAccounts.map((b: any) => (
                <div
                  key={b.id}
                  onClick={() => onSelectDefaultBank(b.id)}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer flex items-center justify-between text-right transition-all hover:border-primary/20 bg-background",
                    b.isDefault ? "border-primary bg-primary/5 text-primary ring-1 ring-primary" : ""
                  )}
                >
                  <div className="flex flex-col gap-1 font-iran-yekan text-xs">
                    <span className="font-bold text-foreground ltr:inline-block" dir="ltr">{b.cardNumber}</span>
                    {b.shebaNumber && (
                      <span className="text-[10px] text-muted-foreground mt-1 ltr:inline-block" dir="ltr">شبا: {b.shebaNumber}</span>
                    )}
                  </div>

                  {b.isDefault ? (
                    <span className="text-[10px] font-bold text-success-500 bg-success-50 dark:bg-success-950/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <Check className="h-3 w-3" />
                      پیش‌فرض
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                      اطلاعات بانک نامشخص
                    </span>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddCardOpen(true)}
              className="rounded-xl font-iran-yekan font-bold text-xs h-10 px-4 flex items-center justify-center gap-1.5 shadow-sm mt-2"
            >
              <Plus className="h-4 w-4" />
              <span>اضافه کردن حساب جدید (کارت یا شبا)</span>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onAddCardSubmit)} className="flex flex-col gap-4 w-full text-right animate-in slide-in-from-left duration-200">
            <div className="flex items-center gap-2 border-b pb-2 mb-2">
              <button 
                type="button" 
                onClick={() => setIsAddCardOpen(false)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
                aria-label="مرحله قبل"
              >
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
              <span className="text-xs font-bold text-foreground font-iran-yekan">افزودن حساب جدید</span>
            </div>

            <span className="text-xs text-muted-foreground font-iran-yekan block mb-1">
              برای افزودن حساب، <strong>یکی</strong> از دو کادر زیر را پر کنید.
            </span>

            <div className="w-full">
              <Input
                label="شماره کارت"
                placeholder="شماره کارت ۱۶ رقمی"
                error={errors.cardNumber?.message ? String(errors.cardNumber.message) : undefined}
                className="text-xs font-iran-yekan text-left"
                dir="ltr"
                {...register('cardNumber')}
              />
            </div>

            <div className="text-center font-iran-yekan font-bold text-xs text-muted-foreground py-1 select-none">
              یا
            </div>

            <div className="w-full">
              <Input
                label="شماره شبا (بدون IR)"
                placeholder="شماره شبا ۲۴ رقمی"
                error={errors.shebaNumber?.message ? String(errors.shebaNumber.message) : undefined}
                className="text-xs font-iran-yekan text-left"
                dir="ltr"
                {...register('shebaNumber')}
              />
            </div>

            <div className="flex gap-2 mt-4 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddCardOpen(false)}
                className="flex-1 rounded-xl text-xs h-10"
              >
                مرحله قبل
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={createBankAccount.isPending}
                className="flex-1 rounded-xl text-xs h-10"
              >
                افزودن حساب جدید
              </Button>
            </div>
          </form>
        )}
      </ModalBody>
    </Modal>
  );
}