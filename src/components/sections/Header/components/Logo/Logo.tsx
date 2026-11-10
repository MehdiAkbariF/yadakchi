import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/design-system/utils/cn';

interface LogoProps {
  hideTitle?: boolean;
  className?: string;
}

export function Logo({ hideTitle = false, className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="صفحه اصلی یدکچی - بازارگاه تخصصی قطعات خودرو"
      className={cn("flex flex-col items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg", className)}
    >
      <div className="relative w-20 h-10 md:w-24 md:h-12 leading-none">
        <Image
          src="/Logo.svg"
          alt="لوگوی یدکچی | بازارگاه تخصصی قطعات خودرو"
          width={96}
          height={48}
          className="object-contain block"
          priority
        />
      </div>
      
      {!hideTitle && (
        <span
          aria-hidden="true"
          className="text-[0.625rem] sm:text-[0.6875rem] font-bold text-muted-foreground text-center block leading-none select-none"
        >
          انتخاب هوشمند قطعات خودرو
        </span>
      )}
    </Link>
  );
}