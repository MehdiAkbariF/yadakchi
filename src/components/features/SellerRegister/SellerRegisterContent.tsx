'use client';

import { motion } from 'framer-motion';
import { Sparkles, Users } from 'lucide-react';
import { Accordion } from '@/components/composites/Accordion/Accordion';

import { AnimatedBackground } from './components/AnimatedBackground';
import { OrbitDiagram } from './components/OrbitDiagram';
import { FeatureCard } from './components/FeatureCard';
import { StepCard } from './components/StepCard';
import { TestimonialCard } from './components/TestimonialCard';
import { CTAButton } from './components/CTAButton';
import { AnimatedWaves } from './svgs/DecorativeShapes';

export function SellerRegisterContent() {
  const features = [
    { id: 'panel', title: 'پنل اختصاصی فروشگاه', desc: 'مدیریت ساده، کامل و یکپارچه فروشگاه آنلاین', color: 'text-primary bg-primary/10' },
    { id: 'accounting', title: 'مدیریت فروش و حسابداری', desc: 'گزارش دقیق فروش، تسویه و درآمد فروشنده', color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'inventory', title: 'مدیریت محصولات و موجودی', desc: 'کنترل کامل قطعات، قیمت‌ها و موجودی انبار', color: 'text-blue-500 bg-blue-500/10' },
    { id: 'shipping', title: 'مدیریت سفارش و ارسال', desc: 'پیگیری سریع سفارش‌ها و وضعیت ارسال آن‌ها', color: 'text-orange-500 bg-orange-500/10' },
    { id: 'ads', title: 'تبلیغات و افزایش فروش', desc: 'افزایش بازدید و جذب مشتریان با کمپین‌ها', color: 'text-amber-500 bg-amber-500/10' },
    { id: 'b2b', title: 'شبکه فروشندگان یدکچی (B2B)', desc: 'ارتباط مستقیم با فروشندگان و تأمین‌کنندگان', color: 'text-purple-500 bg-purple-500/10' },
  ];

  const steps = [
    { number: '۱', title: 'عضویت فروشنده', desc: 'ایجاد حساب فروشندگی و تکمیل اطلاعات اولیه مورد نیاز فروشگاه برای شروع همکاری' },
    { number: '۲', title: 'آموزش پنل', desc: 'آشنایی با امکانات پنل کاربری، روند ثبت موجودی، مدیریت سفارشات و روند ارسال آن‌ها' },
    { number: '۳', title: 'ثبت موجودی و قیمت', desc: 'ثبت قیمت و موجودی کالاهای موجود در یدکچی و یا درخواست افزودن قطعات موردنظر' },
    { number: '۴', title: 'آغاز فروش آنلاین', desc: 'دریافت سفارش‌های آنلاین و فروش به مشتریان سراسر ایران و ثبت کمپین‌های تبلیغاتی' },
  ];

  const testimonials = [
    { initial: 'ع', name: 'علی محمدی', shop: 'فروشگاه لوازم یدکی تهران', quote: 'بعد از عضویت در یدکچی، تعداد مشتریان ما چند برابر شد و مدیریت سفارش‌ها بسیار راحت‌تر از قبل انجام می‌شود.' },
    { initial: 'م', name: 'مهدی رضایی', shop: 'تامین‌کننده قطعات خودرو', quote: 'پشتیبانی عالی و فرآیند ثبت محصولات بسیار ساده است. توانستیم در مدت کوتاهی فروش آنلاین خود را گسترش دهیم.' },
    { initial: 'ح', name: 'حسین کریمی', shop: 'فروشنده قطعات بدنه', quote: 'بزرگ‌ترین مزیت یدکچی دسترسی به مشتریان سراسر کشور است. حالا سفارش‌هایی از شهرهای مختلف دریافت می‌کنیم.' },
  ];

  const faqs = [
    { q: 'آیا ثبت‌نام در یدکچی هزینه دارد؟', a: 'خیر، ثبت‌نام و ایجاد فروشگاه در یدکچی رایگان است.' },
    { q: 'برای فروش در یدکچی نیاز به سایت دارم؟', a: 'خیر، فروشگاه آنلاین شما داخل یدکچی فعال می‌شود و نیازی به سایت جداگانه ندارید.' },
    { q: 'چه فروشندگانی می‌توانند در یدکچی فعالیت کنند؟', a: 'تمام فروشندگان، فروشگاه‌ها، شرکت‌ها، تولیدکنندگان و فعالان حوزه قطعات یدکی خودرو می‌توانند در یدکچی فروش داشته باشند.' },
    { q: 'آیا کالاها از قبل در سایت وجود دارند؟', a: 'بله، بخش زیادی از قطعات و برندها از قبل در مارکت‌پلیس یدکچی ثبت شده‌اند.' },
    { q: 'آیا می‌توانم قطعه جدید ثبت کنم؟', a: 'بله، می‌توانید درخواست افزودن قطعات و برندهای موردنیاز خود را ثبت کنید.' },
    { q: 'چه مدارکی برای ثبت‌نام نیاز است؟', a: 'برای فروشندگان حقیقی، کارت ملی و شماره شبای بانکی نیاز است و در صورت داشتن، جواز کسب هم قابل ثبت است.' },
    { q: 'سفارش‌ها چگونه به فروشنده اعلام می‌شوند؟', a: 'تمام سفارش‌ها از طریق پنل فروشندگی و اعلان‌های سیستم به شما نمایش داده می‌شوند.' },
    { q: 'ارسال سفارش‌ها بر عهده چه کسی است؟', a: 'ارسال سفارش‌ها توسط فروشنده انجام می‌شود و وضعیت آن از طریق پنل قابل مدیریت است.' },
    { q: 'آیا امکان مدیریت چندین کالا و سفارش همزمان وجود دارد؟', a: 'بله، پنل فروشندگی برای مدیریت تعداد بالای کالاها و سفارش‌ها طراحی شده است.' },
    { q: 'تسویه حساب فروش‌ها چگونه انجام می‌شود؟', a: 'گزارش فروش و تسویه‌ها از طریق پنل فروشندگی قابل مشاهده و پیگیری است.' },
  ];

  const handleStartRegister = () => {
    window.location.href = '/login?redirect=/profile/settings';
  };

  return (
    <div className="relative w-full max-w-full overflow-x-clip" dir="rtl">
      
      {/* پس‌زمینه انیمیشن‌دار در تمام صفحه */}
      <AnimatedBackground />

      {/* ⬇️ خنثی‌سازی padding و margin والد (MainLayout) برای تمام‌صفحه شدن */}
      <div className="relative flex flex-col gap-20 md:gap-28 -mx-4 md:-mx-6 -mt-6">

        {/* ============ HERO (تمام‌صفحه) ============ */}
        <section className="relative w-full overflow-hidden">
          {/* پس‌زمینه گرادیانت تمام‌صفحه */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative w-full max-w-[1840px] mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center min-h-[500px]">
            
            {/* متن‌ها */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="lg:col-span-6 flex flex-col items-start gap-4 sm:gap-5 order-1"
            >
              {/* بج بالا */}
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 text-xs font-black text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl uppercase tracking-wider"
              >
                <Sparkles className="h-3.5 w-3.5" />
                از بازار محلی به فروش در سراسر ایران
              </motion.span>

              {/* تیتر با هایلایت موجی */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl sm:text-5xl md:text-6xl font-black text-foreground leading-tight"
              >
                در{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary">یدکچی</span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-primary/40"
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                  >
                    <motion.path
                      d="M0,6 Q50,0 100,6 T200,6"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
                    />
                  </svg>
                </span>{' '}
                فروشنده شوید!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-sm md:text-base text-muted-foreground leading-relaxed sm:leading-loose text-justify max-w-xl"
              >
                خریداران قطعات یدکی قبل از هر تماس یا مراجعه، اول آنلاین جستجو می‌کنند. اگر فروشگاه شما آنلاین نباشد، بخش بزرگی از مشتری‌ها را به رقبا واگذار می‌کنید. در یدکچی بدون نیاز به هزینه‌های سنگین ساخت سایت، فروشگاه رسمی خود را افتتاح کنید.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="w-full sm:w-auto mt-3"
              >
                <CTAButton onClick={handleStartRegister} label="ثبت‌نام رایگان فروشندگی" />
              </motion.div>

              {/* آمار */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-border/40 w-full"
              >
                {[
                  { num: '+۱۰۰۰', label: 'فروشگاه فعال' },
                  { num: '+۵۰K', label: 'کالای متنوع' },
                  { num: '۹۸٪', label: 'رضایت فروشندگان' },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-lg md:text-xl font-black text-primary">{stat.num}</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* مدار چرخان */}
            <OrbitDiagram />
          </div>
        </section>

        {/* ============ FEATURES (با padding داخلی) ============ */}
        <section className="relative w-full">
          <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 md:px-12 flex flex-col gap-10">
            <SectionHeader
              title="امکانات فروشندگان در یدکچی"
              subtitle="همه ابزارهایی که برای توسعه یک کسب‌وکار دیجیتال نیاز دارید"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
              {features.map((feat, i) => (
                <FeatureCard key={feat.id} feat={feat} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ STEPS ============ */}
        <section className="relative w-full">
          <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 md:px-12 flex flex-col gap-10">
            <SectionHeader
              title="مسیر فروشنده شدن"
              subtitle="فقط در ۴ قدم ساده، فروشگاه آنلاین خود را راه‌اندازی کنید"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
              {steps.map((step, i) => (
                <StepCard key={i} step={step} index={i} isLast={i === steps.length - 1} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ TESTIMONIALS ============ */}
        <section className="relative w-full">
          <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 md:px-12 flex flex-col gap-10">
            <SectionHeader
              title="فروشندگان درباره یدکچی چه می‌گویند؟"
              subtitle="تجربه همکاران واقعی فعال در سراسر کشور"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
              {testimonials.map((t, i) => (
                <TestimonialCard key={i} testimonial={t} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="relative w-full">
          <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 md:px-12 flex flex-col gap-10">
            <SectionHeader
              title="پرسش و پاسخ"
              subtitle="پاسخ به سوالات متداول فروشندگان"
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative w-full max-w-3xl mx-auto"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 via-transparent to-primary/20 rounded-3xl blur-sm" />

              <div className="relative flex flex-col gap-1 bg-card border border-border/60 rounded-3xl p-4 sm:p-6 shadow-xl">
                {faqs.map((faq, idx) => (
                  <Accordion key={idx} title={faq.q}>
                    <p className="text-xs sm:text-sm leading-loose text-muted-foreground text-justify pr-1 pb-1">
                      {faq.a}
                    </p>
                  </Accordion>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============ FINAL CTA (تمام‌صفحه، لبه‌به‌لبه) ============ */}
        <section className="relative w-full mt-16">
          {/* Waves تزئینی */}
          <div className="absolute inset-0 overflow-hidden">
            <AnimatedWaves className="opacity-50" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative w-full bg-gradient-to-br from-primary/15 via-primary/5 to-card border-y border-primary/30 py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 overflow-hidden shadow-2xl"
          >
            {/* آیکون تزئینی بزرگ */}
            <Users className="absolute -left-12 -bottom-12 w-56 h-56 text-primary/5 pointer-events-none" />

            <div className="relative w-full max-w-[1840px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
              <div className="flex flex-col text-right gap-3 z-10 max-w-lg mx-auto md:mx-0 md:mr-auto">
                <motion.h3
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground"
                >
                  آماده‌ی ورود به بازار آنلاین هستید؟
                </motion.h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  ثبت‌نام فروشگاه کمتر از ۵ دقیقه زمان می‌برد. همین امروز شعبه آنلاین کسب‌وکار خود را راه‌اندازی کنید.
                </p>
              </div>

              <div className="relative z-10 shrink-0">
                <CTAButton onClick={handleStartRegister} label="شروع ثبت‌نام فروشنده" size="lg" />
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}

// ============ کامپوننت هدر بخش‌ها ============
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground relative"
      >
        {title}
        <motion.svg
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-2 text-primary"
          viewBox="0 0 100 4"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,2 Q25,0 50,2 T100,2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.svg>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-xs sm:text-sm text-muted-foreground max-w-md mt-2"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}