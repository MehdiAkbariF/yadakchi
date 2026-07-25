'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateProfile } from '@/domains/userpanel/hooks/userpanel.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { Select } from '@/components/primitives/Select/Select';
import { User as UserIcon } from 'lucide-react';
import { jalaliToGregorian } from '@/core/utils/formatters';
import { showToast } from '@/core/utils/toast';

const personalInfoSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  nationalCode: z.string().length(10, 'کد ملی باید دقیقا ۱۰ رقم باشد').regex(/^[0-9]+$/, 'کد ملی فقط شامل اعداد است'),
  email: z.string().email('آدرس ایمیل وارد شده معتبر نیست').optional().or(z.literal(''))
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

interface PersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function PersonalInfoModal({ isOpen, onClose, user }: PersonalInfoModalProps) {
  const updateProfile = useUpdateProfile();

  const [birthDay, setBirthDay] = useState(1);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthYear, setBirthYear] = useState(1360);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema as any)
  });

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

  const days = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
  const years = Array.from({ length: 70 }, (_, i) => ({ value: String(1330 + i), label: String(1330 + i) }));

  useEffect(() => {
    if (isOpen && user) {
      reset({
        name: user.fullName?.split(' ')[0] || '',
        lastName: user.lastName || '',
        nationalCode: user.nationalCode || '',
        email: user.email || ''
      });
      if (user.birthDate) {
        const date = new Date(user.birthDate);
        if (!isNaN(date.getTime())) {
          setBirthDay(1);
          setBirthMonth(1);
          setBirthYear(1377);
        }
      }
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data: PersonalInfoFormValues) => {
    const formData = new FormData();
    const computedBirthDate = jalaliToGregorian(birthYear, birthMonth, birthDay);
    formData.append('FullName', `${data.name} ${data.lastName}`);
    formData.append('NationalCode', data.nationalCode);
    formData.append('BirthDate', computedBirthDate);
    if (data.email) {
      formData.append('Email', data.email);
    }
    try {
      await updateProfile.mutateAsync(formData);
      showToast.success('اطلاعات فردی شما با موفقیت بروزرسانی شد');
      onClose();
    } catch (error) {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-primary" />
          ویرایش اطلاعات فردی
        </ModalTitle>
      </ModalHeader>
      <ModalBody className="p-0 pt-4 text-right">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full text-right">
          <span className="text-xs text-muted-foreground font-iran-sans block mb-2 leading-relaxed">
            لطفاً اطلاعات خود را ویرایش و سپس ثبت کنید.
          </span>

          <div className="grid grid-cols-2 gap-3 w-full">
            <Input
              label="نام *"
              placeholder="نام"
              error={errors.name?.message ? String(errors.name.message) : undefined}
              className="text-xs font-iran-sans"
              {...register('name')}
            />
            <Input
              label="نام خانوادگی *"
              placeholder="نام خانوادگی"
              error={errors.lastName?.message ? String(errors.lastName.message) : undefined}
              className="text-xs font-iran-sans"
              {...register('lastName')}
            />
          </div>

          <Input
            label="کد ملی *"
            placeholder="مثال: 0021606803"
            error={errors.nationalCode?.message ? String(errors.nationalCode.message) : undefined}
            className="text-xs font-iran-sans text-left"
            dir="ltr"
            {...register('nationalCode')}
          />

          <Input
            label="آدرس ایمیل"
            placeholder="مثال: email@gmail.com"
            error={errors.email?.message ? String(errors.email.message) : undefined}
            className="text-xs font-iran-sans text-left"
            dir="ltr"
            {...register('email')}
          />

          <div className="w-full flex flex-col gap-2">
            <label className="text-xs md:text-sm font-medium leading-none text-foreground">
              تاریخ تولد *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Select
                placeholder="روز"
                value={String(birthDay)}
                onChange={(e) => setBirthDay(Number(e.target.value))}
                options={days}
              />
              <Select
                placeholder="ماه"
                value={String(birthMonth)}
                onChange={(e) => setBirthMonth(Number(e.target.value))}
                options={months}
              />
              <Select
                placeholder="سال"
                value={String(birthYear)}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                options={years}
              />
            </div>
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