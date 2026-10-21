'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  ChevronUp,
  Send,
  MessageSquare,
  Headphones,
  BadgeCheck,
  CreditCard,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Typography } from '@/components/primitives/Typography';
import { Input } from '@/components/primitives/Input';
import { Button } from '@/components/primitives/Button';
import { Logo } from '@/components/sections/Header/components/Logo/Logo';
import { Accordion } from '@/components/composites/Accordion/Accordion';
import { useGetFrontFooter } from '@/domains/front/banner/hooks/banner.hooks';
import { useGetStaticPageCategories, useSubscribeNewsletter } from '@/domains/front/static/hooks/static.hooks';
import { showToast } from '@/core/utils/toast';

export interface FooterProps {
  className?: string;
}

const WHY_US_ITEMS = [
  {
    id: 1,
    title: 'پرداخت امن',
    description: 'ضمانت تراکنش های شما',
    icon: (
      <div className="relative flex items-center justify-center">
        <CreditCard className="h-5 w-5 text-warning sm:h-6 sm:w-6" />
        <span
          aria-hidden="true"
          className="absolute -bottom-1 -end-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-success"
        />
      </div>
    ),
  },
  {
    id: 2,
    title: 'ضمانت اصل بودن',
    description: 'مرجوع کالا در صورت عدم تناسب',
    icon: <BadgeCheck className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />,
  },
  {
    id: 3,
    title: '۲۴x۷ پشتیبانی',
    description: 'پشتیبانی تخصصی در تمام مراحل',
    icon: <Headphones className="h-5 w-5 text-primary sm:h-6 sm:w-6" />,
  },
  {
    id: 4,
    title: 'ارتباط امن با فروشندگان',
    description: 'در تماس باش، مطمئن خرید کن!',
    icon: <MessageCircle className="h-5 w-5 text-primary sm:h-6 sm:w-6" />,
  },
];

