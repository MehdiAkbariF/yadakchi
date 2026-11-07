import Link from 'next/link';
import { Car } from 'lucide-react';

export function MyCarButton() {
  return (
    <Link
      href="/my-car"
      aria-label="ورود به بخش گاراژ و خودروی من"
      className="flex items-center gap-1.5 text-xs xl:text-sm font-medium text-foreground/90 hover:text-primary transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1 py-0.5"
    >
      <Car aria-hidden="true" className="h-4 w-4 text-primary" />
      <span>ماشین من</span>
    </Link>
  );
}