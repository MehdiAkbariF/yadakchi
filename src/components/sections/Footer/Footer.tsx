// c:\Users\Raven\final-projects\yadakchi-front\yadakchi\src\components\sections\Footer\Footer.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/design-system/utils/cn';
import { Typography } from '@/components/primitives/Typography';
import { Input } from '@/components/primitives/Input';
import { Button } from '@/components/primitives/Button';
import { Logo } from '@/components/sections/Header/components/Logo/Logo';
import { Accordion } from '@/components/composites/Accordion/Accordion';
import { useGetFrontFooter } from '@/domains/front/banner/hooks/banner.hooks';
import { useGetStaticPageCategories, useSubscribeNewsletter } from '@/domains/front/static/hooks/static.hooks';
import { 
  Phone, 
  Mail, 
  ChevronUp, 
  Send, 
  MessageSquare, 
  Headphones, 
  BadgeCheck, 
  CreditCard, 
  MessageCircle 
} from 'lucide-react';
import { showToast } from '@/core/utils/toast';

export interface FooterProps {
  className?: string;
}

// =============================================================================
// بخش «چرا یدکچی؟» با پس‌زمینه سفید، آیکون در سمت راست و عرض فشرده‌تر
// =============================================================================
const WHY_US_ITEMS = [
  {
    id: 1,
    title: 'پرداخت امن',
    description: 'ضمانت تراکنش های شما',
    icon: (
      <div className="relative flex items-center justify-center">
        <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900" />
      </div>
    ),
  },
  {
    id: 2,
    title: 'ضمانت اصل بودن',
    description: 'مرجوع کالا در صورت عدم تناسب',
    icon: <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-600 dark:text-zinc-300" />,
  },
  {
    id: 3,
    title: '۲۴x۷ پشتیبانی',
    description: 'پشتیبانی تخصصی در تمام مراحل',
    icon: <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-[#f05023]" />,
  },
  {
    id: 4,
    title: 'ارتباط امن با فروشندگان',
    description: 'در تماس باش، مطمئن خرید کن!',
    icon: <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#f05023]" />,
  },
];

function WhyYadakchi() {
  return (
    <div className="w-full bg-white dark:bg-zinc-950 py-10 border-b border-zinc-200/70 dark:border-zinc-800">
      <div className="container max-w-6xl mx-auto px-4">
        
        {/* تیتر مرکزی همراه با خط تفکیک در دو طرف */}
        <div className="flex items-center justify-center mb-8 relative">
          <div className="absolute inset-x-0 top-1/2 h-px bg-zinc-200/80 dark:bg-zinc-800 -z-0" />
          <h3 className="relative z-10 bg-white dark:bg-zinc-950 px-5 text-sm sm:text-base font-black font-iran-yekan text-zinc-800 dark:text-zinc-100">
            چرا یدکچی؟
          </h3>
        </div>

        {/* گرید ۴ کارته با عرض فشرده، آیکون سمت راست و هاور سایه‌دار */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {WHY_US_ITEMS.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group relative flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900",
                "border border-zinc-200/80 dark:border-zinc-800",
                "transition-all duration-300 ease-out select-none cursor-pointer",
                // افکت سایه محو در هاور و زوم نامحسوس
                "hover:border-transparent hover:shadow-[0_8px_25px_rgb(0,0,0,0.07)] dark:hover:shadow-[0_8px_25px_rgb(255,255,255,0.03)] hover:-translate-y-0.5"
              )}
            >
              {/* ۱. باکس آیکون (سمت راست) با قابلیت زوم به جلو در هاور */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/60 flex items-center justify-center shrink-0">
                <div className="transition-transform duration-300 ease-out group-hover:scale-115">
                  {item.icon}
                </div>
              </div>

              {/* ۲. متون توضیحات (سمت چپ آیکون) */}
              <div className="flex flex-col text-right min-w-0">
                <span className="text-xs sm:text-[13px] font-black font-iran-yekan text-zinc-800 dark:text-zinc-100 mb-0.5 truncate leading-snug">
                  {item.title}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium font-iran-yekan text-zinc-400 dark:text-zinc-500 truncate leading-relaxed">
                  {item.description}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// =============================================================================
// Footer اصلی
// =============================================================================
const InstagramIcon = () => (
  <svg 
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

export function Footer({ className }: FooterProps) {
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);
  const { data: footerData } = useGetFrontFooter();
  const { data: categories = [] } = useGetStaticPageCategories();
  const subscribeNewsletter = useSubscribeNewsletter();

  useEffect(() => {
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
    colCount === 2 ? 'md:grid-cols-2' : 
    colCount === 3 ? 'md:grid-cols-3' : 
    colCount === 4 ? 'md:grid-cols-4' : 'md:grid-cols-5';

  return (
    <footer className={cn('border-t bg-muted/30 pb-6', className)}>
      {/* ۱. سکشن «چرا یدکچی؟» با پس‌زمینه سفید خالص */}
      <WhyYadakchi />

      <div className="container max-w-[1840px] mx-auto px-4 md:px-6 pt-10">
        
        {/* ۲. بخش بالای فوتر و بازگشت به بالا */}
        <div className="flex flex-col md:flex-row items-center justify-between border-b pb-6 mb-8 gap-4">
          <div className="flex flex-col items-center md:items-start text-center md:text-right gap-2">
            <Logo hideTitle className="scale-110 origin-right" />
            <p className="text-xs text-muted-foreground mt-2 max-w-xl">
              {footerData?.description || 'یدک‌چی؛ مارکت‌پلیس تخصصی خرید قطعات یدکی خودرو'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleScrollToTop}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl border font-iran-yekan font-bold text-xs"
          >
            <span>بازگشت به بالا</span>
            <ChevronUp className="h-4 w-4 text-primary" />
          </Button>
        </div>

        {/* ۳. لینک‌های فوتر در موبایل (Accordion) */}
        <div className="md:hidden w-full space-y-1 pb-6">
          {mounted && activeCategories.map((cat: any, idx: number) => (
            <Accordion key={idx} title={cat.title}>
              <ul className="space-y-1 pr-2 pb-2">
                {cat.staticPages.map((page: any) => (
                  <li key={page.id} className="text-right">
                    <Link 
                      href={page.url} 
                      className="text-xs font-medium font-iran-yekan text-muted-foreground hover:text-primary transition-colors block py-2"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Accordion>
          ))}
        </div>

        {/* ۴. لینک‌های فوتر در دسکتاپ */}
        <div className={cn("hidden md:grid gap-8 border-b pb-10", gridColsClass)}>
          {activeCategories.map((cat: any, idx: number) => (
            <div key={idx} className="space-y-4 text-right flex flex-col items-start">
              <Typography variant="h5" className="font-iran-yekan font-extrabold text-foreground">
                {cat.title}
              </Typography>
              <ul className="space-y-1 w-full">
                {cat.staticPages.map((page: any) => (
                  <li key={page.id} className="text-right">
                    <Link 
                      href={page.url} 
                      className="text-xs font-medium font-iran-yekan text-muted-foreground hover:text-primary transition-colors block py-2"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-4 text-right flex flex-col items-start md:col-span-1">
            <Typography variant="h5" className="font-iran-yekan font-extrabold text-foreground">
              ارتباط با یدک‌چی
            </Typography>
            <div className="space-y-3.5 w-full">
              <div className="flex items-center gap-2 text-xs font-iran-yekan text-muted-foreground justify-start">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span dir="ltr" className="font-medium">تماس: ۰۲۱-۱۲۳۴۵۶۷۸</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-iran-yekan text-muted-foreground justify-start">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">ایمیل: yadakchi@info.com</span>
              </div>
            </div>

            <div className="pt-2 w-full flex flex-col items-start">
              <Typography variant="h6" className="font-iran-yekan font-bold text-foreground mb-2.5">
                همراه ما باشید!
              </Typography>
              <div className="flex items-center gap-3">
                <Link 
                  href="#" 
                  aria-label="صفحه اینستاگرام یدک‌چی"
                  className="w-11 h-11 bg-background border hover:border-primary/30 rounded-xl text-muted-foreground hover:text-primary transition-all shadow-sm flex items-center justify-center shrink-0"
                >
                  <InstagramIcon />
                </Link>
                <Link 
                  href="#" 
                  aria-label="کانال تلگرام یدک‌چی"
                  className="w-11 h-11 bg-background border hover:border-primary/30 rounded-xl text-muted-foreground hover:text-primary transition-all shadow-sm flex items-center justify-center shrink-0"
                >
                  <Send className="h-5 w-5" />
                </Link>
                <Link 
                  href="#" 
                  aria-label="پشتیبانی آنلاین یدک‌چی"
                  className="w-11 h-11 bg-background border hover:border-primary/30 rounded-xl text-muted-foreground hover:text-primary transition-all shadow-sm flex items-center justify-center shrink-0"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ۵. ارتباط با ما در موبایل */}
        <div className="md:hidden space-y-4 py-6 border-b text-right flex flex-col items-start">
          <Typography variant="h5" className="font-iran-yekan font-extrabold text-foreground">
            ارتباط با یدک‌چی
          </Typography>
          <div className="space-y-3.5 w-full">
            <div className="flex items-center gap-2 text-xs font-iran-yekan text-muted-foreground justify-start">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span dir="ltr" className="font-medium">تماس: ۰۲۱-۱۲۳۴۵۶۷۸</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-iran-yekan text-muted-foreground justify-start">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span className="font-medium">ایمیل: yadakchi@info.com</span>
            </div>
          </div>

          <div className="pt-2 w-full flex flex-col items-start">
            <Typography variant="h6" className="font-iran-yekan font-bold text-foreground mb-2.5">
              همراه ما باشید!
            </Typography>
            <div className="flex items-center gap-3">
              <Link 
                href="#" 
                aria-label="صفحه اینستاگرام یدک‌چی"
                className="w-11 h-11 bg-background border hover:border-primary/30 rounded-xl text-muted-foreground hover:text-primary transition-all shadow-sm flex items-center justify-center shrink-0"
              >
                <InstagramIcon />
              </Link>
              <Link 
                href="#" 
                aria-label="کانال تلگرام یدک‌چی"
                className="w-11 h-11 bg-background border hover:border-primary/30 rounded-xl text-muted-foreground hover:text-primary transition-all shadow-sm flex items-center justify-center shrink-0"
              >
                <Send className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                aria-label="پشتیبانی آنلاین یدک‌چی"
                className="w-11 h-11 bg-background border hover:border-primary/30 rounded-xl text-muted-foreground hover:text-primary transition-all shadow-sm flex items-center justify-center shrink-0"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ۶. عضویت در خبرنامه و نمادها */}
        <div className="flex flex-col lg:flex-row items-center justify-between pt-8 gap-8">
          <div className="w-full lg:max-w-md text-right">
            <Typography variant="h6" className="font-iran-yekan font-bold text-foreground mb-2">
              با ثبت ایمیل، از جدیدترین تخفیف‌ها و رویدادها با‌خبر شوید
            </Typography>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full mt-3">
              <Input
                type="email"
                placeholder="آدرس ایمیل شما"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-xl bg-background"
                required
              />
              <Button 
                type="submit" 
                variant="primary" 
                size="md" 
                className="rounded-xl px-5 font-iran-yekan font-bold text-xs shrink-0"
                isLoading={subscribeNewsletter.isPending}
              >
                ثبت ایمیل
              </Button>
            </form>
          </div>

          <div className="flex items-center gap-4 bg-background rounded-2xl border p-4 shadow-sm shrink-0">
            <div className="w-16 h-16 bg-muted/40 rounded-xl flex items-center justify-center text-[10px] text-muted-foreground font-iran-yekan font-bold">رسانه</div>
            <div className="w-16 h-16 bg-muted/40 rounded-xl flex items-center justify-center text-[10px] text-muted-foreground font-iran-yekan font-bold">نماد</div>
            <div className="w-16 h-16 bg-muted/40 rounded-xl flex items-center justify-center text-[10px] text-muted-foreground font-iran-yekan font-bold">اتحادیه</div>
          </div>
        </div>

        {/* ۷. کپی رایت */}
        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-[11px] leading-relaxed text-muted-foreground/80 font-iran-yekan max-w-5xl mx-auto text-center">
            استفاده از مطالب یدک‌چی برای «استفاده غیرتجاری» و با «ذکر منبع» بلامانع است، تمامی حقوق مادی و معنوی این وب سایت متعلق به شرکت تامین اندیشان نوین خودرو می‌باشد.
          </p>
        </div>

      </div>
    </footer>
  );
}