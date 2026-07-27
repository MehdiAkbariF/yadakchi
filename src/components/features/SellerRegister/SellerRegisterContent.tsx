'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accordion } from '@/components/composites/Accordion/Accordion';
import { Button } from '@/components/primitives/Button/Button';
import { Typography } from '@/components/primitives/Typography';
import { Card, CardBody } from '@/components/composites/Card';
import { 
  Store, 
  TrendingUp, 
  Package, 
  Truck, 
  Sparkles, 
  Users, 
  ArrowLeft, 
  CheckCircle, 
  Play, 
  ChevronDown, 
  Check, 
  ShieldCheck, 
  User, 
  Layers, 
  Plus
} from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

interface ConnectionNotification {
  id: number;
  text: string;
  type: 'buy' | 'add' | 'approve';
}

export function SellerRegisterContent() {
  const [notifications, setNotifications] = useState<ConnectionNotification[]>([
    { id: 1, text: 'علی علوی ۱ خرید انجام داد', type: 'buy' },
    { id: 2, text: 'فروشگاه آزادی: ثبت محصول جدید', type: 'add' },
    { id: 3, text: 'تامین‌کننده البرز: تایید سفارش', type: 'approve' }
  ]);

  const [notifIndex, setNotifIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifIndex((prev) => (prev + 1) % notifications.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [notifications.length]);

  const features = [
    {
      id: 'panel',
      title: 'پنل اختصاصی فروشگاه',
      desc: 'مدیریت ساده، کامل و یکپارچه فروشگاه آنلاین',
      icon: Store,
      color: 'text-primary bg-primary/10'
    },
    {
      id: 'accounting',
      title: 'مدیریت فروش و حسابداری',
      desc: 'گزارش دقیق فروش، تسویه و درآمد فروشنده',
      icon: TrendingUp,
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      id: 'inventory',
      title: 'مدیریت محصولات و موجودی',
      desc: 'کنترل کامل قطعات، قیمت‌ها و موجودی انبار',
      icon: Package,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      id: 'shipping',
      title: 'مدیریت سفارش و ارسال',
      desc: 'پیگیری سریع سفارش‌ها و وضعیت ارسال آن‌ها',
      icon: Truck,
      color: 'text-orange-500 bg-orange-500/10'
    },
    {
      id: 'ads',
      title: 'تبلیغات و افزایش فروش',
      desc: 'افزایش بازدید و جذب مشتریان با کمپین‌ها',
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      id: 'b2b',
      title: 'شبکه فروشندگان یدکچی (B2B)',
      desc: 'ارتباط مستقیم با فروشندگان و تأمین‌کنندگان',
      icon: Users,
      color: 'text-purple-500 bg-purple-500/10'
    }
  ];

  const steps = [
    {
      number: '۱',
      title: 'عضویت فروشنده',
      desc: 'ایجاد حساب فروشندگی و تکمیل اطلاعات اولیه مورد نیاز فروشگاه برای شروع همکاری'
    },
    {
      number: '۲',
      title: 'آموزش پنل',
      desc: 'آشنایی با امکانات پنل کاربری، روند ثبت موجودی، مدیریت سفارشات و روند ارسال آن‌ها'
    },
    {
      number: '۳',
      title: 'ثبت موجودی و قیمت',
      desc: 'ثبت قیمت و موجودی کالاهای موجود در یدکچی و یا درخواست افزودن قطعات موردنظر'
    },
    {
      number: '۴',
      title: 'آغاز فروش آنلاین',
      desc: 'دریافت سفارش‌های آنلاین و فروش به مشتریان سراسر ایران و ثبت کمپین‌های تبلیغاتی'
    }
  ];

  const testimonials = [
    {
      initial: 'ع',
      name: 'علی محمدی',
      shop: 'فروشگاه لوازم یدکی تهران',
      quote: 'بعد از عضویت در یدکچی، تعداد مشتریان ما چند برابر شد و مدیریت سفارش‌ها بسیار راحت‌تر از قبل انجام می‌شود.'
    },
    {
      initial: 'م',
      name: 'مهدی رضایی',
      shop: 'تامین‌کننده قطعات خودرو',
      quote: 'پشتیبانی عالی و فرآیند ثبت محصولات بسیار ساده است. توانستیم در مدت کوتاهی فروش آنلاین خود را گسترش دهیم.'
    },
    {
      initial: 'ح',
      name: 'حسین کریمی',
      shop: 'فروشنده قطعات بدنه',
      quote: 'بزرگ‌ترین مزیت یدکچی دسترسی به مشتریان سراسر کشور است. حالا سفارش‌هایی از شهرهای مختلف دریافت می‌کنیم.'
    }
  ];

  const faqs = [
    { q: 'آیا ثبت‌نام در یدکچی هزینه دارد؟', a: 'خیر، ثبت‌نام و ایجاد فروشگاه در یدکچی رایگان است.' },
    { q: 'برای فروش در یدکچی نیاز به سایت دارم؟', a: 'خیر، فروشگاه آنلاین شما داخل یدکچی فعال می‌شود و نیازی به سایت جداگانه ندارید.' },
    { q: 'چه فروشندگانی می‌توانند در یدکچی فعالیت کنند؟', a: 'تمام فروشندگان، فروشگاه‌ها، شرکت‌ها، تولیدکنندگان و فعالان حوزه قطعات یدکی خودرو می‌توانند در یدکچی فروش داشته باشند.' },
    { q: 'آیا کالاها از قبل در سایت وجود دارند؟', a: 'بله، بخش زیادی از قطعات و برندها از قبل در مارکت‌پلیس یدکچی ثبت شده‌اند.' },
    { q: 'آیا می‌توانم قطعه جدید ثبت کنم؟', a: 'بله، می‌توانید درخواست افزودن قطعات و برندهای موردنیاز خود را ثبت کنید.' },
    { q: 'چه مدارکی برای ثبت‌نام نیاز است؟', a: 'برای فروشندگان حقیقی، کارت ملی و شماره شبای بانکی نیاز است و در صورت داشتن، جواز کسب هم قابل ثبت است. برای فروشندگان حقوقی نیز اطلاعات شرکت، آدرس و شبای حساب شرکتی موردنیاز خواهد بود.' },
    { q: 'سفارش‌ها چگونه به فروشنده اعلام می‌شوند؟', a: 'تمام سفارش‌ها از طریق پنل فروشندگی و اعلان‌های سیستم به شما نمایش داده می‌شوند.' },
    { q: 'ارسال سفارش‌ها بر عهده چه کسی است؟', a: 'ارسال سفارش‌ها توسط فروشنده انجام می‌شود و وضعیت آن از طریق پنل قابل مدیریت است.' },
    { q: 'آیا امکان مدیریت چندین کالا و سفارش همزمان وجود دارد؟', a: 'بله، پنل فروشندگی برای مدیریت تعداد بالای کالاها و سفارش‌ها طراحی شده است.' },
    { q: 'تسویه حساب فروش‌ها چگونه انجام می‌شود؟', a: 'گزارش فروش و تسویه‌ها از طریق پنل فروشندگی قابل مشاهده و پیگیری است.' }
  ];

  const handleStartRegister = () => {
    window.location.href = '/login?redirect=/profile/settings';
  };

  return (
    <div className="w-full flex flex-col gap-16 md:gap-24 py-4 select-none text-right" dir="rtl">
      
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full min-h-[500px]">
        <div className="lg:col-span-6 flex flex-col items-start gap-5">
          <span className="text-xs font-black text-primary bg-primary/10 px-3.5 py-1.5 rounded-xl uppercase tracking-wider">
            از بازار محلی به فروش در سراسر ایران
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight font-iran-yekan">
            در یدکچی فروشنده شوید!
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-justify font-iran-yekan max-w-xl">
            خریداران قطعات یدکی قبل از هر تماس یا مراجعه، اول آنلاین جستجو می‌کنند. اگر فروشگاه شما آنلاین نباشد، بخش بزرگی از مشتری‌ها را به رقبایی واگذار می‌کنید که در فضای دیجیتال حضور دارند. در یدکچی شما بدون نیاز به راه‌اندازی سایت یا صرف هزینه‌های سنگین، می‌توانید فروشگاه آنلاین خودتان را داشته باشید.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full sm:w-auto mt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartRegister}
              className="rounded-xl font-iran-yekan font-bold text-sm h-12 px-8 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <span>ثبت‌نام رایگان فروشندگی</span>
              <ArrowLeft className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>

        <div className="lg:col-span-6 w-full flex items-center justify-center relative">
          <div className="w-full max-w-[450px] aspect-square rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center relative p-8">
            
            <div className="absolute inset-0 rounded-full border border-dashed border-primary/10 animate-spin" style={{ animationDuration: '60s' }} />
            <div className="absolute inset-4 rounded-full border border-dashed border-primary/5 animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />

            <div className="relative w-28 h-28 rounded-3xl bg-background border shadow-2xl p-4 flex items-center justify-center">
              <img src="/Logo.svg" alt="" className="w-full h-full object-contain" />
            </div>

            <div className="absolute -top-4 right-1/4 bg-background border rounded-2xl p-3 shadow-lg flex items-center gap-2.5 transform hover:scale-105 transition-transform">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold text-foreground">خریدار آنلاین</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">در جستجوی قطعه</span>
              </div>
            </div>

            <div className="absolute top-1/3 -right-8 bg-background border rounded-2xl p-3 shadow-lg flex items-center gap-2.5 transform hover:scale-105 transition-transform">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">
                <Store className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold text-foreground">فروشگاه شما</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">ثبت موجودی آسان</span>
              </div>
            </div>

            <div className="absolute bottom-8 right-12 bg-background border rounded-2xl p-3 shadow-lg flex items-center gap-2.5 transform hover:scale-105 transition-transform">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold">
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold text-foreground">تأمین‌کننده قطعات</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">فروش بی‌واسطه</span>
              </div>
            </div>

            <div className="absolute bottom-1/3 -left-8 w-60 z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={notifIndex}
                  initial={{ y: 15, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -15, opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="w-full bg-card border rounded-2xl p-3.5 shadow-2xl flex items-center gap-3"
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                    notifications[notifIndex].type === 'buy' && "bg-primary/10 text-primary",
                    notifications[notifIndex].type === 'add' && "bg-blue-500/10 text-blue-500",
                    notifications[notifIndex].type === 'approve' && "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {notifications[notifIndex].type === 'buy' && <Check className="h-5 w-5 stroke-[2.5]" />}
                    {notifications[notifIndex].type === 'add' && <Plus className="h-5 w-5 stroke-[2.5]" />}
                    {notifications[notifIndex].type === 'approve' && <ShieldCheck className="h-5 w-5 stroke-[2.5]" />}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <span className="text-xs font-black text-foreground block truncate">{notifications[notifIndex].text}</span>
                    <span className="text-[9px] text-muted-foreground block mt-0.5">به صورت زنده در یدک‌چی</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      <section className="w-full flex flex-col gap-10">
        <div className="flex flex-col items-center text-center gap-2">
          <h2 className="text-2xl md:text-3xl font-black text-foreground font-iran-yekan">امکانات فروشندگان در یدکچی</h2>
          <p className="text-xs md:text-sm text-muted-foreground font-iran-yekan max-w-md">همه ابزارهایی که برای توسعه یک کسب‌وکار دیجیتال نیاز دارید</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {features.map((feat) => {
            const FeatIcon = feat.icon;
            return (
              <Card key={feat.id} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-card hover:border-primary/20 hover:scale-[1.01] transition-all duration-300 shadow-sm p-6">
                <CardBody className="p-0 flex flex-col items-start text-right gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", feat.color)}>
                    <FeatIcon className="h-6 w-6 stroke-[2]" />
                  </div>
                  <div className="flex flex-col gap-1.5 w-full">
                    <h3 className="text-base font-extrabold text-foreground font-iran-yekan">{feat.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-iran-yekan">{feat.desc}</p>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="w-full flex flex-col gap-12">
        <div className="flex flex-col items-center text-center gap-2">
          <h2 className="text-2xl md:text-3xl font-black text-foreground font-iran-yekan">مسیر فروشنده شدن</h2>
          <p className="text-xs md:text-sm text-muted-foreground font-iran-yekan max-w-md">فقط در ۴ قدم ساده، فروشگاه آنلاین خود را راه‌اندازی کنید</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full relative">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-start gap-4 p-5 rounded-2xl bg-muted/20 border border-transparent hover:border-border transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-primary/10">
                {step.number}
              </div>
              <div className="flex flex-col gap-1.5 text-right w-full">
                <h4 className="text-sm font-extrabold text-foreground font-iran-yekan">{step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-iran-yekan">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full flex flex-col gap-10">
        <div className="flex flex-col items-center text-center gap-2">
          <h2 className="text-2xl md:text-3xl font-black text-foreground font-iran-yekan">فروشندگان درباره یدکچی چه می‌گویند؟</h2>
          <p className="text-xs md:text-sm text-muted-foreground font-iran-yekan max-w-md">تجربه فروشندگان واقعی که کسب‌وکار خود را در یدکچی توسعه داده‌اند</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {testimonials.map((t, idx) => (
            <Card key={idx} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-card shadow-sm p-6 flex flex-col justify-between gap-5">
              <CardBody className="p-0 flex flex-col gap-4 text-right">
                <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-iran-yekan">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 border-t border-dashed pt-4 mt-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black text-sm flex items-center justify-center shrink-0">
                    {t.initial}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-foreground">{t.name}</span>
                    <span className="text-[10px] text-muted-foreground font-iran-yekan mt-0.5">{t.shop}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="w-full flex flex-col gap-10">
        <div className="flex flex-col items-center text-center gap-2">
          <h2 className="text-2xl md:text-3xl font-black text-foreground font-iran-yekan">پرسش و پاسخ</h2>
          <p className="text-xs md:text-sm text-muted-foreground font-iran-yekan max-w-md">سوالات متداول درباره همکاری با یدکچی</p>
        </div>

        <div className="w-full max-w-3xl mx-auto flex flex-col gap-2 bg-background border rounded-2xl p-5 shadow-sm">
          {faqs.map((faq, idx) => (
            <Accordion key={idx} title={faq.q}>
              <p className="text-xs md:text-sm leading-relaxed text-muted-foreground text-justify font-iran-yekan pr-1 pb-1">
                {faq.a}
              </p>
            </Accordion>
          ))}
        </div>
      </section>

      <section className="w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="flex flex-col text-right gap-2 z-10">
          <h3 className="text-xl sm:text-3xl font-black text-foreground font-iran-yekan">آماده‌ی ورود به بازار آنلاین هستید؟</h3>
          <p className="text-xs sm:text-sm text-muted-foreground font-iran-yekan mt-1 max-w-md leading-relaxed">
            ثبت‌نام فروشگاه در یدک‌چی کمتر از ۵ دقیقه زمان می‌برد. همین امروز شعبه آنلاین کسب‌وکار خود را بدون هزینه راه‌اندازی کنید.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={handleStartRegister}
          className="rounded-xl font-iran-yekan font-bold text-sm h-12 px-10 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 shrink-0 z-10 w-full md:w-auto"
        >
          <span>شروع ثبت‌نام فروشنده جدید</span>
          <ArrowLeft className="h-4.5 w-4.5" />
        </Button>
        <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none hidden lg:block">
          <Store className="h-32 w-32 text-primary" strokeWidth={1.5} />
        </div>
      </section>

    </div>
  );
}