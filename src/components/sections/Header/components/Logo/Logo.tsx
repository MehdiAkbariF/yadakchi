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
      {/* 🚨 ابعاد لوگو بزرگتر شد */}
      <div className="relative w-20 h-10 md:w-24 md:h-12 leading-none">
        <Image
          src="/Logo.svg"
          alt="Yadakchi Logo"
          width={96}
          height={48}
          className="object-contain block"
          priority
        />
      </div>
      
      <span className={cn(
        "text-[8px] sm:text-[10px] text-muted-foreground text-center block",
        "leading-none",
        "mt-0 pt-0",
        hideTitle ? "hidden" : "" // در موبایل متن زیرین مخفی باشه
      )}>
        انتخاب هوشمند قطعات خودرو
      </span>
    </Link>
  );
}