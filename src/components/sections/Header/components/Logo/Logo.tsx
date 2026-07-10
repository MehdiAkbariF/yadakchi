// src/components/sections/Header/components/Logo/Logo.tsx

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/design-system/utils/cn';

interface LogoProps {
  hideTitle?: boolean;
  className?: string;
}

export function Logo({ hideTitle = false, className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex flex-col items-center shrink-0", className)}>
      {/* لوگو - بدون margin-bottom */}
      <div className="relative w-12 h-6 md:w-14 md:h-6 leading-none">
        <Image
          src="/Logo.svg"
          alt="Yadakchi Logo"
          width={56}
          height={56}
          className="object-contain block"
          priority
        />
      </div>
      
      {/* متن زیرین - کاملاً چسبیده */}
      <span className={cn(
        "text-[8px] sm:text-[10px] text-muted-foreground text-center block",
        "leading-none", // خط بسیار فشرده
        "mt-0 pt-0", // حذف کامل فاصله بالا
        hideTitle ? "text-[12px] sm:text-[12px]" : ""
      )}>
        انتخاب هوشمند قطعات خودرو
      </span>
    </Link>
  );
}