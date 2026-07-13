// src/components/sections/HeroSection/HeroSection.tsx

import Link from 'next/link';
import { cn } from '@/design-system/utils/cn';
import { Typography } from '@/components/primitives/Typography';
import { Button } from '@/components/primitives/Button';

export interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section className={cn(
      'relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-400 p-8 text-white',
      className
    )}>
      <div className="relative z-10 flex flex-col items-start gap-4 md:max-w-2xl">
        <Typography variant="h1" className="text-white">
          به یدکچی خوش آمدید
        </Typography>
        <Typography variant="lead" className="text-white/90">
          بزرگترین مارکت‌پلیس خودرو و قطعات یدکی در ایران
        </Typography>
        <div className="flex flex-wrap gap-4 mt-4">
          <Link href="/products">
            <Button variant="secondary" size="lg">
              مشاهده محصولات
            </Button>
          </Link>
          <Link href="/shops">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              فروشگاه‌ها
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
    </section>
  );
}