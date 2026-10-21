import Link from 'next/link';
import { cn } from '@/design-system/utils/cn';
import { Typography } from '@/components/primitives/Typography';
import { Button } from '@/components/primitives/Button';

export interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-xl bg-gradient-to-l from-primary to-primary-hover p-8 text-primary-foreground',
        className
      )}
    >
      <div className="relative z-10 flex flex-col items-start gap-4 md:max-w-2xl">
        <Typography variant="h1" className="text-primary-foreground">
          به یدکچی خوش آمدید
        </Typography>
        <Typography variant="lead" className="text-primary-foreground/90">
          بزرگترین مارکت‌پلیس خودرو و قطعات یدکی در ایران
        </Typography>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link href="/product">
            <Button variant="secondary" size="lg">
              مشاهده محصولات
            </Button>
          </Link>
          <Link href="/shops">
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              فروشگاه‌ها
            </Button>
          </Link>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute -end-20 -top-20 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-20 -start-20 h-48 w-48 rounded-full bg-primary-foreground/10 blur-2xl"
      />
    </section>
  );
}