// src/components/primitives/OtpInput/OtpInput.tsx

'use client';

import { useRef } from 'react';
import { cn } from '@/design-system/utils/cn';

export interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export const OtpInput = ({
  length = 5,
  value,
  onChange,
  className
}: OtpInputProps) => {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, val: string) => {
    // فیلتر کردن مقادیر غیر عددی جهت جلوگیری از ورود حروف متفرقه
    if (!/^[0-9]?$/.test(val)) return;

    const newValue = [...value];
    newValue[index] = val;
    onChange(newValue);

    // پرش خودکار به اینپوت بعدی پس از وارد کردن عدد بدون لرزش کیبورد
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // بازگشت خودکار به اینپوت قبلی در صورت فشردن دکمه پاک کردن (Backspace)
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={cn('flex items-center justify-center gap-3', className)} dir="ltr">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { if (el) inputRefs.current[index] = el; }}
          type="tel" // مرورگرهای موبایل را مجبور به نمایش دائمی کیبورد عددی می‌کند
          inputMode="numeric" // فعال‌سازی لایه عددی اختصاصی کیبورد در اندروید و iOS
          pattern="[0-9]*" // هماهنگی کامل با گوشی‌های آیفون و سافاری
          autoComplete="one-time-code" // فعال‌سازی قابلیت ورود خودکار کدهای پیامک شده (SMS Auto-fill)
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-bold rounded-xl border border-input bg-background text-foreground transition-all duration-150 focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm focus:bg-primary/5 focus:scale-105"
        />
      ))}
    </div>
  );
};