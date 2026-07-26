'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateProfile } from '@/domains/userpanel/hooks/userpanel.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { Briefcase } from 'lucide-react';
import { showToast } from '@/core/utils/toast';

const jobSchema = z.object({
  job: z.string().min(2, 'لطفاً شغل خود را وارد کنید')
});

type JobFormValues = z.infer<typeof jobSchema>;

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function JobModal({ isOpen, onClose, user }: JobModalProps) {
  const updateProfile = useUpdateProfile();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema as any),
    defaultValues: {
      job: ''
    }
  });

  useEffect(() => {
    if (isOpen && user) {
      reset({
        job: user.job || ''
      });
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data: JobFormValues) => {
    const formData = new FormData();
    formData.append('Job', data.job);
    try {
      await updateProfile.mutateAsync(formData);
      showToast.success('شغل/سمت شما با موفقیت ویرایش شد');
      onClose();
    } catch (error) {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          ویرایش شغل / سمت
        </ModalTitle>
      </ModalHeader>
      <ModalBody className="p-0 pt-4 text-right">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full text-right">
          <div className="w-full">
            <Input
              label="شغل یا سمت خود را وارد کنید *"
              placeholder="شغل خود را انتخاب کنید"
              error={errors.job?.message ? String(errors.job.message) : undefined}
              className="text-xs font-iran-yekan"
              {...register('job')}
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