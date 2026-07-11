// src/app/(auth)/login/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/shared/Layouts/AuthLayout';
import { FormField } from '@/components/composites/FormField';
import { Button } from '@/components/primitives/Button';
import { Typography } from '@/components/primitives/Typography';
import { useRequestLogin, useConfirmLogin, useAuth } from '@/domains/auth/hooks/auth.hooks';
import { authValidators } from '@/domains/auth/validation/auth.validation';
import { Loader2, Phone, RotateCcw, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  // تعریف دقیق ورودی‌های ۵ رقمی
  const [otpArray, setOtpArray] = useState<string[]>(Array(5).fill(''));
  const otpInputRefs = useRef<HTMLInputElement[]>([]);

  // تایمر پیامک
  const [countdown, setCountdown] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const requestLogin = useRequestLogin();
  const confirmLogin = useConfirmLogin();

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (isTimerActive && countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsTimerActive(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown, isTimerActive]);

  const startTimer = () => {
    setCountdown(120);
    setIsTimerActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = authValidators.login.safeParse({ phoneNumber });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'شماره موبایل وارد شده معتبر نیست');
      return;
    }

    try {
      await requestLogin.mutateAsync({ phoneNumber });
      setStep('otp');
      setOtpArray(Array(5).fill(''));
      startTimer();
      // فوکوس اتوماتیک روی اولین مربع ورود کد
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setError(err.userMessage || 'خطا در ارسال کد تایید. مجدداً تلاش کنید.');
    }
  };

  // رفتار داینامیک باکس‌های ورود رمز یکبار مصرف
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);

    // حرکت خودکار به فیلد بعدی
    if (value && index < 4) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // برگشت به فیلد قبلی با فشردن Backspace در صورت خالی بودن خانه جاری
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirmOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const code = otpArray.join('');

    const validation = authValidators.confirmLogin.safeParse({ phoneNumber, code });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'کد تایید باید ۵ رقم کامل باشد');
      return;
    }

    try {
      await confirmLogin.mutateAsync({ phoneNumber, code });
      router.push('/');
    } catch (err: any) {
      setError(err.userMessage || 'کد ورود معتبر نیست یا منقضی شده است');
    }
  };

  const handleResendOTP = async () => {
    if (isTimerActive) return;
    setError('');

    try {
      await requestLogin.mutateAsync({ phoneNumber });
      setOtpArray(Array(5).fill(''));
      startTimer();
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setError(err.userMessage || 'خطا در ارسال مجدد کد تایید');
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthLayout>
      {step === 'phone' ? (
        <div className="space-y-5" dir="rtl">
          <div className="text-center">
            <Typography variant="h3" className="font-iran-yekan font-bold text-foreground">
              ورود | ثبت‌نام
            </Typography>
          </div>

          <form onSubmit={handleRequestOTP} className="space-y-4">
            <FormField
              type="tel"
              placeholder="شماره موبایل خود را وارد کنید"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              error={error}
              leftIcon={<Phone className="h-4 w-4 text-muted-foreground" />}
              required
              autoFocus
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

          {/* متن شرایط استفاده از سرویس */}
          <Typography variant="small" color="muted" className="text-center font-iran-sans text-[10px] leading-relaxed text-muted-foreground/80 px-2 block">
            ورود | ثبت نام شما به معنای پذیرش{' '}
            <Link href="/terms" className="text-primary hover:underline font-bold">قوانین و مقررات</Link>{' '}
            و{' '}
            <Link href="/privacy" className="text-primary hover:underline font-bold">حریم خصوصی</Link>{' '}
            کاربران یدکچی است.
          </Typography>
        </div>
      ) : (
        <div className="space-y-5" dir="rtl">
          <div className="text-center">
            {/* دکمه بازگشت به فاز وارد کردن شماره موبایل */}
            <button 
              onClick={() => setStep('phone')}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline font-iran-sans mb-2"
            >
              <ArrowRight className="h-4 w-4" />
              <span>تغییر شماره موبایل ({phoneNumber})</span>
            </button>
            <Typography variant="h3" className="font-iran-yekan font-bold text-foreground">
              کد تایید را وارد کنید
            </Typography>
          </div>

          <form onSubmit={handleConfirmOTP} className="space-y-5">
            {/* گرید ۵ تایی مربع‌های متمایز کد تایید با سایه‌زنی غنی سه بعدی */}
            <div className="flex items-center justify-center gap-3" dir="ltr">
              {otpArray.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { if (el) otpInputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-bold rounded-xl border border-input bg-background text-foreground transition-all duration-150 focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm focus:bg-primary/5 focus:scale-105"
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-center text-destructive font-iran-sans font-medium">{error}</p>
            )}

            {/* شمارش معکوس پیامک */}
            <div className="flex items-center justify-center text-sm font-iran-sans">
              {isTimerActive ? (
                <Typography variant="small" color="muted">
                  ارسال مجدد کد پس از:{' '}
                  <span className="font-bold text-foreground">{formatTime(countdown)}</span>
                </Typography>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={requestLogin.isPending}
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1 transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  ارسال مجدد کد تایید
                </button>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={confirmLogin.isPending}
            >
              ورود به سیستم
            </Button>
          </form>
        </div>
      )}
    </AuthLayout>
  );
}