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
import { Phone, Mail, ChevronUp, Send, MessageSquare } from 'lucide-react';
import { showToast } from '@/core/utils/toast';

export interface FooterProps {
  className?: string;
}

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
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
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
    (cat: any) => cat.staticPages && cat.staticPages.length > 0
  );

  const colCount = activeCategories.length + 1;
  const gridColsClass = 
    colCount === 2 ? 'md:grid-cols-2' : 
    colCount === 3 ? 'md:grid-cols-3' : 
    colCount === 4 ? 'md:grid-cols-4' : 'md:grid-cols-5';

  return (
    <footer className={cn('border-t bg-muted/30 pt-10 pb-6', className)}>
      <div className="container max-w-[1840px] mx-auto px-4 md:px-6">
        
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
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl border font-iran-sans font-bold text-xs"
          >
            <span>بازگشت به بالا</span>
            <ChevronUp className="h-4 w-4 text-primary" />
          </Button>
        </div>

        <div className="md:hidden w-full space-y-1 pb-6 ">
          {mounted && activeCategories.map((cat: any, idx: number) => (
            <Accordion key={idx} title={cat.title}>
              <ul className="space-y-1 pr-2 pb-2">
                {cat.staticPages.map((page: any) => (
                  <li key={page.id} className="text-right">
                    <Link 
                      href={page.url} 
                      className="text-xs font-medium font-iran-sans text-muted-foreground hover:text-primary transition-colors block py-2" // افزایش فضای تاچ به py-2
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Accordion>
          ))}
        </div>

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
                      className="text-xs font-medium font-iran-sans text-muted-foreground hover:text-primary transition-colors block py-2" // افزایش فضای تاچ به py-2
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
              <div className="flex items-center gap-2 text-xs font-iran-sans text-muted-foreground justify-start">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span dir="ltr" className="font-medium">تماس: ۰۲۱-۱۲۳۴۵۶۷۸</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-iran-sans text-muted-foreground justify-start">
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
                  aria-label="صفحه اینستاگرام یدک‌چی" // اضافه شدن لیبل دسترسی‌پذیری
                  className="w-11 h-11 bg-background border hover:border-primary/30 rounded-xl text-muted-foreground hover:text-primary transition-all shadow-sm flex items-center justify-center shrink-0" // تاچ تارگت استاندارد ۴۴ پیکسل
                >
                  <InstagramIcon />
                </Link>
                <Link 
                  href="#" 
                  aria-label="کانال تلگرام یدک‌چی" // اضافه شدن لیبل دسترسی‌پذیری
                  className="w-11 h-11 bg-background border hover:border-primary/30 rounded-xl text-muted-foreground hover:text-primary transition-all shadow-sm flex items-center justify-center shrink-0" // تاچ تارگت استاندارد ۴۴ پیکسل
                >
                  <Send className="h-5 w-5" />
                </Link>
                <Link 
                  href="#" 
                  aria-label="پشتیبانی آنلاین یدک‌چی" // اضافه شدن لیبل دسترسی‌پذیری
                  className="w-11 h-11 bg-background border hover:border-primary/30 rounded-xl text-muted-foreground hover:text-primary transition-all shadow-sm flex items-center justify-center shrink-0" // تاچ تارگت استاندارد ۴۴ پیکسل
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden space-y-4 py-6 border-b text-right flex flex-col items-start">
          <Typography variant="h5" className="font-iran-yekan font-extrabold text-foreground">
            ارتباط با یدک‌چی
          </Typography>
          <div className="space-y-3.5 w-full">
            <div className="flex items-center gap-2 text-xs font-iran-sans text-muted-foreground justify-start">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span dir="ltr" className="font-medium">تماس: ۰۲۱-۱۲۳۴۵۶۷۸</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-iran-sans text-muted-foreground justify-start">
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
                aria-label="صفحه اینستاگرام یدک‌چی" // لیبل دسترسی‌پذیری موبایل
                className="w-11 h-11 bg-background border hover:border-primary/30 rounded-xl text-muted-foreground hover:text-primary transition-all shadow-sm flex items-center justify-center shrink-0"
              >
                <InstagramIcon />
              </Link>
              <Link 
                href="#" 
                aria-label="کانال تلگرام یدک‌چی" // لیبل دسترسی‌پذیری موبایل
                className="w-11 h-11 bg-background border hover:border-primary/30 rounded-xl text-muted-foreground hover:text-primary transition-all shadow-sm flex items-center justify-center shrink-0"
              >
                <Send className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                aria-label="پشتیبانی آنلاین یدک‌چی" // لیبل دسترسی‌پذیری موبایل
                className="w-11 h-11 bg-background border hover:border-primary/30 rounded-xl text-muted-foreground hover:text-primary transition-all shadow-sm flex items-center justify-center shrink-0"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

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
                className="rounded-xl px-5 font-iran-sans font-bold text-xs shrink-0"
                isLoading={subscribeNewsletter.isPending}
              >
                ثبت ایمیل
              </Button>
            </form>
          </div>

          <div className="flex items-center gap-4 bg-background rounded-2xl border p-4 shadow-sm shrink-0">
            <div className="w-16 h-16 bg-muted/40 rounded-xl flex items-center justify-center text-[10px] text-muted-foreground font-iran-sans font-bold">رسانه</div>
            <div className="w-16 h-16 bg-muted/40 rounded-xl flex items-center justify-center text-[10px] text-muted-foreground font-iran-sans font-bold">نماد</div>
            <div className="w-16 h-16 bg-muted/40 rounded-xl flex items-center justify-center text-[10px] text-muted-foreground font-iran-sans font-bold">اتحادیه</div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-[11px] leading-relaxed text-muted-foreground/80 font-iran-sans max-w-5xl mx-auto text-center">
            استفاده از مطالب یدک‌چی برای «استفاده غیرتجاری» و با «ذکر منبع» بلامانع است، تمامی حقوق مادی و معنوی این وب سایت متعلق به شرکت تامین اندیشان نوین خودرو می‌باشد.
          </p>
        </div>

      </div>
    </footer>
  );
}