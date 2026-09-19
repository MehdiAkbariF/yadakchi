// src/app/seller/register/page.tsx (یا فایل کامپوننت مربوطه)

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accordion } from '@/components/composites/Accordion/Accordion';
import { Button } from '@/components/primitives/Button/Button';
import { Card, CardBody } from '@/components/composites/Card';
import { 
  Store, 
  TrendingUp, 
  Package, 
  Truck, 
  Sparkles, 
  Users, 
  ArrowLeft, 
  ShieldCheck, 
  User, 
  Layers, 
  Plus,
  Check
} from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

interface ConnectionNotification {
  id: number;
  text: string;
  type: 'buy' | 'add' | 'approve';
}

export function SellerRegisterContent() {
  const [notifications] = useState<ConnectionNotification[]>([
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

  // المان‌های مدار چرخان
  const orbitItems = [
    {
      id: 'buyer',
      title: 'خریدار آنلاین',
      desc: 'در جستجوی قطعه',
      icon: User,
      color: 'text-primary bg-primary/10',
      // زاویه ۰ درجه (بالای مدار)
      style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' }
    },
    {
      id: 'store',
      title: 'فروشگاه شما',
      desc: 'ثبت موجودی آسان',
      icon: Store,
      color: 'text-emerald-500 bg-emerald-500/10',
      // زاویه ۱۲۰ درجه (پایین-چپ مدار)
      style: { top: '75%', left: '93.3%', transform: 'translate(-50%, -50%)' }
    },
    {
      id: 'supplier',
      title: 'تأمین‌کننده',
      desc: 'فروش بی‌واسطه',
      icon: Layers,
      color: 'text-blue-500 bg-blue-500/10',
      // زاویه ۲۴۰ درجه (پایین-راست مدار)
      style: { top: '75%', left: '6.7%', transform: 'translate(-50%, -50%)' }
    }
  ];

  return (
    // مهار قطعی اسکرول افقی موبایل با overflow-x-clip
    <div className="w-full max-w-full overflow-x-clip flex flex-col gap-16 md:gap-24 py-4 text-right" dir="rtl">
      
      {/* بخش هیرو */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center w-full min-h-[500px]">
        
        {/* متون سمت راست */}
        <div className="lg:col-span-6 flex flex-col items-start gap-4 sm:gap-5 order-1">
          <span className="text-xs font-black text-primary bg-primary/10 px-3.5 py-1.5 rounded-xl uppercase tracking-wider">
            از بازار محلی به فروش در سراسر ایران
          </span>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight">
            در یدکچی فروشنده شوید!
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed sm:leading-loose text-justify max-w-xl">
            خریداران قطعات یدکی قبل از هر تماس یا مراجعه، اول آنلاین جستجو می‌کنند. اگر فروشگاه شما آنلاین نباشد، بخش بزرگی از مشتری‌ها را به رقبا واگذار می‌کنید. در یدکچی بدون نیاز به هزینه‌های سنگین ساخت سایت، فروشگاه رسمی خود را افتتاح کنید.
          </p>

          <div className="w-full sm:w-auto mt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartRegister}
              className="w-full sm:w-auto rounded-xl font-bold text-sm h-12 px-8 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <span>ثبت‌نام رایگان فروشندگی</span>
              <ArrowLeft className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>

        {/* بخش انیمیشن مداری کهکشانی (رفع کامل باگ اسکرول و پیاده‌سازی چرخش) */}
        <div className="lg:col-span-6 w-full flex items-center justify-center relative order-2 py-6 sm:py-10">
          
          {/* کانتینر محدودکننده دایره (واکنش‌گرا برای جلوگیری از اورفلو) */}
          <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[420px] md:h-[420px] rounded-full flex items-center justify-center">
            
            {/* خطوط مدار راداری دکوراتیو */}
            <div className="absolute inset-0 rounded-full border border-dashed border-primary/20" />
            <div className="absolute inset-6 rounded-full border border-dashed border-border/50" />
            
            {/* ۱. مدار متحرک سیاره‌ای (۳۶۰ درجه چرخش پیوسته) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 w-full h-full rounded-full pointer-events-none"
            >
              {orbitItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.id}
                    style={item.style}
                    className="absolute pointer-events-auto"
                  >
                    {/* ضد-چرخش (Counter Rotation): زاویه منفی دقیق برای ثابت و افقی ماندن متون */}
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                      className="bg-card/95 backdrop-blur-md border border-border/70 rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg flex items-center gap-2 sm:gap-2.5 whitespace-nowrap hover:scale-110 transition-transform duration-200 cursor-default"
                    >
                      <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0", item.color)}>
                        <ItemIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] sm:text-xs font-black text-foreground">{item.title}</span>
                        <span className="text-[8px] sm:text-[10px] text-muted-foreground mt-0.5">{item.desc}</span>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>

            {/* لوگوی مرکزی ثابت یدکچی با هاله نوری */}
            <div className="relative z-10 w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-background border border-border/80 shadow-2xl p-3 sm:p-4 flex items-center justify-center">
              <img src="/Logo.svg" alt="یدک‌چی" className="w-full h-full object-contain" />
              {/* هاله تابشی پشت لوگو */}
              <div className="absolute inset-0 -z-10 rounded-2xl sm:rounded-3xl bg-primary/10 blur-xl animate-pulse" />
            </div>

            {/* ۲. کارت نوتیفیکیشن لایو (موقعیت‌دهی امن در مرکز پایین برای عدم ایجاد اسکرول) */}
            <div className="absolute -bottom-4 sm:bottom-2 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-[250px] sm:max-w-[270px] z-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={notifIndex}
                  initial={{ y: 10, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -10, opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="w-full bg-card/95 backdrop-blur-md border border-border/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-xl flex items-center gap-2.5"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0",
                    notifications[notifIndex].type === 'buy' && "bg-primary/10 text-primary",
                    notifications[notifIndex].type === 'add' && "bg-blue-500/10 text-blue-500",
                    notifications[notifIndex].type === 'approve' && "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {notifications[notifIndex].type === 'buy' && <Check className="h-4 w-4 stroke-[2.5]" />}
                    {notifications[notifIndex].type === 'add' && <Plus className="h-4 w-4 stroke-[2.5]" />}
                    {notifications[notifIndex].type === 'approve' && <ShieldCheck className="h-4 w-4 stroke-[2.5]" />}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <span className="text-[11px] sm:text-xs font-black text-foreground block truncate">
                      {notifications[notifIndex].text}
                    </span>
                    <span className="text-[9px] text-muted-foreground block">به صورت زنده در یدک‌چی</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* امکانات فروشندگان */}
      <section className="w-full flex flex-col gap-8 sm:gap-10">
        <div className="flex flex-col items-center text-center gap-2">
          <h2 className="text-xl sm:text-3xl font-black text-foreground">امکانات فروشندگان در یدکچی</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">همه ابزارهایی که برای توسعه یک کسب‌وکار دیجیتال نیاز دارید</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {features.map((feat) => {
            const FeatIcon = feat.icon;
            return (
              <Card key={feat.id} className="border border-border/60 rounded-2xl bg-card hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 shadow-xs p-5 sm:p-6">
                <CardBody className="p-0 flex flex-col items-start text-right gap-3.5 sm:gap-4">
                  <div className={cn("w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0", feat.color)}>
                    <FeatIcon className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <h3 className="text-sm sm:text-base font-extrabold text-foreground">{feat.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      {/* مسیر فروشنده شدن */}
      <section className="w-full flex flex-col gap-8 sm:gap-10">
        <div className="flex flex-col items-center text-center gap-2">
          <h2 className="text-xl sm:text-3xl font-black text-foreground">مسیر فروشنده شدن</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">فقط در ۴ قدم ساده، فروشگاه آنلاین خود را راه‌اندازی کنید</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-start gap-3.5 p-5 rounded-2xl bg-muted/30 border border-border/40 hover:border-primary/20 transition-all">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary text-primary-foreground font-black text-base sm:text-lg flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
                {step.number}
              </div>
              <div className="flex flex-col gap-1 text-right w-full">
                <h3 className="text-xs sm:text-sm font-extrabold text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* نظرات فروشندگان */}
      <section className="w-full flex flex-col gap-8 sm:gap-10">
        <div className="flex flex-col items-center text-center gap-2">
          <h2 className="text-xl sm:text-3xl font-black text-foreground">فروشندگان درباره یدکچی چه می‌گویند؟</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">تجربه همکاران واقعی فعال در سراسر کشور</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full">
          {testimonials.map((t, idx) => (
            <Card key={idx} className="border border-border/60 rounded-2xl bg-card shadow-xs p-5 sm:p-6 flex flex-col justify-between gap-4">
              <CardBody className="p-0 flex flex-col gap-3.5 text-right">
                <p className="text-xs sm:text-sm text-foreground/90 leading-loose">
                  «{t.quote}»
                </p>
                <div className="flex items-center gap-3 border-t border-border/40 pt-3.5 mt-1">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0">
                    {t.initial}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">{t.name}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{t.shop}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* پرسش‌های متداول */}
      <section className="w-full flex flex-col gap-8 sm:gap-10">
        <div className="flex flex-col items-center text-center gap-2">
          <h2 className="text-xl sm:text-3xl font-black text-foreground">پرسش و پاسخ</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">پاسخ به سوالات متداول فروشندگان</p>
        </div>

        <div className="w-full max-w-3xl mx-auto flex flex-col gap-2 bg-card border border-border/60 rounded-2xl p-4 sm:p-6 shadow-xs">
          {faqs.map((faq, idx) => (
            <Accordion key={idx} title={faq.q}>
              <p className="text-xs sm:text-sm leading-loose text-muted-foreground text-justify pr-1 pb-1">
                {faq.a}
              </p>
            </Accordion>
          ))}
        </div>
      </section>

      {/* بنر پایانی ثبت‌نام */}
      <section className="w-full bg-gradient-to-br from-primary/15 via-primary/5 to-card border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 relative overflow-hidden shadow-xs">
        <div className="flex flex-col text-right gap-2 z-10">
          <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-foreground">آماده‌ی ورود به بازار آنلاین هستید؟</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md leading-relaxed">
            ثبت‌نام فروشگاه کمتر از ۵ دقیقه زمان می‌برد. همین امروز شعبه آنلاین کسب‌وکار خود را راه‌اندازی کنید.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={handleStartRegister}
          className="w-full md:w-auto rounded-xl font-bold text-xs sm:text-sm h-11 sm:h-12 px-8 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 shrink-0 z-10 active:scale-95 transition-transform"
        >
          <span>شروع ثبت‌نام فروشنده</span>
          <ArrowLeft className="h-4.5 w-4.5" />
        </Button>
      </section>

    </div>
  );
}