function WhyYadakchi() {
  return (
    <section className="w-full border-b border-border bg-card py-10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="relative mb-8 flex items-center justify-center">
          <div aria-hidden="true" className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
          <h3 className="relative z-10 bg-card px-5 text-sm font-bold text-foreground sm:text-base">
            چرا یدکچی؟
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {WHY_US_ITEMS.map((item) => (
            <div
              key={item.id}
              className={cn(
                'group relative flex select-none items-center gap-3 rounded-lg border border-border bg-card p-3.5 sm:p-4',
                'transition-colors duration-normal ease-in-out',
                'hover:border-primary/40'
              )}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-muted sm:h-12 sm:w-12">
                {item.icon}
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="mb-0.5 truncate text-xs font-bold leading-snug text-foreground sm:text-sm">
                  {item.title}
                </span>
                <span className="truncate text-2xs leading-relaxed text-muted-foreground sm:text-xs">
                  {item.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const InstagramIcon = () => (
  <svg
    aria-hidden="true"
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const SOCIAL_LINKS = [
  { id: 'instagram', label: 'صفحه اینستاگرام یدک‌چی', icon: <InstagramIcon /> },
  { id: 'telegram', label: 'کانال تلگرام یدک‌چی', icon: <Send className="h-5 w-5" /> },
  { id: 'support', label: 'پشتیبانی آنلاین یدک‌چی', icon: <MessageSquare className="h-5 w-5" /> },
];

export function Footer({ className }: FooterProps) {
  const [email, setEmail] = React.useState('');
  const [mounted, setMounted] = React.useState(false);
  const { data: footerData } = useGetFrontFooter();
  const { data: categories = [] } = useGetStaticPageCategories();
  const subscribeNewsletter = useSubscribeNewsletter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleScrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast.error('لطفاً یک آدرس ایمیل معتبر وارد کنید');
      return;
    }
    try {
      await subscribeNewsletter.mutateAsync({ email });
      showToast.success('عضویت در خبرنامه با موفقیت انجام شد');
      setEmail('');
    } catch (err: any) {
      showToast.error(err.userMessage || 'خطا در ثبت ایمیل');
    }
  };

  const activeCategories = categories.filter(
    (cat) => cat && cat.staticPages && cat.staticPages.length > 0
  );

  const colCount = activeCategories.length + 1;
  const gridColsClass =
    colCount === 2 ? 'md:grid-cols-2'
    : colCount === 3 ? 'md:grid-cols-3'
    : colCount === 4 ? 'md:grid-cols-4'
    : 'md:grid-cols-5';

  return (
    <footer className={cn('border-t border-border bg-muted/30 pb-6', className)}>
      <WhyYadakchi />

      <div className="container mx-auto max-w-[1840px] px-4 pt-10 md:px-6">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 border-b border-border pb-6 md:flex-row">
          <div className="flex flex-col items-center text-center md:items-start md:gap-2">
            <Logo hideTitle className="origin-right scale-110" />
            <p className="mt-2 max-w-xl text-xs text-muted-foreground">
              {footerData?.description || 'یدک‌چی؛ مارکت‌پلیس تخصصی خرید قطعات یدکی خودرو'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleScrollToTop}
            className="flex h-10 items-center gap-1.5 px-4"
          >
            <span>بازگشت به بالا</span>
            <ChevronUp aria-hidden="true" className="h-4 w-4 text-primary" />
          </Button>
        </div>

        <div className="w-full space-y-1 pb-6 md:hidden">
          {mounted && activeCategories.map((cat: any, idx: number) => (
            <Accordion key={idx} title={cat.title}>
              <ul className="space-y-1 pb-2 pe-2">
                {cat.staticPages.map((page: any) => (
                  <li key={page.id}>
                    <Link
                      href={page.url}
                      className="block py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Accordion>
          ))}
        </div>

        <div className={cn('hidden border-b border-border pb-10 md:grid gap-8', gridColsClass)}>
          {activeCategories.map((cat: any, idx: number) => (
            <div key={idx} className="flex flex-col items-start space-y-4">
              <Typography variant="h5" className="font-bold text-foreground">
                {cat.title}
              </Typography>
              <ul className="w-full space-y-1">
                {cat.staticPages.map((page: any) => (
                  <li key={page.id}>
                    <Link
                      href={page.url}
                      className="block py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col items-start space-y-4 md:col-span-1">
            <Typography variant="h5" className="font-bold text-foreground">
              ارتباط با یدک‌چی
            </Typography>
            <div className="w-full space-y-3.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
                <span dir="ltr" className="font-medium">تماس: ۰۲۱-۱۲۳۴۵۶۷۸</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
                <span className="font-medium">ایمیل: yadakchi@info.com</span>
              </div>
            </div>

            <div className="flex w-full flex-col items-start pt-2">
              <Typography variant="h6" className="mb-2.5 font-bold text-foreground">
                همراه ما باشید!
              </Typography>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <Link
                    key={link.id}
                    href="#"
                    aria-label={link.label}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-xs transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {link.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4 border-b border-border py-6 md:hidden">
          <Typography variant="h5" className="font-bold text-foreground">
            ارتباط با یدک‌چی
          </Typography>
          <div className="w-full space-y-3.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
              <span dir="ltr" className="font-medium">تماس: ۰۲۱-۱۲۳۴۵۶۷۸</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
              <span className="font-medium">ایمیل: yadakchi@info.com</span>
            </div>
          </div>

          <div className="flex w-full flex-col items-start pt-2">
            <Typography variant="h6" className="mb-2.5 font-bold text-foreground">
              همراه ما باشید!
            </Typography>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((link) => (
                <Link
                  key={link.id}
                  href="#"
                  aria-label={link.label}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-xs transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {link.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-8 pt-8 lg:flex-row">
          <div className="w-full lg:max-w-md">
            <Typography variant="h6" className="mb-2 font-bold text-foreground">
              با ثبت ایمیل، از جدیدترین تخفیف‌ها و رویدادها باخبر شوید
            </Typography>
            <form onSubmit={handleSubscribe} className="mt-3 flex w-full gap-2">
              <Input
                type="email"
                placeholder="آدرس ایمیل شما"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-card"
                required
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="shrink-0 px-5"
                isLoading={subscribeNewsletter.isPending}
              >
                ثبت ایمیل
              </Button>
            </form>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted text-2xs font-bold text-muted-foreground">
              رسانه
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted text-2xs font-bold text-muted-foreground">
              نماد
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted text-2xs font-bold text-muted-foreground">
              اتحادیه
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="mx-auto max-w-5xl text-center text-2xs leading-relaxed text-muted-foreground">
            استفاده از مطالب یدک‌چی برای «استفاده غیرتجاری» و با «ذکر منبع» بلامانع است، تمامی حقوق مادی و معنوی این وب سایت متعلق به شرکت تامین اندیشان نوین خودرو می‌باشد.
          </p>
        </div>
      </div>
    </footer>
  );
}
