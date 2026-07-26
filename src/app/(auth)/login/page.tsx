'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '@/components/shared/Layouts/AuthLayout';
import { Input } from '@/components/primitives/Input';
import { OtpInput } from '@/components/primitives/OtpInput';
import { Button } from '@/components/primitives/Button';
import { Typography } from '@/components/primitives/Typography';
import { useRequestLogin, useConfirmLogin, useAuth } from '@/domains/auth/hooks/auth.hooks';
import { authValidators, LoginRequest } from '@/domains/auth/validation/auth.validation';
import { Phone, RotateCcw, PencilLine } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { showToast } from '@/core/utils/toast';

function LoginContent() {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpArray, setOtpArray] = useState<string[]>(Array(5).fill(''));
  const [countdown, setCountdown] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const requestLogin = useRequestLogin();
  const confirmLogin = useConfirmLogin();

  // خواندن مسیر بازگشتی (Redirect URL) از پارامتر آدرس
  const redirectUrl = searchParams ? (searchParams.get('redirect') || '/') : '/';

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginRequest>({
    resolver: zodResolver(authValidators.login.getSchema() as any),
    defaultValues: {
      phoneNumber: ''
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = redirectUrl;
    }
  }, [isAuthenticated, redirectUrl]);

  useEffect(() => {
    if (isTimerActive && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setIsTimerActive(false);
    }
  }, [countdown, isTimerActive]);

  const startTimer = () => {
    setCountdown(120);
    setIsTimerActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestOTP = async (data: LoginRequest) => {
    try {
      await requestLogin.mutateAsync({ phoneNumber: data.phoneNumber });
      setPhoneNumber(data.phoneNumber);
      setStep('otp');
      setOtpArray(Array(5).fill(''));
      startTimer();
      showToast.success('کد تایید با موفقیت ارسال شد');
    } catch (err: any) {
      const errMsg = err.userMessage || 'خطا در ارسال کد تایید. مجدداً تلاش کنید.';
      setError('phoneNumber', { message: errMsg });
      showToast.error(errMsg);
    }
  };

  const handleConfirmOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpArray.join('');

    const validation = authValidators.confirmLogin.safeParse({ phoneNumber, code });
    if (!validation.success) {
      showToast.error('کد تایید باید ۵ رقم کامل باشد');
      return;
    }

    try {
      await confirmLogin.mutateAsync({ phoneNumber, code });
      showToast.success('خوش آمدید! در حال انتقال...');
      window.location.href = redirectUrl;
    } catch (err: any) {
      const errMsg = err.userMessage || 'کد ورود معتبر نیست یا منقضی شده است';
      showToast.error(errMsg);
    }
  };

  const handleResendOTP = async () => {
    if (isTimerActive) return;

    try {
      await requestLogin.mutateAsync({ phoneNumber });
      setOtpArray(Array(5).fill(''));
      startTimer();
      showToast.success('کد تایید مجدداً ارسال شد');
    } catch (err: any) {
      const errMsg = err.userMessage || 'خطا در ارسال مجدد کد تایید';
      showToast.error(errMsg);
    }
  };

  return (
    <AuthLayout title={step === 'phone' ? 'ورود | ثبت‌نام' : 'کد تایید را وارد کنید'}>
      {step === 'phone' ? (
        <div className="space-y-5" dir="rtl">
          <form onSubmit={handleSubmit(handleRequestOTP)} className="space-y-4">
            <Input
              type="tel"
              placeholder="شماره موبایل خود را وارد کنید"
              error={errors.phoneNumber?.message}
              leftIcon={<Phone className="h-4 w-4 text-muted-foreground" />}
              required
              autoFocus
              {...register('phoneNumber')}
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

          <Typography variant="small" color="muted" className="text-center font-iran-yekan text-[10px] leading-relaxed text-muted-foreground/80 px-2 block">
            ورود | ثبت نام شما به معنای پذیرش{' '}
            <Link href="/terms" className="text-primary hover:underline font-bold">قوانین و مقررات</Link>{' '}
            و{' '}
            <Link href="/privacy" className="text-primary hover:underline font-bold">حریم خصوصی</Link>{' '}
            کاربران یدک‌چی است.
          </Typography>
        </div>
      ) : (
        <div className="space-y-6" dir="rtl">
          <Typography variant="small" color="muted" className="text-center block">
            کد ارسال شده به شماره <span className="font-bold text-foreground ltr:inline-block" dir="ltr">{phoneNumber}</span> را وارد کنید
          </Typography>

          <form onSubmit={handleConfirmOTP} className="space-y-6">
            <OtpInput 
              length={5} 
              value={otpArray} 
              onChange={(val) => setOtpArray(val)} 
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={confirmLogin.isPending}
            >
              تایید و ورود
            </Button>
          </form>

          <div className="flex flex-col items-center gap-3 pt-2">
            {isTimerActive ? (
              <Typography variant="small" color="muted" className="flex items-center gap-2 font-iran-yekan">
                <RotateCcw className="h-3.5 w-3.5 text-muted-foreground/70" />
                دریافت مجدد کد از طریق پیامک
                <span className="font-bold text-foreground ltr:inline-block" dir="ltr">{formatTime(countdown)}</span>
              </Typography>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={requestLogin.isPending}
                className="flex items-center gap-2 text-xs text-primary font-bold hover:underline transition-all font-iran-yekan"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                دریافت مجدد کد از طریق پیامک
              </button>
            )}
          </div>

          <div className="flex justify-center border-t border-border pt-4">
            <button 
              onClick={() => setStep('phone')}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors font-iran-yekan group"
            >
              <PencilLine className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
              ویرایش شماره &gt;
            </button>
          </div>

        </div>
      )}
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}