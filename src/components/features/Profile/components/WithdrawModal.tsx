'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  useGetBankAccounts, 
  useSubmitWithdrawRequest 
} from '@/domains/userpanel/hooks/userpanel.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { Select } from '@/components/primitives/Select/Select';
import { AddBankCardForm } from './AddBankCardForm';
import { CreditCard, Plus, ArrowRight } from 'lucide-react';
import { showToast } from '@/core/utils/toast';

const withdrawFormSchema = z.object({
  amount: z.number().int().positive('مبلغ برداشت باید عدد مثبت باشد'),
  bankAccountId: z.string().uuid('شناسه حساب بانکی نامعتبر است')
});

type WithdrawFormValues = z.infer<typeof withdrawFormSchema>;

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: any;
}

export function WithdrawModal({ isOpen, onClose, wallet }: WithdrawModalProps) {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  const { data: bankAccounts = [] } = useGetBankAccounts();
  const submitWithdraw = useSubmitWithdrawRequest();

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawFormSchema),
    defaultValues: {
      amount: 0,
      bankAccountId: ''
    }
  });

  const watchAmount = watch('amount');

  useEffect(() => {
    if (isOpen) {
      const defaultAccountId = bankAccounts.find(b => b.isDefault)?.id || bankAccounts[0]?.id || '';
      reset({
        amount: 0,
        bankAccountId: defaultAccountId
      });
      setIsAddCardOpen(false);
    }
  }, [isOpen, bankAccounts, reset]);

  const handleWithdrawSubmit = async (data: WithdrawFormValues) => {
    const rawWithdrawable = wallet ? Number(wallet.withdrawableBalance.replace(/[^0-9]/g, '')) : 0;
    if (data.amount > rawWithdrawable) {
      showToast.error('مبلغ درخواستی بیشتر از موجودی قابل برداشت شماست');
      return;
    }

    try {
      await submitWithdraw.mutateAsync({
        amount: data.amount * 10,
        bankAccountId: data.bankAccountId
      });
      showToast.success('درخواست برداشت با موفقیت ثبت شد');
      onClose();
    } catch (error) {}
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          ثبت درخواست برداشت وجه
        </ModalTitle>
      </ModalHeader>
      <ModalBody className="p-0 pt-4 text-right">
        {!isAddCardOpen ? (
          <form onSubmit={handleSubmit(handleWithdrawSubmit)} className="flex flex-col gap-4 w-full text-right">
            
            <div className="w-full flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl p-3.5 text-right text-xs text-primary font-bold">
              <span>موجود قابل برداشت شما:</span>
              <span>{wallet?.withdrawableBalance || '۰ تومان'}</span>
            </div>

            <div className="w-full">
              {bankAccounts.length > 0 ? (
                <div className="w-full flex flex-col gap-2">
                  <Select
                    label="انتخاب کارت بانکی مقصد *"
                    placeholder="یک کارت بانکی را انتخاب کنید..."
                    error={errors.bankAccountId?.message ? String(errors.bankAccountId.message) : undefined}
                    options={bankAccounts.map((b: any) => ({
                      value: b.id,
                      label: `${b.cardNumber} ${b.isDefault ? '(پیش‌فرض)' : ''}`
                    }))}
                    {...register('bankAccountId')}
                  />
                  <button
                    type="button"
                    onClick={() => setIsAddCardOpen(true)}
                    className="text-[10px] font-bold font-iran-sans text-primary hover:underline self-end flex items-center gap-1 mt-1 outline-none"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>افزودن کارت بانکی جدید</span>
                  </button>
                </div>
              ) : (
                <div className="w-full py-6 border border-dashed rounded-xl flex flex-col items-center justify-center gap-3 bg-muted/10">
                  <span className="text-xs font-bold text-muted-foreground font-iran-sans">هیچ کارت بانکی ثبت نکرده‌اید.</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddCardOpen(true)}
                    className="rounded-xl font-iran-sans font-bold text-xs h-9 px-4 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>ثبت اولین کارت بانکی</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="w-full">
              <Input
                label="مبلغ برداشت دلخواه (تومان) *"
                placeholder="مبلغ مورد نظر خود را به تومان وارد کنید..."
                type="number"
                error={errors.amount?.message ? String(errors.amount.message) : undefined}
                rightIcon={<span className="text-xs font-bold text-muted-foreground font-iran-sans">تومان</span>}
                className="text-xs font-iran-sans text-left"
                dir="ltr"
                {...register('amount', { valueAsNumber: true })}
              />
              {watchAmount > 0 && (
                <span className="text-[10px] font-bold text-muted-foreground font-iran-sans mt-1 block">
                  معادل {formatNumber(Number(watchAmount) * 10)} ریال به بانک مقصد ارسال خواهد شد.
                </span>
              )}
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
                disabled={bankAccounts.length === 0}
                isLoading={submitWithdraw.isPending}
                className="flex-1 rounded-xl text-xs h-10"
              >
                ثبت درخواست برداشت
              </Button>
            </div>

          </form>
        ) : (
          <div className="w-full flex flex-col gap-4 animate-in slide-in-from-left duration-200">
            <div className="flex items-center gap-2 border-b pb-2">
              <button 
                type="button" 
                onClick={() => setIsAddCardOpen(false)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
                aria-label="مرحله قبل"
              >
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
              <span className="text-xs font-bold text-foreground font-iran-yekan">ثبت کارت بانکی جدید</span>
            </div>

            <AddBankCardForm onCancel={() => setIsAddCardOpen(false)} />
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}