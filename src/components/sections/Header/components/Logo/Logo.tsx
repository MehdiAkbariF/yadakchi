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
        "text-[10px] sm:text-[11px] font-bold text-muted-foreground text-center block",
        "leading-none",
        "mt-0 pt-0",
        hideTitle ? "hidden" : ""
      )}>
        انتخاب هوشمند قطعات خودرو
      </span>
    </Link>
  );
}