// src/app/(auth)/login/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/shared/Layouts/AuthLayout';
import { FormField } from '@/components/composites/FormField';
import { Button } from '@/components/primitives/Button';
import { Typography } from '@/components/primitives/Typography';
import { useRequestLogin, useConfirmLogin } from '@/domains/auth/hooks/auth.hooks';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');

  const requestLogin = useRequestLogin();
  const confirmLogin = useConfirmLogin();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await requestLogin.mutateAsync({ phoneNumber });
      setStep('otp');
    } catch (err: any) {
      setError(err.userMessage || 'خطا در ارسال کد تایید');
    }
  };

  const handleConfirmOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await confirmLogin.mutateAsync({ phoneNumber, code: otpCode });
      router.push('/');
    } catch (err: any) {
      setError(err.userMessage || 'کد تایید نامعتبر است');
    }
  };

  return (
    <AuthLayout
      title={step === 'phone' ? 'ورود به یادکچی' : 'تایید کد'}
      subtitle={step === 'phone' 
        ? 'شماره موبایل خود را وارد کنید' 
        : 'کد تایید ارسال شده را وارد کنید'
      }
    >
      {step === 'phone' ? (
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <FormField
            type="tel"
            label="شماره موبایل"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            error={error}
            required
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={requestLogin.isPending}
          >
            دریافت کد تایید
          </Button>
        </form>
      ) : (
        <form onSubmit={handleConfirmOTP} className="space-y-4">
          <FormField
            type="text"
            label="کد تایید"
            placeholder="۱۲۳۴۵۶"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            error={error}
            required
          />
          <Typography variant="small" color="muted" className="text-center">
            کد تایید به شماره {phoneNumber} ارسال شد
          </Typography>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={confirmLogin.isPending}
          >
            ورود
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => setStep('phone')}
          >
            تغییر شماره موبایل
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}