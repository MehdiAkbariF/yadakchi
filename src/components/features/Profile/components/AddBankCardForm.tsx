'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBankAccount } from '@/domains/userpanel/hooks/userpanel.hooks';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { showToast } from '@/core/utils/toast';

const bankAccountFormSchema = z.object({
  cardNumber: z.string().length(16, 'شماره کارت باید ۱۶ رقم باشد').regex(/^[0-9]+$/, 'شماره کارت فقط شامل اعداد است'),
  shebaNumber: z.string().regex(/^IR[0-9]{22}$/, 'شماره شبا نامعتبر است (باید با IR شروع شود و در مجموع ۲۴ کاراکتر باشد)')
});

type BankAccountFormValues = z.infer<typeof bankAccountFormSchema>;

interface AddBankCardFormProps {
  onCancel: () => void;
}

export function AddBankCardForm({ onCancel }: AddBankCardFormProps) {
  const createBankAccount = useCreateBankAccount();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountFormSchema),
    defaultValues: {
      cardNumber: '',
      shebaNumber: ''
    }
  });

  const handleCreateBankSubmit = async (data: BankAccountFormValues) => {
    try {
      await createBankAccount.mutateAsync({
        cardNumber: data.cardNumber,
        shebaNumber: data.shebaNumber
      });
      showToast.success('کارت بانکی با موفقیت ثبت شد');
      reset();
      onCancel();
    } catch (error) {}
  };

  return (
    <form onSubmit={handleSubmit(handleCreateBankSubmit)} className="flex flex-col gap-4 w-full text-right">
      
      <div className="w-full">
        <Input
          label="شماره ۱۶ رقمی کارت بانکی *"
          placeholder="شماره کارت را وارد کنید..."
          type="text"
          maxLength={16}
          error={errors.cardNumber?.message ? String(errors.cardNumber.message) : undefined}
          className="text-xs font-iran-sans text-left"
          dir="ltr"
          {...register('cardNumber')}
        />
      </div>

      <div className="w-full">
        <Input
          label="شماره شبا (با فرمت IR) *"
          placeholder="مثال: IR123456789012345678901234"
          type="text"
          maxLength={24}
          error={errors.shebaNumber?.message ? String(errors.shebaNumber.message) : undefined}
          className="text-xs font-iran-sans text-left"
          dir="ltr"
          {...register('shebaNumber')}
        />
      </div>

      <div className="flex gap-2 mt-4 w-full">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 rounded-xl text-xs h-10"
        >
          انصراف
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={createBankAccount.isPending}
          className="flex-1 rounded-xl text-xs h-10"
        >
          ثبت نهایی کارت
        </Button>
      </div>

    </form>
  );
}